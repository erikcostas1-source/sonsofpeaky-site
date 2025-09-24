// Base de Destinos para Motociclistas - Brasil
const destinos = [
    // São Paulo
    {
        id: 1,
        nome: "Estrada de Campos do Jordão",
        cidade: "Campos do Jordão",
        estado: "SP",
        regiao: "Sudeste",
        endereco: "SP-123, Campos do Jordão - SP",
        distancia: 180,
        duracao: "3-4 horas",
        dificuldade: "Moderada",
        custoMedio: 250,
        descricao: "Estrada serrana com curvas desafiadoras e paisagens deslumbrantes",
        tipo: ["natureza", "aventura", "gastronomia"],
        melhor_epoca: ["maio", "junho", "julho", "agosto"],
        dicas: [
            "Estrada com muitas curvas, pilote com cuidado",
            "Leve roupas quentes, temperatura baixa na serra",
            "Vários pontos para parar e apreciar a vista"
        ],
        pontos_interesse: [
            "Portal de Campos do Jordão",
            "Horto Florestal",
            "Cervejaria Baden Baden",
            "Teleférico"
        ]
    },
    {
        id: 2,
        nome: "Rota dos Vinhos - Serra Gaúcha",
        cidade: "Bento Gonçalves",
        estado: "RS",
        regiao: "Sul",
        endereco: "RS-444, Bento Gonçalves - RS",
        distancia: 120,
        duracao: "2-3 horas",
        dificuldade: "Fácil",
        custoMedio: 300,
        descricao: "Rota pelas vinícolas da Serra Gaúcha com degustações",
        tipo: ["gastronomia", "cultura", "natureza"],
        melhor_epoca: ["fevereiro", "março", "abril", "outubro", "novembro"],
        dicas: [
            "Agende degustações com antecedência",
            "Defina um condutor designado",
            "Estradas bem sinalizadas e pavimentadas"
        ],
        pontos_interesse: [
            "Vinícola Miolo",
            "Casa Valduga",
            "Vinícola Salton",
            "Vale dos Vinhedos"
        ]
    },
    {
        id: 3,
        nome: "Chapada Diamantina",
        cidade: "Lençóis",
        estado: "BA",
        regiao: "Nordeste",
        endereco: "BA-142, Lençóis - BA",
        distancia: 400,
        duracao: "6-8 horas",
        dificuldade: "Difícil",
        custoMedio: 500,
        descricao: "Aventura pela Chapada com cachoeiras e trilhas incríveis",
        tipo: ["natureza", "aventura"],
        melhor_epoca: ["maio", "junho", "julho", "agosto", "setembro"],
        dicas: [
            "Leve equipamentos de camping",
            "Algumas trilhas exigem guia",
            "Abastecimento limitado, planeje paradas"
        ],
        pontos_interesse: [
            "Cachoeira da Fumaça",
            "Gruta Azul",
            "Morro do Pai Inácio",
            "Poço Encantado"
        ]
    },
    {
        id: 4,
        nome: "Estrada Real - Ouro Preto",
        cidade: "Ouro Preto",
        estado: "MG",
        regiao: "Sudeste",
        endereco: "BR-356, Ouro Preto - MG",
        distancia: 300,
        duracao: "4-5 horas",
        dificuldade: "Moderada",
        custoMedio: 280,
        descricao: "Rota histórica pelas cidades coloniais mineiras",
        tipo: ["historia", "cultura", "gastronomia"],
        melhor_epoca: ["abril", "maio", "junho", "julho", "agosto"],
        dicas: [
            "Centro histórico com ruas de pedra",
            "Estacionamento pode ser desafiador",
            "Rica gastronomia mineira"
        ],
        pontos_interesse: [
            "Igreja São Francisco de Assis",
            "Museu da Inconfidência",
            "Mina du Veloso",
            "Casa dos Contos"
        ]
    },
    {
        id: 5,
        nome: "Costa Verde - Rio x Santos",
        cidade: "Angra dos Reis",
        estado: "RJ",
        regiao: "Sudeste",
        endereco: "BR-101, Angra dos Reis - RJ",
        distancia: 250,
        duracao: "4-5 horas",
        dificuldade: "Fácil",
        custoMedio: 350,
        descricao: "Estrada litorânea com praias paradisíacas",
        tipo: ["praia", "natureza", "gastronomia"],
        melhor_epoca: ["março", "abril", "maio", "setembro", "outubro"],
        dicas: [
            "Estrada com tráfego intenso nos finais de semana",
            "Muitas opções de praias para parar",
            "Pedágios no trajeto"
        ],
        pontos_interesse: [
            "Praia Grande",
            "Vila do Abraão (Ilha Grande)",
            "Praia de Lopes Mendes",
            "Paraty Centro Histórico"
        ]
    },
    {
        id: 6,
        nome: "Pantanal - Estrada Parque",
        cidade: "Bonito",
        estado: "MS",
        regiao: "Centro-Oeste",
        endereco: "MS-382, Bonito - MS",
        distancia: 500,
        duracao: "7-8 horas",
        dificuldade: "Moderada",
        custoMedio: 600,
        descricao: "Fauna selvagem e rios cristalinos do Pantanal",
        tipo: ["natureza", "aventura", "ecoturismo"],
        melhor_epoca: ["maio", "junho", "julho", "agosto", "setembro"],
        dicas: [
            "Temporada seca ideal para motocicletas",
            "Reserve passeios com antecedência",
            "Leve repelente e protetor solar"
        ],
        pontos_interesse: [
            "Rio da Prata",
            "Gruta do Lago Azul",
            "Aquário Natural",
            "Cachoeira Boca da Onça"
        ]
    },
    {
        id: 7,
        nome: "Vale do Capão - Chapada Diamantina",
        cidade: "Palmeiras",
        estado: "BA",
        regiao: "Nordeste",
        endereco: "BA-142, Palmeiras - BA",
        distancia: 450,
        duracao: "6-7 horas",
        dificuldade: "Difícil",
        custoMedio: 400,
        descricao: "Destino místico com cachoeiras e comunidade alternativa",
        tipo: ["natureza", "aventura", "espiritualidade"],
        melhor_epoca: ["junho", "julho", "agosto", "setembro"],
        dicas: [
            "Estrada de terra nos últimos quilômetros",
            "Comunidade com vibe hippie",
            "Cachoeiras de águas cristalinas"
        ],
        pontos_interesse: [
            "Cachoeira da Purificação",
            "Morro Branco",
            "Vale do Pati",
            "Cachoeira do Mixila"
        ]
    },
    {
        id: 8,
        nome: "Serra da Mantiqueira",
        cidade: "Monte Verde",
        estado: "MG",
        regiao: "Sudeste",
        endereco: "MG-295, Monte Verde - MG",
        distancia: 200,
        duracao: "3-4 horas",
        dificuldade: "Moderada",
        custoMedio: 220,
        descricao: "Clima de montanha com arquitetura europeia",
        tipo: ["natureza", "gastronomia", "romance"],
        melhor_epoca: ["junho", "julho", "agosto"],
        dicas: [
            "Temperatura baixa, leve roupas quentes",
            "Fondue e culinária de montanha",
            "Estrada sinuosa com belas paisagens"
        ],
        pontos_interesse: [
            "Teleférico de Monte Verde",
            "Aventureiro Parque",
            "Centro da cidade",
            "Pico Selado"
        ]
    },
    {
        id: 9,
        nome: "Litoral Norte - SP",
        cidade: "Ubatuba",
        estado: "SP",
        regiao: "Sudeste",
        endereco: "BR-101, Ubatuba - SP",
        distancia: 230,
        duracao: "3-4 horas",
        dificuldade: "Fácil",
        custoMedio: 280,
        descricao: "Praias selvagens e mata atlântica preservada",
        tipo: ["praia", "natureza", "surf"],
        melhor_epoca: ["março", "abril", "maio", "setembro", "outubro"],
        dicas: [
            "Mais de 100 praias para escolher",
            "Trilhas na mata atlântica",
            "Ideal para surf e esportes aquáticos"
        ],
        pontos_interesse: [
            "Praia do Felix",
            "Ilha Anchieta",
            "Trilha das 7 Praias",
            "Centro Histórico"
        ]
    },
    {
        id: 10,
        nome: "Canion Fortaleza",
        cidade: "Cambará do Sul",
        estado: "RS",
        regiao: "Sul",
        endereco: "RS-427, Cambará do Sul - RS",
        distancia: 180,
        duracao: "3-4 horas",
        dificuldade: "Moderada",
        custoMedio: 200,
        descricao: "Cânions impressionantes com vistas espetaculares",
        tipo: ["natureza", "aventura", "fotografia"],
        melhor_epoca: ["outubro", "novembro", "dezembro", "janeiro"],
        dicas: [
            "Ventos fortes nos cânions",
            "Trilhas bem demarcadas",
            "Nascer do sol imperdível"
        ],
        pontos_interesse: [
            "Fortaleza Canyon",
            "Itaimbezinho Canyon",
            "Cascata do Tigre Preto",
            "Trilha do Rio do Boi"
        ]
    },
    {
        id: 11,
        nome: "Rota das Cachoeiras - Goiás",
        cidade: "Pirenópolis",
        estado: "GO",
        regiao: "Centro-Oeste",
        endereco: "GO-338, Pirenópolis - GO",
        distancia: 150,
        duracao: "2-3 horas",
        dificuldade: "Fácil",
        custoMedio: 180,
        descricao: "Centro histórico preservado e cachoeiras cristalinas",
        tipo: ["historia", "natureza", "cultura"],
        melhor_epoca: ["maio", "junho", "julho", "agosto"],
        dicas: [
            "Centro histórico tombado",
            "Várias cachoeiras próximas",
            "Festival de inverno famoso"
        ],
        pontos_interesse: [
            "Cachoeira do Rosário",
            "Igreja do Rosário",
            "Cachoeira dos Dragões",
            "Santuário de Vida Selvagem"
        ]
    },
    {
        id: 12,
        nome: "Praia do Rosa",
        cidade: "Imbituba",
        estado: "SC",
        regiao: "Sul",
        endereco: "SC-434, Imbituba - SC",
        distancia: 120,
        duracao: "2 horas",
        dificuldade: "Fácil",
        custoMedio: 250,
        descricao: "Praia em formato de rosa, point do surf e baleias",
        tipo: ["praia", "surf", "natureza"],
        melhor_epoca: ["julho", "agosto", "setembro", "outubro"],
        dicas: [
            "Temporada de baleias francas",
            "Praia ideal para surf",
            "Vila charmosa com pousadas"
        ],
        pontos_interesse: [
            "Mirante da Praia do Rosa",
            "Lagoa Ibiraquera",
            "Centro de Imbituba",
            "Praia da Vila"
        ]
    }
];

// Utilitários para filtrar destinos
const utils = {
    filtrarPorRegiao: (regiao) => destinos.filter(d => d.regiao === regiao),
    filtrarPorTipo: (tipo) => destinos.filter(d => d.tipo.includes(tipo)),
    filtrarPorOrcamento: (max) => destinos.filter(d => d.custoMedio <= max),
    filtrarPorDificuldade: (dificuldade) => destinos.filter(d => d.dificuldade === dificuldade),
    obterAleatorio: (quantidade = 1) => {
        const shuffled = [...destinos].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, quantidade);
    }
};

console.log(`📍 ${destinos.length} destinos carregados para o Gerador de Rolês`);