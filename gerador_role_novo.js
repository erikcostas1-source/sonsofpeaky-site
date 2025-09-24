// ===== GERADOR DE ROLÊ DE MOTO COMPLETO =====

// Configuração da IA - usando config.js
const GOOGLE_API_KEY = 'AIzaSyCiHRVozYYmHB-5W64QdJzn9dQYAyRl9Tk'; // Nova chave da API
const API_URL_GENERATE_TEXT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=AIzaSyCiHRVozYYmHB-5W64QdJzn9dQYAyRl9Tk';

// Função principal do Gerador de Rolê de Moto
async function gerarRoleDeMoto() {
    // Coleta de dados do formulário
    const enderecoPartida = document.getElementById('endereco-partida')?.value.trim() || 'Penha, São Paulo, SP';
    const dataRole = document.getElementById('data-role')?.value || '';
    const horarioSaida = document.getElementById('horario-saida')?.value || '08:00';
    const horarioVolta = document.getElementById('horario-volta')?.value || '19:00';
    const orcamento = parseInt(document.getElementById('orcamento-role')?.value) || null;
    const experienciaDesejada = document.getElementById('experiencia-desejada')?.value.trim() || '';
    const tipoMoto = document.getElementById('tipo-moto')?.value || '600cc';
    const perfilPilotagem = document.getElementById('perfil-pilotagem')?.value || 'moderado';
    
    // Validações
    if (!experienciaDesejada) {
        mostrarErro('Por favor, descreva que experiência você quer viver!');
        return;
    }
    
    if (!tipoMoto) {
        mostrarErro('Por favor, selecione o tipo da sua moto!');
        return;
    }
    
    // Mostrar loading
    mostrarLoading();
    
    try {
        // Calcular tempo disponível
        const tempoDisponivel = calcularTempoDisponivel(horarioSaida, horarioVolta);
        
        // Configuração do consumo da moto
        const consumoMoto = {
            '125cc': { litrosPor100km: 2.8, descricao: '125-150cc (econômica)', kmPorLitro: 35 },
            '250cc': { litrosPor100km: 4.0, descricao: '250-400cc (média)', kmPorLitro: 25 },
            '600cc': { litrosPor100km: 5.5, descricao: '600-800cc (esportiva)', kmPorLitro: 18 },
            '1000cc': { litrosPor100km: 6.7, descricao: '1000cc+ (big trail)', kmPorLitro: 15 }
        }[tipoMoto];
        
        // Prompt para a IA
        const promptIA = criarPromptIA({
            experienciaDesejada,
            enderecoPartida,
            dataRole,
            horarioSaida,
            horarioVolta,
            tempoDisponivel,
            orcamento,
            consumoMoto,
            perfilPilotagem
        });
        
        // Consultar IA
        const sugestoes = await consultarIA(promptIA);
        
        // Renderizar resultados
        if (sugestoes && sugestoes.length > 0) {
            renderizarSugestoes(sugestoes);
        } else {
            mostrarErro('Não foi possível gerar sugestões. Tente ajustar seus critérios.');
        }
        
    } catch (error) {
        console.error('Erro ao gerar rolê:', error);
        mostrarErro('Erro ao consultar IA. Tente novamente em alguns segundos.');
    } finally {
        esconderLoading();
    }
}

// Criar prompt otimizado para a IA
function criarPromptIA(dados) {
    return `Você é um especialista mundial em turismo de motociclismo. Crie 3 sugestões PERFEITAS baseadas na experiência desejada.

🏍️ DADOS DO MOTOCICLISTA:
- Experiência desejada: "${dados.experienciaDesejada}"
- Ponto de partida: ${dados.enderecoPartida}
- Data: ${dados.dataRole || 'Flexível'}
- Horário de saída: ${dados.horarioSaida}
- Horário de volta: ${dados.horarioVolta}
- Tempo disponível: ${dados.tempoDisponivel.horas}h ${dados.tempoDisponivel.minutos}min
- Orçamento: ${dados.orcamento ? `R$ ${dados.orcamento}` : 'Flexível'}
- Moto: ${dados.consumoMoto.descricao} (${dados.consumoMoto.kmPorLitro}km/l)
- Perfil: ${dados.perfilPilotagem}

🎯 INSTRUÇÕES OBRIGATÓRIAS:
1. Use apenas lugares REAIS e específicos (nome do estabelecimento/atração)
2. SEMPRE forneça endereço COMPLETO (rua, número, cidade, estado, CEP se possível)
3. Calcule distâncias reais de ${dados.enderecoPartida}
4. Calcule custos precisos:
   - Combustível: ${dados.consumoMoto.kmPorLitro}km/l × R$6,50/litro
   - Pedágios de moto (valores reais das rodovias)
   - Gastos no local (refeições, ingressos, etc.)
5. Considere o tempo disponível (${dados.tempoDisponivel.horas}h ${dados.tempoDisponivel.minutos}min)
6. Foque na EXPERIÊNCIA solicitada

🔄 FORMATO DE RESPOSTA:
Responda APENAS com JSON válido:
{
  "sugestoes": [
    {
      "nome": "Nome específico do local",
      "endereco": "Endereço completo com rua, número, cidade, estado",
      "experiencia": "Descrição detalhada da experiência que terá",
      "distanciaKm": 150,
      "tempoViagem": "2h30min",
      "custos": {
        "combustivel": 35,
        "pedagio": 15,
        "local": 80,
        "total": 130
      },
      "roteiro": "Roteiro passo a passo com horários",
      "dicasEspeciais": "Dicas importantes específicas do local",
      "porquePerfeito": "Por que atende perfeitamente à experiência desejada"
    }
  ]
}`;
}

