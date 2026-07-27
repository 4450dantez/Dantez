const {
    default: makeWASocket,
    DisconnectReason,
    useMultiFileAuthState,
    downloadContentFromMessage
} = require("@whiskeysockets/baileys");

const P = require("pino");
const qrcode = require("qrcode-terminal");
const readline = require("readline");
const os = require("os");

// Import the external menu function
const { getMenu } = require("./menu");

// Helper function to handle terminal input
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

    // Ask user for connection method if not logged in yet
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

    // Connection events handler
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

    // Incoming messages handler
    sock.ev.on("messages.upsert", async ({ messages, type }) => {
        if (type !== "notify") return;

        const msg = messages[0];
        if (!msg || !msg.message) return;

        if (msg.key.remoteJid === "status@broadcast") return;

        const from = msg.key.remoteJid;
        const isGroup = from.endsWith("@g.us");

        // Extract message text across different message types
        const text = (
            msg.message.conversation ||
            msg.message.extendedTextMessage?.text ||
            msg.message.imageMessage?.caption ||
            msg.message.videoMessage?.caption ||
            ""
        ).trim();

        // Separate prefix, command, and args
        const prefix = ".";
        if (!text.startsWith(prefix)) return;

        const args = text.slice(prefix.length).trim().split(/ +/);
        const command = args.shift().toLowerCase();
        const q = args.join(" "); // Text query after command

        console.log(`📩 [${from}] Executed: ${prefix}${command}`);

        switch (command) {
            // ==================== GENERAL COMMANDS ====================
            case "menu":
            case "help": {
                const userJid = msg.key.participant ? msg.key.participant.split("@")[0] : from.split("@")[0];
                const menuText = getMenu(prefix, userJid);

                await sock.sendMessage(from, { 
                    text: menuText,
                    mentions: [msg.key.participant || from]
                }, { quoted: msg });
                break;
            }

            case "ping": {
                const start = Date.now();
                const sentMsg = await sock.sendMessage(from, { text: "🏓 Testing speed..." }, { quoted: msg });
                const end = Date.now();
                await sock.sendMessage(from, { text: `🏓 *Pong!* Speed: \`${end - start}ms\`` }, { quoted: sentMsg });
                break;
            }

            case "owner": {
                await sock.sendMessage(from, {
                    text: `👑 *Bot Owner Info*\n\n• Name: Dantez\n• Contact: wa.me/254768586061`
                }, { quoted: msg });
                break;
            }

            case "runtime": {
                const uptime = process.uptime();
                const hours = Math.floor(uptime / 3600);
                const minutes = Math.floor((uptime % 3600) / 60);
                const seconds = Math.floor(uptime % 60);

                const ramUsage = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
                const totalRam = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2);

                await sock.sendMessage(from, {
                    text: `⚙️ *System Stats*\n\n⏱️ *Uptime:* ${hours}h ${minutes}m ${seconds}s\n💾 *RAM Usage:* ${ramUsage} MB / ${totalRam} GB\n🖥️ *OS:* ${os.platform()} (${os.arch()})`
                }, { quoted: msg });
                break;
            }

            case "say": {
                if (!q) return await sock.sendMessage(from, { text: `❌ Please provide text. Example: *${prefix}say Hello World*` }, { quoted: msg });
                await sock.sendMessage(from, { text: q }, { quoted: msg });
                break;
            }

            case "quote": {
                const quotes = [
                    "“The best way to predict the future is to create it.”",
                    "“Do what you can, with what you have, where you are.”",
                    "“It always seems impossible until it's done.”",
                    "“Success is not final, failure is not fatal: it is the courage to continue that counts.”"
                ];
                const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
                await sock.sendMessage(from, { text: `💬 ${randomQuote}` }, { quoted: msg });
                break;
            }

            // ==================== MEDIA COMMANDS ====================
            case "sticker":
            case "s": {
                const isImage = msg.message.imageMessage || (msg.message.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage);

                if (!isImage) {
                    return await sock.sendMessage(from, { text: `❌ Please send or reply to an image with *${prefix}sticker*` }, { quoted: msg });
                }

                try {
                    const targetMessage = msg.message.imageMessage 
                        ? msg.message.imageMessage 
                        : msg.message.extendedTextMessage.contextInfo.quotedMessage.imageMessage;

                    const stream = await downloadContentFromMessage(targetMessage, "image");
                    let buffer = Buffer.from([]);
                    for await (const chunk of stream) {
                        buffer = Buffer.concat([buffer, chunk]);
                    }

                    await sock.sendMessage(from, { sticker: buffer }, { quoted: msg });
                } catch (err) {
                    console.log("Sticker Error:", err);
                    await sock.sendMessage(from, { text: "❌ Failed to generate sticker." }, { quoted: msg });
                }
                break;
            }

            // ==================== GROUP COMMANDS ====================
            case "tagall": {
                if (!isGroup) return await sock.sendMessage(from, { text: "❌ This command can only be used in groups!" }, { quoted: msg });

                const groupMetadata = await sock.groupMetadata(from);
                const participants = groupMetadata.participants;

                let response = `📢 *Attention Everyone!*\n\n📝 *Message:* ${q || "None"}\n\n`;
                let mentions = [];

                for (let mem of participants) {
                    response += `• @${mem.id.split("@")[0]}\n`;
                    mentions.push(mem.id);
                }

                await sock.sendMessage(from, { text: response, mentions: mentions }, { quoted: msg });
                break;
            }

            case "groupinfo": {
                if (!isGroup) return await sock.sendMessage(from, { text: "❌ This command can only be used in groups!" }, { quoted: msg });

                const groupMetadata = await sock.groupMetadata(from);
                const infoText = 
`👥 *GROUP INFORMATION*

📌 *Name:* ${groupMetadata.subject}
🆔 *ID:* ${groupMetadata.id}
👤 *Owner:* @${groupMetadata.owner ? groupMetadata.owner.split("@")[0] : "Unknown"}
👥 *Members:* ${groupMetadata.participants.length}
📅 *Created:* ${new Date(groupMetadata.creation * 1000).toLocaleDateString()}`;

                await sock.sendMessage(from, { 
                    text: infoText,
                    mentions: groupMetadata.owner ? [groupMetadata.owner] : []
                }, { quoted: msg });
                break;
            }

            default:
                break;
        }
    });
}

startBot();

