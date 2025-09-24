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
    
    // Feedback visual
    alert(`Rolê escolhido: ${sugestao.nome}\n\nRoteiro salvo! Você pode compartilhar com o grupo.`);
    
    // Scroll para o topo
    document.querySelector('#ferramentas').scrollIntoView({ behavior: 'smooth' });
}

// Compartilhar rolê
async function compartilharRole(index) {
    const sugestao = window.sugestoesRole?.[index];
    if (!sugestao) return;
    
    const textoCompartilhamento = `🏍️ ROLÊ SONS OF PEAKY 🏍️

📍 DESTINO: ${sugestao.nome}
🎯 EXPERIÊNCIA: ${sugestao.experiencia}

📋 DETALHES:
• 📏 Distância: ${sugestao.distanciaKm}km
• ⏱️ Tempo: ${sugestao.tempoViagem}
• 💰 Custo total: R$ ${sugestao.custos.total}

🗺️ ENDEREÇO:
${sugestao.endereco}

🛣️ ROTEIRO:
${sugestao.roteiro}

💡 DICAS:
${sugestao.dicasEspeciais}

#SonsOfPeaky #Motociclismo #Brotherhood`;
    
    // Tentar Web Share API
    if (navigator.share) {
        try {
            await navigator.share({
                title: `Rolê SOP: ${sugestao.nome}`,
                text: textoCompartilhamento
            });
            return;
        } catch (error) {
            console.log('Web Share cancelado');
        }
    }
    
    // Fallback: copiar para clipboard
    try {
        await navigator.clipboard.writeText(textoCompartilhamento);
        alert('Rolê copiado para área de transferência! 📋');
    } catch (error) {
        alert('Não foi possível compartilhar automaticamente. Copie manualmente o texto abaixo:\n\n' + textoCompartilhamento);
    }
}

// Funções auxiliares
function mostrarLoading() {
    document.getElementById('resultados-container').classList.remove('hidden');
    document.getElementById('loading-role').classList.remove('hidden');
    document.getElementById('sugestoes-role').classList.add('hidden');
}

function esconderLoading() {
    document.getElementById('loading-role').classList.add('hidden');
    document.getElementById('sugestoes-role').classList.remove('hidden');
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