// Consultar IA Gemini
async function consultarIA(prompt) {
    const payload = {
        contents: [{
            parts: [{
                text: prompt
            }]
        }]
    };
    
    const response = await fetch(API_URL_GENERATE_TEXT, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`);
    }
    
    const data = await response.json();
    const textoResposta = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!textoResposta) {
        throw new Error('Resposta inválida da IA');
    }
    
    // Extrair JSON da resposta
    const jsonMatch = textoResposta.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
        throw new Error('JSON não encontrado na resposta');
    }
    
    const resultado = JSON.parse(jsonMatch[0]);
    return resultado.sugestoes || [];
}

// Renderizar sugestões na interface
// Função para simular parceiros baseados no destino
function gerarParceiros(nomeDestino, planoUsuario = 'gratuito') {
    // Parceiros cadastrados (simulação - em produção viria do banco de dados)
    const parceirosCadastrados = JSON.parse(localStorage.getItem('parceiros_cadastrados') || '[]');
    
    const parceirosPorRegiao = {
        'serras': [
            { nome: 'Pousada Serra Verde', tipo: 'hospedagem', desconto: '25%', telefone: '(11) 3333-4444', plano: 'premium' },
            { nome: 'Restaurante Vista da Serra', tipo: 'restaurante', desconto: '15%', telefone: '(11) 3333-5555', plano: 'basico' },
            { nome: 'Posto Shell Montanha', tipo: 'combustivel', desconto: 'R$ 0,10/L', telefone: '(11) 3333-6666', plano: 'enterprise' }
        ],
        'praia': [
            { nome: 'Hotel Beira Mar', tipo: 'hospedagem', desconto: '30%', telefone: '(13) 4444-5555', plano: 'premium' },
            { nome: 'Churrascaria do Pescador', tipo: 'restaurante', desconto: '20%', telefone: '(13) 4444-6666', plano: 'premium' },
            { nome: 'Oficina Moto Beach', tipo: 'servico', desconto: '20%', telefone: '(13) 4444-7777', plano: 'basico' }
        ],
        'cachoeira': [
            { nome: 'Pousada Águas Claras', tipo: 'hospedagem', desconto: '20%', telefone: '(19) 5555-6666', plano: 'basico' },
            { nome: 'Restaurante Trilha Verde', tipo: 'restaurante', desconto: '15%', telefone: '(19) 5555-7777', plano: 'premium' },
            { nome: 'Shell Select Natureza', tipo: 'combustivel', desconto: 'R$ 0,08/L', telefone: '(19) 5555-8888', plano: 'enterprise' }
        ],
        'default': [
            { nome: 'Moto Hotel Express', tipo: 'hospedagem', desconto: '15%', telefone: '(11) 9999-0000', plano: 'basico' },
            { nome: 'Lanchonete do Motoqueiro', tipo: 'restaurante', desconto: '10%', telefone: '(11) 9999-1111', plano: 'basico' },
            { nome: 'Posto Ipiranga Rota', tipo: 'combustivel', desconto: 'R$ 0,05/L', telefone: '(11) 9999-2222', plano: 'premium' }
        ]
    };
    
    // Determinar região baseada no nome do destino
    let regiao = 'default';
    const nomeStr = nomeDestino.toLowerCase();
    if (nomeStr.includes('serra') || nomeStr.includes('monte') || nomeStr.includes('montanha')) {
        regiao = 'serras';
    } else if (nomeStr.includes('praia') || nomeStr.includes('litoral') || nomeStr.includes('santos') || nomeStr.includes('ubatuba')) {
        regiao = 'praia';
    } else if (nomeStr.includes('cachoeira') || nomeStr.includes('água') || nomeStr.includes('rio')) {
        regiao = 'cachoeira';
    }
    
    let parceiros = [...parceirosPorRegiao[regiao]];
    
    // Adicionar parceiros cadastrados da região
    const parceirosDaRegiao = parceirosCadastrados.filter(p => {
        // Simular filtro por região baseado no endereço
        const endereco = p.endereco.toLowerCase();
        if (regiao === 'serras' && (endereco.includes('serra') || endereco.includes('monte'))) return true;
        if (regiao === 'praia' && (endereco.includes('praia') || endereco.includes('santos') || endereco.includes('litoral'))) return true;
        if (regiao === 'cachoeira' && (endereco.includes('cachoeira') || endereco.includes('água'))) return true;
        if (regiao === 'default') return true;
        return false;
    });
    
    // Converter parceiros cadastrados para o formato esperado
    const parceirosFormatados = parceirosDaRegiao.map(p => ({
        nome: p.nomeEmpresa,
        tipo: p.tipoNegocio,
        desconto: `${p.desconto}%`,
        telefone: p.whatsapp,
        plano: p.plano,
        cadastrado: true
    }));
    
    parceiros = [...parceiros, ...parceirosFormatados];
    
    // Ordenar por plano (enterprise > premium > básico) para priorizar quem paga mais
    parceiros.sort((a, b) => {
        const prioridade = { 'enterprise': 3, 'premium': 2, 'basico': 1 };
        return (prioridade[b.plano] || 0) - (prioridade[a.plano] || 0);
    });
    
    // Filtrar baseado no plano do usuário
    if (planoUsuario === 'gratuito') {
        return []; // Plano gratuito não tem parceiros
    } else if (planoUsuario === 'aventureiro') {
        return parceiros.slice(0, 2); // Apenas 2 parceiros
    } else if (planoUsuario === 'lendario') {
        return parceiros.slice(0, 5); // Até 5 parceiros
    }
    
    return parceiros;
}

// Função para gerar seção de parceiros no HTML
function gerarSecaoParceiros(nomeDestino) {
    // Simular plano do usuário (em produção viria do sistema de autenticação)
    const planoUsuario = localStorage.getItem('planoUsuario') || 'gratuito';
    const parceiros = gerarParceiros(nomeDestino, planoUsuario);
    
    if (parceiros.length === 0) {
        if (planoUsuario === 'gratuito') {
            return `
                <!-- Upgrade para Parceiros -->
                <div class="bg-gradient-to-r from-amber-900/20 to-orange-900/20 rounded-lg p-4 mb-6 border border-amber-700/30">
                    <h6 class="text-amber-400 font-bold text-sm mb-3 flex items-center gap-2">
                        🤝 PARCERIAS EXCLUSIVAS
                    </h6>
                    <p class="text-gray-300 text-sm mb-3">Assinantes premium têm acesso a descontos especiais em:</p>
                    <div class="grid grid-cols-3 gap-2 mb-4">
                        <div class="text-center">
                            <i class="fas fa-bed text-amber-500 text-lg mb-1"></i>
                            <p class="text-xs text-gray-400">Hospedagens</p>
                        </div>
                        <div class="text-center">
                            <i class="fas fa-utensils text-amber-500 text-lg mb-1"></i>
                            <p class="text-xs text-gray-400">Restaurantes</p>
                        </div>
                        <div class="text-center">
                            <i class="fas fa-gas-pump text-amber-500 text-lg mb-1"></i>
                            <p class="text-xs text-gray-400">Combustível</p>
                        </div>
                    </div>
                    <button onclick="window.location.href='#precos'" class="w-full px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-black font-semibold rounded-lg text-sm transition-all duration-300">
                        🚀 Fazer Upgrade
                    </button>
                </div>
            `;
        }
        return '';
    }
    
    const iconesParcerias = {
        'hospedagem': '🏨',
        'restaurante': '🍽️',
        'combustivel': '⛽',
        'servico': '🔧'
    };
    
    return `
        <!-- Parceiros Exclusivos -->
        <div class="bg-gradient-to-r from-amber-900/20 to-orange-900/20 rounded-lg p-4 mb-6 border border-amber-700/30">
            <h6 class="text-amber-400 font-bold text-sm mb-3 flex items-center gap-2">
                🤝 PARCEIROS EXCLUSIVOS
                <span class="bg-amber-500 text-black px-2 py-0.5 rounded-full text-xs font-bold">
                    ${planoUsuario.toUpperCase()}
                </span>
            </h6>
            <div class="space-y-3">
                ${parceiros.map(parceiro => `
                    <div class="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-3">
                                <span class="text-lg">${iconesParcerias[parceiro.tipo] || '🏪'}</span>
                                <div>
                                    <p class="text-white font-semibold text-sm">${parceiro.nome}</p>
                                    <p class="text-gray-400 text-xs">${parceiro.telefone}</p>
                                </div>
                            </div>
                            <div class="text-right">
                                <span class="bg-green-500/20 text-green-400 px-2 py-1 rounded text-xs font-bold">
                                    ${parceiro.desconto}
                                </span>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
            <div class="mt-3 p-2 bg-gray-800/30 rounded text-xs text-gray-400 text-center">
                💡 Apresente este cupom nos estabelecimentos parceiros
            </div>
        </div>
    `;
}

function renderizarSugestoes(sugestoes) {
    const container = document.getElementById('sugestoes-role');
    if (!container) return;
    
    container.innerHTML = sugestoes.map((sugestao, index) => `
        <div class="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700 hover:border-amber-500/50 transition-all duration-300 sugestao-card shadow-xl">
            <!-- Header da Sugestão -->
            <div class="flex items-start justify-between mb-6 pb-4 border-b border-gray-700">
                <div class="flex-1">
                    <h5 class="text-2xl font-bold text-transparent bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text mb-3">
                        ${sugestao.nome}
                    </h5>
                    
                    <!-- Endereço Destacado -->
                    <div class="bg-gray-800/80 rounded-lg p-3 mb-4 border border-gray-600">
                        <div class="flex items-start gap-2">
                            <span class="text-amber-400 text-sm mt-0.5">📍</span>
                            <div>
                                <p class="text-gray-200 text-sm font-medium">Endereço:</p>
                                <p class="text-gray-300 text-sm">${sugestao.endereco}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="flex items-center gap-4 text-sm text-gray-400">
                        <span class="flex items-center gap-1">📏 ${sugestao.distanciaKm}km</span>
                        <span class="flex items-center gap-1">⏱️ ${sugestao.tempoViagem}</span>
                    </div>
                </div>
                <div class="bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-2 rounded-full font-bold text-lg shadow-lg">
                    R$ ${sugestao.custos.total}
                </div>
            </div>
            
            <!-- Experiência -->
            <div class="bg-gradient-to-r from-amber-900/20 to-orange-900/20 rounded-lg p-4 mb-6 border border-amber-700/30">
                <h6 class="text-amber-400 font-bold text-sm mb-3 flex items-center gap-2">
                    ✨ SUA EXPERIÊNCIA
                </h6>
                <p class="text-gray-200 leading-relaxed">${sugestao.experiencia}</p>
            </div>
            
            <!-- Grid de Informações -->
            <div class="grid md:grid-cols-2 gap-4 mb-6">
                <!-- Custos -->
                <div class="bg-blue-900/20 rounded-lg p-4 border border-blue-700/30">
                    <h6 class="text-blue-400 font-bold text-sm mb-3 flex items-center gap-2">
                        💰 INVESTIMENTO
                    </h6>
                    <div class="space-y-2 text-sm">
                        <div class="flex justify-between">
                            <span class="text-gray-300">⛽ Combustível:</span>
                            <span class="text-blue-300 font-semibold">R$ ${sugestao.custos.combustivel}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-300">🛣️ Pedágios:</span>
                            <span class="text-blue-300 font-semibold">R$ ${sugestao.custos.pedagio}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-300">🍽️ No local:</span>
                            <span class="text-blue-300 font-semibold">R$ ${sugestao.custos.local}</span>
                        </div>
                        <div class="border-t border-blue-700/30 pt-2 mt-2">
                            <div class="flex justify-between font-bold">
                                <span class="text-blue-200">Total:</span>
                                <span class="text-blue-300 text-lg">R$ ${sugestao.custos.total}</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Por que é perfeito -->
                <div class="bg-purple-900/20 rounded-lg p-4 border border-purple-700/30">
                    <h6 class="text-purple-400 font-bold text-sm mb-3 flex items-center gap-2">
                        🎯 POR QUE É IDEAL
                    </h6>
                    <p class="text-gray-300 text-sm leading-relaxed">${sugestao.porquePerfeito}</p>
                </div>
            </div>
            
            <!-- Roteiro -->
            <div class="bg-green-900/20 rounded-lg p-4 mb-6 border border-green-700/30">
                <h6 class="text-green-400 font-bold text-sm mb-3 flex items-center gap-2">
                    🗺️ ROTEIRO SUGERIDO
                </h6>
                <p class="text-gray-300 text-sm leading-relaxed">${sugestao.roteiro}</p>
            </div>
            
            <!-- Dicas Especiais -->
            <div class="bg-yellow-900/20 rounded-lg p-4 mb-6 border border-yellow-700/30">
                <h6 class="text-yellow-400 font-bold text-sm mb-3 flex items-center gap-2">
                    💡 DICAS ESPECIAIS
                </h6>
                <p class="text-gray-300 text-sm leading-relaxed">${sugestao.dicasEspeciais}</p>
            </div>
            
            ${gerarSecaoParceiros(sugestao.nome)}
            
            <!-- Botões de Ação -->
            <div class="flex gap-3">
                <button class="escolher-role flex-1 px-6 py-4 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-gray-900 font-bold rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
                        onclick="escolherRole(${index})">
                    🚀 Escolher Este Rolê
                </button>
                <button class="compartilhar-role px-4 py-4 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors"
                        onclick="compartilharRole(${index})"
                        title="Compartilhar">
                    📤
                </button>
            </div>
        </div>
    `).join('');
    
    // Mostrar container de resultados
    document.getElementById('resultados-container').classList.remove('hidden');
    
    // Salvar sugestões globalmente
    window.sugestoesRole = sugestoes;
}

// Escolher um rolê
function escolherRole(index) {
    const sugestao = window.sugestoesRole?.[index];
    if (!sugestao) return;
    
    // Salvar escolha
    window.roleEscolhido = sugestao;
    
    // Mostrar modal de ações
    mostrarModalAcoesRole(sugestao, index);
}

// Modal com ações após escolher rolê
function mostrarModalAcoesRole(sugestao, index) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4';
    modal.innerHTML = `
        <div class="bg-gray-900 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
            <!-- Header -->
            <div class="sticky top-0 bg-gray-900 p-6 border-b border-gray-700 rounded-t-xl">
                <div class="flex items-center justify-between">
                    <div>
                        <h3 class="text-2xl font-bold text-transparent bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text">
                            🎉 Rolê Escolhido!
                        </h3>
                        <p class="text-gray-300 text-sm mt-1">${sugestao.nome}</p>
                    </div>
                    <button onclick="fecharModalAcoes()" class="text-gray-400 hover:text-white text-2xl">×</button>
                </div>
            </div>
            
            <!-- Conteúdo -->
            <div class="p-6 space-y-6">
                <!-- Resumo do Rolê -->
                <div class="bg-gradient-to-r from-amber-900/20 to-orange-900/20 rounded-lg p-4 border border-amber-700/30">
                    <h4 class="text-amber-400 font-bold mb-2 flex items-center gap-2">
                        📍 DESTINO CONFIRMADO
                    </h4>
                    <p class="text-gray-200 text-sm mb-2">${sugestao.endereco}</p>
                    <div class="flex items-center gap-4 text-sm text-gray-300">
                        <span>📏 ${sugestao.distanciaKm}km</span>
                        <span>⏱️ ${sugestao.tempoViagem}</span>
                        <span>💰 R$ ${sugestao.custos.total}</span>
                    </div>
                </div>
                
                <!-- Ações Principais -->
                <div class="grid md:grid-cols-2 gap-4">
                    <!-- Compartilhar -->
                    <button onclick="compartilharRoleEscolhido(${index})" 
                            class="flex items-center gap-3 p-4 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors">
                        <span class="text-2xl">📤</span>
                        <div class="text-left">
                            <div class="font-bold">Compartilhar</div>
                            <div class="text-xs opacity-90">Enviar para o grupo</div>
                        </div>
                    </button>
                    
                    <!-- Gerar Checklist -->
                    <button onclick="gerarChecklistRole()" 
                            class="flex items-center gap-3 p-4 bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors">
                        <span class="text-2xl">📋</span>
                        <div class="text-left">
                            <div class="font-bold">Checklist</div>
                            <div class="text-xs opacity-90">O que levar/verificar</div>
                        </div>
                    </button>
                    
                    <!-- Salvar no Calendário -->
                    <button onclick="salvarNoCalendario()" 
                            class="flex items-center gap-3 p-4 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors">
                        <span class="text-2xl">📅</span>
                        <div class="text-left">
                            <div class="font-bold">Calendário</div>
                            <div class="text-xs opacity-90">Adicionar evento</div>
                        </div>
                    </button>
                    
                    <!-- Abrir no Maps -->
                    <button onclick="abrirNoMaps('${sugestao.endereco.replace(/'/g, "\\'")}')" 
                            class="flex items-center gap-3 p-4 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors">
                        <span class="text-2xl">🗺️</span>
                        <div class="text-left">
                            <div class="font-bold">Ver Rota</div>
                            <div class="text-xs opacity-90">Abrir no Google Maps</div>
                        </div>
                    </button>
                </div>
                
                <!-- Ações Secundárias -->
                <div class="pt-4 border-t border-gray-700">
                    <h4 class="text-gray-300 font-bold mb-3 text-sm">PRÓXIMOS PASSOS:</h4>
                    <div class="space-y-2 text-sm">
                        <div class="flex items-center gap-3 text-gray-300">
                            <span class="text-green-400">✓</span>
                            <span>Rolê salvo e pronto para execução</span>
                        </div>
                        <div class="flex items-center gap-3 text-gray-300">
                            <span class="text-yellow-400">⏳</span>
                            <span>Verifique previsão do tempo no dia</span>
                        </div>
                        <div class="flex items-center gap-3 text-gray-300">
                            <span class="text-blue-400">ℹ️</span>
                            <span>Confirme funcionamento do local</span>
                        </div>
                    </div>
                </div>
                
                <!-- Botão de Fechar -->
                <div class="pt-4">
                    <button onclick="fecharModalAcoes()" 
                            class="w-full px-4 py-3 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors">
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Fechar com ESC
    const handleEsc = (e) => {
        if (e.key === 'Escape') {
            fecharModalAcoes();
            document.removeEventListener('keydown', handleEsc);
        }
    };
    document.addEventListener('keydown', handleEsc);
}

// Fechar modal de ações
function fecharModalAcoes() {
    const modal = document.querySelector('.fixed.inset-0.bg-black\\/70');
    if (modal) {
        modal.remove();
    }
}

// Compartilhar rolê escolhido (do modal)
async function compartilharRoleEscolhido(index) {
    await compartilharRole(index);
    fecharModalAcoes();
}

// Compartilhar rolê (função original melhorada)
async function compartilharRole(index) {
    const sugestao = window.sugestoesRole?.[index];
    if (!sugestao) return;
    
    // Obter dados do formulário para incluir no compartilhamento
    const dataRole = document.getElementById('data-role')?.value || 'A definir';
    const horarioSaida = document.getElementById('horario-saida')?.value || '08:00';
    const enderecoPartida = document.getElementById('endereco-partida')?.value || 'A definir';
    
    const textoCompartilhamento = `🏍️ ROLÊ SONS OF PEAKY 🏍️

📍 DESTINO: ${sugestao.nome}
🎯 EXPERIÊNCIA: ${sugestao.experiencia}

📅 QUANDO: ${dataRole === 'A definir' ? 'Data a definir' : new Date(dataRole + 'T00:00').toLocaleDateString('pt-BR')}
⏰ SAÍDA: ${horarioSaida} - ${enderecoPartida}

📋 DETALHES:
• 📏 Distância: ${sugestao.distanciaKm}km
• ⏱️ Tempo: ${sugestao.tempoViagem}
• 💰 Custo estimado: R$ ${sugestao.custos.total}

🗺️ ENDEREÇO COMPLETO:
${sugestao.endereco}

🛣️ ROTEIRO SUGERIDO:
${sugestao.roteiro}

💡 DICAS IMPORTANTES:
${sugestao.dicasEspeciais}

🏍️ CONFIRMEM PRESENÇA! Brotherhood em ação! 

#SonsOfPeaky #Motociclismo #Brotherhood #Role`;
    
    // Tentar Web Share API
    if (navigator.share) {
        try {
            await navigator.share({
                title: `Rolê SOP: ${sugestao.nome}`,
                text: textoCompartilhamento,
                url: window.location.href
            });
            return;
        } catch (error) {
            console.log('Web Share cancelado');
        }
    }
    
    // Fallback: copiar para clipboard
    try {
        await navigator.clipboard.writeText(textoCompartilhamento);
        
        // Feedback visual melhorado
        const toast = document.createElement('div');
        toast.className = 'fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50';
        toast.textContent = '📋 Rolê copiado! Cole no WhatsApp do grupo';
        document.body.appendChild(toast);
        
        setTimeout(() => toast.remove(), 3000);
        
    } catch (error) {
        alert('Não foi possível compartilhar automaticamente. Copie manualmente o texto abaixo:\n\n' + textoCompartilhamento);
    }
}

// Gerar checklist para o rolê
function gerarChecklistRole() {
    const sugestao = window.roleEscolhido;
    if (!sugestao) return;
    
    const tipoMoto = document.getElementById('tipo-moto')?.value || '600cc';
    const distancia = sugestao.distanciaKm;
    
    const checklist = `📋 CHECKLIST ROLÊ: ${sugestao.nome}

🏍️ VERIFICAÇÕES NA MOTO:
${distancia > 200 ? '✓ Revisão completa (óleo, freios, pneus)' : '✓ Verificação básica (óleo, freios)'}
✓ Calibragem dos pneus
✓ Combustível completo
✓ Kit de primeiros socorros
${tipoMoto === '1000cc' ? '✓ Verificar bagageiros/alforjes' : '✓ Espaço para bagagem'}

🎒 ITENS PESSOAIS:
✓ Documentos (CNH, documento da moto)
✓ Capacete e equipamentos de segurança
✓ Protetor solar e óculos
✓ Carregador portátil para celular
✓ Dinheiro em espécie (pedágios/emergências)

🍽️ ALIMENTAÇÃO:
✓ Água (pelo menos 1L)
${sugestao.custos.local > 50 ? '✓ Reserva no restaurante (se necessário)' : '✓ Lanche para o caminho'}
✓ Balas/energético para a viagem

🌤️ CLIMA & SITUAÇÃO:
✓ Conferir previsão do tempo
✓ Confirmar funcionamento do destino
✓ Avisar família sobre o rolê
✓ Definir ponto de encontro com o grupo

⚠️ EMERGÊNCIAS:
✓ Contato de mecânico da região
✓ Número de emergência dos membros
✓ Seguro da moto em dia

Bom rolê, irmão! 🏍️🔥`;

    // Mostrar checklist
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4';
    modal.innerHTML = `
        <div class="bg-gray-900 rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-gray-700">
            <div class="p-6">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-xl font-bold text-green-400">📋 Checklist do Rolê</h3>
                    <button onclick="this.closest('.fixed').remove()" class="text-gray-400 hover:text-white text-2xl">×</button>
                </div>
                <pre class="text-gray-300 text-sm whitespace-pre-wrap bg-gray-800 p-4 rounded-lg">${checklist}</pre>
                <div class="flex gap-3 mt-4">
                    <button onclick="copiarChecklist(\`${checklist.replace(/`/g, '\\`')}\`)" 
                            class="flex-1 px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors">
                        📋 Copiar Checklist
                    </button>
                    <button onclick="this.closest('.fixed').remove()" 
                            class="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors">
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// Copiar checklist
async function copiarChecklist(texto) {
    try {
        await navigator.clipboard.writeText(texto);
        
        const toast = document.createElement('div');
        toast.className = 'fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50';
        toast.textContent = '✓ Checklist copiado!';
        document.body.appendChild(toast);
        
        setTimeout(() => toast.remove(), 2000);
    } catch (error) {
        alert('Checklist:\n\n' + texto);
    }
}

// Salvar no calendário
function salvarNoCalendario() {
    const sugestao = window.roleEscolhido;
    if (!sugestao) return;
    
    const dataRole = document.getElementById('data-role')?.value;
    const horarioSaida = document.getElementById('horario-saida')?.value || '08:00';
    const horarioVolta = document.getElementById('horario-volta')?.value || '19:00';
    
    if (!dataRole) {
        alert('⚠️ Defina uma data no formulário antes de salvar no calendário!');
        return;
    }
    
    // Criar evento do calendário
    const evento = {
        title: `🏍️ Rolê SOP: ${sugestao.nome}`,
        start: `${dataRole}T${horarioSaida}:00`,
        end: `${dataRole}T${horarioVolta}:00`,
        description: `${sugestao.experiencia}\n\nEndereço: ${sugestao.endereco}\nDistância: ${sugestao.distanciaKm}km\nCusto: R$ ${sugestao.custos.total}\n\nDicas: ${sugestao.dicasEspeciais}`,
        location: sugestao.endereco
    };
    
    // Gerar URL do Google Calendar
    const startDate = new Date(`${dataRole}T${horarioSaida}:00`).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const endDate = new Date(`${dataRole}T${horarioVolta}:00`).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    
    const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(evento.title)}&dates=${startDate}/${endDate}&details=${encodeURIComponent(evento.description)}&location=${encodeURIComponent(evento.location)}`;
    
    window.open(calendarUrl, '_blank');
    
    fecharModalAcoes();
}

