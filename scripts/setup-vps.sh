#!/bin/bash
# ================================================
# Setup script for Insane Barber on Ubuntu VPS
# Run as root: bash setup-vps.sh
# ================================================

set -e

echo "=== Updating system ==="
apt update && apt upgrade -y

echo "=== Installing Docker ==="
curl -fsSL https://get.docker.com | sh
systemctl enable docker
systemctl start docker

echo "=== Installing Docker Compose ==="
apt install -y docker-compose-plugin

echo "=== Creating app user ==="
useradd -m -s /bin/bash deploy || true
usermod -aG docker deploy

echo "=== Cloning repository ==="
su - deploy -c '
  git clone https://github.com/TU_USUARIO/tesis-code.git ~/insane-barber
  cd ~/insane-barber
  cp .env.production .env.production
'

echo "=== Installing Nginx for SSL (optional) ==="
apt install -y certbot

echo ""
echo "================================================"
echo "  Setup complete!"
echo "================================================"
echo ""
echo "Next steps:"
echo "  1. Edit /home/deploy/insane-barber/.env.production"
echo "     - Change DB_PASSWORD"
echo "     - Change JWT_SECRET"
echo "     - Set NEXT_PUBLIC_API_URL to your domain"
echo ""
echo "  2. Deploy:"
echo "     cd /home/deploy/insane-barber"
echo "     docker compose -f docker-compose.prod.yml --env-file .env.production up -d"
echo ""
echo "  3. (Optional) SSL with Let's Encrypt:"
echo "     certbot certonly --standalone -d tu-dominio.com"
echo ""
echo "  4. GitHub Actions secrets to configure:"
echo "     VPS_HOST     = your VPS IP"
echo "     VPS_USER     = deploy"
echo "     VPS_SSH_KEY  = contents of ~/.ssh/id_ed25519"
echo ""
