import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import path from "path";

// 1. Setup Gemini Native
if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
  console.error("❌ Mising GOOGLE_GENERATIVE_AI_API_KEY");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY);
const model = genAI.getGenerativeModel({ model: "embedding-001" });

async function generateEmbedding(text: string): Promise<number[]> {
  const result = await model.embedContent(text);
  return Array.from(result.embedding.values);
}

// 2. VectorStore Logic (Self-contained)
class InlineVectorStore {
  public data: any[] = [];
  public dbPath: string;

  constructor(dbPath: string) {
    this.dbPath = dbPath;
  }

  async add(id: string, content: string, vector: number[], metadata: any = {}) {
    this.data.push({ id, content, vector, metadata });
    console.log(`✅ Guardado: ${id} (Vectores: ${vector.length})`);
  }
}

// 3. Data & Execution
const LABOR_FAQS = [
  {
    id: "labor-dismissal-unfair",
    question: "¿Cuál es la indemnización por despido improcedente en 2026?",
    answer: "Para contratos firmados después de febrero de 2012, la indemnización por despido improcedente es de 33 días por año trabajado, con un tope de 24 mensualidades. Si el contrato es anterior, se calculan 45 días por año para el tramo previo a dicha fecha."
  },
  {
    id: "labor-settlement-vs-indemnity",
    question: "¿Qué diferencia hay entre el finiquito y la indemnización?",
    answer: "El finiquito (liquidación) es obligatorio tras cualquier cese e incluye salarios devengados, vacaciones no disfrutadas y parte proporcional de pagas extra. La indemnización es una compensación económica adicional que solo se paga en ciertos tipos de despido (objetivo o improcedente)."
  },
  {
    id: "labor-vacation-rights",
    question: "¿Cuántos días de vacaciones me corresponden legalmente?",
    answer: "Según el Estatuto de los Trabajadores, tienes derecho a un mínimo de 30 días naturales por año trabajado (o 22 laborales). Si el contrato termina antes de disfrutarlas, la empresa debe abonarlas obligatoriamente en el finiquito."
  },
  {
    id: "labor-sick-leave-dismissal",
    question: "¿Me pueden despedir estando de baja médica (IT)?",
    answer: "Estar de baja no impide legalmente un despido objetivo o disciplinario si existe una causa real ajena a la enfermedad. Sin embargo, si el despido se debe exclusivamente a la situación de salud, puede ser declarado nulo por discriminación bajo la Ley 15/2022."
  },
  {
    id: "labor-conciliation-adaptation",
    question: "¿Tengo derecho a adaptar mi jornada sin reducir el sueldo?",
    answer: "Sí, bajo el Artículo 34.8 del Estatuto de los Trabajadores (la 'jornada a la carta'), puedes solicitar adaptaciones de duración y distribución de la jornada para conciliar vida familiar sin necesidad de reducir jornada ni salario, siempre que sea razonable y proporcionado."
  },
  {
    id: "labor-dismissal-objective",
    question: "¿Qué indemnización corresponde por un despido objetivo?",
    answer: "El despido por causas económicas, técnicas, organizativas o de producción (objetivo) conlleva una indemnización de 20 días por año trabajado con un máximo de 12 mensualidades, además de un preaviso obligatorio de 15 días."
  },
  {
    id: "labor-plazo-impugnacion",
    question: "¿Cuánto tiempo tengo para reclamar contra un despido?",
    answer: "El plazo es de 20 días hábiles (excluyendo sábados, domingos y festivos) desde la fecha de efectos del despido. Este plazo es de caducidad e improrrogable."
  },
  {
    id: "labor-modification-conditions",
    question: "¿Qué pasa si la empresa cambia mi horario o salario?",
    answer: "Si la modificación es sustancial (Art. 41 ET), la empresa debe preavisar con 15 días. Si te perjudica, puedes rescindir el contrato con derecho a una indemnización de 20 días por año trabajado (máximo 9 meses) y acceso a prestación por desempleo."
  },
  {
    id: "labor-mobbing-action",
    question: "¿Qué debo hacer ante una situación de acoso laboral (mobbing)?",
    answer: "Debes comunicar la situación por escrito a la empresa activando el protocolo de acoso. Si no se resuelve, puedes solicitar judicialmente la extinción del contrato con la misma indemnización que un despido improcedente, además de posibles daños y perjuicios."
  },
  {
    id: "labor-maternity-2026",
    question: "¿Cuál es la duración del permiso por nacimiento en 2026?",
    answer: "En España, en 2026, el permiso por nacimiento y cuidado del menor para ambos progenitores se ha consolidado en 19 semanas (ampliado respecto a las 16 anteriores), siendo las 6 primeras obligatorias y a jornada completa inmediatamente después del parto o resolución judicial."
  }
];

async function populate() {
  console.log("🚀 Población Directa (v2)...");
  const store = new InlineVectorStore("");

  for (const faq of LABOR_FAQS) {
    try {
      console.log(`➡️ Procesando: ${faq.question}`);
      const vector = await generateEmbedding(faq.question);
      await store.add(faq.id, `${faq.question}\n\n${faq.answer}`, vector, { 
        category: "Derecho Laboral",
        updatedAt: new Date().toISOString()
      });
    } catch (e) {
      console.error(`❌ Error en ${faq.id}:`, e.message);
    }
  }
  
  console.log(`\n📦 BBDD Total: ${store.data.length} ítems.`);
  if (store.data.length > 0) {
    process.stdout.write("JSON_DUMP_START" + JSON.stringify(store.data) + "JSON_DUMP_END\n");
  }
}

populate();
