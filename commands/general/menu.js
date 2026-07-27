const { getMenu } = require("../../menu");

module.exports = {
    name: "menu",
    category: "general",
    description: "Display command menu",
    async execute(sock, msg, from, args) {
        const prefix = ".";
        const userJid = msg.key.participant ? msg.key.participant.split("@")[0] : from.split("@")[0];
        const menuText = getMenu(prefix, userJid);

        await sock.sendMessage(from, { 
            text: menuText,
            mentions: [msg.key.participant || from]
        }, { quoted: msg });
    }
};

