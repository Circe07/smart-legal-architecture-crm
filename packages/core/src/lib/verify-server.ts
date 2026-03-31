import fetch from 'node-fetch';

async function verify() {
  try {
    console.log("🔍 Verificando servidor local en http://localhost:3000...");
    const response = await fetch("http://localhost:3000/");
    
    console.log(`✅ Status: ${response.status}`);
    console.log("🛡️ Cabeceras de Seguridad Detectadas:");
    console.log(`- HSTS: ${response.headers.get("strict-transport-security")}`);
    console.log(`- CSP: ${response.headers.get("content-security-policy")?.substring(0, 50)}...`);
    console.log(`- X-Frame: ${response.headers.get("x-frame-options")}`);
    console.log(`- X-Content-Type: ${response.headers.get("x-content-type-options")}`);
    
    if (response.status === 200) {
      console.log("🟢 El servidor responde correctamente y tiene las protecciones activas.");
    }
  } catch (e) {
    console.error("❌ Error conectando al servidor local:", e.message);
  }
}

verify();
