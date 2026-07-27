// menu.js

function getMenu(prefix, pushName) {
    return `🤖 *DANTEZ BOT OFFICIAL MENU*

👤 *User:* @${pushName}
⚙️ *Prefix:* [ ${prefix} ]

─── 🌐 *GENERAL COMMANDS* ───
• *${prefix}ping*
• *${prefix}menu*
• *${prefix}owner*
• *${prefix}runtime*

─── 🎨 *MEDIA & UTILS* ───
• *${prefix}sticker*
• *${prefix}say*
• *${prefix}quote*
• *${prefix}joke*

─── 👥 *GROUP COMMANDS* ───
• *${prefix}tagall*
• *${prefix}groupinfo*

💡 *Tip:* Send *${prefix}sticker* as caption to an image to convert it!`;
}

module.exports = { getMenu };

