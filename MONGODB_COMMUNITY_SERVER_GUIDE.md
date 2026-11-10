# MongoDB Community Server Deployment Guide — CALZARE

This guide explains how to deploy and connect **MongoDB Community Server** (self-hosted, open-source) instead of MongoDB Atlas.

---

## Connection String Format for Community Server

Unlike MongoDB Atlas (`mongodb+srv://`), MongoDB Community Server uses standard TCP socket connections:

| Environment | Format | Example |
|---|---|---|
| **Local Machine** | No Auth | `mongodb://127.0.0.1:27017/calzare_production` |
| **Remote VPS** (With Auth) | Authenticated | `mongodb://calzare_admin:your_password@YOUR_SERVER_IP:27017/calzare_production?authSource=admin` |
| **Docker Compose** | Internal Network | `mongodb://calzare_admin:your_password@mongodb:27017/calzare_production?authSource=admin` |

---

## Deployment Option 1: 1-Click Docker Compose (Recommended)

The repository includes a ready-to-use [`docker-compose.yml`](file:///d:/CALZARE/docker-compose.yml) that runs **MongoDB Community Server 7.0** alongside the **CALZARE Backend API**.

### Steps:
1. Install Docker & Docker Compose on your server/VPS (Ubuntu, Debian, EC2, DigitalOcean, etc.):
   ```bash
   curl -fsSL https://get.docker.com | sh
   ```
2. Clone your repository:
   ```bash
   git clone https://github.com/TechyDeveloper8/Calzare.git
   cd Calzare
   ```
3. Start both services in detached mode:
   ```bash
   docker compose up -d
   ```
4. Verify both containers are healthy:
   ```bash
   docker compose ps
   ```
5. View MongoDB or Backend logs:
   ```bash
   docker compose logs -f mongodb
   docker compose logs -f backend
   ```

*Persistent storage is automatically mapped to the `mongo-data` volume so your database is never lost on restart.*

---

## Deployment Option 2: Native Ubuntu / Debian Linux VPS

If you have a Linux VPS (DigitalOcean Droplet, AWS EC2, Hetzner, Linode, Hostinger):

### Step 1: Install MongoDB Community Server
Run the official MongoDB Community Edition 7.0 installation:

```bash
# 1. Install prerequisites
sudo apt-get install gnupg curl -y

# 2. Import MongoDB public GPG key
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | \
   sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor

# 3. Add MongoDB repository
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# 4. Install MongoDB Community Edition packages
sudo apt-get update
sudo apt-get install -y mongodb-org

# 5. Start and enable systemd service
sudo systemctl daemon-reload
sudo systemctl start mongod
sudo systemctl enable mongod
```

### Step 2: Create Admin & Database User
Open the MongoDB Shell:
```bash
mongosh
```

Inside `mongosh`, create your secure database user:
```javascript
use admin

db.createUser({
  user: "calzare_admin",
  pwd: "YourStrongPasswordHere123!",
  roles: [
    { role: "userAdminAnyDatabase", db: "admin" },
    { role: "readWriteAnyDatabase", db: "admin" },
    { role: "dbAdminAnyDatabase", db: "admin" }
  ]
})

exit
```

### Step 3: Enable Security & Network Access
Edit `/etc/mongod.conf`:
```bash
sudo nano /etc/mongod.conf
```

Update `bindIp` and `security`:
```yaml
# Network interfaces
net:
  port: 27017
  bindIp: 0.0.0.0   # Allows connection from your backend (Render / remote app)

# Security
security:
  authorization: enabled
```

Restart MongoDB:
```bash
sudo systemctl restart mongod
```

### Step 4: Configure VPS Firewall (UFW)
Allow connections to port 27017:
```bash
# Allow from any IP (or restrict to your backend IP)
sudo ufw allow 27017/tcp
sudo ufw reload
```

---

## Step 5: Connect Render to Your Community Server

If your backend is hosted on **Render** and your MongoDB Community Server is on your VPS:

1. Open your [Render Dashboard](https://dashboard.render.com).
2. Go to your backend Web Service (`calzare` / `calzare-backend`).
3. Click **Environment Variables** in the left sidebar.
4. Update `MONGO_URI`:
   ```text
   mongodb://calzare_admin:YourStrongPasswordHere123!@YOUR_VPS_IP:27017/calzare_production?authSource=admin
   ```
5. Click **Save Changes**. Render will automatically redeploy and connect directly to your self-hosted MongoDB Community Server.

---

## Daily Backups (Automated)

To back up your self-hosted Community Server database, create a simple daily cron job:

```bash
# Manual Backup
mongodump --uri="mongodb://calzare_admin:YourPassword@127.0.0.1:27017/calzare_production?authSource=admin" --out=/var/backups/mongo-$(date +%F)

# Restore
mongorestore --uri="mongodb://calzare_admin:YourPassword@127.0.0.1:27017/calzare_production?authSource=admin" /var/backups/mongo-XXXX-XX-XX/
```

