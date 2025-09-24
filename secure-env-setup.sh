#!/bin/bash

# Secure Environment Setup Script
# This script helps set up environment variables securely on your production server

set -e  # Exit on any error

echo "🔐 Setting up secure environment variables for patrickadrianus.com..."

# Define paths
DEPLOY_PATH="/var/www"
ENV_FILE="$DEPLOY_PATH/.env.production"
SYSTEMD_SERVICE="/etc/systemd/system/portfolio-server.service"

# Function to prompt for secure input
prompt_secret() {
    local var_name="$1"
    local description="$2"
    local current_value=""
    
    echo ""
    echo "Setting $var_name:"
    echo "$description"
    echo -n "Enter value (input will be hidden): "
    read -s current_value
    echo ""  # New line after hidden input
    
    if [ -n "$current_value" ]; then
        echo "$var_name=$current_value" >> "$ENV_FILE"
        echo "✅ $var_name configured"
    else
        echo "⚠️  $var_name skipped (empty value)"
    fi
}

# Create secure .env.production file
echo "Creating production environment file..."
sudo touch "$ENV_FILE"
sudo chmod 600 "$ENV_FILE"  # Only root can read/write
sudo chown root:root "$ENV_FILE"

# Clear existing file
sudo truncate -s 0 "$ENV_FILE"

# Add basic configuration
echo "NODE_ENV=production" | sudo tee -a "$ENV_FILE" > /dev/null
echo "PORT=3001" | sudo tee -a "$ENV_FILE" > /dev/null

echo ""
echo "📝 Please provide the following environment variables:"

# Prompt for sensitive variables
prompt_secret "VITE_LLM_API_KEY" "GitHub Models Personal Access Token (for AI assistant)"
prompt_secret "SECRET_KEY" "Secret key for server operations (generate a random 64-character string)"

# Optional variables
echo ""
echo "Optional configuration (press Enter to skip):"
prompt_secret "ADMIN_PASSWORD_HASH" "Hashed password for admin access to feedback data"
prompt_secret "DATABASE_URL" "Database connection string (if using external database)"

# LLM Configuration (can be public)
echo ""
echo "LLM Service Configuration:"
echo "VITE_LLM_API_URL=https://models.github.ai/inference/chat/completions" | sudo tee -a "$ENV_FILE" > /dev/null
echo "VITE_LLM_MODEL=openai/gpt-4o-mini" | sudo tee -a "$ENV_FILE" > /dev/null

echo ""
echo "✅ Environment file created at $ENV_FILE"

# Create systemd service for the server
echo ""
echo "Creating systemd service..."

sudo tee "$SYSTEMD_SERVICE" > /dev/null << EOF
[Unit]
Description=Portfolio Server
After=network.target

[Service]
Type=simple
User=www-data
Group=www-data
WorkingDirectory=$DEPLOY_PATH/server
ExecStart=/usr/bin/node index.js
Restart=always
RestartSec=5
EnvironmentFile=$ENV_FILE

# Security settings
NoNewPrivileges=yes
ProtectSystem=strict
ProtectHome=yes
ReadWritePaths=$DEPLOY_PATH/server/data
PrivateTmp=yes

[Install]
WantedBy=multi-user.target
EOF

echo "✅ Systemd service created"

# Set proper permissions
echo ""
echo "Setting file permissions..."
sudo chown -R www-data:www-data "$DEPLOY_PATH/server"
sudo chmod -R 755 "$DEPLOY_PATH/server"
sudo chmod -R 644 "$DEPLOY_PATH/server"/*.js
sudo mkdir -p "$DEPLOY_PATH/server/data"
sudo chown -R www-data:www-data "$DEPLOY_PATH/server/data"

# Enable and start the service
echo ""
echo "Enabling and starting the portfolio server..."
sudo systemctl daemon-reload
sudo systemctl enable portfolio-server
sudo systemctl start portfolio-server

# Check status
echo ""
echo "Checking service status..."
if sudo systemctl is-active --quiet portfolio-server; then
    echo "✅ Portfolio server is running successfully!"
else
    echo "❌ Portfolio server failed to start. Checking logs..."
    sudo systemctl status portfolio-server --no-pager
    sudo journalctl -u portfolio-server -n 20 --no-pager
    exit 1
fi

echo ""
echo "🎉 Secure environment setup complete!"
echo ""
echo "📋 Summary:"
echo "  - Environment variables stored in: $ENV_FILE"
echo "  - Service configuration: $SYSTEMD_SERVICE"
echo "  - Service status: sudo systemctl status portfolio-server"
echo "  - View logs: sudo journalctl -u portfolio-server -f"
echo ""
echo "🔒 Security measures implemented:"
echo "  - Environment file is only readable by root (600 permissions)"
echo "  - Server runs as www-data user (not root)"
echo "  - Systemd service has security restrictions"
echo "  - API keys are not exposed in client-side code"
echo ""
echo "⚠️  Important reminders:"
echo "  - Never commit .env files to version control"
echo "  - Keep your GitHub PAT secure and rotate it regularly"
echo "  - Use HTTPS in production"
echo "  - Consider adding admin authentication for feedback endpoints"