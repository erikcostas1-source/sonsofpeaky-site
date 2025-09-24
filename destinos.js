// Base de Destinos para o Gerador de Rolê Sons of Peaky
// Destinos categorizados por tema, distância e características

const DESTINOS_DATABASE = {
    // Rolês Urbanos/Regionais (até 100km ida e volta)
    urbano: [
        {
            nome: "São Paulo - Centro Histórico",
            descricao: "Tour pelo coração da metrópole",
            distancia: 60,
            tempoEstimado: "3-4h",
            dificuldade: "fácil",
            tipo: "urbano",
            pontos: [
                "Edifício Copan",
                "Theatro Municipal", 
                "Mercado Municipal",
                "Pateo do Collegio"
            ],
            melhorHorario: "09:00",
            custos: { pedagio: 12, combustivel: 18, alimentacao: 35 },
            tags: ["histórico", "cultural", "urbano"]
        },
        {
            nome: "ABC Paulista - Rota Industrial",
            descricao: "História industrial da região",
            distancia: 80,
            tempoEstimado: "4-5h",
            dificuldade: "fácil",
            tipo: "urbano",
            pontos: [
                "Museu da Imigração", 
                "Sabará Shopping",
                "Parque Central"
            ],
            melhorHorario: "08:30",
            custos: { pedagio: 8, combustivel: 22, alimentacao: 30 },
            tags: ["industrial", "histórico", "urbano"]
        },
        {
            nome: "Osasco - Rota dos Shoppings",
            descricao: "Tour gastronômico e comercial",
            distancia: 45,
            tempoEstimado: "2-3h",
            dificuldade: "fácil",
            tipo: "urbano",
            pontos: [
                "Shopping União",
                "West Plaza",
                "Centro de Osasco"
            ],
            melhorHorario: "14:00",
            custos: { pedagio: 6, combustivel: 15, alimentacao: 40 },
            tags: ["gastronômico", "comercial", "urbano"]
        }
    ],

    // Rolês de Serra/Montanha (100-300km)
    serra: [
        {
            nome: "Campos do Jordão",
            descricao: "A Suíça Brasileira nas montanhas paulistas",
            distancia: 280,
            tempoEstimado: "6-8h",
            dificuldade: "moderada",
            tipo: "turístico",
            pontos: [
                "Capivari",
                "Horto Florestal", 
                "Morro do Elefante",
                "Vila Britânia"
            ],
            melhorHorario: "06:00",
            custos: { pedagio: 45, combustivel: 75, alimentacao: 80 },
            tags: ["serra", "frio", "turístico", "romântico"],
            avisos: ["Leve casaco", "Estrada sinuosa"]
        },
        {
            nome: "Monte Verde - MG",
            descricao: "Charme europeu na Serra da Mantiqueira",
            distancia: 220,
            tempoEstimado: "5-6h",
            dificuldade: "moderada",
            tipo: "turístico",
            pontos: [
                "Centro de Monte Verde",
                "Pedra Redonda",
                "Teleférico",
                "Cervejaria Baden Baden"
            ],
            melhorHorario: "07:00",
            custos: { pedagio: 35, combustivel: 60, alimentacao: 70 },
            tags: ["serra", "cerveja", "natureza", "aventura"]
        },
        {
            nome: "Serra da Cantareira",
            descricao: "Pulmão verde de São Paulo",
            distancia: 120,
            tempoEstimado: "3-4h",
            dificuldade: "fácil",
            tipo: "natureza",
            pontos: [
                "Núcleo Pedra Grande",
                "Horto Florestal",
                "Mirante",
                "Trilha da Suçuarana"
            ],
            melhorHorario: "08:00",
            custos: { pedagio: 0, combustivel: 35, alimentacao: 25 },
            tags: ["natureza", "trilha", "mirante", "próximo"]
        }
    ],

    // Rolês de Praia/Litoral (150-400km)
    praia: [
        {
            nome: "Santos e São Vicente",
            descricao: "Clássico litoral paulista",
            distancia: 160,
            tempoEstimado: "4-5h",
            dificuldade: "fácil",
            tipo: "praia",
            pontos: [
                "Praia do Gonzaga",
                "Aquário de Santos",
                "Centro Histórico",
                "Monte Serrat"
            ],
            melhorHorario: "08:00",
            custos: { pedagio: 25, combustivel: 45, alimentacao: 50 },
            tags: ["praia", "histórico", "urbano", "familiar"]
        },
        {
            nome: "Ubatuba",
            descricao: "Capital do surf no Litoral Norte",
            distancia: 320,
            tempoEstimado: "7-8h",
            dificuldade: "moderada",
            tipo: "praia",
            pontos: [
                "Praia Grande",
                "Centro Histórico",
                "Praia do Félix",
                "Fortaleza"
            ],
            melhorHorario: "06:00",
            custos: { pedagio: 35, combustivel: 80, alimentacao: 65 },
            tags: ["praia", "surf", "natureza", "aventura"]
        },
        {
            nome: "Bertioga",
            descricao: "Praia e natureza preservada",
            distancia: 180,
            tempoEstimado: "4-5h",
            dificuldade: "fácil",
            tipo: "praia",
            pontos: [
                "Praia da Enseada",
                "Forte São João",
                "Restinga de Bertioga",
                "Centro"
            ],
            melhorHorario: "08:30",
            custos: { pedagio: 28, combustivel: 50, alimentacao: 45 },
            tags: ["praia", "natureza", "história", "família"]
        }
    ],

    // Rolês Gastronômicos (100-250km)
    gastronomico: [
        {
            nome: "Holambra",
            descricao: "Sabores holandeses e campos de flores",
            distancia: 240,
            tempoEstimado: "5-6h",
            dificuldade: "fácil",
            tipo: "gastronômico",
            pontos: [
                "Moinho Povos Unidos",
                "Deck do Amor",
                "Restaurantes típicos",
                "Feira de flores"
            ],
            melhorHorario: "08:00",
            custos: { pedagio: 22, combustivel: 65, alimentacao: 85 },
            tags: ["gastronômico", "flores", "holandês", "romântico"]
        },
        {
            nome: "Socorro - SP",
            descricao: "Capital nacional do aventurismo gastronômico",
            distancia: 200,
            tempoEstimado: "5-6h",
            dificuldade: "moderada",
            tipo: "gastronômico",
            pontos: [
                "Centro histórico",
                "Restaurante da Montanha",
                "Cervejaria local",
                "Mercado Municipal"
            ],
            melhorHorario: "09:00",
            custos: { pedagio: 18, combustivel: 55, alimentacao: 75 },
            tags: ["gastronômico", "aventura", "cerveja", "montanha"]
        },
        {
            nome: "Embu das Artes",
            descricao: "Arte, cultura e culinária caipira",
            distancia: 80,
            tempoEstimado: "3-4h",
            dificuldade: "fácil",
            tipo: "gastronômico",
            pontos: [
                "Largo dos Jesuítas",
                "Casa do Artesão",
                "Restaurantes típicos",
                "Feira de domingo"
            ],
            melhorHorario: "10:00",
            custos: { pedagio: 8, combustivel: 25, alimentacao: 60 },
            tags: ["gastronômico", "arte", "cultura", "domingo"]
        }
    ],

    // Rolês de Aventura/Trilha (150-350km)
    aventura: [
        {
            nome: "Cunha - SP",
            descricao: "Terra da cachaça e cerâmica",
            distancia: 300,
            tempoEstimado: "6-7h",
            dificuldade: "moderada",
            tipo: "aventura",
            pontos: [
                "Ateliês de cerâmica",
                "Cachaçarias",
                "Pico do Itaguaré",
                "Centro histórico"
            ],
            melhorHorario: "07:00",
            custos: { pedagio: 30, combustivel: 78, alimentacao: 65 },
            tags: ["aventura", "cachaça", "arte", "montanha"]
        },
        {
            nome: "Paranapiacaba",
            descricao: "Vila ferroviária na serra",
            distancia: 110,
            tempoEstimado: "4-5h",
            dificuldade: "moderada",
            tipo: "aventura",
            pontos: [
                "Estação de trem",
                "Vila inglesa",
                "Trilhas locais",
                "Mirante"
            ],
            melhorHorario: "08:30",
            custos: { pedagio: 15, combustivel: 32, alimentacao: 40 },
            tags: ["aventura", "histórico", "trilha", "trem"]
        },
        {
            nome: "Águas de Lindóia",
            descricao: "Águas termais e aventura",
            distancia: 250,
            tempoEstimado: "5-6h",
            dificuldade: "moderada",
            tipo: "aventura",
            pontos: [
                "Termas",
                "Teleférico",
                "Cristo Redentor",
                "Balneário municipal"
            ],
            melhorHorario: "07:30",
            custos: { pedagio: 25, combustivel: 68, alimentacao: 55 },
            tags: ["aventura", "termas", "relaxante", "teleférico"]
        }
    ],

    // Rolês Históricos/Culturais (120-280km)
    historico: [
        {
            nome: "São Bento do Sapucaí",
            descricao: "Portal da Mantiqueira",
            distancia: 220,
            tempoEstimado: "5-6h",
            dificuldade: "moderada",
            tipo: "histórico",
            pontos: [
                "Pedra do Baú",
                "Igreja Matriz",
                "Museu Municipal",
                "Centro histórico"
            ],
            melhorHorario: "07:00",
            custos: { pedagio: 20, combustivel: 58, alimentacao: 50 },
            tags: ["histórico", "montanha", "pedra", "cultura"]
        },
        {
            nome: "Taubaté",
            descricao: "Terra do Saci e de Monteiro Lobato",
            distancia: 240,
            tempoEstimado: "5-6h",
            dificuldade: "fácil",
            tipo: "histórico",
            pontos: [
                "Museu Monteiro Lobato",
                "Centro histórico",
                "Memorial Félix Guisard",
                "Catedral São Francisco"
            ],
            melhorHorario: "09:00",
            custos: { pedagio: 18, combustivel: 62, alimentacao: 45 },
            tags: ["histórico", "literatura", "cultura", "família"]
        },
        {
            nome: "Mogi das Cruzes",
            descricao: "Berço da imigração japonesa",
            distancia: 120,
            tempoEstimado: "4-5h",
            dificuldade: "fácil",
            tipo: "histórico",
            pontos: [
                "Centro histórico",
                "Igreja do Carmo",
                "Festa das Cerejeiras",
                "Mercado Municipal"
            ],
            melhorHorario: "09:30",
            custos: { pedagio: 12, combustivel: 35, alimentacao: 55 },
            tags: ["histórico", "japonês", "cultura", "flores"]
        }
    ]
};

