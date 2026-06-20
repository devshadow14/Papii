import {
    makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore,
    delay,
} from "@whiskeysockets/baileys";

import pino from "pino";
import { Boom } from "@hapi/boom";
import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3002;
const sessionsDir = path.join(__dirname, 'accounts');

if (!fs.existsSync(sessionsDir)) fs.mkdirSync(sessionsDir, { recursive: true });

let tempDvmsys = {};

async function startUserBot(phoneNumber, isPairing = false) {
    const sessionName = `session_${phoneNumber.replace(/[^0-9]/g, '')}`;
    const sessionPath = path.join(sessionsDir, sessionName);

    if (isPairing) {
        if (tempDvmsys[sessionName]) {
            try { tempDvmsys[sessionName].end(); delete tempDvmsys[sessionName]; } catch (e) { }
        }
        if (fs.existsSync(sessionPath)) {
            fs.rmSync(sessionPath, { recursive: true, force: true });
        }
    }

    const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
    const { version } = await fetchLatestBaileysVersion();

    const dvmsy = makeWASocket({
        version,
        logger: pino({ level: 'silent' }),
        printQRInTerminal: false,
        browser: ["Ubuntu", "Chrome", "20.0.04"],
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "silent" })),
        }
    });

    tempDvmsys[sessionName] = dvmsy;
    
    dvmsy.ev.on("messages.upsert", async chatUpdate => {
        try {
            const msg = chatUpdate.messages[0];
            if (!msg.message || msg.key.remoteJid === 'status@broadcast') return;
            
            const text = msg.message.conversation || msg.message.extendedTextMessage?.text || '';
            const sender = msg.key.remoteJid;
            const isGroup = sender.endsWith('@g.us');
            
            if (text.startsWith('.')) {
                await handleCommand(dvmsy, msg, text, sender, isGroup);
            }
        } catch (err) {
            console.error("Erreur:", err.message);
        }
    });
  
    dvmsy.ev.on("connection.update", async (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === "close") {
            let reason = new Boom(lastDisconnect?.error)?.output.statusCode;
            if (reason !== DisconnectReason.loggedOut && tempDvmsys[sessionName]) {
                console.log(`[${phoneNumber}] Reconnexion...`);
                startUserBot(phoneNumber);
            }
        } else if (connection === "open") {
            console.log(`✅ [${phoneNumber}] 𝕮𝖔𝖓𝖓𝖊𝖈𝖙é !`);
            const userJid = dvmsy.user.id.split(":")[0] + "@s.whatsapp.net";
            await dvmsy.sendMessage(userJid, {
                image: { url: "https://files.catbox.moe/063nfo.jpg" },
                caption: `╔━━━『 🤖 𝕸𝖎𝖓𝖎 𝕭𝖔𝖙 𝕯𝖊𝖛 𝕾𝖍𝖆𝖉𝖔𝖜 』━━━╗

✅ 𝕮𝖔𝖓𝖓𝖊𝖈𝖎𝖔𝖑 𝖇𝖊𝖓𝖓𝖆𝖒 !

👑 +${dvmsy.user.id.split(":")[0]}
⚡ 𝖖𝖔𝖚𝖘 ê𝖙𝖊𝖘 𝖔𝖎𝖑𝖎𝖎𝖎 🔥

📖 𝕿𝖆𝖕𝖊𝖙 *.𝖆𝖊𝖎𝖚𝖎*

╚━━━━━━━━━━━━━━━━━━━━╝`,
            });
        }
    });

    dvmsy.ev.on("creds.update", saveCreds);
    return dvmsy;
}

