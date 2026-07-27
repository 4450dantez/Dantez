module.exports = {
    name: "owner",
    category: "general",
    description: "Display owner contact cards",
    async execute(sock, msg, from, args) {
        // Phone numbers in international format
        const ownerNumbers = ["254768586061", "254754574642"];
        const contactsList = [];

        for (const num of ownerNumbers) {
            const jid = `${num}@s.whatsapp.net`;
            let name = "here's my owner";

            // Attempt to fetch current WhatsApp profile username
            try {
                const [result] = await sock.onWhatsApp(jid);
                if (result && result.notify) {
                    name = result.notify;
                }
            } catch (err) {
                console.log(`Could not fetch username for ${num}:`, err);
            }

            // Create vCard structure for each contact
            const vcard = 
                `BEGIN:VCARD\n` +
                `VERSION:3.0\n` +
                `FN:${name}\n` +
                `ORG:here's my owner;\n` +
                `TEL;type=CELL;type=VOICE;waid=${num}:+${num}\n` +
                `END:VCARD`;

            contactsList.push({ vcard });
        }

        // Send the interactive contact cards
        await sock.sendMessage(
            from,
            {
                contacts: {
                    displayName: "Bot Owners",
                    contacts: contactsList
                }
            },
            { quoted: msg }
        );
    }
};

