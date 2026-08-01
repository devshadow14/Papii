/**
 * telegram-bot.js
 * Interface Telegram : /pair <numero>, /status, /logout
 */
require('dotenv').config()
const TelegramBot = require('node-telegram-bot-api')
const { startPairingSession, getSession, logoutSession, getAllSessions } = require('./whatsapp-manager')

const TOKEN = process.env.TELEGRAM_BOT_TOKEN
const BOT_NAME = process.env.BOT_NAME || 'DEV SHADOW MD V1.0'
const ADMIN_ID = 8853009974

function isAdmin(userId) {
    return Number(userId) === ADMIN_ID
}

// Canal obligatoire (codé en dur, pas besoin de .env)
const REQUIRED_CHANNELS = [
    { id: -1004378010801, name: 'Canal Scofield', link: 'https://t.me/+nVlSnjK2GVljNjhk' }
]

if (!TOKEN) {
    console.error('❌ TELEGRAM_BOT_TOKEN manquant dans le fichier .env')
    process.exit(1)
}

const bot = new TelegramBot(TOKEN, { polling: true })

// Garde en mémoire le dernier message envoyé par le bot, par utilisateur
const lastBotMessage = new Map()

// Supprime le message précédent du bot pour ce chat, puis envoie le nouveau
async function sendReplacing(chatId, sendFn) {
    const previous = lastBotMessage.get(chatId)
    if (previous) {
        await bot.deleteMessage(chatId, previous).catch(() => {})
    }
    const sent = await sendFn()
    lastBotMessage.set(chatId, sent.message_id)
    return sent
}

// Vérifie si l'utilisateur a rejoint TOUS les canaux requis (le bot doit être admin de chacun)
async function getMissingChannels(userId) {
    const missing = []
    for (const channel of REQUIRED_CHANNELS) {
        try {
            const member = await bot.getChatMember(channel.id, userId)
            if (!['member', 'administrator', 'creator'].includes(member.status)) {
                missing.push(channel)
            }
        } catch (err) {
            console.error(`Erreur vérification canal ${channel.name} :`, err.message)
            missing.push(channel)
        }
    }
    return missing
}

// Images
const START_IMAGE = 'https://files.catbox.moe/gmc0e0.jpg'
const CONNECTED_IMAGE = 'https://files.catbox.moe/jy343n.jpg'

const WELCOME_BANNER =
`┏━━━━━━━━━━━━━━━┓
   ⚡ 𝗕𝗜𝗘𝗡𝗩𝗘𝗡𝗨𝗘 ⚡
┗━━━━━━━━━━━━━━━┛
『 𝗠𝗜𝗖𝗛𝗘𝗔𝗟 𝗦𝗖𝗢𝗙𝗜𝗘𝗟𝗗 𝗠𝗗 』

🤖 𝗕𝗼𝘁 𝗪𝗵𝗮𝘁𝘀𝗔𝗽𝗽 𝗠𝘂𝗹𝘁𝗶-𝗔𝗽𝗽𝗮𝗿𝗲𝗶𝗹𝘀
🚀 𝗥𝗮𝗽𝗶𝗱𝗲 • 𝗦𝘁𝗮𝗯𝗹𝗲 • 𝗣𝗿𝗲𝗺𝗶𝘂𝗺

✨ 𝗜𝗔 𝗽𝘂𝗶𝘀𝘀𝗮𝗻𝘁𝗲
✨ 𝗧é𝗹é𝗰𝗵𝗮𝗿𝗴𝗲𝗺𝗲𝗻𝘁 𝘃𝗶𝗱é𝗼 & 𝗺𝘂𝘀𝗶𝗾𝘂𝗲
✨ 𝗚𝗲𝘀𝘁𝗶𝗼𝗻 𝗱𝗲 𝗴𝗿𝗼𝘂𝗽𝗲 𝗮𝘃𝗮𝗻𝗰é𝗲

📌 𝗔𝗽𝗽𝘂𝘆𝗲𝘇 𝘀𝘂𝗿 𝗹𝗲 𝗯𝗼𝘂𝘁𝗼𝗻 𝗽𝗼𝘂𝗿 𝗰𝗼𝗺𝗺𝗲𝗻𝗰𝗲𝗿`

