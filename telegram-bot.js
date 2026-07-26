/**
 * telegram-bot.js
 * Interface Telegram : /pair <numero>, /status, /logout
 */
require('dotenv').config()
const TelegramBot = require('node-telegram-bot-api')
const { startPairingSession, getSession, logoutSession } = require('./whatsapp-manager')

const TOKEN = process.env.TELEGRAM_BOT_TOKEN
const BOT_NAME = process.env.BOT_NAME || 'DEV SHADOW MD V1.0'

if (!TOKEN) {
    console.error('❌ TELEGRAM_BOT_TOKEN manquant dans le fichier .env')
    process.exit(1)
}

const bot = new TelegramBot(TOKEN, { polling: true })

bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id,
        `👋 Bienvenue sur *${BOT_NAME}*\n\n` +
        `Commandes disponibles :\n` +
        `/pair <numero> — Connecter un numéro WhatsApp\n` +
        `/status — Voir votre session active\n` +
        `/logout — Déconnecter votre session`,
        { parse_mode: 'Markdown' }
    )
})

bot.onText(/\/pair (.+)/, async (msg, match) => {
    const chatId = msg.chat.id
    const userId = msg.from.id
    const phoneNumber = match[1].replace(/[^0-9]/g, '')

    if (!phoneNumber || phoneNumber.length < 8) {
        return bot.sendMessage(chatId, '❌ Numéro invalide. Exemple : /pair 221779867123')
    }

    if (getSession(userId)) {
        return bot.sendMessage(chatId, '⚠️ Vous avez déjà une session active. Faites /logout avant de connecter un autre numéro.')
    }

    await bot.sendMessage(chatId, `⏳ Génération du code de jumelage pour ${phoneNumber}...`)
    await startPairingSession(userId, phoneNumber, bot, chatId)
})

bot.onText(/\/status/, (msg) => {
    const session = getSession(msg.from.id)
    bot.sendMessage(msg.chat.id, session ? '✅ Session WhatsApp active.' : '❌ Aucune session active. Utilisez /pair <numero>.')
})

bot.onText(/\/logout/, async (msg) => {
    const chatId = msg.chat.id
    const ok = await logoutSession(msg.from.id)
    bot.sendMessage(chatId, ok ? '👋 Session déconnectée.' : '❌ Aucune session active.')
})

console.log(`🤖 Bot Telegram "${BOT_NAME}" démarré et en écoute...`)

module.exports = bot
