// menu.js

/**
 * Returns the formatted menu text for Dantez Bot.
 * @param {string} prefix - The bot's command prefix (e.g., ".")
 * @param {string} pushName - The user's name or number
 * @returns {string} - Formatted menu string
 */
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

─── 👥 *GROUP COMMANDS* ───
• *${prefix}tagall* - Mention all group members
• *${prefix}groupinfo* - Show details about current group

💡 *Tip:* Send *${prefix}sticker* as caption to an image to convert it!`;
}

module.exports = { getMenu };

