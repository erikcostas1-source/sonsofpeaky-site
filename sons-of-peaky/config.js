// 🏍️ Sons of Peaky - Configuração do Site do Clube
// Config focado nas funcionalidades do clube de motos

window.SOP_CONFIG = {
  // API Google Gemini para IA Assistant
  // 🔒 SEGURANÇA: API Key agora carregada de forma segura
  // Usar variáveis de ambiente ou configuração externa
  textUrl: "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent",
  apiKey: null, // Será carregada dinamicamente de fonte segura
  
  // Método para configurar API key de forma segura
  setApiKey: function(key) {
    this.apiKey = key;
    this.textUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`;
  },
  
  // Método para verificar se API key está configurada
  isApiKeyConfigured: function() {
    return this.apiKey !== null && this.apiKey !== undefined && this.apiKey.trim() !== '';
  },
  
  // Configurações do Clube
  club: {
    name: "Sons of Peaky",
    motto: "Unidos pela estrada, fortalecidos pela irmandade",
    founded: "2019",
    location: "Brasil",
    website: "https://sonsofpeaky.com.br"
  },
  
  // IA Assistant personalizada para o clube
  aiAssistant: {
    name: "SOP Assistant",
    context: "Você é o assistente oficial do clube Sons of Peaky. Ajude membros com informações sobre eventos, estatutos, história do clube e questões relacionadas ao motociclismo.",
    personality: "amigável, respeitoso, conhecedor de motos e cultura do clube",
    language: "pt-BR"
  },
  
  // Configurações de tema
  theme: {
    primary: "#c9a14a",      // Dourado
    secondary: "#fb923c",    // Laranja
    background: "#0d0d0d",   // Preto
    card: "#1a1a1a",        // Cinza escuro
    text: "#ffffff"          // Branco
  },
  
  // PWA Configuration
  pwa: {
    name: "Sons of Peaky",
    shortName: "SOP",
    description: "Site oficial do clube Sons of Peaky",
    themeColor: "#c9a14a",
    backgroundColor: "#0d0d0d"
  },
  
  // Versão e ambiente
  version: "2.0.0",
  environment: "production",
  project: "sons-of-peaky"
};