// Função para buscar destinos baseado nos critérios
function buscarDestinos({ kmDesejada, tema = null, dificuldade = null, orcamento = null, horarioSaida = null, horarioVolta = null }) {
    let destinosFiltrados = [];
    
    // Buscar em todas as categorias se não especificou tema
    const categorias = tema ? [tema] : Object.keys(DESTINOS_DATABASE);
    
    categorias.forEach(categoria => {
        if (DESTINOS_DATABASE[categoria]) {
            DESTINOS_DATABASE[categoria].forEach(destino => {
                // Filtro por distância (margem de 20%)
                const margemKm = kmDesejada * 0.2;
                if (destino.distancia >= (kmDesejada - margemKm) && 
                    destino.distancia <= (kmDesejada + margemKm)) {
                    
                    // Filtros opcionais
                    if (dificuldade && destino.dificuldade !== dificuldade) return;
                    if (orcamento && calcularCustoTotal(destino) > orcamento) return;
                    
                    // NOVA LÓGICA: Verificar viabilidade de tempo
                    if (horarioSaida && horarioVolta) {
                        const isViavel = verificarViabilidadeTempo(destino, categoria, horarioSaida, horarioVolta);
                        if (!isViavel.viavel) return;
                        
                        // Adicionar informações de tempo ao destino
                        destino.infoTempo = isViavel;
                    }
                    
                    destinosFiltrados.push({
                        ...destino,
                        categoria,
                        compatibilidade: calcularCompatibilidade(destino, kmDesejada)
                    });
                }
            });
        }
    });
    
    // Ordenar por compatibilidade
    return destinosFiltrados.sort((a, b) => b.compatibilidade - a.compatibilidade);
}

