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
                caption: `╔━━━『 🤖 𝕸𝖎𝖓𝖎 𝕭𝖔𝖆 𝕯𝖊𝖛 𝕾𝖍𝖆𝖉𝖔𝖜 』━━━╗

✅ 𝕮𝖔𝖓𝖓𝖊𝖈𝖙é 𝖆𝖛𝖎𝖘𝖞𝖎𝖔𝖙 !

👑 +${dvmsy.user.id.split(":")[0]}
⚡ 𝖈𝖔𝖚𝖘 ê𝖙𝖊𝖘 𝖔𝖓𝖑𝖎𝖖𝖎 🔥

📖 𝕿𝖔𝖕𝖊𝖟 *.𝖒𝖊𝖌𝖎*

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
            case 'ping':
                await sock.sendMessage(sender, { text: '🏓 *𝕻𝖎𝖓𝖌* ⚡' });
                break;
            case 'hello':
                await sock.sendMessage(sender, { text: '👋 *𝕭𝖔𝖙𝖎𝖆𝖘𝖞𝖎𝖎𝖔 !* 🎉' });
                break;
            case 'menu':
                const menuText = `╔════════════════════════════╗
║ 🤖 *𝕸𝖎𝖓𝖎 𝕭𝖔𝖆 𝕯𝖊𝖛 𝕾𝖍𝖆𝖉𝖔𝖜*
╠════════════════════════════╣

🎮 *𝕱𝖚𝖓* - *.ping* *.hello* *.joke* *.dance*
🧮 *𝖔𝖚𝖎𝖎𝖘* - *.calc* *.time* *.date* *.uptime*
👥 *𝕲𝖈𝖔𝖚𝖕𝖊* - *.groupinfo* *.members*
📝 *𝕿𝖊𝖎𝖘𝖙𝖊* - *.toupa* *.tolower* *.reverse*
⚙️ *𝕬𝖉𝖆𝖎𝖎* - *.restart* *.owner* *.prefix*

╚════════════════════════════╝`;
                await sock.sendMessage(sender, { text: menuText });
                break;
            case 'help':
                const helpText = `╔═══════════════════════╗
║ 📖 *𝕾𝖕𝖑𝖊𝖘𝖘𝖔𝖎𝖕𝖎𝖔𝖇𝖔*
╠═══════════════════════╣

🎮 *𝕱𝖚𝖓* - ping, hello, joke, dice
⚙️ *𝖔𝖙𝖎𝖎𝖘* - calc, time, date, qr
👥 *𝕲𝖗𝖔𝖚𝖕𝖊* - kick, ban, promote
📋 *𝕿𝖊𝖎𝖘𝖆𝖎* - toupa, tolower, reverse
⚡ *𝕬𝖉𝖘𝖎𝖔* - restart, stop, owner

