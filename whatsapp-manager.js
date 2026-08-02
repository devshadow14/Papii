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
const PhoneNumber = require('awesome-phonenumber')
const { handleMessages, handleGroupParticipantUpdate, handleStatus } = require('./main')

// Sessions actives en mémoire : telegramUserId -> socket Baileys
const activeSessions = new Map()

async function startPairingSession(telegramUserId, phoneNumber, telegramBot, telegramChatId) {
    const cleanNumber = phoneNumber.replace(/[^0-9]/g, '')

    // Validation du numéro AVANT de créer le socket
    if (!PhoneNumber('+' + cleanNumber).isValid()) {
        await telegramBot.sendMessage(telegramChatId, `❌ Numéro invalide : ${phoneNumber}\n\nFormat attendu : indicatif pays + numéro, sans + ni espaces (ex: 221779867123).`)
        return null
    }

    const sessionPath = path.join('./session', String(telegramUserId))

    // Reset de session avant un nouveau /pair (comme dans la version panel web) — évite les conflits d'ancienne session
    if (activeSessions.has(telegramUserId)) {
        try { activeSessions.get(telegramUserId).end() } catch {}
        activeSessions.delete(telegramUserId)
    }
    if (fs.existsSync(sessionPath)) {
        fs.rmSync(sessionPath, { recursive: true, force: true })
    }
    fs.mkdirSync(sessionPath, { recursive: true })

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

    // Demande du code de jumelage — UNIQUEMENT si ce numéro n'est pas déjà enregistré
    if (!sock.authState.creds.registered) {
        await delay(8000) // laisse le socket bien s'initialiser avant de demander le code
        try {
            let code = await sock.requestPairingCode(cleanNumber)
            code = code?.match(/.{1,4}/g)?.join('-') || code
            const codeMessage =
                `╭--------------------------\n` +
                `┃┌─〔 Micheal scofield 〕\n` +
                `┃ ✪ ᴄᴏᴅᴇ ᴅᴇ ᴊᴜᴍᴇʟᴀɢᴇ:\n` +
                `┃   \`${code}\`\n` +
                `┃\n` +
                `┃ ✪ ᴇᴛᴀᴘᴇs:\n` +
                `┃   1. Paramètres\n` +
                `┃   2. Appareils liés\n` +
                `┃   3. Lier un appareil\n` +
                `┃   4. Lier avec un numéro\n` +
                `┃   5. Entrez le code ⬆️ (appui long pour copier)\n` +
                `┃└────────────\n` +
                `╰-------------------------`
            await telegramBot.sendMessage(telegramChatId, codeMessage, { parse_mode: 'Markdown' })
        } catch (err) {
            console.error(`Erreur requestPairingCode (${telegramUserId}) :`, err)
            await telegramBot.sendMessage(telegramChatId, `❌ Erreur lors de la génération du code : ${err.message}\n\nRéessayez avec /pair ${phoneNumber}`)
            try { sock.end() } catch {}
            activeSessions.delete(telegramUserId)
            return null
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
            const isLoggedOut = statusCode === DisconnectReason.loggedOut
            const wasRegistered = sock.authState.creds.registered

            if (isLoggedOut) {
                activeSessions.delete(telegramUserId)
                await telegramBot.sendMessage(telegramChatId, `⚠️ Session WhatsApp déconnectée pour ${phoneNumber}. Refaites /pair pour vous reconnecter.`)
            } else if (wasRegistered) {
                // Déjà connecté avec succès avant la coupure → simple reconnexion, SANS régénérer de code
                await delay(5000)
                await reconnectSession(telegramUserId, phoneNumber, telegramBot, telegramChatId)
            } else {
                // Coupure pendant la phase de pairing (avant que le code soit entré) → on n'auto-relance PAS
                // pour éviter une boucle de codes. L'utilisateur doit relancer /pair manuellement si besoin.
                console.log(`Session ${telegramUserId} fermée avant la fin du pairing, aucune relance automatique.`)
                activeSessions.delete(telegramUserId)
            }
        }
    })

    return sock
}

// Reconnexion d'une session déjà appairée (ne redemande jamais de code)
async function reconnectSession(telegramUserId, phoneNumber, telegramBot, telegramChatId) {
    const sessionPath = path.join('./session', String(telegramUserId))
    if (!fs.existsSync(sessionPath)) {
        console.log(`Pas de session existante pour ${telegramUserId}, reconnexion annulée.`)
        return null
    }

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
            await telegramBot.sendMessage(telegramChatId, `✅ bot scofield connecter avec succès pour le numéro ${phoneNumber} !`)
        }

        if (connection === 'close') {
            const statusCode = lastDisconnect?.error?.output?.statusCode
            const isLoggedOut = statusCode === DisconnectReason.loggedOut

            if (isLoggedOut) {
                activeSessions.delete(telegramUserId)
                await telegramBot.sendMessage(telegramChatId, `⚠️ Session WhatsApp déconnectée pour ${phoneNumber}. Refaites /pair pour vous reconnecter.`)
            } else {
                await delay(5000)
                await reconnectSession(telegramUserId, phoneNumber, telegramBot, telegramChatId)
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