function connectedInfoMessage(firstName) {
    return `ʙᴏɴsᴏɪʀ, ${firstName} !\n\n` +
        `╭─────────────\n` +
        `│ 〔 ɪɴғᴏ ʙᴏᴛ 〕\n` +
        `├─────────────\n` +
        `│ 𒑡 ɴᴏᴍ : ᴍɪᴄʜᴇᴀʟ sᴄᴏғɪᴇʟᴅ ᴍᴅ\n` +
        `│ 𒑡 ᴠᴇʀsɪᴏɴ : 1.0.0\n` +
        `│ 𒑡 ᴘʀéғɪxᴇ : .\n` +
        `│ 𒑡 ᴅᴇᴠ : ᴅᴇᴠ sʜᴀᴅᴏᴡ ᴛᴇᴄʜ\n` +
        `╰─────────────\n\n` +
        `╭─────────────\n` +
        `│ 〔 ᴄᴏᴍᴍᴀɴᴅᴇs 〕\n` +
        `├─────────────\n` +
        `│ 𒑡 /pair <numero>\n` +
        `│ 𒑡 /status\n` +
        `│ 𒑡 /logout\n` +
        `╰─────────────`
}

function pairUsageMessage() {
    return `╭--------------------------\n` +
        `┃┌─〔 Micheal scofield 〕\n` +
        `┃ ✪ ᴜsᴀɢᴇ:\n` +
        `┃   /pair <ɴᴜᴍʙᴇʀ>\n` +
        `┃\n` +
        `┃ ✪ ᴇxᴀᴍᴘʟᴇ:\n` +
        `┃   /pair 221 xxxxxxx\n` +
        `┃└────────────\n` +
        `╰-------------------------`
}

function statusMessage(isActive) {
    return `╭--------------------------\n` +
        `┃┌─〔 Micheal scofield 〕\n` +
        `┃ ✪ sᴛᴀᴛᴜᴛ:\n` +
        `┃   ${isActive ? '✅ sᴇssɪᴏɴ ᴀᴄᴛɪᴠᴇ' : '❌ ᴀᴜᴄᴜɴᴇ sᴇssɪᴏɴ'}\n` +
        `┃\n` +
        `┃ ✪ ɪɴғᴏ:\n` +
        `┃   ${isActive ? 'ᴡʜᴀᴛsᴀᴘᴘ ᴄᴏɴɴᴇᴄᴛé' : 'ᴜᴛɪʟɪsᴇᴢ /pair <ɴᴜᴍʙᴇʀ>'}\n` +
        `┃└────────────\n` +
        `╰-------------------------`
}

function logoutMessage(success) {
    return `╭--------------------------\n` +
        `┃┌─〔 Micheal scofield 〕\n` +
        `┃ ✪ ʀésᴜʟᴛᴀᴛ:\n` +
        `┃   ${success ? '👋 sᴇssɪᴏɴ ᴅéᴄᴏɴɴᴇᴄᴛéᴇ' : '❌ ᴀᴜᴄᴜɴᴇ sᴇssɪᴏɴ ᴀᴄᴛɪᴠᴇ'}\n` +
        `┃└────────────\n` +
        `╰-------------------------`
}

function adminPanelMessage() {
    const sessionCount = getAllSessions().size
    return `╭--------------------------\n` +
        `┃┌─〔 Micheal scofield 〕\n` +
        `┃ ✪ 👑 ᴇsᴘᴀᴄᴇ ᴀᴅᴍɪɴ\n` +
        `┃\n` +
        `┃ ✪ sᴇssɪᴏɴs ᴀᴄᴛɪᴠᴇs:\n` +
        `┃   ${sessionCount}\n` +
        `┃\n` +
        `┃ ✪ ᴄᴏᴍᴍᴀɴᴅᴇs:\n` +
        `┃   /admin - ᴄᴇ ᴘᴀɴᴇʟ\n` +
        `┃   /broadcast <msg> - ᴇɴᴠᴏʏᴇʀ à ᴛᴏᴜs\n` +
        `┃└────────────\n` +
        `╰-------------------------`
}

bot.onText(/^\/admin$/, async (msg) => {
    const chatId = msg.chat.id
    if (!isAdmin(msg.from.id)) {
        return bot.sendMessage(chatId, '❌ Commande réservée à l\'administrateur du bot.')
    }
    await bot.sendMessage(chatId, adminPanelMessage())
})