// Abrir no Google Maps
function abrirNoMaps(endereco) {
    const enderecoPartida = document.getElementById('endereco-partida')?.value || 'Penha, São Paulo, SP';
    const mapsUrl = `https://www.google.com/maps/dir/${encodeURIComponent(enderecoPartida)}/${encodeURIComponent(endereco)}`;
    
    window.open(mapsUrl, '_blank');
    
    fecharModalAcoes();
}

// Funções auxiliares com loading states melhorados
function mostrarLoading() {
    const botao = document.getElementById('gerar-role-btn');
    const container = document.getElementById('resultados-container');
    const loading = document.getElementById('loading-role');
    const sugestoes = document.getElementById('sugestoes-role');
    
    // Atualizar botão com loading
    if (botao) {
        botao.classList.add('btn-loading');
        botao.innerHTML = `
            <div class="loading-spinner"></div>
            <span>Consultando IA...</span>
        `;
        botao.disabled = true;
    }
    
    // Mostrar container de loading
    if (container) container.classList.remove('hidden');
    if (loading) loading.classList.remove('hidden');
    if (sugestoes) sugestoes.classList.add('hidden');
}

function esconderLoading() {
    const botao = document.getElementById('gerar-role-btn');
    const loading = document.getElementById('loading-role');
    const sugestoes = document.getElementById('sugestoes-role');
    
    // Restaurar botão
    if (botao) {
        botao.classList.remove('btn-loading');
        botao.innerHTML = `🚀 Gerar Rolê Personalizado`;
        botao.disabled = false;
    }
    
    // Esconder loading e mostrar resultados
    if (loading) loading.classList.add('hidden');
    if (sugestoes) sugestoes.classList.remove('hidden');
}

