// menu.js

function getMenu(prefix, pushName) {
    return `🤖 *DANTEZ BOT OFFICIAL MENU*

👤 *User:* @${pushName}
⚙️ *Prefix:* [ ${prefix} ]

─── 🌐 *GENERAL COMMANDS* ───
• *${prefix}ping* - Check bot response speed
• *${prefix}menu* - Display this command menu
• *${prefix}owner* - Contact bot owner
• *${prefix}runtime* - Display bot uptime and system specs

─── 🎨 *MEDIA & UTILS* ───
• *${prefix}sticker* - Convert reply/caption image to sticker
• *${prefix}say <text>* - Make the bot repeat your text
• *${prefix}quote* - Get a random inspirational quote
• *${prefix}joke* - Get a random funny joke

─── 👥 *GROUP COMMANDS* ───
• *${prefix}tagall* - Mention all group members
• *${prefix}groupinfo* - Show details about current group

💡 *Tip:* Send *${prefix}sticker* as caption to an image to convert it!`;
}

module.exports = { getMenu };
