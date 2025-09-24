// Config para desenvolvimento local (chaves removidas por segurança)
// ✅ PRODUÇÃO: Usa funções serverless - sem exposição de chaves
// ⚠️ DESENVOLVIMENTO: Configure suas chaves localmente se necessário
window.SOP_CONFIG = {
  textUrl: "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=YOUR_DEV_API_KEY_HERE",
  imageUrl: "https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=YOUR_DEV_API_KEY_HERE",
  apiKey: "YOUR_DEV_API_KEY_HERE",
  version: "1.5.0",
  environment: "production"
};