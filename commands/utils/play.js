const yts = require("yt-search");
const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

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

            // Search YouTube
            const searchResult = await yts(query);
            const video = searchResult.videos[0];

            if (!video) {
                return await sock.sendMessage(from, { text: "❌ No results found on YouTube." }, { quoted: msg });
            }

            const infoText = `🎵 *SONG FOUND*\n\n📌 *Title:* ${video.title}\n⏱️ *Duration:* ${video.timestamp}\n👤 *Channel:* ${video.author.name}\n\n⏳ *Downloading audio, please wait...*`;
            await sock.sendMessage(from, { text: infoText }, { quoted: msg });

            // Output path
            const outputPath = path.join(__dirname, `temp_${Date.now()}.mp3`);

            // Execute yt-dlp with explicit mp3 audio conversion
            const ytDlpCmd = `yt-dlp -f "ba/b" -x --audio-format mp3 --audio-quality 0 -o "${outputPath}" "${video.url}"`;

            exec(ytDlpCmd, async (error) => {
                if (error) {
                    console.error("yt-dlp execution error:", error);
                    return await sock.sendMessage(from, { text: "❌ Failed to download audio." }, { quoted: msg });
                }

                if (fs.existsSync(outputPath)) {
                    try {
                        // Send as standard audio using audio/mpeg
                        await sock.sendMessage(
                            from,
                            {
                                audio: { url: outputPath },
                                mimetype: "audio/mpeg",
                                ptt: false
                            },
                            { quoted: msg }
                        );
                    } catch (sendErr) {
                        console.error("Audio mode failed, trying document fallback...", sendErr);
                        
                        // Fallback: Send as document if media server rejects audio
                        try {
                            await sock.sendMessage(
                                from,
                                {
                                    document: { url: outputPath },
                                    mimetype: "audio/mpeg",
                                    fileName: `${video.title}.mp3`
                                },
                                { quoted: msg }
                            );
                        } catch (docErr) {
                            console.error("Document upload failed too:", docErr);
                            await sock.sendMessage(from, { text: "❌ WhatsApp media servers rejected the file." }, { quoted: msg });
                        }
                    } finally {
                        if (fs.existsSync(outputPath)) {
                            fs.unlinkSync(outputPath);
                        }
                    }
                } else {
                    await sock.sendMessage(from, { text: "❌ Audio file missing after download." }, { quoted: msg });
                }
            });

        } catch (err) {
            console.error("Play command error:", err);
            await sock.sendMessage(from, { text: "❌ An error occurred while processing your request." }, { quoted: msg });
        }
    }
};

