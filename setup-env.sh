#!/bin/bash
# Environment Setup Script for VoiceSticker

echo "🚀 VoiceSticker Environment Setup"
echo "=================================="
echo ""

# Get Worker URL
read -p "Enter your Cloudflare Worker URL (e.g., https://voicesticker-worker.xxx.workers.dev): " WORKER_URL

if [ -z "$WORKER_URL" ]; then
    echo "❌ Worker URL is required!"
    exit 1
fi

# Telegram WebApp
echo ""
echo "📱 Setting up Telegram WebApp..."
cd apps/telegram-webapp
cat > .env.local << EOL
# Telegram WebApp Environment Variables
NEXT_PUBLIC_WORKER_URL=${WORKER_URL}
EOL
echo "✅ Created apps/telegram-webapp/.env.local"

# WhatsApp PWA
echo ""
echo "📱 Setting up WhatsApp PWA..."
cd ../whatsapp-pwa
cat > .env.local << EOL
# WhatsApp PWA Environment Variables
NEXT_PUBLIC_WORKER_URL=${WORKER_URL}
EOL
echo "✅ Created apps/whatsapp-pwa/.env.local"

# Worker config reminder
echo ""
echo "📝 Worker Configuration:"
echo "   Edit worker/wrangler.toml and update:"
echo "   - TELEGRAM_BOT_TOKEN (get from @BotFather)"
echo "   - ALLOWED_ORIGINS (update after deploying frontends)"
echo ""

echo "✅ Environment setup complete!"
echo ""
echo "Next steps:"
echo "1. Deploy worker: cd worker && wrangler deploy"
echo "2. Deploy Telegram: cd apps/telegram-webapp && vercel --prod"
echo "3. Deploy WhatsApp: cd apps/whatsapp-pwa && vercel --prod"
echo "4. Update worker CORS with Vercel URLs"