function mostrarLoadingGeral(elemento, texto = 'Carregando...') {
    if (!elemento) return;
    
    elemento.classList.add('btn-loading');
    const textoOriginal = elemento.innerHTML;
    elemento.innerHTML = `
        <div class="loading-spinner"></div>
        <span>${texto}</span>
    `;
    elemento.disabled = true;
    
    // Retornar função para restaurar
    return () => {
        elemento.classList.remove('btn-loading');
        elemento.innerHTML = textoOriginal;
        elemento.disabled = false;
    };
}

function mostrarErro(mensagem) {
    const container = document.getElementById('sugestoes-role');
    if (container) {
        container.innerHTML = `
            <div class="bg-red-900/20 border border-red-700/50 rounded-lg p-6 text-center">
                <div class="text-red-400 text-4xl mb-4">⚠️</div>
                <h5 class="text-red-300 font-bold text-lg mb-2">Ops! Algo deu errado</h5>
                <p class="text-red-200">${mensagem}</p>
            </div>
        `;
    }
    document.getElementById('resultados-container').classList.remove('hidden');
}

function calcularTempoDisponivel(saida, volta) {
    const [saidaH, saidaM] = saida.split(':').map(Number);
    const [voltaH, voltaM] = volta.split(':').map(Number);
    
    let totalMinutos = (voltaH * 60 + voltaM) - (saidaH * 60 + saidaM);
    if (totalMinutos < 0) totalMinutos += 24 * 60; // Próximo dia
    
    return {
        horas: Math.floor(totalMinutos / 60),
        minutos: totalMinutos % 60
    };
}

// Inicializar data padrão (próximo sábado)
function inicializarDataPadrao() {
    const hoje = new Date();
    const proximoSabado = new Date(hoje);
    proximoSabado.setDate(hoje.getDate() + (6 - hoje.getDay()));
    
    const dataInput = document.getElementById('data-role');
    if (dataInput && !dataInput.value) {
        dataInput.value = proximoSabado.toISOString().split('T')[0];
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar data padrão
    inicializarDataPadrao();
    
    // Botão principal
    const botaoGerar = document.getElementById('gerar-role-btn');
    if (botaoGerar) {
        botaoGerar.addEventListener('click', gerarRoleDeMoto);
    }
});

// ===== SIMULADOR DE PLANOS (PARA DEMONSTRAÇÃO) =====

function simularPlano(tipoPlano) {
    // Salvar plano no localStorage
    localStorage.setItem('planoUsuario', tipoPlano);
    
    // Atualizar interface
    const spanPlanoAtual = document.querySelector('#plano-atual span');
    if (spanPlanoAtual) {
        const nomesPlanos = {
            'gratuito': 'Gratuito',
            'aventureiro': 'Aventureiro (R$29/mês)',
            'lendario': 'Lendário (R$59/mês)'
        };
        spanPlanoAtual.textContent = nomesPlanos[tipoPlano];
        spanPlanoAtual.className = tipoPlano === 'gratuito' ? 'text-gray-300 font-semibold' : 'text-amber-400 font-semibold';
    }
    
    // Mostrar notificação
    mostrarNotificacaoPlano(tipoPlano);
    
    // Se houver sugestões na tela, re-renderizar para mostrar/esconder parceiros
    if (window.sugestoesRole && window.sugestoesRole.length > 0) {
        renderizarSugestoes(window.sugestoesRole);
    }
}

function mostrarNotificacaoPlano(tipoPlano) {
    const mensagens = {
        'gratuito': '📋 Plano Gratuito selecionado - Sem parceiros disponíveis',
        'aventureiro': '🚀 Plano Aventureiro ativo - Parceiros básicos desbloqueados!',
        'lendario': '👑 Plano Lendário ativo - Todos os parceiros premium disponíveis!'
    };
    
    // Criar notificação
    const notificacao = document.createElement('div');
    notificacao.className = 'fixed top-4 right-4 z-50 bg-gray-800 border border-amber-500 rounded-lg p-4 shadow-lg max-w-sm';
    notificacao.innerHTML = `
        <div class="flex items-start gap-3">
            <div class="flex-1">
                <p class="text-white text-sm font-semibold">${mensagens[tipoPlano]}</p>
                <p class="text-gray-400 text-xs mt-1">Agora gere um rolê para ver as diferenças!</p>
            </div>
            <button onclick="this.parentElement.parentElement.remove()" class="text-gray-400 hover:text-white">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    document.body.appendChild(notificacao);
    
    // Remove após 5 segundos
    setTimeout(() => {
        if (notificacao.parentElement) {
            notificacao.remove();
        }
    }, 5000);
}

// Inicializar plano padrão ao carregar página
document.addEventListener('DOMContentLoaded', function() {
    const planoAtual = localStorage.getItem('planoUsuario') || 'gratuito';
    simularPlano(planoAtual);
    
    // Inicializar calculadora de ROI
    if (document.getElementById('ticket-medio')) {
        calcularROI();
    }
    
    // Inicializar máquina de captura de parceiros
    iniciarMaquinaParceiros();
});

// ===== SISTEMA DE CHECKOUT SIMULADO =====

function iniciarCheckout(plano, valor) {
    // Criar modal de checkout
    const modalCheckout = document.createElement('div');
    modalCheckout.className = 'fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4';
    modalCheckout.innerHTML = `
        <div class="bg-gray-900 rounded-2xl max-w-md w-full border border-gray-700 shadow-2xl">
            <!-- Header -->
            <div class="p-6 border-b border-gray-700">
                <div class="flex items-center justify-between">
                    <div>
                        <h3 class="text-xl font-bold text-white">Checkout - Plano ${plano.charAt(0).toUpperCase() + plano.slice(1)}</h3>
                        <p class="text-gray-400 text-sm">R$ ${valor}/mês</p>
                    </div>
                    <button onclick="fecharCheckout()" class="text-gray-400 hover:text-white text-xl">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
            
            <!-- Conteúdo -->
            <div class="p-6 space-y-6">
                <!-- Resumo do Plano -->
                <div class="bg-gradient-to-r from-amber-900/20 to-orange-900/20 rounded-lg p-4 border border-amber-700/30">
                    <h4 class="text-amber-400 font-semibold mb-2">Você terá acesso a:</h4>
                    <ul class="text-gray-300 text-sm space-y-1">
                        ${plano === 'aventureiro' ? `
                            <li>✅ Rolês ilimitados</li>
                            <li>✅ Destinos premium</li>
                            <li>✅ Parcerias com hotéis (15-25% off)</li>
                            <li>✅ Suporte prioritário</li>
                        ` : `
                            <li>✅ Tudo do Aventureiro</li>
                            <li>✅ Roteiros exclusivos</li>
                            <li>✅ Parcerias premium (até 30% off)</li>
                            <li>✅ Eventos exclusivos</li>
                            <li>✅ Consultoria personalizada</li>
                        `}
                    </ul>
                </div>
                
                <!-- Formulário de Pagamento Simulado -->
                <div class="space-y-4">
                    <div>
                        <label class="block text-gray-300 text-sm font-semibold mb-2">Método de Pagamento</label>
                        <div class="space-y-2">
                            <label class="flex items-center space-x-3 p-3 rounded-lg border border-gray-700 hover:border-amber-500 cursor-pointer transition-colors">
                                <input type="radio" name="pagamento" value="cartao" checked class="text-amber-500">
                                <i class="fas fa-credit-card text-amber-500"></i>
                                <span class="text-white">Cartão de Crédito</span>
                            </label>
                            <label class="flex items-center space-x-3 p-3 rounded-lg border border-gray-700 hover:border-amber-500 cursor-pointer transition-colors">
                                <input type="radio" name="pagamento" value="pix" class="text-amber-500">
                                <i class="fas fa-qrcode text-amber-500"></i>
                                <span class="text-white">PIX</span>
                            </label>
                            <label class="flex items-center space-x-3 p-3 rounded-lg border border-gray-700 hover:border-amber-500 cursor-pointer transition-colors">
                                <input type="radio" name="pagamento" value="boleto" class="text-amber-500">
                                <i class="fas fa-barcode text-amber-500"></i>
                                <span class="text-white">Boleto Bancário</span>
                            </label>
                        </div>
                    </div>
                    
                    <div>
                        <label class="block text-gray-300 text-sm font-semibold mb-2">Email</label>
                        <input type="email" placeholder="seu@email.com" 
                               class="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-600 text-white focus:border-amber-500 outline-none transition-colors">
                    </div>
                </div>
                
                <!-- Garantia -->
                <div class="bg-green-900/20 rounded-lg p-3 border border-green-700/30">
                    <div class="flex items-center gap-2 text-green-400 text-sm">
                        <i class="fas fa-shield-alt"></i>
                        <span class="font-semibold">Garantia de 30 dias</span>
                    </div>
                    <p class="text-gray-400 text-xs mt-1">Reembolso integral se não ficar satisfeito</p>
                </div>
            </div>
            
            <!-- Footer -->
            <div class="p-6 border-t border-gray-700">
                <div class="flex gap-3">
                    <button onclick="fecharCheckout()" 
                            class="flex-1 py-3 px-6 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition-colors">
                        Cancelar
                    </button>
                    <button onclick="processarPagamento('${plano}', ${valor})" 
                            class="flex-1 py-3 px-6 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-black rounded-lg font-semibold transition-all duration-300">
                        Confirmar R$ ${valor}/mês
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modalCheckout);
}

function fecharCheckout() {
    const modal = document.querySelector('.fixed.inset-0.bg-black\\/80');
    if (modal) {
        modal.remove();
    }
}

function processarPagamento(plano, valor) {
    // Simular processamento
    const botaoConfirmar = document.querySelector('button[onclick*="processarPagamento"]');
    if (botaoConfirmar) {
        botaoConfirmar.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Processando...';
        botaoConfirmar.disabled = true;
    }
    
    setTimeout(() => {
        fecharCheckout();
        
        // Ativar plano
        simularPlano(plano);
        
        // Mostrar sucesso
        mostrarSucesso(plano, valor);
        
        // Scroll para ferramentas para testar
        setTimeout(() => {
            document.getElementById('ferramentas').scrollIntoView({ behavior: 'smooth' });
        }, 2000);
        
    }, 2000);
}

