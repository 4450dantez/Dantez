const {
    default: makeWASocket,
    DisconnectReason,
    useMultiFileAuthState,
    downloadContentFromMessage
} = require("@whiskeysockets/baileys");

const P = require("pino");
const qrcode = require("qrcode-terminal");
const readline = require("readline");
const fs = require("fs");
const path = require("path");

// Configuration Toggles
const CONFIG = {
    autoViewStatus: true,
    autoLikeStatus: true,
    statusLikeEmoji: "❤️"
};

const commands = new Map();

function loadCommands(dir = path.join(__dirname, "commands")) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            loadCommands(filePath);
        } else if (file.endsWith(".js")) {
            const command = require(filePath);
            if (command.name) {
                commands.set(command.name.toLowerCase(), command);
                console.log(`🔹 Loaded command: .${command.name}`);
            }
        }
    }
}

loadCommands();

function askQuestion(query) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    return new Promise((resolve) =>
        rl.question(query, (ans) => {
            rl.close();
            resolve(ans.trim());
        })
    );
}

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState("./auth_info");

    const sock = makeWASocket({
        auth: state,
        logger: P({ level: "silent" }),
        printQRInTerminal: false
    });

    sock.ev.on("creds.update", saveCreds);

    if (!sock.authState.creds.registered) {
        const inputPhone = await askQuestion(
            "📱 Enter phone number for Pairing Code (e.g., 254768586061) or press Enter to use QR Code: "
        );

        if (inputPhone) {
            const phoneNumber = inputPhone.replace(/[^0-9]/g, "");
            setTimeout(async () => {
                try {
                    const code = await sock.requestPairingCode(phoneNumber);
                    console.log(`\n🔑 Pairing Code for ${phoneNumber}: ${code}\n`);
                } catch (err) {
                    console.log("❌ Pairing error:", err.message);
                }
            }, 3000);
        } else {
            console.log("\n📲 Selected QR Code mode. Waiting for QR Code...\n");
        }
    }

    sock.ev.on("connection.update", async (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr && !sock.authState.creds.registered) {
            console.log("📱 Scan this QR Code with WhatsApp:\n");
            qrcode.generate(qr, { small: true });
        }

        if (connection === "open") {
            console.log("✅ Bot Connected Successfully!");
        }

        if (connection === "close") {
            const statusCode = lastDisconnect?.error?.output?.statusCode;
            const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

            console.log(`❌ Connection closed (StatusCode: ${statusCode}).`);

            if (shouldReconnect) {
                console.log("♻ Reconnecting...");
                startBot();
            } else {
                console.log("🔒 Logged out. Delete 'auth_info' directory and restart.");
            }
        }
    });

    sock.ev.on("messages.upsert", async ({ messages, type }) => {
        if (type !== "notify") return;

        for (const msg of messages) {
            if (!msg || !msg.message) continue;

            const from = msg.key.remoteJid;

            // 🟢 AUTO VIEW & AUTO LIKE STATUS
            if (from === "status@broadcast") {
                const participant = msg.key.participant || msg.participant;
                if (!participant) continue;

                // 1. Auto View Status
                if (CONFIG.autoViewStatus) {
                    try {
                        await sock.readMessages([
                            {
                                remoteJid: "status@broadcast",
                                id: msg.key.id,
                                participant: participant
                            }
                        ]);
                        console.log(`👀 Auto Viewed Status from: ${participant}`);
                    } catch (err) {
                        console.error("Failed to view status:", err);
                    }
                }

                // 2. Auto Like Status
                if (CONFIG.autoLikeStatus) {
                    try {
                        await sock.sendMessage(
                            "status@broadcast",
                            {
                                react: {
                                    text: CONFIG.statusLikeEmoji,
                                    key: msg.key
                                }
                            },
                            {
                                statusJidList: [participant]
                            }
                        );
                        console.log(`❤️ Auto Liked Status from: ${participant}`);
                    } catch (err) {
                        console.error("Failed to like status:", err);
                    }
                }

                continue;
            }

            // Normal Commands
            const text = (
                msg.message.conversation ||
                msg.message.extendedTextMessage?.text ||
                msg.message.imageMessage?.caption ||
                msg.message.videoMessage?.caption ||
                ""
            ).trim();

            const prefix = ".";
            if (!text.startsWith(prefix)) continue;

            const args = text.slice(prefix.length).trim().split(/ +/);
            const cmdName = args.shift().toLowerCase();

            const command = commands.get(cmdName);
            if (!command) continue;

            try {
                console.log(`📩 [${from}] Executed: ${prefix}${cmdName}`);
                await command.execute(sock, msg, from, args, downloadContentFromMessage);
            } catch (err) {
                console.error(`Error executing ${cmdName}:`, err);
                await sock.sendMessage(from, { text: "❌ An error occurred while executing that command." }, { quoted: msg });
            }
        }
    });
}

startBot();

