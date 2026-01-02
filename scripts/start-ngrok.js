#!/usr/bin/env node

/**
 * Script para exponer el webhook con ngrok
 * Uso: npm run ngrok
 *
 * IMPORTANTE: Debes tener el servidor corriendo con `npm run dev` en otra terminal
 */

const { spawn } = require('child_process')
const { existsSync } = require('fs')
const { join } = require('path')

const PORT = 3000

console.log('🌐 Iniciando ngrok para exponer webhook...\n')

// Verificar .env.local
if (!existsSync(join(process.cwd(), '.env.local'))) {
  console.error('❌ Archivo .env.local no encontrado\n')
  console.error('Crea el archivo .env.local con las siguientes variables:')
  console.error('  DATABASE_URL="postgresql://..."')
  console.error('  GEMINI_API_KEY="..."')
  console.error('  YCLOUD_API_KEY="..."  # Opcional para desarrollo\n')
  process.exit(1)
}

// Cargar .env.local
require('dotenv').config({ path: '.env.local' })

// Verificar si ngrok está instalado
const ngrokCheck = spawn('which', ['ngrok'], { shell: true })
ngrokCheck.on('close', (code) => {
  if (code !== 0) {
    console.error('❌ ngrok no está instalado\n')
    console.error('Instálalo con uno de estos comandos:')
    console.error('  npm install -g ngrok')
    console.error('  brew install ngrok  # macOS\n')
    process.exit(1)
  }

  startNgrok()
})

function startNgrok() {
  console.log('✅ Configuración validada\n')

  // Verificar que el servidor esté corriendo
  console.log('⚠️  IMPORTANTE: Asegúrate de tener el servidor corriendo con:')
  console.log('   npm run dev\n')

  // Obtener URL fija de ngrok desde env o usar dominio por defecto
  const ngrokUrl = process.env.NGROK_URL || 'monkey-valued-incredibly.ngrok-free.app'
  const webhookUrl = `https://${ngrokUrl}/api/whatsapp/webhook`

  console.log('🌐 Exponiendo webhook con ngrok...\n')

  // Iniciar ngrok con URL fija
  const ngrok = spawn(
    'ngrok',
    ['http', `--url=${ngrokUrl}`, PORT.toString()],
    {
      stdio: 'inherit',
      shell: true,
    }
  )

  // Esperar un poco y mostrar instrucciones
  setTimeout(() => {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('✅ Webhook activo!')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
    console.log('📍 Servidor local:  http://localhost:3000')
    console.log('📍 Panel de ngrok:  http://localhost:4040')
    console.log(`📍 Webhook público: ${webhookUrl}\n`)
    console.log('🔧 Configuración en Ycloud:')
    console.log('   1. Ve a Ycloud Dashboard > Webhooks')
    console.log(`   2. Configura la URL: ${webhookUrl}\n`)
    console.log('🧪 Prueba el webhook:')
    console.log(`   curl ${webhookUrl}\n`)
    console.log('📖 Guía completa: docs/YCLOUD_SETUP.md\n')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
    console.log('⚠️  Presiona Ctrl+C para detener ngrok\n')
  }, 2000)

  // Manejar señal de interrupción
  const cleanup = () => {
    console.log('\n🛑 Deteniendo ngrok...')
    ngrok.kill('SIGTERM')
    setTimeout(() => {
      console.log('✅ ngrok detenido')
      process.exit(0)
    }, 1000)
  }

  process.on('SIGINT', cleanup)
  process.on('SIGTERM', cleanup)

  ngrok.on('exit', () => {
    process.exit(0)
  })
}