bot.onText(/\/broadcast (.+)/s, async (msg, match) => {
    const chatId = msg.chat.id
    if (!isAdmin(msg.from.id)) {
        return bot.sendMessage(chatId, '❌ Commande réservée à l\'administrateur du bot.')
    }
    const text = match[1]
    const sessions = getAllSessions()
    let sent = 0
    for (const telegramUserId of sessions.keys()) {
        try {
            await bot.sendMessage(telegramUserId, `📢 *Message du propriétaire*\n\n${text}`, { parse_mode: 'Markdown' })
            sent++
        } catch (err) {
            console.error(`Échec broadcast vers ${telegramUserId} :`, err.message)
        }
    }
    await bot.sendMessage(chatId, `✅ Message envoyé à ${sent}/${sessions.size} utilisateur(s).`)
})

bot.onText(/\/start$/, async (msg) => {
    const chatId = msg.chat.id
    try {
        await bot.sendPhoto(chatId, START_IMAGE, {
            caption: WELCOME_BANNER,
            reply_markup: {
                inline_keyboard: [
                    [{ text: '⚡ Start Bot 👽', callback_data: 'start_bot' }]
                ]
            }
        })
    } catch (err) {
        console.error('Erreur /start :', err.message)
        await bot.sendMessage(chatId, '❌ Une erreur est survenue. Réessayez /start.')
    }
})

bot.on('callback_query', async (query) => {
    const chatId = query.message.chat.id
    const userId = query.from.id

    if (query.data === 'start_bot') {
        await bot.answerCallbackQuery(query.id)

        const missing = await getMissingChannels(userId)
        if (missing.length > 0) {
            await sendReplacing(chatId, () => bot.sendMessage(chatId,
                `❌ *Accès refusé*\n\nVous devez d'abord rejoindre ${missing.length > 1 ? 'nos canaux officiels' : 'notre canal officiel'} pour utiliser le bot.`,
                {
                    parse_mode: 'Markdown',
                    reply_markup: {
                        inline_keyboard: [
                            ...missing.map(c => [{ text: `📢 Rejoindre ${c.name}`, url: c.link }]),
                            [{ text: '✅ J\'ai rejoint, vérifier', callback_data: 'start_bot' }]
                        ]
                    }
                }
            ))
            return
        }

        try {
            await sendReplacing(chatId, () => bot.sendPhoto(chatId, CONNECTED_IMAGE, {
                caption: connectedInfoMessage(query.from.first_name || 'Utilisateur')
            }))
        } catch (err) {
            console.error('Erreur envoi message connecté :', err.message)
            await sendReplacing(chatId, () => bot.sendMessage(chatId, connectedInfoMessage(query.from.first_name || 'Utilisateur')))
        }
    }
})

bot.onText(/^\/pair$/, async (msg) => {
    await bot.sendMessage(msg.chat.id, pairUsageMessage())
})

bot.onText(/\/pair (.+)/, async (msg, match) => {
    const chatId = msg.chat.id
    const userId = msg.from.id
    const phoneNumber = match[1].replace(/[^0-9]/g, '')

    const missing = await getMissingChannels(userId)
    if (missing.length > 0) {
        return bot.sendMessage(chatId,
            `❌ *Accès refusé*\n\nVous devez d'abord rejoindre ${missing.length > 1 ? 'nos canaux officiels' : 'notre canal officiel'}.`,
            {
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: missing.map(c => [{ text: `📢 Rejoindre ${c.name}`, url: c.link }])
                }
            }
        )
    }

    if (!phoneNumber || phoneNumber.length < 8) {
        return bot.sendMessage(chatId, pairUsageMessage())
    }

    if (getSession(userId)) {
        return bot.sendMessage(chatId, '⚠️ Vous avez déjà une session active. Faites /logout avant de connecter un autre numéro.')
    }

    await bot.sendMessage(chatId, `⏳ Génération du code de jumelage pour ${phoneNumber}...`)
    await startPairingSession(userId, phoneNumber, bot, chatId)
})

bot.onText(/\/status/, async (msg) => {
    const chatId = msg.chat.id
    const session = getSession(msg.from.id)
    await bot.sendMessage(chatId, statusMessage(!!session))
})

bot.onText(/\/logout/, async (msg) => {
    const chatId = msg.chat.id
    const ok = await logoutSession(msg.from.id)
    await bot.sendMessage(chatId, logoutMessage(ok))
})

bot.on('polling_error', (err) => {
    console.error('❌ Erreur polling Telegram :', err.message)
})

console.log(`🤖 Bot Telegram "${BOT_NAME}" démarré et en écoute...`)

module.exports = bot