// NOVA FUNÇÃO: Verificar se é possível fazer o rolê no tempo disponível
function verificarViabilidadeTempo(destino, categoria, horarioSaida, horarioVolta) {
    const [horaSaida, minSaida] = horarioSaida.split(':').map(Number);
    const [horaVolta, minVolta] = horarioVolta.split(':').map(Number);
    
    const minutosDisponiveis = (horaVolta * 60 + minVolta) - (horaSaida * 60 + minSaida);
    const horasDisponiveis = minutosDisponiveis / 60;
    
    // Calcular tempo necessário
    const tempoViagemIda = parseInt(destino.tempoEstimado.split('-')[1]) || 4; // pega tempo máximo
    const tempoPermanencia = calcularTempoPermanencia(categoria, destino);
    const tempoViagemVolta = tempoViagemIda; // mesmo tempo da ida
    
    const tempoTotalNecessario = tempoViagemIda + tempoPermanencia + tempoViagemVolta;
    
    const isViavel = horasDisponiveis >= tempoTotalNecessario;
    
    return {
        viavel: isViavel,
        horasDisponiveis: Math.round(horasDisponiveis * 100) / 100,
        tempoNecessario: tempoTotalNecessario,
        sobra: Math.round((horasDisponiveis - tempoTotalNecessario) * 100) / 100,
        detalhes: {
            ida: tempoViagemIda,
            permanencia: tempoPermanencia,
            volta: tempoViagemVolta
        }
    };
}

