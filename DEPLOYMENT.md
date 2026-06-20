# 🚀 GUIDE DE DÉPLOIEMENT VERCEL

## Étape 1 : Préparer le projet

```bash
# Initialiser git si ce n'est pas fait
git init
git add .
git commit -m "Initial commit - Mini Bot Dev Shadow"
```

## Étape 2 : Créer un repo GitHub

1. Aller sur **github.com**
2. Créer un nouveau repo : `mini-bot-dev-shadow`
3. Copier les commandes git
4. Pusher le projet

```bash
git remote add origin https://github.com/TON_USERNAME/mini-bot-dev-shadow.git
git branch -M main
git push -u origin main
```

## Étape 3 : Déployer sur Vercel

### Option A : Via le site Vercel

1. Aller sur **vercel.com**
2. Se connecter/créer un compte
3. Cliquer "New Project"
4. Importer le repo GitHub
5. Cliquer "Deploy" ✅

### Option B : Vercel CLI

```bash
npm install -g vercel
vercel login
vercel --prod
```

## 🎯 Configuration Vercel

Aucune configuration supplémentaire n'est nécessaire !

Le fichier `vercel.json` gère tout automatiquement.

## ⚙️ Variables d'environnement

Si tu veux ajouter des variables :

1. Aller dans **Settings** du projet Vercel
2. Aller à **Environment Variables**
3. Ajouter tes variables

Exemples :
- `BOT_NAME` = Nom du bot
- `PREFIX` = Préfixe (défaut : .)

## 🔗 Accès après déploiement

Après le déploiement, tu auras une URL comme :
```
https://mini-bot-dev-shadow.vercel.app
```

Accède au site de pairing :
```
https://mini-bot-dev-shadow.vercel.app/
```

## 🐛 Dépannage

### Le bot ne se connecte pas
- Vérifier les logs : `vercel logs <project-name>`
- Vérifier que port 3002 n'est pas bloqué

### Les sessions ne se sauvegardent pas
- Vercel utilise un système de fichiers éphémère
- Pour persister les données, utiliser une DB comme MongoDB

### Site de pairing blanc
- Vercel rechercle les requêtes GET
- Vérifier que `express` est bien installé

## 📊 Monitoring

Pour surveiller ton bot :

1. **Logs Vercel** : `vercel logs`
2. **Dashboard** : vercel.com/dashboard
3. **Analytics** : Voir les requêtes en temps réel

## 🔄 Mise à jour du bot

Pour updater le bot :

```bash
# Modifier le code
git add .
git commit -m "Update bot commands"
git push

# Vercel redéploiera automatiquement !
```

---

**C'est tout ! Ton bot est maintenant en ligne 🎉**