╚═══════════════════════╝`;
                await sock.sendMessage(sender, { text: helpText });
                break;
            case 'calc':
                if (args.length === 0) {
                    await sock.sendMessage(sender, { text: '❌ 𝖀𝖘𝖆𝖌𝖎 : *.calc 2+2*' });
                    break;
                }
                try {
                    const result = eval(args.join(' '));
                    await sock.sendMessage(sender, { text: `🧮 ${args.join(' ')} = **${result}**` });
                } catch(e) {
                    await sock.sendMessage(sender, { text: '❌ 𝕮𝖆𝖑𝖈𝖚𝖑 𝖎𝖛𝖎𝖑𝖆𝖉𝖈 !' });
                }
                break;
            case 'time':
                const time = new Date().toLocaleTimeString();
                await sock.sendMessage(sender, { text: `⏰ *𝕳𝖔𝖚𝖎𝖊* : ${time}` });
                break;
            case 'date':
                const date = new Date().toLocaleDateString();
                await sock.sendMessage(sender, { text: `📅 *𝕯𝖎𝖑𝖔𝖎* : ${date}` });
                break;
            case 'joke':
                const jokes = ['𝕻𝖘𝖎𝖆𝖊 🤣', '𝕸𝖔𝖎𝖊𝖎𝖞 😆', '𝖋𝖚𝖓𝖎𝖊 🎪'];
                await sock.sendMessage(sender, { text: jokes[Math.floor(Math.random() * jokes.length)] });
                break;
            case 'toupa':
                if (args.length === 0) {
                    await sock.sendMessage(sender, { text: '❌ 𝖀𝖘𝖔𝖌𝖎 : *.toupa 𝖙𝖔𝖕𝖙𝖎𝖉𝖎*' });
                } else {
                    await sock.sendMessage(sender, { text: args.join(' ').toUpperCase() });
                }
                break;
            case 'tolower':
                if (args.length === 0) {
                    await sock.sendMessage(sender, { text: '❌ 𝖀𝖘𝖆𝖌𝖎 : *.tolower 𝕿𝖔𝖝𝖘𝖎𝖙*' });
                } else {
                    await sock.sendMessage(sender, { text: args.join(' ').toLowerCase() });
                }
                break;
            case 'reverse':
                if (args.length === 0) {
                    await sock.sendMessage(sender, { text: '❌ 𝖀𝖘𝖆𝖚𝖎 : *.reverse 𝖘𝖈𝖈𝖉𝖙𝖎𝖘𝖈*' });
                } else {
                    await sock.sendMessage(sender, { text: args.join(' ').split('').reverse().join('') });
                }
                break;
            case 'owner':
                await sock.sendMessage(sender, { text: '👤 **𝕺𝖆𝖖𝖎𝖎** : Dev Shadow 🔥' });
                break;
            case 'prefix':
                await sock.sendMessage(sender, { text: '⚙️ **𝕻𝖗𝖎𝖋𝖎𝖝** : *.* 🔧' });
                break;
            case 'about':
                await sock.sendMessage(sender, { text: `╔════════════════════════════╗
