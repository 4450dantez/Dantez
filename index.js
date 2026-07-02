const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const pino = require('pino');
const readline = require('readline');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const question = (text) => new Promise((resolve) => rl.question(text, resolve));

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
    
    const sock = makeWASocket({
        logger: pino({ level: 'silent' }),
        auth: state,
        printQRInTerminal: false // No QR code needed!
    });

    // If we aren't logged in yet, ask for your phone number to give you a pairing code!
    if (!sock.authState.creds.registered) {
        const phoneNumber = await question('Please enter your WhatsApp phone number with country code (e.g., 254712345678): ');
        const code = await sock.requestPairingCode(phoneNumber.trim());
        console.log(`\nYour Pairing Code is: ${code}\n`);
        console.log('Open WhatsApp -> Linked Devices -> Link with phone number instead, and enter this code!');
    }

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', (update) => {
        const { connection } = update;
        if (connection === 'open') {
            console.log('Beep Boop! Your WhatsApp Bot is connected and ready! 🤖');
        }
    });

    sock.ev.on('messages.upsert', async (m) => {
        const msg = m.messages[0];
        if (!msg.message || msg.key.fromMe) return;

        const text = msg.message.conversation || msg.message.extendedTextMessage?.text || '';
        const from = msg.key.remoteJid;

        if (text.toLowerCase() === '!hello') {
            await sock.sendMessage(from, { text: 'Hello! I am Dantez, running smoothly on mobile! 🤖✨' });
        }
        if (text.toLowerCase() === '!ping') {
            await sock.sendMessage(from, { text: 'Pong! 🏓' });
        }
    });
}

startBot();