// Calcular tempo ideal de permanência baseado no tipo de destino
function calcularTempoPermanencia(categoria, destino) {
    const temposPorCategoria = {
        'praia': 4,
        'serra': 5,
        'gastronomico': 3,
        'aventura': 4,
        'historico': 3,
        'urbano': 2
    };
    
    let tempoPadrao = temposPorCategoria[categoria] || 3;
    
    // Ajustes específicos por tags
    if (destino.tags?.includes('relaxante')) tempoPadrao += 1;
    if (destino.tags?.includes('aventura')) tempoPadrao += 1;
    if (destino.tags?.includes('rápido')) tempoPadrao -= 1;
    
    return Math.max(1, tempoPadrao); // mínimo 1 hora
}

// Calcular compatibilidade baseada na proximidade da distância desejada
function calcularCompatibilidade(destino, kmDesejada) {
    const diferenca = Math.abs(destino.distancia - kmDesejada);
    const maxDiferenca = kmDesejada * 0.2; // 20% de margem
    return Math.max(0, 100 - (diferenca / maxDiferenca * 100));
}

// Calcular custo total do destino
function calcularCustoTotal(destino) {
    return destino.custos.pedagio + destino.custos.combustivel + destino.custos.alimentacao;
}

// Sugerir horário baseado na distância e horário de volta desejado
function sugerirHorario(destino, horaVoltaDesejada = null) {
    if (horaVoltaDesejada) {
        // Calcular horário de saída baseado no horário de volta desejado
        const tempoViagemIda = parseInt(destino.tempoEstimado.split('-')[1]) || 4; // pega o tempo máximo
        const tempoPermanencia = destino.categoria === 'praia' ? 4 : 
                               destino.categoria === 'gastronomico' ? 3 : 
                               destino.categoria === 'serra' ? 5 : 3; // horas no local
        const tempoTotal = (tempoViagemIda * 2) + tempoPermanencia; // ida + volta + permanência
        
        const horaVolta = parseInt(horaVoltaDesejada.split(':')[0]);
        const horaSaida = Math.max(6, horaVolta - tempoTotal); // não antes das 6h
        return `${horaSaida.toString().padStart(2, '0')}:00`;
    }
    
    return destino.melhorHorario;
}

// Criar array simples para compatibilidade com gerador.js
const destinos = [];
Object.values(DESTINOS_DATABASE).forEach(categoria => {
    if (Array.isArray(categoria)) {
        destinos.push(...categoria);
    }
});

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.DESTINOS_DATABASE = DESTINOS_DATABASE;
    window.destinos = destinos; // Para compatibilidade com gerador.js
    window.buscarDestinos = buscarDestinos;
    window.sugerirHorario = sugerirHorario;
    window.calcularCustoTotal = calcularCustoTotal;
    window.verificarViabilidadeTempo = verificarViabilidadeTempo;
}