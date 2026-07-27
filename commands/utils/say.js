module.exports = {
    name: "say",
    category: "utils",
    description: "Make the bot repeat your text",
    async execute(sock, msg, from, args) {
        const q = args.join(" ");
        if (!q) {
            return await sock.sendMessage(from, { text: "❌ Please provide text. Example: *.say Hello World*" }, { quoted: msg });
        }
        await sock.sendMessage(from, { text: q }, { quoted: msg });
    }
};

