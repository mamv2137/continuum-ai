import { PrismaClient } from '../src/generated/client.js'

const prisma = new PrismaClient()

async function checkUser() {
  const user = await prisma.user.findUnique({
    where: { phoneNumber: '+5491121913619' },
  })

  console.log(JSON.stringify(user, null, 2))
  await prisma.$disconnect()
}

checkUser()
