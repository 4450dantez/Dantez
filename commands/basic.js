async function handleCommand(sock, msg, from, body, config) {
  const args = body.slice(config.prefix.length).trim().split(' ');
  const command = args[0].toLowerCase();
  const text = args.slice(1).join(' ');

  switch (command) {

    case 'menu':
      await sock.sendMessage(from, {
        text: `*${config.botName} Menu*\n\n${config.prefix}menu\n${config.prefix}ping\n${config.prefix}hi\n${config.prefix}joke`
      }, { quoted: msg });
      break;

    case 'ping':
      await sock.sendMessage(from, {
        text: '🏓 Pong!'
      }, { quoted: msg });
      break;

    case 'hi':
      await sock.sendMessage(from, {
        text: `Hey! 👋 I'm ${config.botName}`
      }, { quoted: msg });
      break;

    case 'joke':
      await sock.sendMessage(from, {
        text: '😂 Why do programmers prefer dark mode? Because light attracts bugs!'
      }, { quoted: msg });
      break;

    default:
      await sock.sendMessage(from, {
        text: '❌ Unknown command.'
      }, { quoted: msg });
  }
}

module.exports = { handleCommand };

