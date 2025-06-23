```

**Key Improvements**:
- Uses `EmbedBuilder` (discord.js v14+) instead of deprecated `MessageEmbed`.
- Uses environment variables (`process.env`) for secure configuration.
- Adds rate limit prevention with a 1-second delay between DMs.
- Fetches guild members to ensure all members are available.
- Makes commands case-insensitive.
- Adds owner-based permission checks alongside administrator permissions.
- Includes error handling for DM failures.

#### 3. **Set Up Environment Variables**
Instead of `config.json`, use a `.env` file for security (especially for the token). Create a `.env` file in your project root:

<xaiArtifact artifact_id="5b30ee66-4500-4403-9a13-9aa76e9d34bf" artifact_version_id="48db2f5d-b837-401f-a3bc-5910bef6b14e" title=".env" contentType="text/plain">
```env
TOKEN=YOUR_NEW_BOT_TOKEN
PREFIX=.
STATUSES=["Senle","Kalbimle","Hayatımla"]
TIMER=10
OWNERS=["1339667070916366462"]
```

**Note**: Replace `YOUR_NEW_BOT_TOKEN` with the new token from the Discord Developer Portal. Add `.env` to `.gitignore` to prevent it from being pushed to GitHub.

#### 4. **Set Up GitHub Repository**
1. **Create a Repository**:
   - Go to [GitHub](https://github.com) and create a new repository (e.g., `discord-announcement-bot`).
   - Initialize it with a `README.md` and `.gitignore` (select the Node.js template to exclude `node_modules` and `.env`).

2. **Project Structure**:
   ```
   discord-announcement-bot/
   ├── index.js
   ├── .env
   ├── package.json
   ├── .gitignore
   └── README.md
   ```

3. **Create `package.json`**:
   Run `npm init -y` to generate a `package.json`, then install dependencies:

   ```bash
   npm install discord.js dotenv
   ```

   Your `package.json` should look like this:

   <xaiArtifact artifact_id="6b3dcd83-8ec1-4cea-9867-75cdb7b14cb2" artifact_version_id="e99148f9-ef21-499c-bfa8-1badf92ab226" title="package.json" contentType="application/json">
   ```json
   {
     "name": "discord-announcement-bot",
     "version": "1.0.0",
     "main": "index.js",
     "scripts": {
       "start": "node index.js"
     },
     "dependencies": {
       "discord.js": "^14.16.3",
       "dotenv": "^16.4.5"
     }
   }
   ```

4. **Push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/discord-announcement-bot.git
   git push -u origin main
   ```

#### 5. **Host the Bot for 24/7 Operation**
Since GitHub Pages cannot run a Node.js bot, use one of these platforms to host it:

