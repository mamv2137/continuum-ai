# Guía de Configuración de Ycloud (WhatsApp)

Esta guía te ayudará a configurar Ycloud para conectar el bot de Continuum AI con WhatsApp.

## 📋 Prerequisitos

- Cuenta en [Ycloud](https://www.ycloud.com/)
- Número de teléfono para WhatsApp Business
- Servidor con URL pública (usaremos ngrok para desarrollo)

---

## 🚀 Paso 1: Crear Cuenta en Ycloud

1. Ve a [https://www.ycloud.com/](https://www.ycloud.com/)
2. Regístrate o inicia sesión
3. Completa el proceso de verificación

---

## 🔑 Paso 2: Obtener API Key

1. Ve al **Dashboard** de Ycloud
2. Navega a **Settings** > **API Keys**
3. Crea una nueva API Key
4. **Copia la API key** (solo se muestra una vez)
5. Pégala en tu archivo `.env.local`:

```env
YCLOUD_API_KEY="tu-api-key-aqui"
```

---

## 📱 Paso 3: Configurar WhatsApp Business

### Opción A: Usar Número de Prueba de Ycloud

Ycloud proporciona un número de prueba para desarrollo:

1. Ve a **WhatsApp** > **Test Number**
2. Escanea el QR code con WhatsApp
3. Ahora puedes enviar mensajes de prueba

### Opción B: Conectar tu Propio Número

1. Ve a **WhatsApp** > **Phone Numbers**
2. Haz clic en **Add Phone Number**
3. Sigue el proceso de verificación de WhatsApp Business API
4. Espera aprobación (puede tomar 24-48 horas)

---

## 🌐 Paso 4: Exponer tu Webhook Localmente

Para desarrollo, necesitas exponer tu servidor local a Internet.

### Opción 1: Script Automático (Recomendado)

**Paso 1:** Inicia el servidor de desarrollo en una terminal:

```bash
npm run dev
```

**Paso 2:** En otra terminal, expone el webhook con ngrok:

```bash
npm run ngrok
```

El script ngrok:

- ✅ Valida que ngrok esté instalado
- ✅ Valida que `.env.local` esté configurado
- ✅ Expone el webhook con ngrok usando una URL fija
- ✅ Muestra la URL pública del webhook

**URL del webhook:**

```text
https://monkey-valued-incredibly.ngrok-free.app/api/whatsapp/webhook
```

**Nota:** El script usa la URL fija de ngrok configurada. Si quieres usar una URL diferente, agrégala a tu `.env.local`:

```env
NGROK_URL="tu-dominio-personalizado.ngrok-free.app"
```

Abre [http://localhost:4040](http://localhost:4040) para ver el panel de ngrok.

**Presiona Ctrl+C en cada terminal para detener los servicios.**

### Opción 2: Manual con ngrok

1. **Instalar ngrok:**
   ```bash
   npm install -g ngrok
   # o
   brew install ngrok  # macOS
   ```

2. **Iniciar tu servidor local:**
   ```bash
   npm run dev
   ```

3. **En otra terminal, exponer el puerto 3000:**
   ```bash
   ngrok http 3000
   ```

4. **Copiar la URL de ngrok:**
   ```
   Forwarding  https://abc123.ngrok.io -> http://localhost:3000
   ```

   Tu webhook será: `https://abc123.ngrok.io/api/whatsapp/webhook`

### Opción 3: Usar Cloudflare Tunnel

```bash
npm install -g cloudflared
cloudflared tunnel --url http://localhost:3000
```

---

## ⚙️ Paso 5: Configurar Webhook en Ycloud

1. Ve al **Dashboard de Ycloud**
2. Navega a **WhatsApp** > **Webhooks**
3. Haz clic en **Configure Webhook**

4. **Configura los siguientes campos:**
   - **Webhook URL**: `https://tu-dominio.ngrok.io/api/whatsapp/webhook`
   - **Events to Subscribe**:
     - ✅ `message` (mensajes entrantes)
     - ✅ `message.delivered` (opcional, para tracking)
     - ✅ `message.read` (opcional, para tracking)

5. **Guardar configuración**

6. **Verificar Webhook:**
   - Ycloud hará un `GET` request a tu webhook
   - Debe retornar `200 OK`
   - Verifica en los logs de tu consola

---

## 🧪 Paso 6: Probar la Conexión

### Test 1: Verificar que el webhook está activo

```bash
curl https://tu-dominio.ngrok.io/api/whatsapp/webhook
```

Respuesta esperada:
```json
{
  "status": "ok",
  "webhook": "active"
}
```

### Test 2: Enviar mensaje de prueba

1. Escanea el QR del número de prueba de Ycloud con tu WhatsApp
2. Envía un mensaje: **"Hola"**
3. Deberías recibir la respuesta del bot de Continuum

### Test 3: Revisar logs

En tu consola de desarrollo deberías ver:
```
📥 Webhook recibido: { ... }
📱 Mensaje de +5215512345678: "Hola"
✅ Respuesta generada para +5215512345678
📤 Mensaje enviado exitosamente. ID: msg_xxx
```

---

## 🔐 Paso 7: Configurar Seguridad (Opcional pero Recomendado)

Ycloud envía un header `X-YCloud-Signature` para verificar la autenticidad del webhook usando HMAC SHA256.

### ¿Por qué es importante?

Sin validación de firma, cualquiera podría enviar requests falsos a tu webhook. La validación asegura que los mensajes realmente provienen de Ycloud.

### Configuración

1. **Obtener Webhook Secret:**
   - Ve a **Webhooks** en Ycloud Dashboard
   - Copia el **Webhook Secret** (se muestra al configurar el webhook)

2. **Agregar a `.env.local`:**

   ```env
   YCLOUD_WEBHOOK_SECRET="tu-webhook-secret-aqui"
   ```

3. **Reiniciar el servidor:**

   ```bash
   npm run webhook
   ```

### Cómo funciona

El webhook ahora automáticamente:

- ✅ Valida la firma HMAC SHA256 en cada request
- ✅ Verifica el timestamp para prevenir replay attacks (max 5 minutos)
- ✅ Rechaza requests con firma inválida con status 401
- ✅ Compara firmas de manera timing-safe (previene timing attacks)

Si `YCLOUD_WEBHOOK_SECRET` no está configurado, el webhook funciona sin validación (solo para desarrollo).

### Logs de seguridad

Con la validación habilitada verás:

```text
🔒 Firma del webhook validada correctamente
📥 Webhook recibido: { ... }
```

Si falla:

```text
🔒 Validación de firma falló: Invalid webhook signature
```

---

## 📊 Paso 8: Monitorear Mensajes

### En Ycloud Dashboard

1. Ve a **WhatsApp** > **Messages**
2. Verás todos los mensajes entrantes y salientes
3. Puedes ver estado de entrega, errores, etc.

### En tu Aplicación

Revisa los logs en tu consola:
```bash
npm run dev
```

Todos los mensajes se loguean con emojis para fácil identificación:
- 📥 Webhook recibido
- 📱 Mensaje del usuario
- ✅ Respuesta generada
- 📤 Mensaje enviado

---

## ⚠️ Troubleshooting

### Error: "Webhook verification failed"

**Causa:** Ycloud no puede alcanzar tu webhook.

**Solución:**
1. Verifica que ngrok esté corriendo
2. Verifica que tu servidor esté en el puerto 3000
3. Prueba el webhook manualmente con curl

---

### Error: "Invalid API Key"

**Causa:** API Key incorrecta o no configurada.

**Solución:**
1. Verifica que `YCLOUD_API_KEY` esté en `.env.local`
2. Verifica que la API key sea correcta
3. Regenera la API key si es necesario

---

### Error: "Message sending failed"

**Causa:** Número no registrado o límites excedidos.

**Solución:**
1. Si estás usando número de prueba, asegúrate de haber escaneado el QR
2. Verifica límites de mensajes en Ycloud Dashboard
3. Revisa logs de Ycloud para más detalles

---

### Mensaje no llega al usuario

**Causa:** Webhook recibe pero no envía respuesta.

**Solución:**
1. Verifica que `YCLOUD_API_KEY` esté configurada
2. Revisa logs de la consola para ver el error
3. Verifica formato del número de teléfono (+código país + número)

---

## 🚀 Paso 9: Preparar para Producción

Cuando estés listo para producción:

### 1. Deploy a Vercel/Railway/etc

```bash
# Ejemplo con Vercel
npm install -g vercel
vercel --prod
```

### 2. Configurar Variables de Entorno

En tu plataforma de hosting, configura:
- `DATABASE_URL`
- `GEMINI_API_KEY`
- `YCLOUD_API_KEY`
- `YCLOUD_WEBHOOK_SECRET`
- `BETTER_AUTH_SECRET`

### 3. Actualizar Webhook en Ycloud

Cambia la URL del webhook a tu dominio de producción:
```
https://tu-app.vercel.app/api/whatsapp/webhook
```

### 4. Verificar Número de WhatsApp Business

Si usabas número de prueba, ahora necesitas:
1. Número de teléfono dedicado para WhatsApp Business
2. Verificación de Meta/Facebook
3. Completar perfil de negocio

---

## 📝 Checklist de Configuración

Antes de probar con usuarios reales:

- [ ] ✅ Cuenta de Ycloud creada
- [ ] ✅ API Key obtenida y configurada
- [ ] ✅ Webhook expuesto (ngrok o similar)
- [ ] ✅ Webhook configurado en Ycloud
- [ ] ✅ Número de WhatsApp conectado
- [ ] ✅ Test enviado y recibido correctamente
- [ ] ✅ Logs verificados (sin errores)
- [ ] ✅ Gemini API Key configurada
- [ ] ✅ Base de datos conectada
- [ ] ✅ Webhook signature verificada (opcional)

---

## 📚 Recursos

- [Documentación de Ycloud](https://docs.ycloud.com/)
- [WhatsApp Business API Docs](https://developers.facebook.com/docs/whatsapp)
- [ngrok Documentation](https://ngrok.com/docs)

---

## 💬 Ejemplo de Conversación Completa

```
Usuario: Hola
Bot: ¡Hola! ¿Cómo te sientes en este momento?

Usuario: Me siento un poco ansioso
Bot: Te escucho. ¿Dónde sientes esa ansiedad en tu cuerpo?

Usuario: En el pecho
Bot: ¿Cómo es esa sensación en tu pecho? ¿Tiene peso, temperatura?

Usuario: Es como una presión, algo pesado
Bot: ¿Esa presión se queda quieta o se mueve?

Usuario: Se queda ahí
Bot: Si esa presión tuviera una intensidad del 1 al 10, ¿cuál sería?

Usuario: Como un 7
Bot: ¿Hay alguna otra parte de tu cuerpo donde notes algo?

Usuario: Gracias, listo
Bot: Gracias por tomarte este tiempo para conectar con tu experiencia presente.

[Insight generado por IA]

¡Hasta pronto! 🌱
```

---

**¿Problemas?** Revisa los logs de desarrollo o abre un issue en el repositorio.
