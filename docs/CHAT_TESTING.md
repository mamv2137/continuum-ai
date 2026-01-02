# Guía de Testing con UI de Chat

Esta guía explica cómo usar la interfaz de chat para probar el bot de Gestalt sin necesidad de WhatsApp.

---

## 🎯 ¿Para qué sirve?

La UI de testing te permite:

- ✅ **Probar el bot sin gastar mensajes de WhatsApp**
- ✅ **Iterar rápidamente** durante el desarrollo
- ✅ **Probar con múltiples usuarios** simultáneamente
- ✅ **Resetear conversaciones** fácilmente
- ✅ **Ver el flujo completo** del bot de Gestalt

---

## 🚀 Cómo Usar

### 1. Iniciar el servidor

```bash
npm run dev
```

### 2. Abrir la UI de chat

Abre tu navegador en: [http://localhost:3000/chat](http://localhost:3000/chat)

### 3. Configurar número de teléfono

En el header, puedes cambiar el número de teléfono de prueba:

- **Por defecto:** `+5491121913619`
- **Formato:** Debe empezar con `+` y tener 10-15 dígitos

### 4. Enviar mensajes

1. Escribe un mensaje en el campo de texto
2. Presiona **Enter** o haz clic en **Enviar**
3. El bot responderá usando Gemini AI con lógica de Gestalt

**Atajos de teclado:**
- `Enter` → Enviar mensaje
- `Shift + Enter` → Nueva línea

### 5. Resetear conversación

Haz clic en el botón **Resetear** para:
- Completar el check-in activo
- Empezar una nueva conversación desde cero

---

## 📊 Ejemplo de Conversación

```
👤 Tú: Hola

🤖 Bot: ¡Hola! ¿Cómo te sientes en este momento?

👤 Tú: Me siento ansioso

🤖 Bot: Te escucho. ¿Dónde sientes esa ansiedad en tu cuerpo?

👤 Tú: En el pecho, como una presión

🤖 Bot: ¿Cómo es esa presión? ¿Tiene peso, temperatura, forma?

👤 Tú: Es pesada y apretada

🤖 Bot: Si tuvieras que darle una intensidad del 1 al 10, ¿cuál sería?

👤 Tú: Como un 7

🤖 Bot: ¿Hay alguna otra parte de tu cuerpo donde notes algo?

👤 Tú: No, solo ahí

🤖 Bot: Gracias por tomarte este tiempo...

[Insight generado por IA]

¡Hasta pronto! 🌱
```

---

## 🔧 Endpoints de la API

### POST `/api/chat/send`

Envía un mensaje al bot.

**Request:**
```json
{
  "phoneNumber": "+5491121913619",
  "message": "Hola"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "response": "¡Hola! ¿Cómo te sientes en este momento?",
    "checkInId": "xxx-xxx-xxx",
    "isNewUser": true,
    "isNewCheckIn": true
  }
}
```

---

### POST `/api/chat/reset`

Resetea la conversación de un usuario.

**Request:**
```json
{
  "phoneNumber": "+5491121913619"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Conversation reset successfully",
  "data": {
    "userId": "xxx-xxx-xxx",
    "checkInCompleted": true
  }
}
```

---

## 🧪 Casos de Uso para Testing

### 1. Probar Mensaje de Bienvenida

1. Usa un número de teléfono nuevo (ej: `+5491199999999`)
2. Envía cualquier mensaje
3. Deberías recibir el mensaje de bienvenida

### 2. Probar Detección de Intelectualización

Envía mensajes con "porque", "creo que", "pienso que":

```
👤 "Me siento mal porque mi jefe es difícil"
🤖 El bot debería redirigir al cuerpo
```

### 3. Probar Zona Interna (Soma)

Envía mensajes con sensaciones corporales:

```
👤 "Siento presión en el pecho"
👤 "Tengo un nudo en el estómago"
👤 "Me duele la cabeza"
```

### 4. Probar Cierre de Sesión

Envía mensajes de despedida:

```
👤 "Gracias"
👤 "Listo"
👤 "Hasta luego"
```

El bot debería generar un insight y cerrar la sesión.

### 5. Probar Múltiples Usuarios

1. Abre múltiples pestañas del navegador
2. Usa diferentes números de teléfono en cada pestaña
3. Verifica que las conversaciones son independientes

---

## 🔐 Seguridad

- ✅ **Solo disponible en desarrollo** (`NODE_ENV !== 'production'`)
- ✅ **Los endpoints retornan 403 en producción**
- ✅ **No afecta el webhook de WhatsApp** (rutas separadas)

---

## 🐛 Troubleshooting

### Error: "This endpoint is only available in development"

**Causa:** Intentando usar en producción.

**Solución:** Esta UI solo funciona con `NODE_ENV=development`

---

### Error: "GEMINI_API_KEY no está configurada"

**Causa:** Falta la API key de Gemini.

**Solución:**
```env
GEMINI_API_KEY="tu-api-key-aqui"
```

---

### Error: "Invalid phone number"

**Causa:** Número de teléfono con formato incorrecto.

**Solución:** Usa formato internacional: `+[código país][número]`
Ejemplo: `+5491121913619`

---

### El bot no responde

**Posibles causas:**
1. Servidor no está corriendo → `npm run dev`
2. Error en Gemini API → Revisa logs en consola
3. Error de base de datos → Verifica `DATABASE_URL`

---

## 📝 Diferencias con WhatsApp

| Característica | UI de Testing | WhatsApp Real |
|----------------|---------------|---------------|
| **Endpoint** | `/api/chat/send` | `/api/whatsapp/webhook` |
| **Validación de firma** | ❌ No | ✅ Sí (opcional) |
| **Envío de respuesta** | ✅ Retorna en JSON | ✅ Envía por Ycloud |
| **Límite de mensajes** | ♾️ Ilimitado | ⚠️ Según plan de Ycloud |
| **Resetear conversación** | ✅ Botón en UI | ❌ Manual en BD |
| **Cambiar usuario** | ✅ Input en UI | ❌ Requiere otro número |

---

## 🎨 Personalización

### Cambiar número por defecto

Edita `src/app/chat/page.tsx`:

```tsx
const [phoneNumber, setPhoneNumber] = useState('+5491121913619') // Cambia aquí
```

### Agregar más funcionalidades

Puedes agregar:
- Ver historial de check-ins
- Exportar conversación
- Ver estadísticas del usuario
- Cambiar prompt del bot

---

## 📚 Recursos

- [Documentación del Bot](ARCHITECTURE.md)
- [Configuración de Ycloud](YCLOUD_SETUP.md)
- [Testing con Scripts](../scripts/README.md)

---

**¿Problemas?** Abre un issue o revisa los logs de desarrollo.
