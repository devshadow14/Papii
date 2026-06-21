import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3002;

// Dummy sessions count (remplacer par une vraie DB si needed)
let sessionsCount = 0;

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
                <h1>𝕸𝖎𝖓𝖎 𝕭𝖔𝖆</h1>
                <div class="subtitle">𝕯𝖊𝖛 𝕾𝖍𝖆𝖉𝖔𝖜 𝕻𝖎𝖎𝖞𝖎𝖎𝖌</div>

                <div class="image-container">
                    <img src="https://files.catbox.moe/gi7bzj.jpg" alt="Bot">
                </div>

                <div class="input-group">
                    <label>📱 𝕹𝖚𝖒𝖙𝖔 𝖂𝖍𝖆𝖙𝖘</label>
                    <input type="text" id="num" placeholder="221XXXXXXXX" maxlength="15">
                </div>

                <button id="btn" onclick="alert('𝕿𝖎𝖕𝖇𝖎𝖉𝖑𝖈𝖆𝖎𝖎𝖔𝖘 : 𝖊𝖘𝖞𝖈𝖍𝖍𝖘𝖊𝖞 𝖗𝖙𝖗𝖆 𝖈𝖔𝖓𝖙𝖆𝖈𝖎𝖎𝖎𝖎𝖔𝖒𝖛𝖔')">⚡ 𝕲𝖆𝖎𝖆𝖎𝖈𝖔 𝕮𝖔𝖘𝖔 ⚡</button>

                <div class="divider"></div>

                <div class="stats">
                    <div><span class="dot"></span>𝕺𝖚𝖈𝖎𝖎𝖆</div>
                    <div><span class="dot"></span>💻 𝖈𝖊𝖙 𝖘𝖎𝖞𝖇𝖔𝖙</div>
                </div>
            </div>

            <!-- ===== COMMANDS SECTION ===== -->
            <div class="commands-section">
                <h2>📖 𝕮𝖔𝖑𝖎𝖆𝖓𝖉𝖈𝖘 𝕳𝖕𝖎𝖘𝖕𝖔𝖓𝖎𝖔𝖕𝖙</h2>

                <!-- FUN COMMANDS -->
                <div class="command-category">
                    <h3>🎮 𝕱𝖚𝖎</h3>
                    <div class="command-list">
                        <div class="command-item">
                            <code>.ping</code>
                            <span>𝕻𝖎𝖎𝖌 𝖕𝖔𝖎𝖘𝖊</span>
                        </div>
                        <div class="command-item">
                            <code>.hello</code>
                            <span>𝕾𝖆𝖚𝖚𝖚𝖘𝖙𝖔𝖎𝖔</span>
                        </div>
                        <div class="command-item">
                            <code>.joke</code>
                            <span>𝖀𝖌𝖘𝖆𝖌𝖙𝖆 𝖈𝖎𝖘𝖆𝖘𝖎𝖇𝖠</span>
                        </div>
                        <div class="command-item">
                            <code>.dance</code>
                            <span>𝕻𝖙𝖎𝖘𝖔𝖎𝖔</span>
                        </div>
                    </div>
                </div>

                <!-- UTILITY COMMANDS -->
                <div class="command-category">
                    <h3>🧮 𝖆𝖎𝖙𝖍𝖞</h3>
                    <div class="command-list">
                        <div class="command-item">
                            <code>.calc 2+2</code>
                            <span>𝕮𝖎𝖙𝖘𝖎𝖈𝖆𝖝𝖎</span>
                        </div>
                        <div class="command-item">
                            <code>.time</code>
                            <span>𝕳𝖔𝖚𝖟 𝖚𝖎𝖎𝖎𝖎𝖍𝖎𝖎</span>
                        </div>
                        <div class="command-item">
                            <code>.date</code>
                            <span>𝕯𝖆𝖙𝖊𝖒𝖍𝖚𝖔𝖎𝖉𝖎</span>
                        </div>
                        <div class="command-item">
                            <code>.uptime</code>
                            <span>𝖀𝖑𝖈𝖒𝖎𝖙𝖈 𝖉𝖚 𝖇𝖍𝖎</span>
                        </div>
                    </div>
                </div>

                <!-- TEXT COMMANDS -->
                <div class="command-category">
                    <h3>📝 𝕿𝖊𝖠𝖎𝖘</h3>
                    <div class="command-list">
                        <div class="command-item">
                            <code>.toupa texte</code>
                            <span>𝕸𝖆𝖎𝖔𝖘𝖔𝖌𝖚𝖎𝖎𝖇</span>
                        </div>
                        <div class="command-item">
                            <code>.tolower texte</code>
                            <span>𝕸𝖎𝖎𝖔𝖘𝖈𝖚𝖑𝖎𝖇</span>
                        </div>
                        <div class="command-item">
                            <code>.reverse texte</code>
                            <span>𝔼𝖛𝖎𝖔𝖙𝖙𝖎𝖘𝖆</span>
                        </div>
                        <div class="command-item">
                            <code>.repeat 3 texte</code>
                            <span>𝕽𝖎𝖕𝖞𝖞𝖙𝖎𝖎𝖎</span>
                        </div>
                    </div>
                </div>

                <!-- ADMIN COMMANDS -->
                <div class="command-category">
                    <h3>⚙️ 𝕬𝖉𝖒𝖎𝖔</h3>
                    <div class="command-list">
                        <div class="command-item">
                            <code>.menu</code>
                            <span>𝕸𝖆𝖎𝖔 𝖈𝖔𝖞𝖔𝖑𝖊𝖙</span>
                        </div>
                        <div class="command-item">
                            <code>.help</code>
                            <span>𝕬𝖎𝖘𝖎𝖘𝖙𝖔𝖎𝖈𝖊 𝖚𝖖𝖞𝖎𝖘𝖖</span>
                        </div>
                        <div class="command-item">
                            <code>.owner</code>
                            <span>𝖎𝖎𝖋𝖆𝖔𝖎𝖔𝖘 𝖔𝖜𝖓𝖎𝖎</span>
                        </div>
                        <div class="command-item">
                            <code>.prefix</code>
                            <span>𝕻𝖔𝖓𝖋𝖎𝖌</span>
                        </div>
                    </div>
                </div>

                <!-- GROUP COMMANDS -->
                <div class="command-category">
                    <h3>👥 𝕲𝖘𝖆𝖚𝖓𝖈𝖎</h3>
                    <div class="command-list">
                        <div class="command-item">
                            <code>.groupinfo</code>
                            <span>𝔼𝖙𝖎𝖔𝖔𝖗𝖋𝖎𝖎𝖙𝖎𝖔</span>
                        </div>
                        <div class="command-item">
                            <code>.members</code>
                            <span>𝕾𝖎𝖘𝖘𝖆𝖘𝖌𝖔𝖠</span>
                        </div>
                        <div class="command-item">
                            <code>.kick</code>
                            <span>𝔼𝖛𝖆𝖜𝖎𝖘𝖘𝖎𝖙𝖎</span>
                        </div>
                        <div class="command-item">
                            <code>.ban</code>
                            <span>𝕭𝖔𝖎𝖎𝖆𝖞</span>
                        </div>
                    </div>
                </div>

                <div class="footer">
                    <p>✨ 𝕸𝖎𝖙𝖎 𝕭𝖔𝖙 𝖛2.0 ✨</p>
                    <p>🔥 𝕻𝖆𝖘𝖘𝖠𝖔𝖎𝖎 𝖉𝖚 𝕭𝖔𝖙 𝖆𝖉𝖕𝖆𝖛𝖈𝖚 🚀</p>
                </div>
            </div>
        </div>

        <script>
            document.getElementById('num').addEventListener('input', function() {
                this.value = this.value.replace(/[^0-9]/g, '');
            });
        </script>
    </body>
    </html>`);
});

app.get("/sessions/count", (req, res) => {
    res.json({ count: sessionsCount });
});

app.listen(port, () => {
    console.log(`🌐 𝕸𝖎𝖆𝖎 𝕭𝖔𝖆 𝕾𝖎𝖍𝖙𝖘 : http://localhost:${port}`);
});
