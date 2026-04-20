#!/bin/bash
# Run on your OCI Ubuntu VM as root / via sudo

set -e

apt-get update -y
apt-get install -y nginx certbot python3-certbot-nginx ufw

# Open ports in OS firewall
ufw allow 22
ufw allow 80
ufw allow 443
ufw --force enable

# Copy nginx config
cp /tmp/nginx.conf /etc/nginx/sites-available/auth-proxy
ln -sf /etc/nginx/sites-available/auth-proxy /etc/nginx/sites-enabled/auth-proxy
rm -f /etc/nginx/sites-enabled/default

nginx -t && systemctl reload nginx

echo "Nginx ready. OCI Security List must also allow TCP 80 and 443 ingress."
echo "To get TLS cert: certbot --nginx -d your-domain.com"
