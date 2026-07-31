const axios = require('axios');
const settings = require('../settings'); // 🔥 Pour adReply

// Fonction pour traduire en français
async function translateToFrench(text) {
    try {
        const res = await axios.post(
            "https://libretranslate.de/translate",
            { q: text, source: "auto", target: "fr", format: "text" },
            { headers: { "Content-Type": "application/json" } }
        );
        return res.data.translatedText || text;
    } catch {
        return text; // Retourne le texte original si échec
    }
}

async function newsCommand(sock, chatId) {
    try {
        const apiKey = 'dcd720a6f1914e2d9dba9790c188c08c'; // Ta clé NewsAPI
        const response = await axios.get(`https://newsapi.org/v2/top-headlines?country=us&apiKey=${apiKey}`);
        const articles = response.data.articles.slice(0, 5); // Top 5 articles

        // Traduire les titres et descriptions en français
        const translatedArticles = await Promise.all(
            articles.map(async article => ({
                title: await translateToFrench(article.title || ''),
                description: await translateToFrench(article.description || '')
            }))
        );

        let newsMessage = '📰 *Actualités du moment*:\n\n';
        translatedArticles.forEach((article, index) => {
            newsMessage += `${index + 1}. *${article.title}*\n${article.description}\n\n`;
        });

        await sock.sendMessage(
            chatId,
            {
                text: newsMessage + "_\nBy MR_MUZAN_TECH ™_",
                contextInfo: { externalAdReply: settings.adReply }
            }
        );

    } catch (error) {
        console.error('Erreur actualités :', error);
        await sock.sendMessage(
            chatId,
            {
                text: '❌ Impossible de récupérer les actualités pour le moment.\n\n_By MUZAN TECH ™_',
                contextInfo: { externalAdReply: settings.adReply }
            }
        );
    }
}

module.exports = { newsCommand };