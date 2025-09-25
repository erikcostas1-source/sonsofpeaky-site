// 🏍️ Sons of Peaky - Configuração do Site do Clube
// Config focado nas funcionalidades do clube de motos

window.SOP_CONFIG = {
  // API Google Gemini para IA Assistant
  textUrl: "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyCiHRVozYYmHB-5W64QdJzn9dQYAyRl9Tk",
  apiKey: "AIzaSyCiHRVozYYmHB-5W64QdJzn9dQYAyRl9Tk",
  
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