function mostrarSucesso(plano, valor) {
    const modalSucesso = document.createElement('div');
    modalSucesso.className = 'fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4';
    modalSucesso.innerHTML = `
        <div class="bg-gray-900 rounded-2xl max-w-md w-full border border-green-500 shadow-2xl">
            <div class="p-8 text-center">
                <div class="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i class="fas fa-check text-white text-2xl"></i>
                </div>
                <h3 class="text-2xl font-bold text-white mb-2">Pagamento Aprovado!</h3>
                <p class="text-gray-300 mb-4">
                    Bem-vindo ao plano <span class="text-amber-400 font-semibold">${plano.charAt(0).toUpperCase() + plano.slice(1)}</span>!
                </p>
                <div class="bg-gradient-to-r from-amber-900/20 to-orange-900/20 rounded-lg p-4 border border-amber-700/30 mb-6">
                    <p class="text-amber-400 font-semibold text-sm">🎉 Agora você tem acesso:</p>
                    <ul class="text-gray-300 text-sm mt-2 space-y-1">
                        <li>✅ Parcerias exclusivas desbloqueadas</li>
                        <li>✅ Descontos em hotéis e restaurantes</li>
                        <li>✅ Suporte prioritário</li>
                    </ul>
                </div>
                <button onclick="this.parentElement.parentElement.remove()" 
                        class="w-full py-3 px-6 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-black rounded-lg font-semibold transition-all duration-300">
                    Começar a Usar!
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modalSucesso);
    
    // Confete de celebração (usando eventos)
    setTimeout(() => {
        console.log('🎉 Novo assinante do plano', plano, '- R$', valor, '/mês');
    }, 500);
}

// ===== SISTEMA DE CADASTRO DE PARCEIROS =====

function iniciarCadastroParceiro(plano, valor) {
    const planoInfo = {
        'basico': {
            nome: 'Básico',
            leads: '50 leads/mês',
            comissao: '3%',
            features: ['Listagem no app', 'Dashboard básico', 'Suporte email']
        },
        'premium': {
            nome: 'Premium',
            leads: '200 leads/mês',
            comissao: '5%',
            features: ['Destaque premium', 'Analytics avançado', 'API integração', 'Suporte prioritário']
        },
        'enterprise': {
            nome: 'Enterprise',
            leads: 'Leads ilimitados',
            comissao: '7%',
            features: ['Prioridade máxima', 'Múltiplas unidades', 'Account Manager', 'Relatórios customizados']
        }
    };

    const info = planoInfo[plano];
    
    const modalParceiro = document.createElement('div');
    modalParceiro.className = 'fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4';
    modalParceiro.innerHTML = `
        <div class="bg-gray-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-700 shadow-2xl">
            <!-- Header -->
            <div class="p-6 border-b border-gray-700">
                <div class="flex items-center justify-between">
                    <div>
                        <h3 class="text-2xl font-bold text-white">Cadastro de Parceiro - ${info.nome}</h3>
                        <p class="text-gray-400">R$ ${valor}/mês • ${info.leads} • Comissão ${info.comissao}</p>
                    </div>
                    <button onclick="fecharCadastroParceiro()" class="text-gray-400 hover:text-white text-xl">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
            
            <!-- Formulário -->
            <div class="p-6 space-y-6">
                <!-- Dados da Empresa -->
                <div>
                    <h4 class="text-lg font-bold text-white mb-4">📋 Dados da Empresa</h4>
                    <div class="grid md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-gray-300 text-sm font-semibold mb-2">Nome da Empresa *</label>
                            <input type="text" id="nome-empresa" placeholder="Ex: Hotel Fazenda Bela Vista" 
                                   class="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-600 text-white focus:border-amber-500 outline-none transition-colors">
                        </div>
                        <div>
                            <label class="block text-gray-300 text-sm font-semibold mb-2">CNPJ *</label>
                            <input type="text" id="cnpj-empresa" placeholder="00.000.000/0001-00" 
                                   class="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-600 text-white focus:border-amber-500 outline-none transition-colors">
                        </div>
                    </div>
                </div>
                
                <!-- Tipo de Negócio -->
                <div>
                    <label class="block text-gray-300 text-sm font-semibold mb-2">Tipo de Negócio *</label>
                    <select id="tipo-negocio" class="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-600 text-white focus:border-amber-500 outline-none transition-colors">
                        <option value="">Selecione o tipo</option>
                        <option value="hospedagem">🏨 Hospedagem (Hotel, Pousada, Hostel)</option>
                        <option value="restaurante">🍽️ Restaurante (Lanchonete, Bar, Cafeteria)</option>
                        <option value="combustivel">⛽ Posto de Combustível</option>
                        <option value="oficina">🔧 Oficina/Mecânica</option>
                        <option value="turismo">🎯 Turismo/Atração</option>
                        <option value="equipamentos">🏍️ Equipamentos/Acessórios</option>
                        <option value="outros">🏪 Outros</option>
                    </select>
                </div>
                
                <!-- Localização -->
                <div>
                    <h4 class="text-lg font-bold text-white mb-4">📍 Localização</h4>
                    <div class="grid md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-gray-300 text-sm font-semibold mb-2">Endereço Completo *</label>
                            <input type="text" id="endereco-parceiro" placeholder="Rua, número, bairro, cidade, estado" 
                                   class="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-600 text-white focus:border-amber-500 outline-none transition-colors">
                        </div>
                        <div>
                            <label class="block text-gray-300 text-sm font-semibold mb-2">Raio de Atuação (km)</label>
                            <select id="raio-atuacao" class="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-600 text-white focus:border-amber-500 outline-none transition-colors">
                                <option value="5">5km (Local)</option>
                                <option value="20">20km (Regional)</option>
                                <option value="50" selected>50km (Amplo)</option>
                                <option value="100">100km (Estadual)</option>
                                <option value="500">500km (Nacional)</option>
                            </select>
                        </div>
                    </div>
                </div>
                
                <!-- Ofertas -->
                <div>
                    <h4 class="text-lg font-bold text-white mb-4">🎁 Ofertas para Motociclistas</h4>
                    <div class="space-y-3">
                        <div>
                            <label class="block text-gray-300 text-sm font-semibold mb-2">Desconto Oferecido (%)</label>
                            <input type="number" id="desconto-oferecido" value="15" min="5" max="50" 
                                   class="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-600 text-white focus:border-amber-500 outline-none transition-colors">
                        </div>
                        <div>
                            <label class="block text-gray-300 text-sm font-semibold mb-2">Descrição da Oferta</label>
                            <textarea id="descricao-oferta" placeholder="Ex: 15% de desconto em hospedagem + café da manhã grátis para motociclistas" 
                                      class="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-600 text-white focus:border-amber-500 outline-none transition-colors h-20 resize-none"></textarea>
                        </div>
                    </div>
                </div>
                
                <!-- Contato -->
                <div>
                    <h4 class="text-lg font-bold text-white mb-4">📞 Contato</h4>
                    <div class="grid md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-gray-300 text-sm font-semibold mb-2">Nome do Responsável *</label>
                            <input type="text" id="nome-responsavel" placeholder="Nome completo" 
                                   class="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-600 text-white focus:border-amber-500 outline-none transition-colors">
                        </div>
                        <div>
                            <label class="block text-gray-300 text-sm font-semibold mb-2">WhatsApp *</label>
                            <input type="tel" id="whatsapp-parceiro" placeholder="(11) 99999-9999" 
                                   class="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-600 text-white focus:border-amber-500 outline-none transition-colors">
                        </div>
                    </div>
                    <div class="mt-4">
                        <label class="block text-gray-300 text-sm font-semibold mb-2">Email *</label>
                        <input type="email" id="email-parceiro" placeholder="contato@empresa.com" 
                               class="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-600 text-white focus:border-amber-500 outline-none transition-colors">
                    </div>
                </div>
                
                <!-- Resumo do Plano -->
                <div class="bg-gradient-to-r from-amber-900/20 to-orange-900/20 rounded-lg p-6 border border-amber-700/30">
                    <h4 class="text-amber-400 font-semibold mb-3">📦 Resumo do Plano ${info.nome}</h4>
                    <div class="grid md:grid-cols-2 gap-4">
                        <div>
                            <ul class="text-gray-300 text-sm space-y-2">
                                ${info.features.map(feature => `<li>✅ ${feature}</li>`).join('')}
                            </ul>
                        </div>
                        <div class="text-right">
                            <div class="text-2xl font-bold text-white">R$ ${valor}/mês</div>
                            <div class="text-amber-400 text-sm">${info.leads}</div>
                            <div class="text-green-400 text-sm">Comissão ${info.comissao}</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Footer -->
            <div class="p-6 border-t border-gray-700">
                <div class="flex gap-3">
                    <button onclick="fecharCadastroParceiro()" 
                            class="flex-1 py-3 px-6 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition-colors">
                        Cancelar
                    </button>
                    <button onclick="finalizarCadastroParceiro('${plano}', ${valor})" 
                            class="flex-1 py-3 px-6 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-black rounded-lg font-semibold transition-all duration-300">
                        Finalizar Cadastro
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modalParceiro);
}

function fecharCadastroParceiro() {
    const modal = document.querySelector('.fixed.inset-0.bg-black\\/80');
    if (modal) {
        modal.remove();
    }
}

function finalizarCadastroParceiro(plano, valor) {
    const dados = {
        nomeEmpresa: document.getElementById('nome-empresa').value,
        cnpj: document.getElementById('cnpj-empresa').value,
        tipoNegocio: document.getElementById('tipo-negocio').value,
        endereco: document.getElementById('endereco-parceiro').value,
        raioAtuacao: document.getElementById('raio-atuacao').value,
        desconto: document.getElementById('desconto-oferecido').value,
        descricaoOferta: document.getElementById('descricao-oferta').value,
        nomeResponsavel: document.getElementById('nome-responsavel').value,
        whatsapp: document.getElementById('whatsapp-parceiro').value,
        email: document.getElementById('email-parceiro').value,
        plano: plano,
        valor: valor
    };
    
    // Validação básica
    const camposObrigatorios = ['nomeEmpresa', 'cnpj', 'tipoNegocio', 'endereco', 'nomeResponsavel', 'whatsapp', 'email'];
    const campoVazio = camposObrigatorios.find(campo => !dados[campo]);
    
    if (campoVazio) {
        alert('Por favor, preencha todos os campos obrigatórios.');
        return;
    }
    
    // Simular processamento
    const botaoFinalizar = document.querySelector('button[onclick*="finalizarCadastroParceiro"]');
    if (botaoFinalizar) {
        botaoFinalizar.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Processando...';
        botaoFinalizar.disabled = true;
    }
    
    setTimeout(() => {
        fecharCadastroParceiro();
        mostrarSucessoParceiro(dados);
        
        // Salvar dados localmente (em produção, enviar para API)
        const parceirosExistentes = JSON.parse(localStorage.getItem('parceiros_cadastrados') || '[]');
        parceirosExistentes.push({
            ...dados,
            id: Date.now(),
            dataCadastro: new Date().toISOString(),
            status: 'ativo',
            leadsRecebidos: 0,
            vendas: 0,
            faturamento: 0
        });
        localStorage.setItem('parceiros_cadastrados', JSON.stringify(parceirosExistentes));
        
        console.log('🏢 Novo parceiro cadastrado:', dados);
        console.log('📊 Total de parceiros:', parceirosExistentes.length);
        
        // Simular envio de email de boas-vindas
        setTimeout(() => {
            console.log('📧 Email de boas-vindas enviado para:', dados.email);
        }, 1000);
        
    }, 2000);
}

