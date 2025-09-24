// Configuração do Gerador de Rolês
window.GERADOR_CONFIG = {
    // API do Google Gemini
    textUrl: "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=AIzaSyB6MdY8jd1pxAw-K0LN3F3xF8Z5q5dFmJE",
    
    // Configurações gerais
    app: {
        name: "Gerador de Rolês de Moto",
        version: "1.0.0",
        description: "IA que cria roteiros personalizados para motociclistas",
        author: "Gerador de Rolês Team",
        contact: "contato@gerador-roles.com",
        website: "https://gerador-roles.com"
    },
    
    // Configurações da IA
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