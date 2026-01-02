#!/bin/bash

# Script para exponer el webhook con ngrok
# Uso: ./scripts/start-ngrok.sh
#
# IMPORTANTE: Debes tener el servidor corriendo con `npm run dev` en otra terminal

set -e

echo "🌐 Iniciando ngrok para exponer webhook..."
echo ""

# Verificar que ngrok esté instalado
if ! command -v ngrok &> /dev/null; then
    echo "❌ ngrok no está instalado"
    echo ""
    echo "Instálalo con uno de estos comandos:"
    echo "  npm install -g ngrok"
    echo "  brew install ngrok  # macOS"
    echo ""
    exit 1
fi

# Verificar que las variables de entorno estén configuradas
if [ ! -f ".env.local" ]; then
    echo "❌ Archivo .env.local no encontrado"
    echo ""
    echo "Crea el archivo .env.local con las siguientes variables:"
    echo "  DATABASE_URL=\"postgresql://...\""
    echo "  GEMINI_API_KEY=\"...\""
    echo "  YCLOUD_API_KEY=\"...\"  # Opcional para desarrollo"
    echo ""
    exit 1
fi

echo "✅ Configuración validada"
echo ""

# Verificar que el servidor esté corriendo
echo "⚠️  IMPORTANTE: Asegúrate de tener el servidor corriendo con:"
echo "   npm run dev"
echo ""

# Obtener URL fija de ngrok desde env o usar dominio por defecto
NGROK_URL="${NGROK_URL:-monkey-valued-incredibly.ngrok-free.app}"
WEBHOOK_URL="https://${NGROK_URL}/api/whatsapp/webhook"

# Iniciar ngrok con URL fija
echo "🌐 Exponiendo webhook con ngrok..."
echo ""
ngrok http --url=$NGROK_URL 3000 &
NGROK_PID=$!

# Esperar un poco para que ngrok se inicie
sleep 2

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Webhook activo!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📍 Servidor local:  http://localhost:3000"
echo "📍 Panel de ngrok:  http://localhost:4040"
echo "📍 Webhook público: $WEBHOOK_URL"
echo ""
echo "🔧 Configuración en Ycloud:"
echo "   1. Ve a Ycloud Dashboard > Webhooks"
echo "   2. Configura la URL: $WEBHOOK_URL"
echo ""
echo "🧪 Prueba el webhook:"
echo "   curl $WEBHOOK_URL"
echo ""
echo "📖 Guía completa: docs/YCLOUD_SETUP.md"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "⚠️  Presiona Ctrl+C para detener ngrok"
echo ""

# Manejar señal de interrupción
trap "echo ''; echo '🛑 Deteniendo ngrok...'; kill $NGROK_PID 2>/dev/null; echo '✅ ngrok detenido'; exit 0" INT

# Esperar indefinidamente
wait