function mostrarSucessoParceiro(dados) {
    const modalSucesso = document.createElement('div');
    modalSucesso.className = 'fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4';
    modalSucesso.innerHTML = `
        <div class="bg-gray-900 rounded-2xl max-w-md w-full border border-green-500 shadow-2xl">
            <div class="p-8 text-center">
                <div class="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i class="fas fa-handshake text-white text-2xl"></i>
                </div>
                <h3 class="text-2xl font-bold text-white mb-2">Parceria Confirmada!</h3>
                <p class="text-gray-300 mb-4">
                    Bem-vindo à rede Sons of Peaky, <strong>${dados.nomeEmpresa}</strong>!
                </p>
                
                <div class="bg-gradient-to-r from-amber-900/20 to-orange-900/20 rounded-lg p-4 border border-amber-700/30 mb-6">
                    <p class="text-amber-400 font-semibold text-sm mb-2">🎉 Próximos Passos:</p>
                    <ul class="text-gray-300 text-sm space-y-1 text-left">
                        <li>✅ Análise do cadastro (até 24h)</li>
                        <li>✅ Configuração no sistema</li>
                        <li>✅ Acesso ao dashboard enviado por email</li>
                        <li>✅ Primeiros leads em até 48h</li>
                    </ul>
                </div>
                
                <div class="bg-gray-800/50 rounded-lg p-4 mb-6">
                    <div class="text-center">
                        <div class="text-lg font-bold text-white">Plano ${dados.plano.charAt(0).toUpperCase() + dados.plano.slice(1)}</div>
                        <div class="text-2xl font-bold text-green-400">R$ ${dados.valor}/mês</div>
                        <div class="text-gray-400 text-sm">Cobrança inicia em 7 dias</div>
                    </div>
                </div>
                
                <p class="text-gray-400 text-sm mb-6">
                    📧 Enviamos um email com todos os detalhes para <strong>${dados.email}</strong>
                </p>
                
                <button onclick="this.parentElement.parentElement.remove()" 
                        class="w-full py-3 px-6 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-black rounded-lg font-semibold transition-all duration-300">
                    Perfeito!
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modalSucesso);
}

// ===== CALCULADORA DE ROI =====

function calcularROI() {
    const ticketMedio = parseFloat(document.getElementById('ticket-medio')?.value) || 150;
    const clientesMes = parseInt(document.getElementById('clientes-mes')?.value) || 50;
    const investimento = 399; // Plano Premium como padrão
    
    const faturamentoMensal = ticketMedio * clientesMes;
    const roi = ((faturamentoMensal - investimento) / investimento * 100).toFixed(0);
    const paybackDias = (investimento / (faturamentoMensal / 30)).toFixed(1);
    
    // Atualizar interface
    if (document.getElementById('faturamento-resultado')) {
        document.getElementById('faturamento-resultado').textContent = `R$ ${faturamentoMensal.toLocaleString('pt-BR')}`;
    }
    
    if (document.getElementById('investimento-valor')) {
        document.getElementById('investimento-valor').textContent = `R$ ${investimento}`;
        document.getElementById('faturamento-valor').textContent = `R$ ${faturamentoMensal.toLocaleString('pt-BR')}`;
        document.getElementById('roi-valor').textContent = `${roi}%`;
        
        // Atualizar payback
        const paybackElement = document.querySelector('[class*="text-blue-400"].font-bold');
        if (paybackElement) {
            paybackElement.textContent = `${paybackDias} dias`;
        }
    }
}

// ===== MÁQUINA AUTOMÁTICA DE AQUISIÇÃO DE PARCEIROS =====

function iniciarMaquinaParceiros() {
    // Detectar se é um possível empresário (baseado no comportamento)
    let pontuacaoEmpresario = 0;
    let tempoNoSite = 0;
    let cliquesFerramentas = 0;
    
    // Monitorar comportamento
    document.addEventListener('click', function(e) {
        if (e.target.closest('#ferramentas') || e.target.closest('#precos')) {
            cliquesFerramentas++;
            pontuacaoEmpresario += 10;
        }
        
        if (e.target.closest('#parcerias')) {
            pontuacaoEmpresario += 20;
        }
        
        verificarMostrarWidget();
    });
    
    // Monitorar tempo no site
    setInterval(() => {
        tempoNoSite += 5;
        if (tempoNoSite > 30) pontuacaoEmpresario += 5; // 30+ segundos
        if (tempoNoSite > 60) pontuacaoEmpresario += 10; // 1+ minuto
        if (tempoNoSite > 120) pontuacaoEmpresario += 15; // 2+ minutos
        
        verificarMostrarWidget();
    }, 5000);
    
    // Intent to leave (mouse sai da tela)
    document.addEventListener('mouseleave', function() {
        if (tempoNoSite > 15) {
            pontuacaoEmpresario += 25;
            verificarMostrarWidget();
        }
    });
    
    function verificarMostrarWidget() {
        const jaViuWidget = localStorage.getItem('widget_parceiro_visto');
        const jaEParceiro = localStorage.getItem('ja_eh_parceiro');
        
        if (!jaViuWidget && !jaEParceiro && pontuacaoEmpresario >= 25) {
            setTimeout(() => mostrarWidgetParceiro(), 2000);
        }
    }
    
    // Atualizar números em tempo real
    atualizarNumerosLive();
    setInterval(atualizarNumerosLive, 8000); // A cada 8 segundos
    
    // Iniciar countdown
    iniciarCountdown();
}

function mostrarWidgetParceiro() {
    const widget = document.getElementById('partner-magnet');
    if (widget) {
        widget.classList.remove('hidden');
        widget.classList.add('animate-slideInRight');
        
        // Marcar como visto
        localStorage.setItem('widget_parceiro_visto', 'true');
        
        // Auto-hide após 15 segundos se não interagir
        setTimeout(() => {
            if (!widget.classList.contains('hidden')) {
                widget.classList.add('animate-slideOutRight');
                setTimeout(() => widget.classList.add('hidden'), 500);
            }
        }, 15000);
    }
}

function atualizarNumerosLive() {
    // Simular números dinâmicos para criar urgência
    const baseUsers = 3200;
    const variation = Math.floor(Math.random() * 100);
    const usersOnline = baseUsers + variation;
    
    const baseLeads = 120;
    const leadsVariation = Math.floor(Math.random() * 20);
    const leadsHoje = baseLeads + leadsVariation;
    
    const basePartners = 840;
    const partnersVariation = Math.floor(Math.random() * 15);
    const partnersCount = basePartners + partnersVariation;
    
    const baseSignups = 8;
    const signupsVariation = Math.floor(Math.random() * 8);
    const liveSignups = baseSignups + signupsVariation;
    
    // Vagas restantes (sempre entre 1-5 para criar urgência)
    const vagasRestantes = Math.floor(Math.random() * 4) + 1;
    
    // Atualizar DOM
    const elements = {
        'users-online': usersOnline.toLocaleString('pt-BR'),
        'leads-hoje': leadsHoje,
        'partners-count': partnersCount,
        'live-signups': liveSignups,
        'vagas-restantes': vagasRestantes
    };
    
    Object.keys(elements).forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            // Animação de mudança
            element.style.transform = 'scale(1.1)';
            element.style.color = '#10b981';
            
            setTimeout(() => {
                element.textContent = elements[id];
                element.style.transform = 'scale(1)';
                element.style.color = '';
            }, 200);
        }
    });
}

function iniciarCountdown() {
    // Countdown de 24 horas que reinicia automaticamente
    let tempoRestante = localStorage.getItem('countdown_partner');
    
    if (!tempoRestante) {
        // Iniciar countdown de 24 horas
        const agora = new Date().getTime();
        const amanha = agora + (24 * 60 * 60 * 1000);
        tempoRestante = amanha;
        localStorage.setItem('countdown_partner', tempoRestante);
    }
    
    const countdownInterval = setInterval(() => {
        const agora = new Date().getTime();
        const diferenca = tempoRestante - agora;
        
        if (diferenca > 0) {
            const horas = Math.floor(diferenca / (1000 * 60 * 60));
            const minutos = Math.floor((diferenca % (1000 * 60 * 60)) / (1000 * 60));
            const segundos = Math.floor((diferenca % (1000 * 60)) / 1000);
            
            const timer = document.getElementById('countdown-timer');
            if (timer) {
                timer.textContent = `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;
            }
        } else {
            // Reiniciar countdown
            const novoTempo = new Date().getTime() + (24 * 60 * 60 * 1000);
            localStorage.setItem('countdown_partner', novoTempo);
            tempoRestante = novoTempo;
        }
    }, 1000);
}

function abrirCapturaRapida() {
    const modal = document.getElementById('modal-captura');
    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        
        // Analytics: captura iniciada
        console.log('🎯 Captura de parceiro iniciada');
        
        // Focar no primeiro campo
        setTimeout(() => {
            const nomeInput = document.getElementById('nome-rapido');
            if (nomeInput) nomeInput.focus();
        }, 300);
    }
}

function fecharCapturaRapida() {
    const modal = document.getElementById('modal-captura');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
}

function fecharWidgetParceiro() {
    const widget = document.getElementById('partner-magnet');
    if (widget) {
        widget.classList.add('hidden');
        
        // Marcar para não mostrar novamente nesta sessão
        sessionStorage.setItem('widget_fechado', 'true');
    }
}