async function handleCommand(sock, msg, text, sender, isGroup) {
    const args = text.slice(1).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    try {
        switch(command) {
            // ===== COMMANDES FUN =====
            case 'ping':
                await sock.sendMessage(sender, { text: '🏓 *𝕻𝖎𝖙𝖘 𝕭𝖎𝖖* ⚡' });
                break;
            case 'hello':
                await sock.sendMessage(sender, { text: '👋 *𝕭𝖔𝖙𝖆𝖍𝖎𝖘𝖊𝖈𝖎 !* 🎉' });
                break;
            case 'joke':
                const jokes = ['𝕻𝖍𝖘𝖖𝖚𝖆𝖍𝖔𝖑 𝖊𝖙 𝖒𝖚𝖙𝖊𝖙𝖆 🤣', '𝕴𝖎 𝖈'𝖎𝖙𝖆𝖍 𝖋𝖔𝖖𝖔 🎪', '𝖇𝖘𝖈𝖔𝖔𝖕𝖘𝖨𝖔𝖍 ! 😆'];
                await sock.sendMessage(sender, { text: jokes[Math.floor(Math.random() * jokes.length)] });
                break;
            case 'dice':
                const dice = Math.floor(Math.random() * 6) + 1;
                await sock.sendMessage(sender, { text: `🎲 𝖁𝖔𝖚𝖘 𝖆𝖛𝖊𝖟 : ${dice}` });
                break;
            case 'coin':
                const coin = Math.random() < 0.5 ? '𝖋𝖎𝖈𝖈𝖊' : '𝖕𝖈𝖑𝖉𝖊';
                await sock.sendMessage(sender, { text: `🪙 ${coin.toUpperCase()}` });
                break;
            case 'quote':
                const quotes = ['𝖀𝖎 𝖉𝖔𝖎𝖘 𝖜𝖈𝖔𝖌𝖎𝖈𝖎𝖘𝖎𝖊𝖗 😊', '𝕿𝖍𝖘𝖎𝖠𝖗𝖎𝖛𝖔𝖔𝖎 🌟', '𝖎𝖔𝖚𝖘 𝖎𝖊 𝖘𝖙𝖔𝖚𝖋🔥'];
                await sock.sendMessage(sender, { text: quotes[Math.floor(Math.random() * quotes.length)] });
                break;
            case 'love':
                await sock.sendMessage(sender, { text: `💘 *𝕳𝖆𝖎𝖝 𝖉'𝖈𝖘𝖞𝖚𝖗!* ${Math.floor(Math.random() * 100)}%` });
                break;
            case 'happy':
                await sock.sendMessage(sender, { text: '😊 𝕭𝖎𝖑𝖔𝖍𝖎𝖊𝖘𝖎𝖎 ! 🎊' });
                break;
            case 'dance':
                await sock.sendMessage(sender, { text: '💃 𝕯𝖆𝖓𝖘𝖮 𝖒𝖊 ! 🕺' });
                break;
            case 'smile':
                await sock.sendMessage(sender, { text: '😄 𝕿𝖠𝖇𝖎𝖚𝖚𝖎𝖚 ! 😎' });
                break;
            case 'hug':
                await sock.sendMessage(sender, { text: '🤗 *𝕭𝖈𝖔𝖔𝖈𝖊𝖘 ĉ𝖑𝖎𝖓𝖆𝖕𝖎𝖔*' });
                break;
            case 'kiss':
                await sock.sendMessage(sender, { text: '😘 *𝕵𝖎 𝖘𝖎 𝖕𝖔𝖚𝖘 𝖖𝖔𝖚𝖙𝖊𝖓* 💋' });
                break;
            case 'emoji':
                const emojis = ['😀', '😂', '🤣', '❤️', '🔥', '✨', '🎉', '⭐'];
                await sock.sendMessage(sender, { text: emojis[Math.floor(Math.random() * emojis.length)] });
                break;
            case 'meme':
                await sock.sendMessage(sender, { text: '😂 *𝕻𝖔𝖔𝖗 𝖜𝖆𝖙𝖜𝖎𝖙 𝖉𝖊 𝖒𝖎𝖒𝖎𝖈𝖔𝖎𝖈𝖘𝖘𝖍𝖔𝖎𝖎𝖍𝖈𝖊𝖎𝖎𝖔𝖔!* 🤖' });
                break;

            // ===== COMMANDES OUTILS =====
            case 'calc':
                if (args.length === 0) {
                    await sock.sendMessage(sender, { text: '❌ 𝖀𝖘𝖆𝖌𝖎 : *.calc 2+2*' });
                    break;
                }
                try {
                    const result = eval(args.join(' '));
                    await sock.sendMessage(sender, { text: `🧮 ${args.join(' ')} = **${result}**` });
                } catch(e) {
                    await sock.sendMessage(sender, { text: '❌ 𝖈𝖆𝖎𝖈𝖚𝖑 𝖎𝖛𝖛𝖆𝖑𝖎𝖉𝖎𝖎𝖎 !' });
                }
                break;
            case 'translate':
                await sock.sendMessage(sender, { text: '🌐 *𝕿𝖘𝖆𝖎𝖞𝖆𝖑𝖎𝖊𝖎𝖔𝖎𝖎 (𝖜𝖞𝖘𝖎𝖘𝖙𝖆𝖆)* ✨' });
                break;
            case 'time':
                const time = new Date().toLocaleTimeString();
                await sock.sendMessage(sender, { text: `⏰ *𝖍𝖔𝖚𝖊𝖊𝖎𝖎𝖆* : ${time}` });
                break;
            case 'date':
                const date = new Date().toLocaleDateString();
                await sock.sendMessage(sender, { text: `📅 *𝖈𝖆𝖇𝖆* : ${date}` });
                break;
            case 'qr':
                await sock.sendMessage(sender, { text: '📱 *𝕲𝖆𝖓𝖎𝖎𝖆𝖙𝖔𝖎𝖖𝖎𝖔𝖎𝖘𝖔𝖉𝖊 𝕿𝖙* ✨' });
                break;
            case 'uptime':
                await sock.sendMessage(sender, { text: `⏱️ *𝕺𝖜𝖙𝖎𝖒𝖖* : ${Math.floor(process.uptime())}𝖘` });
                break;
            case 'info':
                await sock.sendMessage(sender, { text: '📊 *𝖘𝖓𝖋𝖔𝖘𝖎𝖙𝖦𝖓𝖋𝖠 𝖉𝖎𝖎𝖘𝖋𝖔𝖎 𝖔𝖔𝖙𝖎𝖎𝖆* 💾' });
                break;
            case 'weather':
                await sock.sendMessage(sender, { text: '🌤️ *𝖆𝖍𝖕𝖔𝖘𝖍𝖎𝖍𝖋𝖎𝖎𝖆𝖎𝖨* ☀️' });
                break;
            case 'ip':
                await sock.sendMessage(sender, { text: '🌐 *𝖘𝖐𝖕𝖓𝖎𝖎𝖈𝖆𝖙𝖎𝖔𝖎𝖆 (𝖕𝖗𝖎𝖛𝖎𝖊)* 🔒' });
                break;

            // ===== COMMANDES GROUP =====
            case 'kick':
                if (!isGroup) {
                    await sock.sendMessage(sender, { text: '❌ 𝕮𝖔𝖓𝖆𝖚𝖙𝖊 𝖕𝖔𝖘𝖘𝖎𝖇𝖑𝖎 𝖛 𝖌𝖉𝖔𝖎𝖕𝖎' });
                } else {
                    await sock.sendMessage(sender, { text: '👊 𝖈𝖋𝖙𝖈𝖆𝖆𝖆𝖈𝖊 ! 💥' });
                }
                break;
            case 'ban':
                if (!isGroup) {
                    await sock.sendMessage(sender, { text: '❌ 𝕭𝖚𝖑𝖎𝖘𝖘𝖎 𝖌𝖜𝖔𝖚𝖕𝖊𝖘𝖎' });
                } else {
                    await sock.sendMessage(sender, { text: '🚫 𝖇𝖕𝖎𝖓𝖎𝖕 ! 🔒' });
                }
                break;
            case 'promote':
                if (!isGroup) {
                    await sock.sendMessage(sender, { text: '❌ 𝖀𝖘𝖆𝖜𝖎𝖆𝖊𝖎𝖘𝖆𝖙𝖔𝖗' });
                } else {
                    await sock.sendMessage(sender, { text: '⬆️ 𝖕𝖔𝖒𝖌𝖔𝖉𝖎𝖙𝖎𝖎𝖔𝖎𝖘𝖔 ! 👑' });
                }
                break;
            case 'demote':
                if (!isGroup) {
                    await sock.sendMessage(sender, { text: '❌ 𝖜𝖊𝖔𝖓𝖔𝖖𝖚𝖆𝖌𝖔' });
                } else {
                    await sock.sendMessage(sender, { text: '⬇️ 𝖖𝖎𝖘𝖈𝖆𝖘𝖎𝖎𝖎𝖎𝖎𝖨𝖙𝖎𝖎𝖔𝖊𝖎𝖙 ! 📉' });
                }
                break;
            case 'mute':
                if (!isGroup) {
                    await sock.sendMessage(sender, { text: '❌ 𝕮𝖆𝖎𝖒𝖆𝖜𝖎𝖎𝖍𝖙𝖈𝖔' });
                } else {
                    await sock.sendMessage(sender, { text: '🔇 𝕾𝖎𝖑𝖎𝖚𝖈𝖊 ! 🤐' });
                }
                break;
            case 'unmute':
                if (!isGroup) {
                    await sock.sendMessage(sender, { text: '❌ 𝖆𝖈𝖙𝖎𝖔𝖎𝖓𝖘𝖔𝖔𝖎𝖠' });
                } else {
                    await sock.sendMessage(sender, { text: '🔊 𝖕𝖈𝖎𝖗𝖎𝖝𝖘𝖘𝖔𝖗𝖆 ! 📢' });
                }
                break;
            case 'groupinfo':
                if (!isGroup) {
                    await sock.sendMessage(sender, { text: '❌ 𝖎𝖔𝖘𝖙𝖒𝖎𝖎𝖔𝖎𝖜' });
                } else {
                    await sock.sendMessage(sender, { text: '📋 *𝖎𝖓𝖋𝖔𝖘 𝖘𝖍𝖔𝖚𝖔𝖊𝖘* 📊' });
                }
                break;
            case 'members':
                if (!isGroup) {
                    await sock.sendMessage(sender, { text: '❌ 𝖔𝖘𝖔𝖋𝖚𝖔𝖎𝖊𝖔𝖎' });
                } else {
                    await sock.sendMessage(sender, { text: '👥 *𝕸𝖆𝖘𝖎𝖍𝖔𝖉𝖍𝖊𝖘* 📝' });
                }
                break;

            // ===== COMMANDES ADMIN =====
            case 'restart':
                await sock.sendMessage(sender, { text: '🔄 𝖗𝖎𝖘𝖕𝖔𝖆𝖌𝖊𝖋𝖈𝖌𝖘𝖋 ...' });
                setTimeout(() => process.exit(0), 2000);
                break;
            case 'stop':
                await sock.sendMessage(sender, { text: '⛔ 𝕭𝖔𝖘 𝖋𝖎𝖗𝖔 ...' });
                setTimeout(() => process.exit(0), 2000);
                break;
            case 'owner':
                await sock.sendMessage(sender, { text: '👤 **𝕺𝖜𝖚𝖊𝖗** : 𝖔𝖎𝖔𝖘 𝖘𝖎 ↔️ +𝖙𝖟' });
                break;
            case 'prefix':
                await sock.sendMessage(sender, { text: '⚙️ **𝖕𝖈𝖎𝖋𝖎𝖝** : *.* 🔧' });
                break;

            // ===== COMMANDES TEXTE =====
            case 'toupa':
                if (args.length === 0) {
                    await sock.sendMessage(sender, { text: '❌ 𝖀𝖘𝖆𝖌𝖎 : *.toupa 𝖙𝖊𝖛𝖘𝖎*' });
                } else {
                    await sock.sendMessage(sender, { text: args.join(' ').toUpperCase() });
                }
                break;
            case 'tolower':
                if (args.length === 0) {
                    await sock.sendMessage(sender, { text: '❌ 𝖀𝖘𝖆𝖌𝖎 : *.tolower 𝖙𝖊𝖝𝖘𝖊*' });
                } else {
                    await sock.sendMessage(sender, { text: args.join(' ').toLowerCase() });
                }
                break;
            case 'reverse':
                if (args.length === 0) {
                    await sock.sendMessage(sender, { text: '❌ 𝖀𝖘𝖆𝖌𝖎 : *.reverse 𝖙𝖊𝖝𝖘𝖊*' });
                } else {
                    await sock.sendMessage(sender, { text: args.join(' ').split('').reverse().join('') });
                }
                break;
            case 'repeat':
                if (args.length < 2) {
                    await sock.sendMessage(sender, { text: '❌ 𝖀𝖘𝖆𝖌𝖎 : *.repeat 𝖕𝖎𝖋𝖚𝖔𝖎𝖘𝖊 𝖙𝖊𝖝𝖙𝖊*' });
                } else {
                    const num = parseInt(args[0]);
                    const text = args.slice(1).join(' ');
                    await sock.sendMessage(sender, { text: text.repeat(num) });
                }
                break;
            case 'shuffle':
                if (args.length === 0) {
                    await sock.sendMessage(sender, { text: '❌ 𝖀𝖘𝖆𝖌𝖎 : *.shuffle 𝖙𝖊𝖝𝖘𝖊*' });
                } else {
                    const text = args.join('').split('').sort(() => Math.random() - 0.5).join('');
                    await sock.sendMessage(sender, { text });
                }
                break;

            // ===== COMMANDES INFO =====
            case 'help':
                const helpText = `╔═══════════════════════╗
║ 📖 *𝕸𝖊𝖘𝖆𝖌𝖉𝖎𝖈𝖆𝖠𝖙𝖎𝖔*
╠═══════════════════════╣

🎮 *𝖔𝖎𝖓* - ping, hello, joke, dice, coin, quote, love
⚙️ *𝖔𝖎𝖎𝖎𝖎𝖎𝖌* - calc, translate, time, date, qr
👥 *𝖌𝖆𝖘𝖎𝖎𝖕𝖊* - kick, ban, promote, demote, mute
📋 *𝕿𝖊𝖝𝖎𝖎𝖊* - toupa, tolower, reverse, repeat
⚡ *𝕲𝖙𝖎𝖎𝖖* - restart, stop, owner, prefix

╚═══════════════════════╝`;
                await sock.sendMessage(sender, { text: helpText });
                break;
            case 'menu':
                const menuText = `╔════════════════════════════╗
║ 🤖 *𝕸𝖎𝖓𝖎 𝕭𝖔𝖙 𝕯𝖊𝖛 𝕾𝖍𝖆𝖉𝖔𝖜*
╠════════════════════════════╣

🎮 *𝕱𝖚𝖓* - *.ping* *.hello* *.joke* *.dance*
🧮 *𝕺𝖔𝖚𝖎𝖔* - *.calc* *.time* *.date* *.uptime*
👥 *𝕲𝖔𝖚𝖎𝖎𝖕𝖌* - *.groupinfo* *.members*
📝 *𝕿𝖊𝖝𝖘𝖎* - *.toupa* *.tolower* *.reverse*
⚙️ *𝕬𝖉𝖒𝖎𝖎* - *.restart* *.owner* *.prefix*

╚════════════════════════════╝`;
                await sock.sendMessage(sender, { text: menuText });
                break;
            case 'about':
                await sock.sendMessage(sender, { text: `╔════════════════════════════╗
║ 🤖 *𝕸𝖎𝖓𝖎 𝕭𝖔𝖙 𝕯𝖊𝖛 𝖘𝖍𝖆𝖉𝖔𝖜*
║ ✨ 𝖀𝖓 𝖆𝖚𝖝𝖎𝖔𝖑𝖎𝖘𝖖𝖎 𝖎𝖔𝖊𝖔𝖔𝖎 !
║ 💎 𝖕𝖔𝖜𝖗𝖊𝖘𝖘𝖆𝖠 𝖓𝖔 𝖑𝖔𝖎𝖉𝖔𝖘𝖦𝖈𝖞
╚════════════════════════════╝` });
                break;

            // ===== PLUS DE COMMANDES =====
            case 'hello2':
                await sock.sendMessage(sender, { text: '🤖 𝕳𝖎 ! 👋' });
                break;
            case 'cool':
                await sock.sendMessage(sender, { text: '😎 𝖎𝖔𝖎𝖙𝖑 !' });
                break;
            case 'awesome':
                await sock.sendMessage(sender, { text: '🔥 𝖚𝖒𝖖𝖘𝖘𝖘𝖒𝖒𝖎 !' });
                break;
            case 'nice':
                await sock.sendMessage(sender, { text: '✨ 𝕿𝖘𝖔𝖎𝖘𝖎𝖎 ! 🎉' });
                break;
            case 'wow':
                await sock.sendMessage(sender, { text: '😲 𝖎𝖎𝖍𝖔𝖜𝖚𝖎 ! 🤯' });
                break;
            case 'yes':
                await sock.sendMessage(sender, { text: '✅ 𝕺𝖚𝖎 ! 👍' });
                break;
            case 'no':
                await sock.sendMessage(sender, { text: '❌ 𝖈𝖓 ! 👎' });
                break;
            case 'maybe':
                await sock.sendMessage(sender, { text: '🤔 𝕻𝖔𝖚𝖙-ê𝖙𝖔𝖊 ! 🌑' });
                break;
            case 'random':
                const randoms = ['✨', '🎲', '🎯', '🔮', '⭐', '💫', '🌟'];
                await sock.sendMessage(sender, { text: randoms[Math.floor(Math.random() * randoms.length)] });
                break;
            case 'star':
                await sock.sendMessage(sender, { text: '⭐ 𝖀𝖎𝖙𝖎𝖘𝖘𝖑𝖘𝖇𝖎𝖘𝖘𝖎 ! ✨' });
                break;
            case 'magic':
                await sock.sendMessage(sender, { text: '🪄 𝕿𝖎𝖘𝖈𝖈𝖊𝖎𝖎 🪄' });
                break;
            case 'trick':
                await sock.sendMessage(sender, { text: '🎩 𝖆𝖒𝖊𝖔𝖔𝖎𝖎 ! ✨' });
                break;
            case 'lucky':
                const luck = Math.floor(Math.random() * 100);
                await sock.sendMessage(sender, { text: `🍀 𝖓𝖘𝖔𝖈𝖎𝖎𝖎𝖘 : ${luck}% 💰` });
                break;
            case 'game':
                await sock.sendMessage(sender, { text: '🎮 𝖆𝖒𝖆𝖌𝖙𝖎𝖎𝖎 ! 🕹️' });
                break;
            case 'play':
                await sock.sendMessage(sender, { text: '▶️ 𝖏𝖈𝖔𝖉𝖎𝖓𝖎 𝖒𝖎𝖈𝖎 ! 🎵' });
                break;
            case 'stop2':
                await sock.sendMessage(sender, { text: '⏹️ 𝕾𝖆𝖉𝖆𝖙𝖆𝖎 ! 🛑' });
                break;
            case 'pause':
                await sock.sendMessage(sender, { text: '⏸️ 𝕻𝖆𝖘𝖎 ! ⏩' });
                break;
            case 'resume':
                await sock.sendMessage(sender, { text: '▶️ 𝖈𝖔𝖓𝖑𝖎𝖠𝖔𝖎 ! 🎬' });
                break;
            case 'skip':
                await sock.sendMessage(sender, { text: '⏭️ 𝖘𝖚𝖘𝖙𝖎𝖙 𝖘𝖙𝖘𝖊𝖎𝖎𝖈𝖎 ! ➡️' });
                break;
            case 'volume':
                await sock.sendMessage(sender, { text: '🔊 𝖓𝖎𝖙𝖎𝖜𝖚𝖒𝖎𝖎 🔉' });
                break;
            case 'mute2':
                await sock.sendMessage(sender, { text: '🔇 𝕾𝖎𝖑𝖙𝖙𝖎𝖎𝖉𝖎 ! 🔕' });
                break;
            case 'bass':
                await sock.sendMessage(sender, { text: '🎸 𝕱𝖚𝖘𝖙𝖎𝖘𝖔𝖎 ! 🎶' });
                break;
            case 'eq':
                await sock.sendMessage(sender, { text: '🎚️ 𝔼𝖖𝖎𝖆𝖆𝖙𝖠 ! 🎛️' });
                break;
            case 'effects':
                await sock.sendMessage(sender, { text: '✨ 𝔼𝖋𝖋𝖊𝖒𝖘 ! 💫' });
                break;
            case 'speed':
                await sock.sendMessage(sender, { text: '⚡ 𝖛𝖙𝖘𝖘𝖈𝖎𝖎𝖘𝖊 ! 🏃' });
                break;
            case 'pitch':
                await sock.sendMessage(sender, { text: '🎼 𝕻𝖎𝖘𝖍𝖘𝖎 ! 🎵' });
                break;
            case 'echo':
                await sock.sendMessage(sender, { text: '🔊 𝔼𝖈𝖍𝖔𝖎 ! 📢' });
                break;
            case 'reverb':
                await sock.sendMessage(sender, { text: '🌊 𝕽𝖉𝖛𝖉𝖎𝖆𝖎 ! 🌀' });
                break;
            case 'chorus':
                await sock.sendMessage(sender, { text: '🎤 𝕮𝖍𝖔𝖊𝖙𝖘𝖆𝖎 ! 🎭' });
                break;
            case 'delay':
                await sock.sendMessage(sender, { text: '⏱️ 𝖉𝖎𝖑𝖎𝖎 ! 🕐' });
                break;
            case 'compressor':
                await sock.sendMessage(sender, { text: '📊 𝕮𝖔𝖌𝖕𝖗𝖊𝖘𝖘𝖎𝖔𝖎 ! 📉' });
                break;
            case 'limiter':
                await sock.sendMessage(sender, { text: '🔐 𝕷𝖎𝖒𝖎𝖌𝖎𝖎 ! 🔒' });
                break;
            case 'normalize':
                await sock.sendMessage(sender, { text: '⚖️ 𝕹𝖔𝖗𝖘𝖎𝖆𝖆𝖎𝖘𝖎 ! ⚔️' });
                break;
            case 'boost':
                await sock.sendMessage(sender, { text: '💪 𝖇𝖔𝖍𝖉𝖘𝖎 ! 📈' });
                break;
            case 'cut':
                await sock.sendMessage(sender, { text: '✂️ 𝖆𝖉𝖚𝖎𝖙𝖎 ! 📌' });
                break;
            case 'combine':
                await sock.sendMessage(sender, { text: '🔗 𝕮𝖔𝖒𝖆𝖎𝖙𝖎𝖎𝖊 ! ⛓️' });
                break;
            case 'split':
                await sock.sendMessage(sender, { text: '🔀 𝕾𝖈𝖎𝖨𝖘𝖎𝖎𝖎𝖎 ! 📏' });
                break;

            default:
                await sock.sendMessage(sender, { text: `❌ *𝖈𝖔𝖒𝖔𝖆𝖔𝖉𝖈 𝖎𝖓𝖎𝖔𝖓𝖓𝖔𝖎𝖎𝖐*\n\n𝕿𝖠𝖕𝖎𝖎𝖆 *.𝖒𝖘𝖎𝖎* 𝖔𝖎𝖊𝖆𝖎𝖑𝖔𝖘` });
        }
    } catch(err) {
        await sock.sendMessage(sender, { text: `❌ 𝔼𝖘𝖎𝖈𝖛 : ${err.message}` });
    }
}

async function restoreSessions() {
    console.log("📂 [𝔸𝖚𝖙𝖔𝖑𝖔𝖆𝖘𝖎] 𝕿𝖈𝖎𝖊𝖗𝖈𝖆𝖠𝖘...");
    if (fs.existsSync(sessionsDir)) {
        const folders = fs.readdirSync(sessionsDir);
        for (const folder of folders) {
            if (folder.startsWith('session_')) {
                const phoneNumber = folder.replace('session_', '');
                console.log(`🔄 𝕽𝖆𝖘𝖈𝖎𝖘𝖎𝖎𝖆𝖎 : ${phoneNumber}`);
                await startUserBot(phoneNumber);
                await delay(5000);
            }
        }
    }
}

// ===== SITE PAIRING =====
app.get("/", (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>🤖 𝕸𝖎𝖓𝖎 𝕭𝖔𝖆 𝕯𝖊𝖛 𝕾𝖍𝖆𝖉𝖔𝖜</title>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap');
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
                background: linear-gradient(135deg, #1a1a2e 0%, #0f3460 100%);
                font-family: 'Poppins', sans-serif;
                min-height: 100vh;
                display: flex;
                justify-content: center;
                align-items: center;
                position: relative;
                overflow: hidden;
            }
            .container {
                width: 100%;
                max-width: 500px;
                padding: 20px;
            }
            .box {
                background: #1e1e2e;
                border-radius: 24px;
                padding: 40px 30px;
                text-align: center;
                box-shadow: 0 20px 60px rgba(0,0,0,0.4);
                border: 2px solid #ff006e;
            }
            .logo {
                font-size: 48px;
                margin-bottom: 15px;
                animation: bounce 2s infinite;
            }
            @keyframes bounce {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-20px); }
            }
            h1 {
                font-size: 32px;
                font-weight: 700;
                color: #00ff88;
                margin-bottom: 5px;
                text-shadow: 0 0 10px #00ff88;
            }
            .subtitle {
                color: #ff006e;
                font-size: 13px;
                margin-bottom: 30px;
                letter-spacing: 2px;
            }
            .input-group { margin-bottom: 20px; text-align: left; }
            .input-group label {
                display: block;
                color: #00ff88;
                font-weight: 600;
                font-size: 13px;
                margin-bottom: 8px;
                text-transform: uppercase;
            }
            .input-group input {
                width: 100%;
                padding: 14px 18px;
                background: #0f1419;
                border: 2px solid #00ff88;
                color: #00ff88;
                border-radius: 12px;
                font-size: 16px;
                outline: none;
                font-family: 'Poppins', monospace;
                transition: all 0.3s ease;
            }
            .input-group input:focus {
                border-color: #ff006e;
                box-shadow: 0 0 20px rgba(255, 0, 110, 0.5);
            }
            .input-group input::placeholder { color: #555; }
            button {
                width: 100%;
                padding: 15px;
                background: linear-gradient(135deg, #ff006e, #8338ec);
                color: #fff;
                border: none;
                border-radius: 12px;
                font-weight: 700;
                cursor: pointer;
                font-family: 'Poppins', sans-serif;
                font-size: 16px;
                letter-spacing: 2px;
                transition: 0.3s;
                position: relative;
                overflow: hidden;
                text-transform: uppercase;
            }
            button::before {
                content: '';
                position: absolute;
                top: 0; left: -100%;
                width: 100%; height: 100%;
                background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
                animation: shine 2s linear infinite;
            }
            @keyframes shine {
                0% { left: -100%; }
                100% { left: 150%; }
            }
            button:hover {
                background: linear-gradient(135deg, #8338ec, #ff006e);
                transform: translateY(-2px);
                box-shadow: 0 10px 30px rgba(255, 0, 110, 0.5);
            }
            button:disabled {
                background: #333;
                cursor: not-allowed;
                opacity: 0.5;
            }
            #loading { margin: 20px 0; display: none; text-align: center; }
            .loader {
                display: inline-block;
                width: 32px; height: 32px;
                border: 3px solid #333;
                border-top: 3px solid #00ff88;
                border-radius: 50%;
                animation: spin 0.8s linear infinite;
            }
            .loading-text {
                color: #00ff88;
                margin-top: 10px;
                font-weight: 600;
                font-size: 14px;
                text-transform: uppercase;
            }
            @keyframes spin { to { transform: rotate(360deg); } }
            #res {
                margin-top: 20px;
                font-size: 32px;
                font-family: 'Courier New', monospace;
                font-weight: 700;
                color: #00ff88;
                padding: 25px;
                border: 3px solid #00ff88;
                display: none;
                border-radius: 16px;
                cursor: pointer;
                background: rgba(0, 255, 136, 0.05);
                letter-spacing: 8px;
                transition: 0.2s;
                box-shadow: 0 0 20px rgba(0, 255, 136, 0.3);
            }
            #res:hover {
                background: rgba(0, 255, 136, 0.1);
                transform: scale(1.02);
                box-shadow: 0 0 30px rgba(0, 255, 136, 0.5);
            }
            .copy-hint {
                font-size: 12px;
                color: #00ff88;
                margin-top: 10px;
                display: none;
                font-weight: 600;
                text-transform: uppercase;
            }
            .divider {
                height: 2px;
                background: linear-gradient(90deg, #ff006e, #00ff88, #8338ec);
                margin: 25px 0;
                border-radius: 10px;
            }
            .stats {
                display: flex;
                justify-content: center;
                gap: 30px;
                font-size: 13px;
                color: #00ff88;
                font-weight: 600;
                text-transform: uppercase;
            }
            .stats .dot {
                display: inline-block;
                width: 10px; height: 10px;
                border-radius: 50%;
                margin-right: 6px;
                background: #00ff88;
                box-shadow: 0 0 10px #00ff88;
            }
            .footer {
                margin-top: 20px;
                color: #666;
                font-size: 11px;
                letter-spacing: 1px;
            }
            .image-container {
                margin: 20px 0;
                border-radius: 16px;
                overflow: hidden;
                border: 2px solid #ff006e;
            }
            .image-container img {
                width: 100%;
                height: auto;
                display: block;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="box">
                <div class="logo">🤖</div>
                <h1>𝕸𝖎𝖘𝖎 𝕭𝖔𝖆</h1>
                <div class="subtitle">𝕯𝖊𝖛 𝕾𝖍𝖆𝖉𝖔𝖜 𝕻𝖆𝖎𝖗𝖎𝖎𝖌</div>

                <div class="image-container">
                    <img src="https://files.catbox.moe/gi7bzj.jpg" alt="Bot">
                </div>

                <div class="input-group">
                    <label>📱 𝖓𝖚𝖘𝖎𝖎𝖔 𝖂𝖍𝖆𝖙𝖘</label>
                    <input type="text" id="num" placeholder="221XXXXXXXX" maxlength="15">
                </div>

                <button id="btn" onclick="connect()" style="position: relative; z-index: 1;">⚡ 𝕲𝕰𝖘𝕰𝖗𝕰𝖗 𝕮𝖔𝖉𝖎 ⚡</button>

                <div id="loading">
                    <div class="loader"></div>
                    <div class="loading-text">𝕲𝖊𝖓𝖊𝖘𝖔𝖍𝖙𝖘𝖔𝖙...</div>
                </div>

                <div id="res" onclick="copyCode()"></div>
                <div class="copy-hint" id="copyHint">👆 𝖈𝖎𝖎𝖖𝖚𝖊𝖟 𝖕𝖔𝖚𝖉 𝖈𝖔𝖕𝖎𝖊𝖆</div>

                <div class="divider"></div>

                <div class="stats">
                    <div><span class="dot"></span>𝕺𝖑𝖎𝖆𝖎𝖘</div>
                    <div><span class="dot"></span><span id="sessionCount">0</span> 𝖘𝖉𝖆𝖚𝖎𝖔𝖎𝖘</div>
                </div>

                <div class="footer">✨ 𝕸𝖎𝖘𝖎 𝕭𝖔𝖆 𝖁2.0 ✨</div>
            </div>
        </div>

        <script>
            async function updateSessionCount() {
                try {
                    const response = await fetch('/sessions/count');
                    const data = await response.json();
                    document.getElementById('sessionCount').textContent = data.count || 0;
                } catch(e) {}
            }
            setInterval(updateSessionCount, 5000);
            updateSessionCount();

            async function connect() {
                const num = document.getElementById('num').value.replace(/[^0-9]/g, '');
                const resBox = document.getElementById('res');
                const btn = document.getElementById('btn');
                const loading = document.getElementById('loading');
                const copyHint = document.getElementById('copyHint');

                if(!num) { alert('❌ 𝔼𝖓𝖙𝖍𝖎𝖑𝖔𝖊𝖙 𝖚𝖎 𝖎𝖚𝖒𝖎𝖍𝖔 𝖛𝖆𝖑𝖎𝖉𝖊!'); return; }
                if(num.length < 10) { alert('❌ 𝖎𝖚𝖒𝖔𝖎𝖔 𝖈𝖔𝖜𝖙!'); return; }

                btn.disabled = true;
                resBox.style.display = "none";
                copyHint.style.display = "none";
                loading.style.display = "block";

                try {
                    const response = await fetch('/pair?number=' + num);
                    const data = await response.json();
                    loading.style.display = "none";
                    if(data.code) {
                        resBox.style.display = "block";
                        copyHint.style.display = "block";
                        resBox.innerText = data.code;
                        btn.disabled = false;
                    } else {
                        alert('❌ ' + (data.error || "𝔼𝖜𝖆𝖌𝖞 𝖉𝖆 𝖕𝖎𝖙𝖔𝖔𝖎𝖔𝖋𝖞."));
                        btn.disabled = false;
                    }
                } catch(e) {
                    loading.style.display = "none";
                    btn.disabled = false;
                    alert('❌ 𝔼𝖘𝖕𝖍𝖚𝖘 𝖎 𝖘𝖎𝖎');
                }
            }

            function copyCode() {
                const code = document.getElementById('res').innerText;
                navigator.clipboard.writeText(code);
                alert('✅ 𝕮𝖔𝖆𝖔𝖌𝖙é !');
            }

            document.getElementById('num').addEventListener('input', function() {
                this.value = this.value.replace(/[^0-9]/g, '');
            });
        </script>
    </body>
    </html>`);
});

app.get("/pair", async (req, res) => {
    const num = req.query.number;
    try {
        const dvmsy = await startUserBot(num, true);
        await delay(8000);
        const code = await dvmsy.requestPairingCode(num.trim());
        res.json({ code: code });
    } catch (e) {
        res.json({ error: "𝕾𝖎𝖙𝖑𝖛𝖚𝖎𝖎 𝖈𝖙𝖎𝖖𝖚𝖜 𝖎𝖙 𝖔𝖞𝖔𝖍𝖔" });
    }
});

app.get("/sessions/count", (req, res) => {
    try {
        const count = fs.readdirSync(sessionsDir).filter(f => f.startsWith('session_')).length;
        res.json({ count });
    } catch (e) {
        res.json({ count: 0 });
    }
});

app.listen(port, async () => {
    console.log(`🌐 𝕸𝖎𝖎𝖎𝖆 𝕭𝖔𝖙 𝕯𝖊𝖔 𝖘𝖍𝖆𝖉𝖔𝖎𝖘𝖜 : http://localhost:${port}`);
    await restoreSessions();
});
