const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

// 1. Wake up our robot client
const client = new Client({
    authStrategy: new LocalAuth()
});

// 2. Show a QR code when it's ready to connect
client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
    console.log('Scan this QR code with WhatsApp Linked Devices!');
});

// 3. Let us know when the robot is awake
client.on('ready', () => {
    console.log('Beep Boop! Your WhatsApp Bot is ready!');
});

// 4. Listen for messages!
client.on('message', async (msg) => {
    // If someone texts you "!hello"
    if (msg.body.toLowerCase() === '!hello') {
        await msg.reply('Hello! I am Dantez, a cool robot built from a phone! 🤖✨');
    }
    
    // If someone texts you "!ping"
    if (msg.body.toLowerCase() === '!ping') {
        await msg.reply('Pong! 🏓');
    }
});

client.initialize();
  
