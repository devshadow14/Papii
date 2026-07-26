const settings = {
  packname: 'DEV SHADOW MD V1.0',
  author: 'DEV SHADOW TECH',
  botName: "DEV SHADOW MD V1.0",
  botOwner: 'DEV SHADOW TECH',
  phoneNumber: "221711192303", // Non utilisé pour le pairing (désormais géré par Telegram /pair), gardé pour compatibilité avec main.js
  ownerNumber: '221711192303', // Numéro du propriétaire principal du bot (admin des commandes .owner, .sudo, etc.)
  giphyApiKey: 'qnl7ssQChTdPjsKta2Ax2LMaGXz303tq',
  commandMode: "public",
  maxStoreMessages: 20,
  storeWriteInterval: 10000,
  description: "DEV SHADOW MD — Bot WhatsApp en français, rapide, multi-device, piloté via Telegram.",
  version: "1.0.0",
  channelLink: "https://whatsapp.com/channel/0029VbAlfhMAInPdvqEmAf2N",
  updateZipUrl: "https://github.com/STIVE-DEVX/ZENTROX-MD-main.zip",
  botPreview: "https://i.postimg.cc/Dz3mbLwc/bot-image-f-Of28PVl.jpg",

  // Carte globale
  adReply: {
    title: "DEV SHADOW MD V1.0",
    body: "BY DEV SHADOW TECH",
    thumbnailUrl: 'https://i.postimg.cc/c4KWPt69/chatgpt-image-3-dec-2025-17-48-55-PQCmcx-Vn.jpg',
    sourceUrl: 'https://whatsapp.com/channel/0029VbAlfhMAInPdvqEmAf2N',
    mediaType: 1,
    mediaUrl: 'https://whatsapp.com/channel/0029VbAlfhMAInPdvqEmAf2N',
    renderLargerThumbnail: false
  },

  // Newsletter global (optionnel, utilisable dans toutes les commandes)
  newsletter: {
    newsletterJid: '120363402057857053@newsletter',
    newsletterName: 'DEV SHADOW MD V1.0',
    serverMessageId: -1
  }
};

module.exports = settings;