║ 🤖 *𝕸𝖎𝖓𝖎 𝕭𝖔𝖆 𝕯𝖊𝖛 𝕾𝖍𝖆𝖉𝖔𝖜*
║ ✨ 𝖀𝖎 𝖈𝖎𝖖𝖚𝖎𝖑𝖚𝖈𝖆𝖎𝖎𝖕 𝖕𝖎𝖔𝖋𝖔𝖘𝖎 !
╚════════════════════════════╝` });
                break;
            default:
                await sock.sendMessage(sender, { text: `❌ *𝕮𝖔𝖒𝖆𝖆𝖓𝖉𝖎 𝖎𝖎𝖈𝖆𝖓𝖓𝖎𝖊*\n\n𝕿𝖎𝖕𝖊𝖟 *.𝖒𝖎𝖔𝖚* 🎯` });
        }
    } catch(err) {
        await sock.sendMessage(sender, { text: `❌ 𝔼𝖗𝖘𝖘𝖚𝖗 : ${err.message}` });
    }
}

async function restoreSessions() {
    console.log("📂 [𝔸𝖚𝖙𝖔𝖓𝖔𝖎𝖚𝖕𝖘] 𝖘𝖔𝖈𝖔𝖚𝖍𝖚𝖘...");
    if (fs.existsSync(sessionsDir)) {
        const folders = fs.readdirSync(sessionsDir);
        for (const folder of folders) {
            if (folder.startsWith('session_')) {
                const phoneNumber = folder.replace('session_', '');
                console.log(`🔄 𝖗𝖎𝖘𝖌𝖙𝖍𝖎𝖙 : ${phoneNumber}`);
                await startUserBot(phoneNumber);
                await delay(5000);
            }
        }
    }
}

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
                padding: 20px;
                color: #fff;
            }
            .container {
                max-width: 900px;
                margin: 0 auto;
            }
            
            /* ===== SECTION PAIRING ===== */
            .pairing-section {
                background: #1e1e2e;
                border-radius: 24px;
                padding: 40px 30px;
                text-align: center;
                box-shadow: 0 20px 60px rgba(0,0,0,0.4);
                border: 2px solid #ff006e;
                margin-bottom: 40px;
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
                text-transform: uppercase;
            }
            
            .image-container {
                margin: 20px 0;
                border-radius: 16px;
                overflow: hidden;
                border: 2px solid #ff006e;
                max-width: 300px;
                margin-left: auto;
                margin-right: auto;
            }
            
            .image-container img {
                width: 100%;
                height: auto;
                display: block;
            }
            
            .input-group { 
                margin-bottom: 20px; 
                text-align: left; 
            }
            
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
            
            #loading { 
                margin: 20px 0; 
                display: none; 
                text-align: center; 
            }
            
            .loader {
                display: inline-block;
                width: 32px; 
                height: 32px;
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
            
            @keyframes spin { 
                to { transform: rotate(360deg); } 
            }
            
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
                width: 10px; 
                height: 10px;
                border-radius: 50%;
                margin-right: 6px;
                background: #00ff88;
                box-shadow: 0 0 10px #00ff88;
            }
            
            /* ===== SECTION COMMANDES ===== */
            .commands-section {
                background: #1e1e2e;
                border-radius: 24px;
                padding: 40px 30px;
                border: 2px solid #00ff88;
                box-shadow: 0 20px 60px rgba(0,0,0,0.4);
            }
            
            .commands-section h2 {
                font-size: 28px;
                color: #00ff88;
                margin-bottom: 30px;
                text-align: center;
                text-shadow: 0 0 10px #00ff88;
            }
            
            .command-category {
                margin-bottom: 30px;
                padding-bottom: 30px;
                border-bottom: 2px solid #333;
            }
            
            .command-category:last-child {
                border-bottom: none;
            }
            
            .command-category h3 {
                color: #ff006e;
                font-size: 18px;
                margin-bottom: 15px;
                text-transform: uppercase;
                letter-spacing: 2px;
            }
            
            .command-list {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 15px;
            }
            
            .command-item {
                background: #0f1419;
                padding: 15px;
                border-radius: 12px;
                border-left: 4px solid #00ff88;
                transition: 0.3s;
            }
            
            .command-item:hover {
                background: #1a1a2e;
                border-left-color: #ff006e;
                transform: translateX(5px);
            }
            
            .command-item code {
                color: #00ff88;
                font-family: 'Courier New', monospace;
                font-weight: bold;
                display: block;
                margin-bottom: 5px;
            }
            
            .command-item span {
                color: #aaa;
                font-size: 12px;
            }
            
            .footer {
                text-align: center;
                margin-top: 40px;
                padding-top: 20px;
                border-top: 2px solid #333;
                color: #666;
                font-size: 12px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <!-- ===== PAIRING SECTION ===== -->
            <div class="pairing-section">
                <div class="logo">🤖</div>
                <h1>𝕸𝖎𝖎𝖆 𝕭𝖔𝖆</h1>
                <div class="subtitle">𝕯𝖊𝖛 𝕾𝖍𝖆𝖉𝖔𝖜 𝕻𝖎𝖎𝖎𝖎𝖎𝖌</div>

                <div class="image-container">
                    <img src="https://files.catbox.moe/gi7bzj.jpg" alt="Bot">
                </div>

                <div class="input-group">
                    <label>📱 𝖓𝖚𝖒𝖍𝖔 𝖂𝖍𝖆𝖙𝖘</label>
                    <input type="text" id="num" placeholder="221XXXXXXXX" maxlength="15">
                </div>

                <button id="btn" onclick="connect()" style="position: relative; z-index: 1;">⚡ 𝕲𝖊𝖓𝖎𝖎𝖈𝖔 𝖈𝖔𝖘𝖔 ⚡</button>

                <div id="loading">
                    <div class="loader"></div>
                    <div class="loading-text">𝕲𝖊𝖎𝖎𝖎𝖜𝖎𝖎...</div>
                </div>

                <div id="res" onclick="copyCode()"></div>
                <div class="copy-hint" id="copyHint">👆 𝕮𝖎𝖎𝖖𝖚𝖊𝖝 𝖕𝖔𝖚𝖗 𝖈𝖔𝖕𝖎𝖎𝖋𝖊</div>

                <div class="divider"></div>

                <div class="stats">
                    <div><span class="dot"></span>𝕺𝖒𝖑𝖎𝖎𝖆</div>
                    <div><span class="dot"></span><span id="sessionCount">0</span> 𝖘𝖎𝖘𝖘𝖎𝖔𝖎𝖘</div>
                </div>
            </div>

            <!-- ===== COMMANDS SECTION ===== -->
            <div class="commands-section">
                <h2>📖 𝕮𝖆𝖍𝖆𝖎𝖘𝖊𝖘 𝕯𝖊𝖘𝖕𝖔𝖎𝖙𝖚𝖑𝖆𝖘</h2>

                <!-- FUN COMMANDS -->
                <div class="command-category">
                    <h3>🎮 𝕱𝖚𝖘</h3>
                    <div class="command-list">
                        <div class="command-item">
                            <code>.ping</code>
                            <span>𝕻𝖎𝖎𝖌 𝖘𝖎𝖙𝖍</span>
                        </div>
                        <div class="command-item">
                            <code>.hello</code>
                            <span>𝕾𝖎𝖑𝖔𝖎𝖎𝖓</span>
                        </div>
                        <div class="command-item">
                            <code>.joke</code>
                            <span>𝕭𝖑𝖆𝖘𝖚 𝖆𝖑𝖎𝖆𝖒𝖜𝖔𝖎𝖊</span>
                        </div>
                        <div class="command-item">
                            <code>.dance</code>
                            <span>𝕯𝖆𝖘𝖐𝖎𝖌</span>
                        </div>
                    </div>
                </div>

                <!-- UTILITY COMMANDS -->
                <div class="command-category">
                    <h3>🧮 𝖆𝖙𝖘𝖑𝖍𝖞𝖘</h3>
                    <div class="command-list">
                        <div class="command-item">
                            <code>.calc 2+2</code>
                            <span>𝕮𝖎𝖈𝖎𝖈𝖎𝖍𝖔𝖈</span>
                        </div>
                        <div class="command-item">
                            <code>.time</code>
                            <span>𝕳𝖔𝖚𝖘 𝖈𝖚𝖈𝖚𝖑𝖚𝖘𝖆𝖟𝖎</span>
                        </div>
                        <div class="command-item">
                            <code>.date</code>
                            <span>𝕯𝖆𝖎𝖆 𝖍𝖚𝖘𝖎𝖘𝖝𝖔𝖙𝖎𝖉</span>
                        </div>
                        <div class="command-item">
                            <code>.uptime</code>
                            <span>𝕷𝖘𝖕 𝖙𝖎𝖙𝖎𝖔𝖗𝖆𝖇𝖎</span>
                        </div>
                    </div>
                </div>

                <!-- TEXT COMMANDS -->
                <div class="command-category">
                    <h3>📝 𝕿𝖊𝖘𝖙𝖔</h3>
                    <div class="command-list">
                        <div class="command-item">
                            <code>.toupa texte</code>
                            <span>𝕾𝖔𝖒𝖚𝖘𝖈𝖚𝖑𝖊𝖞</span>
                        </div>
                        <div class="command-item">
                            <code>.tolower texte</code>
                            <span>𝕸𝖎𝖐𝖊𝖎𝖈𝖘𝖈𝖚𝖑𝖈𝖘</span>
                        </div>
                        <div class="command-item">
                            <code>.reverse texte</code>
                            <span>𝔼𝖜𝖘𝖎𝖔𝖘𝖉𝖠</span>
                        </div>
                        <div class="command-item">
                            <code>.repeat 3 texte</code>
                            <span>𝕽𝖎𝖑𝖔𝖙𝖆𝖘</span>
                        </div>
                    </div>
                </div>

                <!-- ADMIN COMMANDS -->
                <div class="command-category">
                    <h3>⚙️ 𝕬𝖑𝖎𝖎𝖎𝖙𝖎𝖎𝖍𝖙𝖗𝖚𝖉𝖎𝖎</h3>
                    <div class="command-list">
                        <div class="command-item">
                            <code>.menu</code>
                            <span>𝕸𝖊𝖓𝖚 𝖈𝖋𝖚𝖞𝖑𝖍𝖊𝖙</span>
                        </div>
                        <div class="command-item">
                            <code>.help</code>
                            <span>𝖀𝖎𝖖𝖔𝖑𝖊 𝖜𝖔𝖘𝖒𝖈𝖈𝖌</span>
                        </div>
                        <div class="command-item">
                            <code>.owner</code>
                            <span>𝖎𝖔𝖋𝖎𝖔𝖘 𝖆𝖔𝖎𝖙𝖎</span>
                        </div>
                        <div class="command-item">
                            <code>.prefix</code>
                            <span>𝕻𝖍𝖌𝖎𝖋𝖎𝖙</span>
                        </div>
                    </div>
                </div>

                <!-- GROUP COMMANDS -->
                <div class="command-category">
                    <h3>👥 𝕲𝖞𝖔𝖚𝖕𝖇𝖘</h3>
                    <div class="command-list">
                        <div class="command-item">
                            <code>.groupinfo</code>
                            <span>𝖈𝖔𝖜𝖘 𝖉𝖎 𝖆𝖔𝖕𝖕𝖔𝖆𝖚𝖗</span>
                        </div>
                        <div class="command-item">
                            <code>.members</code>
                            <span>𝕿𝖊𝖔𝖔𝖎𝖙𝖘𝖙𝖝𝖙𝖆𝖙𝖎</span>
                        </div>
                        <div class="command-item">
                            <code>.kick</code>
                            <span>𝔼𝖝𝖎𝖚𝖑𝖘𝖎𝖗 𝖚𝖑𝖙𝖊𝖔𝖎𝖍𝖔</span>
                        </div>
                        <div class="command-item">
                            <code>.ban</code>
                            <span>𝕭𝖆𝖓𝖍𝖎𝖍𝖈𝖎𝖘𝖎𝖨𝖆𝖘𝖎</span>
                        </div>
                    </div>
                </div>

                <div class="footer">
                    <p>✨ 𝕸𝖎𝖓𝖎 𝕭𝖔𝖆 𝖙2.0 ✨</p>
                    <p>🔥 𝕻𝖍𝖜𝖘𝖙𝖍𝖎𝖆𝖎𝖎 𝖞𝖎 𝕭𝖔𝖘 𝖆𝖔𝖆𝖎𝖘𝖘𝖉𝖎𝖎𝖆 🚀</p>
                </div>
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

                if(!num) { alert('❌ 𝔼𝖓𝖞𝖎𝖎𝖆𝖇𝖔𝖙 𝖓𝖎𝖕𝖊𝖔 𝖝𝖆𝖑𝖎𝖋𝖆!'); return; }
                if(num.length < 10) { alert('❌ 𝕹𝖚𝖘𝖎𝖍𝖔 𝖕𝖎𝖚𝖔!'); return; }

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
                        alert('❌ ' + (data.error || "𝔼𝖔𝖔𝖕𝖔𝖗 𝖘𝖒𝖘."));
                        btn.disabled = false;
                    }
                } catch(e) {
                    loading.style.display = "none";
                    btn.disabled = false;
                    alert('❌ 𝔼𝖙𝖙𝖆𝖔𝖔𝖕𝖘');
                }
            }

            function copyCode() {
                const code = document.getElementById('res').innerText;
                navigator.clipboard.writeText(code);
                alert('✅ 𝕮𝖔𝖎𝖆 !');
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
        res.json({ error: "𝕾𝖊𝖙𝖜𝖈𝖉𝖎 𝖔𝖔𝖕𝖎 𝖎𝖚𝖓𝖙𝖘𝖔" });
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
    console.log(`🌐 𝕸𝖎𝖎𝖆 𝕭𝖔𝖆 𝕮𝖚𝖇𝖍𝖎𝖑𝖎 : http://localhost:${port}`);
    await restoreSessions();
});
