module.exports = {
    name: "joke",
    category: "utils",
    description: "Get a random funny joke",
    async execute(sock, msg, from, args) {
        const jokes = [
            "Why do programmers prefer dark mode?\nBecause light attracts bugs! 🐛",
            "There are 10 types of people in the world: Those who understand binary, and those who don't. 💻",
            "Why did the developer go broke?\nBecause he used up all his cache! 💸",
            "A SQL query walks into a bar, walks up to two tables and asks...\n'Can I join you?' 🍻",
            "How do you comfort a JavaScript bug?\nYou console it! console.log('It's okay') 😂"
        ];

        const randomJoke = jokes[Math.floor(Math.random() * jokes.length)];
        await sock.sendMessage(from, { text: `😂 *Joke of the day:*\n\n${randomJoke}` }, { quoted: msg });
    }
};

