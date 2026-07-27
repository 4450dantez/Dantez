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

            // Temporary output file path
            const outputPath = path.join(__dirname, `temp_${Date.now()}.mp3`);

            // Download with yt-dlp
            const ytDlpCmd = `yt-dlp -x --audio-format mp3 -o "${outputPath}" "${video.url}"`;

            exec(ytDlpCmd, async (error) => {
                if (error) {
                    console.error("yt-dlp execution error:", error);
                    return await sock.sendMessage(from, { text: "❌ Failed to download audio." }, { quoted: msg });
                }

                if (fs.existsSync(outputPath)) {
                    try {
                        // Send audio using direct file stream instead of raw Buffer
                        await sock.sendMessage(
                            from,
                            {
                                audio: { url: outputPath },
                                mimetype: "audio/mp4",
                                ptt: false
                            },
                            { quoted: msg }
                        );
                    } catch (sendErr) {
                        console.error("Error sending audio to WhatsApp:", sendErr);
                        await sock.sendMessage(from, { text: "❌ Error uploading audio to WhatsApp." }, { quoted: msg });
                    } finally {
                        // Clean up temp file
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