##### Option 1: Replit (Free, Easy)
1. **Create a Replit Project**:
   - Go to [Replit](https://replit.com) and create a new Node.js repl.
   - Upload `index.js`, `package.json`, and `.env` to the repl.

2. **Set Up Environment Variables**:
   - In Replit, add your environment variables (from `.env`) in the **Secrets** tab (left sidebar).
   - Example:
     - `TOKEN`: Your new bot token
     - `PREFIX`: .
     - `STATUSES`: ["Senle","Kalbimle","Hayatımla"]
     - `TIMER`: 10
     - `OWNERS`: ["1339667070916366462"]

3. **Run the Bot**:
   - Click **Run** in Replit. The bot will start and stay online as long as the repl is active.
   - To keep it 24/7, enable Replit’s **Always On** feature (requires a paid plan) or use a free alternative like pinging the repl’s URL (see below).

4. **Keep Replit Alive**:
   - Use a service like [UptimeRobot](https://uptimerobot.com) to ping your repl’s URL every 5 minutes to prevent it from sleeping (free tier available).

##### Option 2: Heroku
1. **Create a Heroku App**:
   - Sign up at [Heroku](https://heroku.com) and create a new app.
   - Connect your GitHub repository to Heroku for automatic deployments.

2. **Set Environment Variables**:
   - In Heroku’s dashboard, go to **Settings** > **Config Vars** and add the variables from your `.env` file.

3. **Deploy**:
   - Enable automatic deploys from your GitHub repository’s `main` branch.
   - Add a `Procfile` to your repository:

   <xaiArtifact artifact_id="96695cf8-9fba-4352-84ef-84a94b9c9dd6" artifact_version_id="9487be0d-7f9f-48e6-957e-b2ccdb57ef2b" title="Procfile" contentType="text/plain">
   ```text
   worker: node index.js
   ```

4. **Scale the Worker**:
   - Run `heroku ps:scale worker=1` to ensure the bot runs continuously.

##### Option 3: VPS (Advanced)
If you have a VPS (e.g., AWS, DigitalOcean), you can:
1. Clone your repository: `git clone https://github.com/yourusername/discord-announcement-bot.git`.
2. Install Node.js and dependencies: `npm install`.
3. Use a process manager like PM2 to keep the bot running:
   ```bash
   npm install -g pm2
   pm2 start index.js --name "announcement-bot"
   pm2 startup
   pm2 save
   ```
4. Set environment variables in the VPS (e.g., via `export` or a `.env` file with `dotenv`).

#### 6. **Automate with GitHub Actions**
To automate updates (e.g., redeploy the bot when you push changes to GitHub), use GitHub Actions. This is useful if you’re hosting on a platform like Heroku or a VPS.

1. **Create a GitHub Actions Workflow**:
   Create a file at `.github/workflows/deploy.yml`:

   <xaiArtifact artifact_id="daf78743-384f-4a49-8d47-6a306cc0d198" artifact_version_id="aefc3fe4-3ce8-47f1-9450-25797f7791c0" title=".github/workflows/deploy.yml" contentType="text/yaml">
   ```yaml
   name: Deploy Bot
   on:
     push:
       branches:
         - main
   jobs:
     deploy:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         - name: Set up Node.js
           uses: actions/setup-node@v3
           with:
             node-version: '18'
         - name: Install Dependencies
           run: npm install
         - name: Deploy to Server
           env:
             SSH_PRIVATE_KEY: ${{ secrets.SSH_PRIVATE_KEY }}
             SERVER_IP: ${{ secrets.SERVER_IP }}
             SERVER_USER: ${{ secrets.SERVER_USER }}
           run: |
             echo "$SSH_PRIVATE_KEY" > private_key
             chmod 600 private_key
             ssh -i private_key $SERVER_USER@$SERVER_IP << 'EOF'
               cd ~/discord-announcement-bot
               git pull origin main
               npm install
               pm2 restart announcement-bot
             EOF
   ```

2. **Set Up Secrets**:
   - In your GitHub repository, go to **Settings** > **Secrets and variables** > **Actions** > **New repository secret**.
   - Add:
     - `SSH_PRIVATE_KEY`: Your VPS SSH private key.
     - `SERVER_IP`: Your VPS IP address.
     - `SERVER_USER`: Your VPS username.

   **Note**: This workflow is for a VPS. For Heroku, use the `akhileshns/heroku-deploy` action instead.

#### 7. **Test the Bot**
1. Invite the bot to your Discord server using the OAuth2 URL from the Discord Developer Portal.
2. Ensure the bot has the necessary intents enabled (`Server Members` and `Presence`) in the **Bot** tab.
3. Test commands:
   - `.help`: Should display the help embed.
   - `.dm Hello everyone!`: Should send a DM to all members (if you’re an admin or owner).
   - `.odm Online announcement!`: Should send a DM to online members.
   - `.ping`: Should show the bot’s ping.

#### 8. **Why Not GitHub Pages?**
GitHub Pages is for static websites (HTML/CSS/JS) and cannot run Node.js applications or maintain WebSocket connections required for a Discord bot. Instead, it could be used to host a simple status page for your bot (e.g., showing if it’s online), but the bot itself must run on a server or hosting platform like Replit or Heroku.

#### 9. **Optional: Status Page on GitHub Pages**
If you want a status page for your bot:
1. Create an `index.html` in your repository:
   ```html
   <!DOCTYPE html>
   <html>
   <head>
       <title>Announcement Bot Status</title>
   </head>
   <body>
       <h1>Discord Announcement Bot</h1>
       <p>Status: <span id="status">Checking...</span></p>
       <script>
           fetch('https://your-bot-api-endpoint/status')
               .then(response => response.json())
               .then(data => document.getElementById('status').textContent = data.status)
               .catch(() => document.getElementById('status').textContent = 'Offline');
       </script>
   </body>
   </html>
   ```
2. Enable GitHub Pages in your repository settings (use the `main` branch).
3. You’d need to host a simple API endpoint (e.g., on Replit or Heroku) to provide the bot’s status.

---

### Final Notes
- **Security**: Regenerate your bot token immediately and never commit it to GitHub. Use `.env` for sensitive data.
- **Hosting**: Replit is the easiest free option for 24/7 hosting with UptimeRobot. Heroku or a VPS offers more control but may require payment.
- **GitHub Actions**: Automates deployment to your hosting platform when you push changes to the `main` branch.
- **Intents**: Ensure `Server Members` and `Presence` intents are enabled in the Discord Developer Portal.

If you need help setting up a specific hosting platform (e.g., Replit or Heroku) or configuring GitHub Actions, let me know, and I can provide detailed steps for that part!
