const settings = {
  packname: '𝐌𝐈𝐂𝐇𝐀𝐄𝐋 𝐒𝐂𝐎𝐅𝐈𝐄𝐋𝐃 𝐌𝐃 𝐕1.0',
  author: '𝐃𝐄𝐕 𝐌𝐈𝐂𝐇𝐀𝐄𝐋.𝐒𝐂𝐎𝐅𝐈𝐄𝐋𝐃',
  botName: "𝐌𝐈𝐂𝐇𝐄𝐀𝐋 𝐒𝐂𝐎𝐅𝐈𝐄𝐋𝐃 𝐌𝐃 𝐕1.0",
  botOwner: '𝐃𝐄𝐕 𝐌𝐈𝐂𝐇𝐀𝐄𝐋 𝐒𝐂𝐎𝐅𝐈𝐄𝐋𝐃',
  phoneNumber: "221711192303", // Non utilisé pour le pairing (désormais géré par Telegram /pair), gardé pour compatibilité avec main.js
  ownerNumber: '221711192303', // Numéro du propriétaire principal du bot (admin des commandes .owner, .sudo, etc.)
  giphyApiKey: 'qnl7ssQChTdPjsKta2Ax2LMaGXz303tq',
  commandMode: "public",
  maxStoreMessages: 20,
  storeWriteInterval: 10000,
  description: "MICHAEL SCOFIELD MD — Bot WhatsApp en français, rapide, multi-device, piloté via Telegram.",
  version: "1.0.0",
  channelLink: "https://whatsapp.com/channel/0029Vb86OeIHVvTfZBkfYx2Y",
  updateZipUrl: "https://github.com/STIVE-DEVX/ZENTROX-MD-main.zip",
  botPreview: "https://files.catbox.moe/hu6ia4.jpg",

  // Carte globale
  adReply: {
    title: "𝐌𝐈𝐂𝐇𝐀𝐄𝐋 𝐒𝐂𝐎𝐅𝐈𝐄𝐋𝐃 𝐌𝐃 𝐕1.0",
    body: "𝐛𝐲 𝐃𝐄𝐕 𝐌𝐈𝐂𝐇𝐀𝐄𝐋 𝐒𝐂𝐎𝐅𝐈𝐄𝐋𝐃",
    thumbnailUrl: 'https://files.catbox.moe/hu6ia4.jpg',
    sourceUrl: 'https://whatsapp.com/channel/0029Vb86OeIHVvTfZBkfYx2Y',
    mediaType: 1,
    mediaUrl: 'https://whatsapp.com/channel/0029Vb86OeIHVvTfZBkfYx2Y',
    renderLargerThumbnail: false
  },

  // Newsletter global (optionnel, utilisable dans toutes les commandes)
  newsletter: {
    newsletterJid: '0029Vb86OeIHVvTfZBkfYx2Y@newsletter',
    newsletterName: 'MICHEAL SCOFIELD MD',
    serverMessageId: -1
  }
};

module.exports = settings;
