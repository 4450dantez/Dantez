module.exports = {
    name: "ping",
    category: "general",
    description: "Check bot response speed",
    async execute(sock, msg, from, args) {
        const start = Date.now();
        const sentMsg = await sock.sendMessage(from, { text: "🏓 Testing speed..." }, { quoted: msg });
        const end = Date.now();
        await sock.sendMessage(from, { text: `🏓 *Pong!* Speed: \`${end - start}ms\`` }, { quoted: sentMsg });
    }
};
