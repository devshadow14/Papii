/**
 * DEV SHADOW MD V1.0
 * Bot Telegram connecté à WhatsApp via pairing code (Baileys)
 * ©DEV SHADOW TECH
 *
 * Chaque utilisateur Telegram peut faire /pair <numero> pour connecter
 * son propre numéro WhatsApp. Une session distincte est créée par utilisateur.
 */
require('dotenv').config()
const chalk = require('chalk')

console.log(chalk.cyan(`
< ================================================== >
   ${process.env.BOT_NAME || 'DEV SHADOW MD V1.0'}
   ${process.env.CREATED_BY || 'DEV SHADOW TECH'}
< ================================================== >
`))

// Démarrage du bot Telegram (interface de pairing WhatsApp)
require('./telegram-bot')

process.on('uncaughtException', (err) => {
    console.error('Exception non interceptée :', err)
})

process.on('unhandledRejection', (err) => {
    console.error('Rejet non géré :', err)
})
