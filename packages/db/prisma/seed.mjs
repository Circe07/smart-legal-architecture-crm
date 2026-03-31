import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // 1. Create Firm
  const firm = await prisma.firm.upsert({
    where: { id: 'demo-firm' },
    update: {},
    create: {
      id: 'demo-firm',
      name: 'Archi-Legal Global',
    },
  })

  // 2. Create Clients
  const client1 = await prisma.client.create({
    data: {
      id: 'demo-client-1',
      whatsappNumber: '+5215587654321',
      firmId: firm.id,
    },
  })

  const client2 = await prisma.client.create({
    data: {
      id: 'demo-client-2',
      whatsappNumber: '+34600112233',
      firmId: firm.id,
    },
  })

  // 3. Create Cases
  const case1 = await prisma.case.create({
    data: {
      id: 'demo-case-1',
      firmId: firm.id,
      clientId: client1.id,
    },
  })

  const case2 = await prisma.case.create({
    data: {
      id: 'demo-case-2',
      firmId: firm.id,
      clientId: client2.id,
    },
  })

  // 4. Create Messages (Alerts for the Dashboard)
  await prisma.message.createMany({
    data: [
      {
        body: 'El cliente Morrison expresó insatisfacción con los tiempos de entrega del análisis contractual.',
        direction: 'INBOUND',
        author: 'CLIENT',
        sentiment: 'NEGATIVE',
        firmId: firm.id,
        clientId: client1.id,
        caseId: case1.id,
        metadataJson: { aiTriage: { actionRequired: true } },
      },
      {
        body: 'Documentación de Apex Architecture requiere firma antes del viernes.',
        direction: 'OUTBOUND',
        author: 'AI',
        sentiment: 'NEUTRAL',
        firmId: firm.id,
        clientId: client2.id,
        caseId: case2.id,
        metadataJson: { aiTriage: { actionRequired: true } },
      },
      {
        body: 'WhatsApp: Nuevo mensaje de García & Partners sobre caso de permisos.',
        direction: 'INBOUND',
        author: 'CLIENT',
        sentiment: 'POSITIVE',
        firmId: firm.id,
        clientId: client1.id,
        caseId: case1.id,
        metadataJson: { aiTriage: { actionRequired: false } },
      },
    ],
  })

  console.log('✅ Seeding completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
