const axios = require("axios");

module.exports = {
    name: "ai",
    category: "utils",
    description: "Ask the AI assistant anything",
    async execute(sock, msg, from, args) {
        const query = args.join(" ");

        if (!query) {
            return await sock.sendMessage(
                from,
                { text: "❌ Please ask a question.\n\n*Example:* `.ai Explain quantum computing simply`" },
                { quoted: msg }
            );
        }

        try {
            await sock.sendMessage(from, { text: "🤔 *Thinking...*" }, { quoted: msg });

            // Free public AI endpoint
            const response = await axios.get(`https://api.giftedtech.my.id/api/ai/gpt4?apikey=gifted&q=${encodeURIComponent(query)}`);

            const reply = response.data?.result || "❌ Couldn't generate a response. Try again later.";
            await sock.sendMessage(from, { text: `🤖 *AI Response:*\n\n${reply}` }, { quoted: msg });

        } catch (err) {
            console.error("AI command error:", err);
            await sock.sendMessage(from, { text: "❌ Failed to connect to AI server." }, { quoted: msg });
        }
    }
};

