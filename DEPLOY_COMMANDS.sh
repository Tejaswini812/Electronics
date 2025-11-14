#!/bin/bash
# Hostinger VPS Deployment Commands for semiconventures.in
# DO NOT affect existing domains: villagecounty.in and startup-interns.in

echo "🚀 Starting deployment for semiconventures.in..."

# Step 1: Connect to VPS (run this from your local machine)
# ssh root@31.97.233.176
# Password: Startup8093@123

# Step 2: Check existing projects (VERIFY - DO NOT MODIFY)
echo "📋 Checking existing projects..."
pm2 list
ls -la /var/www/
ls -la /etc/nginx/sites-available/

# Step 3: Create directory for new project
echo "📁 Creating project directory..."
mkdir -p /var/www/semiconventures.in
cd /var/www/semiconventures.in

# Step 4: Clone repository
echo "📥 Cloning repository..."
git clone -b master https://github.com/Tejaswini812/Electronics.git .

# Step 5: Install dependencies
echo "📦 Installing dependencies..."
npm install
cd frontend
npm install
cd ..

# Step 6: Build frontend
echo "🔨 Building frontend..."
cd frontend
npm run build
cd ..

# Step 7: Create .env file
echo "⚙️ Creating .env file..."
cat > .env << EOF
PORT=3003
NODE_ENV=production
EOF

# Step 8: Start with PM2
echo "🚀 Starting application with PM2..."
npm install -g pm2
pm2 start server.js --name semiconventures
pm2 save
pm2 startup

# Step 9: Create Nginx configuration
echo "🌐 Creating Nginx configuration..."
cat > /etc/nginx/sites-available/semiconventures.in << 'NGINXEOF'
server {
    listen 80;
    server_name semiconventures.in www.semiconventures.in;

    location / {
        proxy_pass http://localhost:3003;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
NGINXEOF

# Step 10: Enable site
echo "🔗 Enabling Nginx site..."
ln -s /etc/nginx/sites-available/semiconventures.in /etc/nginx/sites-enabled/

# Step 11: Test and reload Nginx
echo "✅ Testing Nginx configuration..."
nginx -t
if [ $? -eq 0 ]; then
    echo "🔄 Reloading Nginx..."
    systemctl reload nginx
else
    echo "❌ Nginx configuration test failed! Please check the configuration."
    exit 1
fi

# Step 12: Setup SSL
echo "🔒 Setting up SSL certificate..."
apt-get update
apt-get install -y certbot python3-certbot-nginx
certbot --nginx -d semiconventures.in -d www.semiconventures.in

echo "✅ Deployment complete!"
echo "🌐 Your site should be available at: https://semiconventures.in"
echo "📊 Check PM2 status: pm2 list"
echo "📝 View logs: pm2 logs semiconventures"

