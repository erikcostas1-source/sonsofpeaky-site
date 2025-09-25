// 💼 Gerador de Rolês - Configuração da Plataforma Comercial
// Config completo para sistema de negócios com IA

window.GERADOR_CONFIG = {
    // API Google Gemini (usando chave funcional)
    textUrl: "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyCiHRVozYYmHB-5W64QdJzn9dQYAyRl9Tk",
    apiKey: "AIzaSyCiHRVozYYmHB-5W64QdJzn9dQYAyRl9Tk",
    
    // Informações da plataforma
    app: {
        name: "Gerador de Rolês",
        tagline: "Transformando aventuras em negócios",
        version: "2.0.0",
        description: "Plataforma IA para geração de roteiros motociclísticos comerciais",
        author: "Gerador de Rolês Team",
        contact: "contato@gerador-roles.com",
        website: "https://gerador-roles.com",
        support: "suporte@gerador-roles.com"
    },
    
    // Configurações da IA comercial
    ai: {
        temperature: 0.8,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
        cacheTimeout: 30 * 60 * 1000 // 30 minutos
    },
    
    // Configurações de custos (valores médios brasileiros)
    costs: {
        gasolina: 5.50, // R$ por litro
        alimentacao: {
            cafe: 15,
            almoco: 35,
            jantar: 40,
            lanche: 12
        },
        estacionamento: 5,
        pedagio: 8.50
    },
    
    // Configurações de motos
    motos: {
        '125cc': { consumo: 35, velocidade_media: 55 },
        '250cc': { consumo: 25, velocidade_media: 70 },
        '600cc': { consumo: 18, velocidade_media: 85 },
        '1000cc': { consumo: 15, velocidade_media: 90 }
    },
    
    // Perfis de pilotagem
    perfis: {
        'conservador': { velocidade: 55, multiplicador_consumo: 1.0 },
        'moderado': { velocidade: 70, multiplicador_consumo: 1.1 },
        'esportivo': { velocidade: 90, multiplicador_consumo: 1.3 }
    },
    
    // Configurações PWA
    pwa: {
        theme_color: "#ffd700",
        background_color: "#000000",
        display: "standalone"
    }
};

console.log('✅ Configuração do Gerador carregada');