# Scripts de Continuum AI

Este directorio contiene scripts de utilidad para desarrollo y testing.

## 🚀 Scripts de Desarrollo

### Ngrok - Exponer Webhook

Expone el webhook local con ngrok usando una URL fija.

```bash
npm run ngrok
```

**Prerequisitos:**
- ✅ Tener el servidor corriendo con `npm run dev` en otra terminal
- ✅ ngrok instalado globalmente
- ✅ Archivo `.env.local` configurado

**Qué hace:**
- Valida que ngrok esté instalado
- Expone el puerto 3000 con una URL fija de ngrok
- Muestra la URL del webhook para configurar en Ycloud

**Resultado esperado:**
```
✅ Webhook activo!

📍 Webhook público: https://monkey-valued-incredibly.ngrok-free.app/api/whatsapp/webhook
```

**Personalizar URL:**
Agrega `NGROK_URL` a tu `.env.local`:
```env
NGROK_URL="tu-dominio.ngrok-free.app"
```

---

## 🧪 Scripts de Testing

### 1. Test de Conexión a Base de Datos

Valida que la conexión a Neon esté funcionando correctamente.

```bash
npm run db:test
```

**Qué hace:**
- ✅ Verifica conexión a Neon
- ✅ Lista tablas existentes
- ✅ Cuenta registros en tablas principales
- ✅ Identifica problemas comunes de configuración

**Requisitos:**
- `DATABASE_URL` configurada en `.env`
- Conexión a Internet

---

### 2. Test de Repositorios

Prueba end-to-end de los repositorios de Prisma con la base de datos real.

```bash
npm run test:repos
```

**Qué hace:**
1. Crea un usuario de prueba
2. Busca el usuario por teléfono
3. Crea un check-in
4. Busca check-in activo
5. Actualiza el check-in
6. Obtiene estadísticas
7. Limpia datos de prueba

**Requisitos:**
- `DATABASE_URL` configurada en `.env`
- Migraciones aplicadas: `npm run db:migrate`
- Conexión a Internet

---

## 📋 Flujo Recomendado

### Primera Configuración

1. **Configurar Neon Database**
   ```bash
   # Ir a https://console.neon.tech
   # Crear proyecto
   # Copiar DATABASE_URL al archivo .env
   ```

2. **Validar Conexión**
   ```bash
   npm run db:test
   ```

   Deberías ver:
   ```
   🔍 Probando conexión a Neon Database...
   ✅ Conexión establecida
   ✅ Query ejecutada
   ⚠️  No se encontraron tablas. Ejecuta: npm run db:migrate
   ```

3. **Aplicar Migraciones**
   ```bash
   npm run db:migrate
   ```

   Esto creará todas las tablas en Neon.

4. **Validar de Nuevo**
   ```bash
   npm run db:test
   ```

   Ahora deberías ver las tablas:
   ```
   ✅ Tablas encontradas:
      - Account
      - BodySensation
      - CheckIn
      - Psychologist
      - User
      - VerificationToken
      - _prisma_migrations
   ```

5. **Probar Repositorios**
   ```bash
   npm run test:repos
   ```

   Deberías ver todos los tests pasar:
   ```
   1️⃣  Test: Crear usuario
   ✅ Usuario creado

   2️⃣  Test: Buscar usuario por teléfono
   ✅ Usuario encontrado

   ... (más tests)

   ✅ ¡Todos los tests de repositorios pasaron exitosamente!
   ```

6. **(Opcional) Cargar Datos de Ejemplo**
   ```bash
   npm run db:seed
   ```

---

## ❌ Troubleshooting

### Error: "Can't reach database server"

**Causa:** DATABASE_URL incorrecta o sin conexión a Internet.

**Solución:**
1. Verifica que `DATABASE_URL` en `.env` sea correcta
2. Verifica conexión a Internet
3. Verifica que el proyecto de Neon esté activo

---

### Error: "Table does not exist"

**Causa:** Migraciones no aplicadas.

**Solución:**
```bash
npm run db:migrate
```

---

### Error: "Invalid phone number"

**Causa:** Número de teléfono no cumple formato +[código][número].

**Solución:** Los números deben empezar con `+` y tener 10-15 dígitos.
Ejemplo correcto: `+5215512345678`

---

### Error: "Insufficient check-in data"

**Causa:** Intentando completar un check-in sin ninguna zona.

**Solución:** El check-in debe tener al menos una zona (externa, interna o fantasía) antes de completarse.

---

## 📝 Notas

- Los scripts de test crean y eliminan datos automáticamente
- Los tests de repositorios usan transacciones para garantizar limpieza
- Si algo falla, los datos de prueba se limpian automáticamente
- Puedes ejecutar los tests múltiples veces sin problemas

---

## 🔧 Desarrollo

### Agregar Nuevo Script

1. Crear archivo en `scripts/`
2. Agregar comando en `package.json`:
   ```json
   {
     "scripts": {
       "mi-script": "tsx scripts/mi-script.ts"
     }
   }
   ```
3. Documentar en este README

### Convenciones

- Usar `tsx` para ejecutar TypeScript
- Incluir logs claros con emojis
- Manejar errores gracefully
- Limpiar datos de prueba al final
- Documentar requisitos y comportamiento
