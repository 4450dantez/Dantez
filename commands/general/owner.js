module.exports = {
    name: "owner",
    category: "general",
    description: "Display owner contact info",
    async execute(sock, msg, from, args) {
        const ownerNumbers = ["254768586061", "254754574642"];
        const contactsList = [];

        for (const num of ownerNumbers) {
            const jid = `${num}@s.whatsapp.net`;
            let name = `+${num}`;

            // Try to fetch current WhatsApp username
            try {
                const [result] = await sock.onWhatsApp(jid);
                if (result && result.notify) {
                    name = result.notify;
                }
            } catch (err) {
                console.log(`Could not fetch username for ${num}:`, err);
            }

            const vcard = 
                `BEGIN:VCARD\n` +
                `VERSION:3.0\n` +
                `FN:${name}\n` +
                `TEL;type=CELL;type=VOICE;waid=${num}:+${num}\n` +
                `END:VCARD`;

            contactsList.push({ vcard });
        }

        // 1. Send text message
        const textMessage = `you wanna see my handsome owner, okay here is he 🙂‍↔️\n\n• +254768586061\n• +254754574642`;
        await sock.sendMessage(from, { text: textMessage }, { quoted: msg });

        // 2. Send contact cards
        await sock.sendMessage(
            from,
            {
                contacts: {
                    displayName: "Owners",
                    contacts: contactsList
                }
            },
            { quoted: msg }
        );
    }
};

