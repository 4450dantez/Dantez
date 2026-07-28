module.exports = {
    name: "tagall",
    category: "group",
    description: "Mention all members in a group",
    async execute(sock, msg, from, args) {
        // Ensure command is run inside a group
        if (!from.endsWith("@g.us")) {
            return await sock.sendMessage(from, { text: "❌ This command can only be used inside groups!" }, { quoted: msg });
        }

        try {
            const groupMetadata = await sock.groupMetadata(from);
            const participants = groupMetadata.participants;

            const customMessage = args.join(" ") || "Attention everyone!";
            let textMessage = `📢 *ATTENTION EVERYONE*\n\n💬 *Message:* ${customMessage}\n\n👥 *Members:*\n`;

            const mentions = [];
            for (const participant of participants) {
                textMessage += `@${participant.id.split("@")[0]}\n`;
                mentions.push(participant.id);
            }

            await sock.sendMessage(
                from,
                { text: textMessage, mentions: mentions },
                { quoted: msg }
            );

        } catch (err) {
            console.error("Tagall command error:", err);
            await sock.sendMessage(from, { text: "❌ Failed to tag group members." }, { quoted: msg });
        }
    }
};

