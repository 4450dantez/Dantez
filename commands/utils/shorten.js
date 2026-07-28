const axios = require("axios");

module.exports = {
    name: "shorten",
    category: "utils",
    description: "Shorten a long URL",
    async execute(sock, msg, from, args) {
        const url = args[0];

        if (!url || !url.startsWith("http")) {
            return await sock.sendMessage(
                from,
                { text: "❌ Please provide a valid URL starting with http:// or https://\n\n*Example:* `.shorten https://google.com`" },
                { quoted: msg }
            );
        }

        try {
            const response = await axios.get(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`);
            const shortUrl = response.data;

            await sock.sendMessage(
                from,
                { text: `🔗 *Shortened Link:*\n${shortUrl}` },
                { quoted: msg }
            );

        } catch (err) {
            console.error("Shorten command error:", err);
            await sock.sendMessage(from, { text: "❌ Failed to shorten URL." }, { quoted: msg });
        }
    }
};

