import "dotenv/config";
import { vectorStore } from "../lib/vector-db";
import { generateEmbedding } from "../lib/rag-logic";

const FAQS = [
  {
    id: "faq-1",
    content: "Nuestra firma, Archi-Legal, se especializa en derecho arquitectónico y urbanismo. Ayudamos a arquitectos y constructoras con licencias de obra, contratos de construcción y litigios catastrales."
  },
  {
    id: "faq-2",
    content: "Los requisitos para una licencia de obra mayor incluyen: Plano de situación, Proyecto básico visado por el colegio de arquitectos, Justificante de pago de tasas de ICIO y Memoria descriptiva."
  },
  {
    id: "faq-3",
    content: "Estamos ubicados en Calle Falsa 123, Madrid. Nuestro horario de atención es de Lunes a Viernes de 9:00 a 18:00."
  },
  {
    id: "faq-4",
    content: "Si falta documentación en un expediente, el Ayuntamiento suele dar un plazo de 10 días hábiles para subsanar los errores. Archi-Legal puede gestionar esta subsanación por ti."
  },
  {
    id: "faq-5",
    content: "Nuestros honorarios por consulta inicial son de 150€. Si decides contratar el servicio completo de gestión de licencias, este monto se descuenta del total."
  }
];

async function seed() {
  console.log("🌱 Seeding Knowledge Base...");
  
  for (const faq of FAQS) {
    try {
      console.log(`- Generating embedding for: ${faq.id}`);
      const vector = await generateEmbedding(faq.content);
      await vectorStore.add(faq.id, faq.content, vector, { source: "manual-seed" });
    } catch (error) {
      console.error(`❌ Failed to seed FAQ ${faq.id}:`, error);
    }
  }
  
  console.log("✅ Knowledge Base seeded successfully!");
}

seed();
