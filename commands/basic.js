async function handleCommand(sock, msg, from, body, config) {
  const args = body.slice(config.prefix.length).trim().split(' ');
  const command = args[0].toLowerCase();

  switch (command) {
    case 'menu':
      await sock.sendMessage(from, {
        text: `*${config.botName} Menu*\n\n` +
          `${config.prefix}menu - Show this menu\n` +
          `${config.prefix}ping - Check if bot is alive\n` +
          `${config.prefix}time - Current time\n` +
          `${config.prefix}hi - Say hello`
      }, { quoted: msg });
      break;

    case 'ping':
      await sock.sendMessage(from, { text: '🏓 Pong!' }, { quoted: msg });
      break;

    case 'time':
      await sock.sendMessage(from, {
        text: `🕐 ${new Date().toLocaleString()}`
      }, { quoted: msg });
      break;

    case 'hi':
      await sock.sendMessage(from, {
        text: `Hey! 👋 I'm ${config.botName}`
      }, { quoted: msg });
      break;

    default:
      await sock.sendMessage(from, {
        text: `❌ Unknown command. Type *${config.prefix}menu* for help.`
      }, { quoted: msg });
  }
}

module.exports = { handleCommand };