function enviarCapturaRapida() {
    const nome = document.getElementById('nome-rapido').value.trim();
    const whatsapp = document.getElementById('whatsapp-rapido').value.trim();
    const tipo = document.getElementById('tipo-rapido').value;
    
    if (!nome || !whatsapp || !tipo) {
        alert('Por favor, preencha todos os campos.');
        return;
    }
    
    // Criar lead
    const lead = {
        id: Date.now(),
        nome: nome,
        whatsapp: whatsapp,
        tipo: tipo,
        fonte: 'widget_captura',
        timestamp: new Date().toISOString(),
        status: 'novo',
        score: calcularScoreLead(nome, tipo)
    };
    
    // Salvar lead
    const leads = JSON.parse(localStorage.getItem('leads_parceiros') || '[]');
    leads.push(lead);
    localStorage.setItem('leads_parceiros', JSON.stringify(leads));
    
    // Simular envio
    const botao = document.querySelector('button[onclick="enviarCapturaRapida()"]');
    botao.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>ENVIANDO...';
    botao.disabled = true;
    
    setTimeout(() => {
        fecharCapturaRapida();
        mostrarSucessoCaptura(lead);
        
        // Iniciar sequência automatizada
        iniciarSequenciaAutomatizada(lead);
        
    }, 1500);
    
    console.log('🎯 Lead capturado:', lead);
}

function calcularScoreLead(nome, tipo) {
    let score = 50; // Base
    
    // Tipo de negócio
    const scoresPorTipo = {
        'hotel': 90,
        'restaurante': 85,
        'posto': 95,
        'oficina': 80,
        'turismo': 75,
        'outro': 60
    };
    
    score += scoresPorTipo[tipo] || 60;
    
    // Nome da empresa (keywords que indicam maior potencial)
    const keywordsAltoValor = ['hotel', 'pousada', 'resort', 'restaurante', 'posto', 'shell', 'br', 'ipiranga'];
    const nomeUpper = nome.toUpperCase();
    
    keywordsAltoValor.forEach(keyword => {
        if (nomeUpper.includes(keyword.toUpperCase())) {
            score += 15;
        }
    });
    
    return Math.min(score, 100);
}

function mostrarSucessoCaptura(lead) {
    // Criar notificação de sucesso
    const notificacao = document.createElement('div');
    notificacao.className = 'fixed top-4 right-4 z-50 bg-green-600 text-white rounded-xl p-4 shadow-2xl max-w-sm border border-green-500';
    notificacao.innerHTML = `
        <div class="flex items-start gap-3">
            <div class="bg-white/20 rounded-full p-2 flex-shrink-0">
                <i class="fas fa-check text-lg"></i>
            </div>
            <div class="flex-1">
                <h4 class="font-bold text-sm mb-1">🎉 Lead Capturado!</h4>
                <p class="text-green-100 text-xs mb-2">
                    ${lead.nome} está na nossa lista prioritária
                </p>
                <div class="text-xs text-green-200">
                    ⚡ Nossa equipe vai entrar em contato em até 15 minutos
                </div>
            </div>
            <button onclick="this.parentElement.parentElement.remove()" class="text-white/70 hover:text-white">
                <i class="fas fa-times text-sm"></i>
            </button>
        </div>
    `;
    
    document.body.appendChild(notificacao);
    
    // Auto-remove após 8 segundos
    setTimeout(() => {
        if (notificacao.parentElement) {
            notificacao.remove();
        }
    }, 8000);
}

function iniciarSequenciaAutomatizada(lead) {
    // Sequência de follow-up automatizada
    const sequencias = [
        {
            delay: 300000, // 5 minutos
            tipo: 'whatsapp',
            template: `Oi ${lead.nome}! Vi que vocês se interessaram pelos nossos leads de motociclistas. Tenho uma proposta especial que expira hoje. Posso ligar em 2 minutos?`
        },
        {
            delay: 900000, // 15 minutos  
            tipo: 'email',
            template: `Proposta exclusiva para ${lead.nome} - ROI garantido de 400%+`
        },
        {
            delay: 3600000, // 1 hora
            tipo: 'whatsapp',
            template: `${lead.nome}, separei dados reais da sua região: ${Math.floor(Math.random() * 50 + 30)} motociclistas passaram por aí semana passada. Quer ver os detalhes?`
        }
    ];
    
    sequencias.forEach(sequencia => {
        setTimeout(() => {
            enviarMensagemAutomatizada(lead, sequencia);
        }, sequencia.delay);
    });
    
    console.log('🤖 Sequência automatizada iniciada para:', lead.nome);
    
    // Disparar email marketing personalizado
    setTimeout(() => {
        enviarEmailMarketingPersonalizado(lead);
    }, 30000); // 30 segundos após captura
}

function enviarMensagemAutomatizada(lead, sequencia) {
    // Em produção, integraria com APIs do WhatsApp/Email
    console.log(`📱 [${sequencia.tipo.toUpperCase()}] para ${lead.nome}:`, sequencia.template);
    
    // Simular envio bem-sucedido
    const logs = JSON.parse(localStorage.getItem('automation_logs') || '[]');
    logs.push({
        leadId: lead.id,
        tipo: sequencia.tipo,
        timestamp: new Date().toISOString(),
        status: 'enviado',
        template: sequencia.template
    });
    localStorage.setItem('automation_logs', JSON.stringify(logs));
}

// ===== SISTEMA DE EMAIL MARKETING AUTOMATIZADO =====

function enviarEmailMarketingPersonalizado(lead) {
    // Dados regionais simulados (em produção viria de analytics reais)
    const dadosRegionais = gerarDadosRegionais(lead);
    
    const emailTemplate = criarEmailPersonalizado(lead, dadosRegionais);
    
    // Simular envio (em produção usaria SendGrid, Mailchimp, etc.)
    console.log('📧 Email marketing enviado para:', lead.nome);
    console.log('Template:', emailTemplate);
    
    // Salvar no log
    const emailLogs = JSON.parse(localStorage.getItem('email_marketing_logs') || '[]');
    emailLogs.push({
        leadId: lead.id,
        email: emailTemplate,
        dadosRegionais: dadosRegionais,
        timestamp: new Date().toISOString(),
        status: 'enviado'
    });
    localStorage.setItem('email_marketing_logs', JSON.stringify(emailLogs));
    
    // Agendar follow-up
    setTimeout(() => {
        enviarFollowUpAutomatico(lead, dadosRegionais);
    }, 86400000); // 24 horas depois
}

function gerarDadosRegionais(lead) {
    // Simular dados baseados no nome/região (em produção seria geolocalização real)
    const regioes = {
        'sp': {
            nome: 'São Paulo',
            motociclistas: Math.floor(Math.random() * 500 + 800),
            gastoMedio: Math.floor(Math.random() * 200 + 650),
            crescimento: Math.floor(Math.random() * 20 + 15),
            concorrentes: Math.floor(Math.random() * 5 + 2)
        },
        'rj': {
            nome: 'Rio de Janeiro', 
            motociclistas: Math.floor(Math.random() * 300 + 600),
            gastoMedio: Math.floor(Math.random() * 150 + 700),
            crescimento: Math.floor(Math.random() * 15 + 20),
            concorrentes: Math.floor(Math.random() * 4 + 3)
        },
        'mg': {
            nome: 'Minas Gerais',
            motociclistas: Math.floor(Math.random() * 400 + 500),
            gastoMedio: Math.floor(Math.random() * 100 + 550),
            crescimento: Math.floor(Math.random() * 25 + 18),
            concorrentes: Math.floor(Math.random() * 3 + 1)
        }
    };
    
    // Detectar região (simulado)
    const nomeUpper = lead.nome.toUpperCase();
    let regiao = 'sp'; // Default
    
    if (nomeUpper.includes('RIO') || nomeUpper.includes('RJ')) regiao = 'rj';
    if (nomeUpper.includes('MINAS') || nomeUpper.includes('MG') || nomeUpper.includes('BH')) regiao = 'mg';
    
    return regioes[regiao];
}

function criarEmailPersonalizado(lead, dados) {
    const tipoNegocio = {
        'hotel': 'hospedagem',
        'restaurante': 'alimentação',
        'posto': 'combustível',
        'oficina': 'serviços automotivos',
        'turismo': 'turismo',
        'outro': 'serviços'
    };
    
    const roi = Math.floor(((dados.gastoMedio * 30 * 0.05) / 399) * 100); // ROI estimado
    
    return {
        assunto: `🏍️ ${dados.motociclistas} motociclistas na região de ${dados.nome} - Oportunidade Exclusiva!`,
        corpo: `
        Olá, ${lead.nome}!
        
        Vi que vocês atuam no setor de ${tipoNegocio[lead.tipo]} e tenho dados que vão interessar muito:
        
        📊 DADOS EXCLUSIVOS DA SUA REGIÃO (${dados.nome}):
        • ${dados.motociclistas} motociclistas ativos no último mês
        • Gasto médio por viagem: R$ ${dados.gastoMedio}
        • Crescimento do segmento: +${dados.crescimento}% este ano
        • Apenas ${dados.concorrentes} concorrentes diretos cadastrados
        
        💰 OPORTUNIDADE REAL:
        Com nosso sistema, vocês podem capturar pelo menos 50 desses clientes por mês.
        
        ROI estimado: ${roi}% no primeiro mês
        Investimento: R$ 399/mês
        Retorno projetado: R$ ${dados.gastoMedio * 50 * 0.15}/mês
        
        🔥 URGENTE: Temos apenas 2 vagas abertas para ${dados.nome}.
        
        Quer uma demonstração gratuita de 15 minutos?
        
        Responda este email ou chame no WhatsApp: (11) 99999-9999
        
        Abraços,
        Gabriel - Sons of Peaky Business
        
        P.S.: Se responder em 24h, garantimos desconto de 50% no primeiro mês.
        `
    };
}

function enviarFollowUpAutomatico(lead, dados) {
    const followUps = [
        {
            delay: 0,
            template: criarFollowUp1(lead, dados)
        },
        {
            delay: 172800000, // 2 dias
            template: criarFollowUp2(lead, dados)  
        },
        {
            delay: 604800000, // 7 dias
            template: criarFollowUpFinal(lead, dados)
        }
    ];
    
    followUps.forEach(followUp => {
        setTimeout(() => {
            console.log('📧 Follow-up enviado para:', lead.nome);
            console.log(followUp.template);
            
            // Log do follow-up
            const logs = JSON.parse(localStorage.getItem('followup_logs') || '[]');
            logs.push({
                leadId: lead.id,
                template: followUp.template,
                timestamp: new Date().toISOString()
            });
            localStorage.setItem('followup_logs', JSON.stringify(logs));
            
        }, followUp.delay);
    });
}

function criarFollowUp1(lead, dados) {
    return {
        assunto: `${lead.nome} - Case de Sucesso: +R$ 12.000/mês em 30 dias`,
        corpo: `
        Oi ${lead.nome}!
        
        Não sei se você viu meu email anterior sobre os ${dados.motociclistas} motociclistas da região de ${dados.nome}.
        
        Queria compartilhar um case real que aconteceu semana passada:
        
        🏨 Pousada Serra Verde (Campos do Jordão):
        • Investimento: R$ 399/mês
        • Leads recebidos em 30 dias: 127
        • Reservas convertidas: 43
        • Faturamento adicional: R$ 12.400
        • ROI: 3.106%
        
        O segredo? Eles apareceram nos roteiros de 15.000+ motociclistas que usam nosso gerador.
        
        Separei os mesmos dados para a região de ${dados.nome}. Quer ver?
        
        WhatsApp: (11) 99999-9999
        
        Gabriel
        `
    };
}

