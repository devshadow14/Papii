const fetch = require('node-fetch');

async function memeCommand(sock, chatId, message) {
    try {
        const response = await fetch('https://meme-api.com/gimme');

        const contentType = response.headers.get('content-type');

        if (contentType && contentType.includes('image')) {
            const imageBuffer = await response.buffer();

            const buttons = [
                { buttonId: '.meme', buttonText: { displayText: '🎭 Another Meme' }, type: 1 },
                { buttonId: '.joke', buttonText: { displayText: '😄 Joke' }, type: 1 }
            ];

            await sock.sendMessage(chatId, {
                image: imageBuffer,
                caption: `🐶 *Cheems Meme Loaded !*\n\n⚡ _By STIVO TECH ™_`,
                buttons,
                headerType: 1,
                contextInfo: {
                    forwardingScore: 1,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363402057857053@newsletter',
                        newsletterName: '🌹𝐊𝚰𝐋𝐋𝚵𝚪–MD•V3🌹',
                        serverMessageId: -1
                    }
                }
            }, { quoted: message });
        } else {
            throw new Error('Invalid response type from API');
        }

    } catch (error) {
        console.error('Error in meme command:', error);

        await sock.sendMessage(chatId, {
            text: `❌ *Impossible de charger un meme pour le moment.*\nRéessayez plus tard.\n\n⚡ _By STIVO TECH ™_`,
            contextInfo: {
                forwardingScore: 1,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363402057857053@newsletter',
                    newsletterName: '🌹𝐊𝚰𝐋𝐋𝚵𝚪–MD•V3🌹',
                    serverMessageId: -1
                }
            }
        }, { quoted: message });
    }
}

module.exports = memeCommand;