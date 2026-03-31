import fs from 'fs';
import path from 'path';

// Minimal JSON-based database to bypass Prisma engine limitation in offline environment
const DB_FILE = path.join(process.cwd(), '../../packages/db/prisma/dev.db.json');

function readDb() {
  if (!fs.existsSync(DB_FILE)) return { firms: [], clients: [], cases: [], messages: [] };
  const data = fs.readFileSync(DB_FILE, 'utf-8');
  return JSON.parse(data);
}

function writeDb(data) {
  const dir = path.dirname(DB_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

export const prisma: any = {
  firm: {
    findMany: async () => readDb().firms,
    findFirst: async ({ where }: any) => readDb().firms.find((f: any) => !where.id || f.id === where.id),
  },
  client: {
    findMany: async () => readDb().clients,
  },
  case: {
    findFirst: async ({ where, orderBy }: any) => {
      const db = readDb();
      let cases = [...db.cases];
      if (where.firmId) cases = cases.filter((c: any) => c.firmId === where.firmId);
      
      // Basic orderBy implementation
      if (orderBy?.updatedAt === 'desc') {
        cases.sort((a: any, b: any) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      }
      
      const c = cases[0];
      if (c) {
        c.messages = db.messages.filter((m: any) => m.caseId === c.id);
        c.client = db.clients.find((cl: any) => cl.id === c.clientId);
      }
      return c || null;
    }
  },
  message: {
    findMany: async ({ where, orderBy }: any) => {
      const db = readDb();
      let messages = db.messages.filter((m: any) => {
        if (where.firmId && m.firmId !== where.firmId) return false;
        if (where.OR) {
          return where.OR.some((cond: any) => {
            if (cond.metadataJson) {
              const path = cond.metadataJson.path;
              const expected = cond.metadataJson.equals;
              return m.metadataJson?.[path[0]]?.[path[1]] === expected;
            }
            if (cond.sentiment && m.sentiment === cond.sentiment) return true;
            return false;
          });
        }
        return true;
      });

      if (orderBy?.createdAt === 'desc') {
        messages.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }
      return messages;
    },
    create: async ({ data }: any) => {
      const db = readDb();
      const newMessage = { ...data, id: `msg-${Date.now()}`, createdAt: new Date() };
      db.messages.push(newMessage);
      writeDb(db);
      return newMessage;
    }
  }
};

// Initial Sync / Seed
if (!fs.existsSync(DB_FILE)) {
  writeDb({
    firms: [{ id: 'demo-firm', name: 'Archi-Legal Global' }],
    clients: [
      { id: 'demo-client-1', whatsappNumber: '+5215587654321', firmId: 'demo-firm' },
      { id: 'demo-client-2', whatsappNumber: '+34600112233', firmId: 'demo-firm' }
    ],
    cases: [
      { id: 'demo-case-1', firmId: 'demo-firm', clientId: 'demo-client-1', updatedAt: new Date() },
      { id: 'demo-case-2', firmId: 'demo-firm', clientId: 'demo-client-2', updatedAt: new Date() }
    ],
    messages: [
      {
        id: 'm1',
        body: 'El cliente Morrison expresó insatisfacción con los tiempos de entrega del análisis contractual.',
        direction: 'INBOUND',
        author: 'CLIENT',
        sentiment: 'NEGATIVE',
        firmId: 'demo-firm',
        caseId: 'demo-case-1',
        metadataJson: { aiTriage: { actionRequired: true } },
        createdAt: new Date(Date.now() - 1000 * 60 * 15)
      },
      {
        id: 'm2',
        body: 'Documentación de Apex Architecture requiere firma antes del viernes.',
        direction: 'OUTBOUND',
        author: 'AI',
        sentiment: 'NEUTRAL',
        firmId: 'demo-firm',
        caseId: 'demo-case-2',
        metadataJson: { aiTriage: { actionRequired: true } },
        createdAt: new Date(Date.now() - 1000 * 60 * 45)
      }
    ]
  });
}
