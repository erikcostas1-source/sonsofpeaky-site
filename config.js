// Config para desenvolvimento local 
// ✅ PRODUÇÃO: Usa funções serverless - sem exposição de chaves
// ⚠️ DESENVOLVIMENTO: Chave temporária para testes locais
window.SOP_CONFIG = {
  textUrl: "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyCiHRVozYYmHB-5W64QdJzn9dQYAyRl9Tk",
  imageUrl: "https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=AIzaSyCiHRVozYYmHB-5W64QdJzn9dQYAyRl9Tk",
  apiKey: "AIzaSyCiHRVozYYmHB-5W64QdJzn9dQYAyRl9Tk",
  version: "1.5.0",
  environment: "production"
};