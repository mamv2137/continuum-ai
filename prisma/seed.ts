/**
 * Seed script para Continuum AI
 *
 * Uso:
 * npx prisma db seed
 *
 * Este script crea datos de ejemplo para desarrollo.
 * NO ejecutar en producción.
 */

import { PrismaClient, UserRole, SessionStatus } from '../src/generated/client.js'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed de base de datos...\n')

  // 1. Crear psicólogo de ejemplo con código (ahora es un User con rol PSYCHOLOGIST)
  console.log('👨‍⚕️ Creando psicólogo...')
  const psychologist = await prisma.user.upsert({
    where: { phoneNumber: '+5215500000001' },
    update: {},
    create: {
      phoneNumber: '+5215500000001',
      email: 'psicologo@example.com',
      name: 'Dr. Juan Pérez',
      role: UserRole.PSYCHOLOGIST,
      licenseNumber: 'PSI-12345',
      psychologistCode: 'DRJUANPEREZ_2025', // Código para vincular pacientes
      onboardingDone: true,
      termsAccepted: true,
      termsAcceptedAt: new Date(),
    },
  })
  console.log(`   ✓ Psicólogo creado: ${psychologist.name}`)
  console.log(`   📌 Código: ${psychologist.psychologistCode}\n`)

  // 2. Crear usuario individual (B2C)
  console.log('👤 Creando usuario individual...')
  const individualUser = await prisma.user.upsert({
    where: { phoneNumber: '+5215512345678' },
    update: {},
    create: {
      phoneNumber: '+5215512345678',
      name: 'María García',
      role: UserRole.INDIVIDUAL,
      onboardingDone: true,
      termsAccepted: true,
      termsAcceptedAt: new Date(),
    },
  })
  console.log(`   ✓ Usuario creado: ${individualUser.name}\n`)

  // 3. Crear usuario paciente (B2B2C)
  console.log('👥 Creando paciente vinculado a psicólogo...')
  const patientUser = await prisma.user.upsert({
    where: { phoneNumber: '+5215587654321' },
    update: {},
    create: {
      phoneNumber: '+5215587654321',
      name: 'Carlos Rodríguez',
      role: UserRole.PATIENT,
      onboardingDone: true,
      termsAccepted: true,
      termsAcceptedAt: new Date(),
      psychologistId: psychologist.id,
    },
  })
  console.log(`   ✓ Paciente creado: ${patientUser.name}\n`)

  // 4. Crear check-in de ejemplo completado
  console.log('📝 Creando check-in de ejemplo...')
  const checkIn = await prisma.checkIn.create({
    data: {
      userId: individualUser.id,
      status: SessionStatus.COMPLETED,
      externalZone: 'Escucho el sonido de la lluvia afuera. Veo las luces de la ciudad a través de la ventana.',
      fantasyZone: 'Estoy pensando en la reunión de mañana. Me preocupa no estar preparado.',
      aiInsight: 'El usuario muestra signos de ansiedad anticipatoria relacionada con eventos futuros. La conexión con el presente a través de los sentidos parece ayudar.',
      emotionalTone: 'Ansiedad',
      duration: 420, // 7 minutos
      messageCount: 12,
      completionRate: 100,
      rawChatLog: [
        { role: 'model', content: '¡Hola! ¿Cómo te sientes en este momento?', timestamp: new Date().toISOString() },
        { role: 'user', content: 'Un poco ansioso', timestamp: new Date().toISOString() },
        { role: 'model', content: '¿Qué estás notando en tu cuerpo ahora mismo?', timestamp: new Date().toISOString() },
      ],
      completedAt: new Date(),
      bodySensations: {
        create: [
          {
            bodyPart: 'Pecho',
            sensationType: 'Presión',
            intensity: 7,
            description: 'Siento como un peso en el pecho',
          },
          {
            bodyPart: 'Hombros',
            sensationType: 'Tensión',
            intensity: 8,
            description: 'Mis hombros están muy tensos',
          },
          {
            bodyPart: 'Estómago',
            sensationType: 'Nudo',
            intensity: 6,
            description: 'Tengo un nudo en el estómago',
          },
        ],
      },
    },
  })
  console.log(`   ✓ Check-in creado con ${checkIn.messageCount} mensajes\n`)

  // 5. Crear check-in en progreso
  console.log('⏳ Creando check-in en progreso...')
  const inProgressCheckIn = await prisma.checkIn.create({
    data: {
      userId: patientUser.id,
      status: SessionStatus.IN_PROGRESS,
      messageCount: 3,
      rawChatLog: [
        { role: 'model', content: '¡Hola Carlos! ¿Cómo estás?', timestamp: new Date().toISOString() },
        { role: 'user', content: 'Bien, gracias', timestamp: new Date().toISOString() },
      ],
    },
  })
  console.log(`   ✓ Check-in en progreso creado\n`)

  // 6. Actualizar contador de check-ins
  await prisma.user.update({
    where: { id: individualUser.id },
    data: {
      totalCheckIns: 1,
      lastCheckInAt: new Date(),
    },
  })

  await prisma.user.update({
    where: { id: patientUser.id },
    data: {
      totalCheckIns: 1,
      lastCheckInAt: new Date(),
    },
  })

  console.log('✅ Seed completado exitosamente!\n')
  console.log('📊 Resumen:')
  console.log(`   - 1 Psicólogo: ${psychologist.email}`)
  console.log(`   - 2 Usuarios: ${individualUser.phoneNumber}, ${patientUser.phoneNumber}`)
  console.log(`   - 2 Check-ins (1 completado, 1 en progreso)`)
  console.log(`   - 3 Sensaciones corporales\n`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Error durante el seed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
