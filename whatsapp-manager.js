/**
 * whatsapp-manager.js
 * Gère une session WhatsApp (Baileys) par utilisateur Telegram.
 * Chaque utilisateur a son propre dossier de session : ./session/<telegramUserId>/
 */
const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore,
    delay
} = require('@whiskeysockets/baileys')
const pino = require('pino')
const fs = require('fs')
const path = require('path')
const { handleMessages, handleGroupParticipantUpdate, handleStatus } = require('./main')

// Sessions actives en mémoire : telegramUserId -> socket Baileys
const activeSessions = new Map()

async function startPairingSession(telegramUserId, phoneNumber, telegramBot, telegramChatId) {
    const sessionPath = path.join('./session', String(telegramUserId))
    if (!fs.existsSync(sessionPath)) fs.mkdirSync(sessionPath, { recursive: true })

    const { state, saveCreds } = await useMultiFileAuthState(sessionPath)
    const { version } = await fetchLatestBaileysVersion()

    const sock = makeWASocket({
        version,
        logger: pino({ level: 'silent' }),
        printQRInTerminal: false,
        browser: ['Ubuntu', 'Chrome', '20.0.04'],
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'fatal' })),
        },
    })

    activeSessions.set(telegramUserId, sock)
    sock.ev.on('creds.update', saveCreds)

    // Demande du code de jumelage si pas encore enregistré
    if (!sock.authState.creds.registered) {
        await delay(2000)
        try {
            const cleanNumber = phoneNumber.replace(/[^0-9]/g, '')
            let code = await sock.requestPairingCode(cleanNumber)
            code = code?.match(/.{1,4}/g)?.join('-') || code
            await telegramBot.sendMessage(
                telegramChatId,
                `🔑 Votre code de jumelage : *${code}*\n\n` +
                `Sur WhatsApp :\n1. Paramètres > Appareils liés\n2. Lier un appareil\n3. Lier avec un numéro de téléphone\n4. Entrez ce code`,
                { parse_mode: 'Markdown' }
            )
        } catch (err) {
            await telegramBot.sendMessage(telegramChatId, `❌ Erreur lors de la génération du code : ${err.message}`)
            activeSessions.delete(telegramUserId)
            return sock
        }
    }

    // Traitement des messages entrants (commandes .menu, .sticker, .ban, etc. définies dans main.js)
    sock.ev.on('messages.upsert', async (chatUpdate) => {
        try {
            const mek = chatUpdate.messages[0]
            if (!mek?.message) return
            mek.message = (Object.keys(mek.message)[0] === 'ephemeralMessage')
                ? mek.message.ephemeralMessage.message
                : mek.message
            if (mek.key?.remoteJid === 'status@broadcast') {
                await handleStatus(sock, chatUpdate)
                return
            }
            await handleMessages(sock, chatUpdate, true)
        } catch (err) {
            console.error(`Erreur handleMessages (session ${telegramUserId}) :`, err)
        }
    })

    sock.ev.on('group-participants.update', async (update) => {
        try {
            await handleGroupParticipantUpdate(sock, update)
        } catch (err) {
            console.error(`Erreur handleGroupParticipantUpdate (session ${telegramUserId}) :`, err)
        }
    })

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update

        if (connection === 'open') {
            await telegramBot.sendMessage(telegramChatId, `✅ WhatsApp connecté avec succès pour le numéro ${phoneNumber} !`)
        }

        if (connection === 'close') {
            const statusCode = lastDisconnect?.error?.output?.statusCode
            const shouldReconnect = statusCode !== DisconnectReason.loggedOut

            if (statusCode === DisconnectReason.loggedOut) {
                activeSessions.delete(telegramUserId)
                await telegramBot.sendMessage(telegramChatId, `⚠️ Session WhatsApp déconnectée pour ${phoneNumber}. Refaites /pair pour vous reconnecter.`)
            } else if (shouldReconnect) {
                await delay(5000)
                await startPairingSession(telegramUserId, phoneNumber, telegramBot, telegramChatId)
            }
        }
    })

    return sock
}

function getSession(telegramUserId) {
    return activeSessions.get(telegramUserId)
}

function getAllSessions() {
    return activeSessions
}

async function logoutSession(telegramUserId) {
    const sock = activeSessions.get(telegramUserId)
    if (!sock) return false
    try {
        await sock.logout()
    } catch {}
    activeSessions.delete(telegramUserId)
    return true
}

module.exports = { startPairingSession, getSession, getAllSessions, logoutSession }
