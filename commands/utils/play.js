const yts = require("yt-search");
const ytdl = require("@distube/ytdl-core");

module.exports = {
    name: "play",
    category: "utils",
    description: "Search and download audio from YouTube",
    async execute(sock, msg, from, args) {
        const query = args.join(" ");

        if (!query) {
            return await sock.sendMessage(
                from, 
                { text: "❌ Please provide a song name or YouTube link.\n\n*Example:* `.play Shape of You`" }, 
                { quoted: msg }
            );
        }

        try {
            await sock.sendMessage(from, { text: `🔎 Searching for *"${query}"*...` }, { quoted: msg });

            // Search YouTube for the video
            const searchResult = await yts(query);
            const video = searchResult.videos[0];

            if (!video) {
                return await sock.sendMessage(from, { text: "❌ No results found on YouTube." }, { quoted: msg });
            }

            // Send video metadata confirmation
            const infoText = `🎵 *SONG FOUND*\n\n📌 *Title:* ${video.title}\n⏱️ *Duration:* ${video.timestamp}\n👤 *Channel:* ${video.author.name}\n\n⏳ *Downloading audio, please wait...*`;
            await sock.sendMessage(from, { text: infoText }, { quoted: msg });

            // Stream audio from YouTube
            const audioStream = ytdl(video.url, {
                filter: "audioonly",
                quality: "highestaudio",
            });

            const chunks = [];
            for await (const chunk of audioStream) {
                chunks.push(chunk);
            }
            const audioBuffer = Buffer.concat(chunks);

            // Send audio file on WhatsApp
            await sock.sendMessage(
                from,
                {
                    audio: audioBuffer,
                    mimetype: "audio/mp4",
                    fileName: `${video.title}.mp3`
                },
                { quoted: msg }
            );

        } catch (err) {
            console.error("Play command error:", err);
            await sock.sendMessage(from, { text: "❌ Failed to download audio. Please try again." }, { quoted: msg });
        }
    }
};