function criarFollowUp2(lead, dados) {
    return {
        assunto: `ÚLTIMA CHANCE: Vaga para ${dados.nome} expira amanhã`,
        corpo: `
        ${lead.nome},
        
        Está sendo difícil encontrar você!
        
        Tenho más notícias: das 3 vagas que abri para ${dados.nome}, restam apenas 1.
        
        Uma padaria de Atibaia acabou de fechar conosco e já recebeu 23 leads hoje.
        
        ⚠️ A vaga expira às 18h de amanhã e vai para lista de espera.
        
        Não deixe seus concorrentes chegarem na frente.
        
        Última chance: WhatsApp (11) 99999-9999
        
        Gabriel
        `
    };
}

function criarFollowUpFinal(lead, dados) {
    return {
        assunto: `Adeus ${lead.nome} - lista de espera aberta`,
        corpo: `
        ${lead.nome},
        
        É uma pena.
        
        A vaga para ${dados.nome} foi preenchida por um restaurante da região.
        
        Eles já começaram a receber leads hoje.
        
        Vou colocar vocês na lista de espera. Quando abrir nova vaga, entro em contato.
        
        (Entre nós: se mudaram de ideia, ainda consigo uma vaga até meia-noite)
        
        WhatsApp: (11) 99999-9999
        
        Gabriel
        
        P.S.: O restaurante que pegou a vaga já faturou R$ 2.300 hoje. Só avisando.
        `
    };
}

// ===== SISTEMA DE PROSPECÇÃO AUTOMATIZADA =====

function iniciarProspeccaoAutomatizada() {
    // Simular prospecção de empresas (em produção seria web scraping + AI)
    const empresasProspectadas = gerarEmpresasParaProspectar();
    
    empresasProspectadas.forEach((empresa, index) => {
        setTimeout(() => {
            enviarPropostaAutomatizada(empresa);
        }, index * 5000); // 5 segundos entre cada envio
    });
}

function gerarEmpresasParaProspectar() {
    // Lista simulada (em produção viria de APIs como Google Places, etc.)
    return [
        {
            nome: 'Hotel Fazenda Vista Verde',
            tipo: 'hotel',
            telefone: '(11) 97777-7777',
            cidade: 'Campos do Jordão',
            score: 85
        },
        {
            nome: 'Restaurante Estrada Real',
            tipo: 'restaurante', 
            telefone: '(31) 98888-8888',
            cidade: 'Tiradentes',
            score: 92
        },
        {
            nome: 'Pousada do Pescador',
            tipo: 'hotel',
            telefone: '(13) 96666-6666',
            cidade: 'Ubatuba',
            score: 78
        }
    ];
}

function enviarPropostaAutomatizada(empresa) {
    const proposta = {
        empresa: empresa,
        template: criarPropostaPersonalizada(empresa),
        timestamp: new Date().toISOString(),
        status: 'enviada'
    };
    
    // Simular envio via WhatsApp Business API
    console.log('🤖 Proposta automatizada enviada para:', empresa.nome);
    console.log('Template:', proposta.template);
    
    // Salvar no log
    const prospeccoesLogs = JSON.parse(localStorage.getItem('prospeccao_logs') || '[]');
    prospeccoesLogs.push(proposta);
    localStorage.setItem('prospeccao_logs', JSON.stringify(prospeccoesLogs));
}

function criarPropostaPersonalizada(empresa) {
    const motivosPorTipo = {
        'hotel': 'motociclistas precisam de hospedagem em suas viagens',
        'restaurante': 'motociclistas param para comer durante os rolês',
        'posto': 'motociclistas precisam abastecer nas viagens',
        'oficina': 'motociclistas precisam de manutenção preventiva'
    };
    
    const leads = Math.floor(Math.random() * 50 + 30);
    const faturamento = leads * 85; // Ticket médio R$ 85
    
    return `
    Olá! Sou do Sons of Peaky, a maior plataforma de motociclistas do Brasil.
    
    Vi que vocês são referência em ${empresa.cidade} e tenho uma oportunidade:
    
    🏍️ ${leads} motociclistas passaram por ${empresa.cidade} no último mês
    💰 Potencial de faturamento: R$ ${faturamento}/mês
    
    Por que isso interessa ao ${empresa.nome}?
    Porque ${motivosPorTipo[empresa.tipo]}.
    
    Nossa plataforma conecta automaticamente estabelecimentos aos roteiros.
    
    Quer saber como funciona? Tenho 5 minutos agora.
    
    Gabriel - Sons of Peaky
    (11) 99999-9999
    `;
}

// ===== SISTEMA DE ESCASSEZ DINÂMICA =====

function iniciarSistemaEscassez() {
    // Controlar vagas disponíveis dinamicamente
    const escassezConfig = {
        vagasIniciais: 10,
        vagasPorRegiao: 3,
        tempoReposicao: 24 * 60 * 60 * 1000, // 24 horas
        pressaoMinima: 1 // Sempre manter pelo menos 1 vaga "restante"
    };
    
    // Atualizar vagas baseado no tempo e conversões
    setInterval(() => {
        atualizarVagasDisponiveis();
    }, 60000); // A cada minuto
    
    // Criar eventos de conversão fake para pressão social
    setInterval(() => {
        criarEventoConversaoFake();
    }, Math.random() * 300000 + 300000); // Entre 5-10 minutos
}

function atualizarVagasDisponiveis() {
    const agora = Date.now();
    const ultimaAtualizacao = localStorage.getItem('ultima_atualizacao_vagas');
    
    if (!ultimaAtualizacao || agora - ultimaAtualizacao > 24 * 60 * 60 * 1000) {
        // Reset diário das vagas
        const novasVagas = Math.floor(Math.random() * 5) + 1; // 1-5 vagas
        localStorage.setItem('vagas_disponiveis', novasVagas);
        localStorage.setItem('ultima_atualizacao_vagas', agora);
        
        console.log('🔄 Vagas resetadas:', novasVagas);
    }
    
    // Simular ocupação gradual ao longo do dia
    const horaAtual = new Date().getHours();
    const pressao = horaAtual >= 9 && horaAtual <= 18 ? 0.3 : 0.1; // Maior pressão no horário comercial
    
    if (Math.random() < pressao) {
        const vagasAtuais = parseInt(localStorage.getItem('vagas_disponiveis') || '3');
        if (vagasAtuais > 1) {
            localStorage.setItem('vagas_disponiveis', vagasAtuais - 1);
            console.log('📉 Vaga ocupada. Restantes:', vagasAtuais - 1);
        }
    }
}

function criarEventoConversaoFake() {
    const empresasFake = [
        'Hotel Serra Azul',
        'Restaurante da Estrada',
        'Pousada Vista Verde',
        'Posto Rota 101',
        'Oficina Moto Express',
        'Lanchonete do Motoqueiro',
        'Churrascaria Bom Demais',
        'Hotel Fazenda Feliz'
    ];
    
    const cidades = [
        'Campos do Jordão',
        'Ubatuba',
        'Tiradentes',
        'Atibaia',
        'Socorro',
        'Brotas',
        'Águas de Lindóia',
        'Monte Verde'
    ];
    
    const empresa = empresasFake[Math.floor(Math.random() * empresasFake.length)];
    const cidade = cidades[Math.floor(Math.random() * cidades.length)];
    
    // Criar notificação de conversão social
    const notificacao = document.createElement('div');
    notificacao.className = 'fixed bottom-20 left-4 z-40 bg-green-600 text-white rounded-lg p-3 shadow-lg max-w-xs animate-slideInLeft';
    notificacao.innerHTML = `
        <div class="flex items-start gap-2">
            <div class="bg-white/20 rounded-full p-1 flex-shrink-0 mt-0.5">
                <i class="fas fa-check text-xs"></i>
            </div>
            <div class="flex-1 min-w-0">
                <p class="text-xs font-semibold">${empresa}</p>
                <p class="text-green-100 text-xs">${cidade} • acabou de se cadastrar</p>
                <p class="text-green-200 text-xs mt-1">💰 +R$ 850 em leads hoje</p>
            </div>
        </div>
    `;
    
    document.body.appendChild(notificacao);
    
    // Auto-remove após 6 segundos
    setTimeout(() => {
        notificacao.classList.add('animate-slideOutLeft');
        setTimeout(() => {
            if (notificacao.parentElement) {
                notificacao.remove();
            }
        }, 500);
    }, 6000);
    
    console.log('🎭 Evento de conversão social criado:', empresa, cidade);
}

// ===== ANALYTICS E MÉTRICAS DA MÁQUINA =====

function gerarRelatorioMaquina() {
    const leads = JSON.parse(localStorage.getItem('leads_parceiros') || '[]');
    const emails = JSON.parse(localStorage.getItem('email_marketing_logs') || '[]');
    const followups = JSON.parse(localStorage.getItem('followup_logs') || '[]');
    const prospeccoes = JSON.parse(localStorage.getItem('prospeccao_logs') || '[]');
    
    const relatorio = {
        totalLeads: leads.length,
        leadsHoje: leads.filter(l => {
            const hoje = new Date().toDateString();
            return new Date(l.timestamp).toDateString() === hoje;
        }).length,
        emailsEnviados: emails.length,
        followupsEnviados: followups.length,
        prospeccoesManuais: prospeccoes.length,
        taxaConversao: leads.length > 0 ? (leads.filter(l => l.status === 'convertido').length / leads.length * 100).toFixed(1) : 0,
        scoreMedia: leads.length > 0 ? (leads.reduce((acc, l) => acc + l.score, 0) / leads.length).toFixed(1) : 0
    };
    
    console.log('📊 RELATÓRIO DA MÁQUINA DE PARCEIROS:');
    console.table(relatorio);
    
    return relatorio;
}

// Inicializar todos os sistemas automatizados
document.addEventListener('DOMContentLoaded', function() {
    // Aguardar 5 segundos para não interferir com outros scripts
    setTimeout(() => {
        iniciarSistemaEscassez();
        
        // Prospecção automatizada (apenas em horário comercial)
        const horaAtual = new Date().getHours();
        if (horaAtual >= 9 && horaAtual <= 18) {
            setTimeout(() => {
                iniciarProspeccaoAutomatizada();
            }, 60000); // 1 minuto após carregar
        }
        
        // Relatório diário
        setTimeout(() => {
            gerarRelatorioMaquina();
        }, 10000); // 10 segundos após carregar
        
    }, 5000);
});