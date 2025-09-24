/**
 * Gerador de Rolês de Moto - JavaScript Principal
 * Sistema completo de geração de roteiros personalizados
 */

// Configuração da API - usando config.js centralizado
function getAPIConfig() {
    if (typeof window !== 'undefined' && window.SOP_CONFIG) {
        return {
            apiKey: window.SOP_CONFIG.apiKey,
            apiUrl: window.SOP_CONFIG.textUrl
        };
    }
    // Fallback caso config.js não esteja carregado
    return {
        apiKey: 'AIzaSyCiHRVozYYmHB-5W64QdJzn9dQYAyRl9Tk',
        apiUrl: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=AIzaSyCiHRVozYYmHB-5W64QdJzn9dQYAyRl9Tk'
    };
}

// Cache para melhor performance
const cache = new Map();
const CACHE_DURATION = 1000 * 60 * 30; // 30 minutos

// Estado da aplicação
let isGenerating = false;
let currentResults = [];

/**
 * Inicialização da aplicação
 */
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    setupFormValidation();
    loadSavedData();
});

/**
 * Inicializa a aplicação
 */
function initializeApp() {
    console.log('🚀 Gerador de Rolês iniciado');
    
    // Define data atual
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('data-role').value = today;
    
    // Carrega destinos se disponível
    if (typeof destinos !== 'undefined') {
        console.log(`📍 ${destinos.length} destinos carregados`);
    }
    
    // Inicializa PWA
    initializePWA();
    
    // Analytics
    trackPageView();
}

/**
 * Configuração dos event listeners
 */
function setupEventListeners() {
    const form = document.getElementById('gerador-form');
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }
    
    // Auto-save no formulário
    const inputs = form.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        input.addEventListener('change', saveFormData);
        input.addEventListener('input', debounce(saveFormData, 1000));
    });
    
    // Smooth scroll para resultados
    window.addEventListener('scroll', handleScroll);
}

/**
 * Configuração de validação do formulário
 */
function setupFormValidation() {
    const form = document.getElementById('gerador-form');
    const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
    
    inputs.forEach(input => {
        input.addEventListener('blur', validateField);
        input.addEventListener('input', clearFieldError);
    });
}

/**
 * Manipula o envio do formulário
 */
async function handleFormSubmit(event) {
    event.preventDefault();
    
    if (isGenerating) {
        showNotification('⏳ Aguarde a geração atual terminar', 'warning');
        return;
    }
    
    if (!validateForm()) {
        showNotification('❌ Por favor, preencha todos os campos obrigatórios', 'error');
        return;
    }
    
    const formData = getFormData();
    console.log('📝 Dados do formulário:', formData);
    
    try {
        isGenerating = true;
        showLoading();
        hideResults();
        
        const results = await generateRole(formData);
        
        if (results && results.length > 0) {
            currentResults = results;
            displayResults(results);
            saveToHistory(formData, results);
            trackConversion('role_generated');
            showNotification('✅ Rolê gerado com sucesso!', 'success');
        } else {
            throw new Error('Nenhum resultado foi gerado');
        }
        
    } catch (error) {
        console.error('❌ Erro na geração:', error);
        showError('Erro ao gerar rolê. Tente novamente em alguns minutos.');
        trackError('generation_failed', error.message);
    } finally {
        isGenerating = false;
        hideLoading();
    }
}

/**
 * Gera o rolê usando IA
 */
async function generateRole(formData) {
    const cacheKey = JSON.stringify(formData);
    
    // Verifica cache
    if (cache.has(cacheKey)) {
        const cached = cache.get(cacheKey);
        if (Date.now() - cached.timestamp < CACHE_DURATION) {
            console.log('📦 Usando resultado do cache');
            return cached.data;
        }
        cache.delete(cacheKey);
    }
    
    const prompt = buildPrompt(formData);
    console.log('🧠 Prompt gerado:', prompt.substring(0, 200) + '...');
    
    const apiConfig = getAPIConfig();
    console.log('🔧 Usando API:', apiConfig.apiUrl.substring(0, 100) + '...');
    
    try {
        const response = await fetch(apiConfig.apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }],
                generationConfig: {
                    temperature: 0.8,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 2048,
                }
            })
        });
        
        if (!response.ok) {
            throw new Error(`Erro na API: ${response.status} - ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('📡 Resposta completa da API:', JSON.stringify(data, null, 2));
        
        if (!data.candidates || !data.candidates[0]) {
            console.error('❌ Estrutura de resposta inválida:', data);
            throw new Error('Resposta inválida da IA: candidates não encontrado');
        }
        
        if (!data.candidates[0].content || !data.candidates[0].content.parts || !data.candidates[0].content.parts[0]) {
            console.error('❌ Estrutura de content inválida:', data.candidates[0]);
            throw new Error('Resposta inválida da IA: content.parts não encontrado');
        }
        
        if (!data.candidates[0].content.parts[0].text) {
            console.error('❌ Texto não encontrado:', data.candidates[0].content.parts[0]);
            throw new Error('Resposta inválida da IA: texto não encontrado');
        }
        
        const aiResponse = data.candidates[0].content.parts[0].text;
        console.log('🤖 Resposta da IA:', aiResponse.substring(0, 300) + '...');
        
        const results = parseAIResponse(aiResponse, formData);
        
        // Salva no cache
        cache.set(cacheKey, {
            data: results,
            timestamp: Date.now()
        });
        
        return results;
        
    } catch (error) {
        console.error('❌ Erro na chamada da API:', error);
        
        // Fallback para destinos locais se a API falhar
        if (typeof destinos !== 'undefined') {
            console.log('🔄 Usando destinos locais como fallback');
            return generateFallbackResults(formData);
        }
        
        throw error;
    }
}

/**
 * Constrói o prompt para a IA
 */
function buildPrompt(formData) {
    const { 
        enderecoPartida, 
        dataRole, 
        horarioSaida, 
        horarioVolta,
        orcamento, 
        tipoMoto, 
        perfilPilotagem,
        experienciaDesejada,
        nivelAventura,
        companhia,
        preferencias
    } = formData;
    
    const consumoMoto = getConsumoMoto(tipoMoto);
    const velocidadeMedia = getVelocidadeMedia(perfilPilotagem);
    
    return `
Você é um especialista em turismo rodoviário e motociclismo no Brasil. Crie um roteiro detalhado para um rolê de moto baseado nestas informações:

DADOS DO ROLÊ:
- Ponto de partida: ${enderecoPartida}
- Data: ${dataRole}
- Horário de saída: ${horarioSaida}
- Horário de volta: ${horarioVolta}
- Orçamento total: R$ ${orcamento}
- Tipo de moto: ${tipoMoto} (consumo: ${consumoMoto}km/l)
- Perfil de pilotagem: ${perfilPilotagem} (velocidade média: ${velocidadeMedia}km/h)
- Nível de aventura: ${nivelAventura}
- Companhia: ${companhia}
- Preferências: ${preferencias.join(', ') || 'Nenhuma específica'}

EXPERIÊNCIA DESEJADA:
${experienciaDesejada}

INSTRUÇÕES PARA O ROTEIRO:
1. Sugira 2-3 destinos/paradas principais que atendam à experiência desejada
2. Para cada destino, forneça:
   - Nome completo e endereço exato
   - Distância e tempo de viagem desde o ponto anterior
   - Descrição detalhada do que fazer/ver
   - Custo estimado por pessoa
   - Dicas específicas para motociclistas
   - Horário sugerido de chegada e permanência

3. Calcule custos realistas:
   - Combustível (preço atual ~R$ 5,50/litro)
   - Alimentação (café da manhã, almoço, lanche)
   - Eventuais taxas de entrada
   - Estacionamento para moto

4. Considere a logística:
   - Condições das estradas
   - Locais para parar e descansar
   - Postos de combustível no trajeto
   - Segurança para motos

5. Formate a resposta em JSON válido com esta estrutura:
{
  "roteiro": {
    "titulo": "Nome do Roteiro",
    "resumo": "Descrição geral",
    "distancia_total": "XXX km",
    "tempo_total": "X horas",
    "custo_total_estimado": "R$ XXX",
    "nivel_dificuldade": "Fácil/Moderado/Difícil",
    "destinos": [
      {
        "nome": "Nome do Local",
        "endereco": "Endereço completo",
        "distancia_anterior": "XX km",
        "tempo_viagem": "XX min",
        "horario_chegada": "HH:MM",
        "tempo_permanencia": "XX min",
        "descricao": "O que fazer/ver",
        "custo_estimado": "R$ XX",
        "dicas_motociclista": ["dica1", "dica2"],
        "coordenadas": "lat,lng (se souber)"
      }
    ],
    "custos_detalhados": {
      "combustivel": "R$ XX",
      "alimentacao": "R$ XX",
      "entradas": "R$ XX",
      "outros": "R$ XX",
      "total": "R$ XXX"
    },
    "observacoes": ["observação1", "observação2"]
  }
}

IMPORTANTE: Retorne APENAS o JSON válido, sem texto adicional antes ou depois. Use destinos reais e existentes no Brasil.
`;
}

/**
 * Processa a resposta da IA
 */
function parseAIResponse(response, formData) {
    try {
        // Remove possível texto antes/depois do JSON
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('JSON não encontrado na resposta');
        }
        
        const jsonStr = jsonMatch[0];
        const data = JSON.parse(jsonStr);
        
        if (!data.roteiro) {
            throw new Error('Formato de resposta inválido');
        }
        
        return [data.roteiro];
        
    } catch (error) {
        console.error('❌ Erro ao processar resposta da IA:', error);
        console.log('📝 Resposta original:', response);
        
        // Fallback para parsing manual
        return parseResponseManually(response, formData);
    }
}

/**
 * Parsing manual da resposta como fallback
 */
function parseResponseManually(response, formData) {
    // Implementação simplificada para casos de erro
    return [{
        titulo: "Roteiro Personalizado",
        resumo: "Roteiro criado baseado em suas preferências",
        distancia_total: "150 km",
        tempo_total: "8 horas",
        custo_total_estimado: `R$ ${formData.orcamento}`,
        nivel_dificuldade: formData.nivelAventura === 'tranquilo' ? 'Fácil' : 
                          formData.nivelAventura === 'moderado' ? 'Moderado' : 'Difícil',
        destinos: [
            {
                nome: "Destino Sugerido",
                endereco: "Consulte GPS para melhor rota",
                distancia_anterior: "75 km",
                tempo_viagem: "90 min",
                horario_chegada: "10:30",
                tempo_permanencia: "180 min",
                descricao: formData.experienciaDesejada || "Experiência única aguarda você",
                custo_estimado: `R$ ${Math.floor(formData.orcamento * 0.7)}`,
                dicas_motociclista: [
                    "Verifique as condições da estrada",
                    "Leve equipamentos de segurança",
                    "Confirme horários de funcionamento"
                ]
            }
        ],
        custos_detalhados: {
            combustivel: `R$ ${Math.floor(formData.orcamento * 0.3)}`,
            alimentacao: `R$ ${Math.floor(formData.orcamento * 0.4)}`,
            entradas: `R$ ${Math.floor(formData.orcamento * 0.2)}`,
            outros: `R$ ${Math.floor(formData.orcamento * 0.1)}`,
            total: `R$ ${formData.orcamento}`
        },
        observacoes: [
            "Roteiro gerado automaticamente",
            "Confirme informações antes da viagem",
            "Respeite limites de velocidade"
        ]
    }];
}

/**
 * Gera resultados de fallback usando destinos locais
 */
function generateFallbackResults(formData) {
    if (!destinos || destinos.length === 0) {
        throw new Error('Nenhum destino disponível');
    }
    
    // Filtra destinos por orçamento e preferências
    const destinosFiltrados = destinos.filter(d => {
        const custoEstimado = d.custoMedio || 100;
        return custoEstimado <= formData.orcamento;
    });
    
    if (destinosFiltrados.length === 0) {
        throw new Error('Nenhum destino encontrado para o orçamento especificado');
    }
    
    // Seleciona destino aleatório
    const destino = destinosFiltrados[Math.floor(Math.random() * destinosFiltrados.length)];
    
    return [{
        titulo: `Rolê para ${destino.nome}`,
        resumo: destino.descricao || "Destino incrível para motociclistas",
        distancia_total: `${destino.distancia || 150} km`,
        tempo_total: "6-8 horas",
        custo_total_estimado: `R$ ${Math.min(destino.custoMedio || 200, formData.orcamento)}`,
        nivel_dificuldade: destino.dificuldade || 'Moderado',
        destinos: [{
            nome: destino.nome,
            endereco: destino.endereco || "Consulte GPS",
            distancia_anterior: `${destino.distancia || 150} km`,
            tempo_viagem: `${Math.floor((destino.distancia || 150) / 60)} horas`,
            horario_chegada: "10:00",
            tempo_permanencia: "240 min",
            descricao: destino.descricao || formData.experienciaDesejada,
            custo_estimado: `R$ ${Math.floor((destino.custoMedio || 200) * 0.7)}`,
            dicas_motociclista: destino.dicas || [
                "Estrada em boas condições",
                "Local seguro para estacionar",
                "Ótimo para fotos"
            ]
        }],
        custos_detalhados: {
            combustivel: `R$ ${Math.floor(formData.orcamento * 0.3)}`,
            alimentacao: `R$ ${Math.floor(formData.orcamento * 0.4)}`,
            entradas: `R$ ${Math.floor(formData.orcamento * 0.2)}`,
            outros: `R$ ${Math.floor(formData.orcamento * 0.1)}`,
            total: `R$ ${formData.orcamento}`
        },
        observacoes: [
            "Baseado em destinos conhecidos",
            "Confirme condições atuais",
            "Pilote com segurança"
        ]
    }];
}

/**
 * Exibe os resultados na tela
 */
function displayResults(results) {
    const container = document.getElementById('sugestoes-role');
    const resultsSection = document.getElementById('results-section');
    
    if (!container || !results || results.length === 0) {
        showError('Erro ao exibir resultados');
        return;
    }
    
    container.innerHTML = '';
    
    results.forEach((roteiro, index) => {
        const resultCard = createResultCard(roteiro, index);
        container.appendChild(resultCard);
    });
    
    // Mostra seção de resultados
    resultsSection.classList.remove('hidden');
    resultsSection.classList.add('slide-in-up');
    
    // Scroll suave para resultados
    setTimeout(() => {
        resultsSection.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
        });
    }, 300);
}

/**
 * Cria um card de resultado
 */
function createResultCard(roteiro, index) {
    const card = document.createElement('div');
    card.className = 'result-card';
    card.innerHTML = `
        <div class="mb-6">
            <div class="flex items-start justify-between mb-4">
                <div>
                    <h3 class="text-2xl font-bold text-white mb-2">${roteiro.titulo}</h3>
                    <p class="text-gray-300">${roteiro.resumo}</p>
                </div>
                <div class="text-right">
                    <div class="text-2xl font-bold text-gold-primary">${roteiro.custo_total_estimado}</div>
                    <div class="text-sm text-gray-400">${roteiro.distancia_total} • ${roteiro.tempo_total}</div>
                </div>
            </div>
            
            <div class="grid md:grid-cols-3 gap-4 mb-6">
                <div class="bg-gray-800 p-3 rounded-lg text-center">
                    <div class="text-lg font-bold text-gold-primary">${roteiro.distancia_total}</div>
                    <div class="text-sm text-gray-400">Distância Total</div>
                </div>
                <div class="bg-gray-800 p-3 rounded-lg text-center">
                    <div class="text-lg font-bold text-blue-400">${roteiro.tempo_total}</div>
                    <div class="text-sm text-gray-400">Tempo Estimado</div>
                </div>
                <div class="bg-gray-800 p-3 rounded-lg text-center">
                    <div class="text-lg font-bold text-green-400">${roteiro.nivel_dificuldade}</div>
                    <div class="text-sm text-gray-400">Dificuldade</div>
                </div>
            </div>
        </div>
        
        <div class="space-y-4 mb-6">
            <h4 class="text-xl font-bold text-gold-primary mb-3">📍 Destinos do Roteiro</h4>
            ${roteiro.destinos.map((destino, i) => `
                <div class="bg-gray-800 p-4 rounded-lg">
                    <div class="flex items-start justify-between mb-3">
                        <div>
                            <h5 class="text-lg font-bold text-white">${destino.nome}</h5>
                            <p class="text-gray-400 text-sm">${destino.endereco}</p>
                        </div>
                        <div class="text-right">
                            <div class="text-green-400 font-bold">${destino.custo_estimado}</div>
                            <div class="text-xs text-gray-500">${destino.tempo_permanencia}</div>
                        </div>
                    </div>
                    
                    <p class="text-gray-300 mb-3">${destino.descricao}</p>
                    
                    <div class="grid md:grid-cols-2 gap-3 text-sm">
                        <div>
                            <span class="text-gold-primary">🛣️ Distância:</span> ${destino.distancia_anterior}
                        </div>
                        <div>
                            <span class="text-gold-primary">⏰ Chegada:</span> ${destino.horario_chegada}
                        </div>
                    </div>
                    
                    ${destino.dicas_motociclista && destino.dicas_motociclista.length > 0 ? `
                        <div class="mt-3">
                            <h6 class="text-gold-primary font-semibold mb-2">🏍️ Dicas para Motociclistas:</h6>
                            <ul class="text-sm text-gray-300 space-y-1">
                                ${destino.dicas_motociclista.map(dica => `<li>• ${dica}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}
                </div>
            `).join('')}
        </div>
        
        ${roteiro.custos_detalhados ? `
            <div class="cost-display mb-6">
                <h4 class="text-lg font-bold text-green-400 mb-3">💰 Custos Detalhados</h4>
                <div class="space-y-2">
                    <div class="cost-item">
                        <span>⛽ Combustível</span>
                        <span class="font-bold">${roteiro.custos_detalhados.combustivel}</span>
                    </div>
                    <div class="cost-item">
                        <span>🍽️ Alimentação</span>
                        <span class="font-bold">${roteiro.custos_detalhados.alimentacao}</span>
                    </div>
                    <div class="cost-item">
                        <span>🎫 Entradas</span>
                        <span class="font-bold">${roteiro.custos_detalhados.entradas}</span>
                    </div>
                    <div class="cost-item">
                        <span>🔧 Outros</span>
                        <span class="font-bold">${roteiro.custos_detalhados.outros}</span>
                    </div>
                    <div class="cost-item">
                        <span class="text-lg">💎 TOTAL</span>
                        <span class="font-bold text-lg text-gold-primary">${roteiro.custos_detalhados.total}</span>
                    </div>
                </div>
            </div>
        ` : ''}
        
        ${roteiro.observacoes && roteiro.observacoes.length > 0 ? `
            <div class="bg-blue-900 bg-opacity-30 p-4 rounded-lg">
                <h4 class="text-blue-400 font-bold mb-2">ℹ️ Observações Importantes</h4>
                <ul class="text-sm text-gray-300 space-y-1">
                    ${roteiro.observacoes.map(obs => `<li>• ${obs}</li>`).join('')}
                </ul>
            </div>
        ` : ''}
        
        <div class="flex flex-wrap gap-3 mt-6 pt-4 border-t border-gray-700">
            <button onclick="shareRoteiro(${index})" class="btn-primary text-sm px-4 py-2">
                <i class="fas fa-share-alt mr-2"></i>Compartilhar
            </button>
            <button onclick="saveRoteiro(${index})" class="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm transition-colors">
                <i class="fas fa-bookmark mr-2"></i>Salvar
            </button>
            <button onclick="exportToPDF(${index})" class="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm transition-colors">
                <i class="fas fa-file-pdf mr-2"></i>PDF
            </button>
        </div>
    `;
    
    return card;
}

/**
 * Utilitários
 */
function getFormData() {
    const preferencias = [];
    document.querySelectorAll('input[type="checkbox"]:checked').forEach(cb => {
        const label = cb.closest('label').textContent.trim();
        preferencias.push(label);
    });
    
    return {
        enderecoPartida: document.getElementById('endereco-partida').value,
        dataRole: document.getElementById('data-role').value,
        horarioSaida: document.getElementById('horario-saida').value,
        horarioVolta: document.getElementById('horario-volta').value,
        orcamento: parseInt(document.getElementById('orcamento-role').value) || 200,
        tipoMoto: document.getElementById('tipo-moto').value,
        perfilPilotagem: document.getElementById('perfil-pilotagem').value,
        experienciaDesejada: document.getElementById('experiencia-desejada').value,
        nivelAventura: document.getElementById('nivel-aventura').value,
        companhia: document.getElementById('companhia').value,
        preferencias: preferencias
    };
}

function getConsumoMoto(tipo) {
    const consumos = {
        '125cc': 35,
        '250cc': 25,
        '600cc': 18,
        '1000cc': 15
    };
    return consumos[tipo] || 25;
}

function getVelocidadeMedia(perfil) {
    const velocidades = {
        'conservador': 55,
        'moderado': 70,
        'esportivo': 90
    };
    return velocidades[perfil] || 70;
}

function validateForm() {
    const requiredFields = [
        'endereco-partida', 'data-role', 'horario-saida', 
        'horario-volta', 'orcamento-role', 'tipo-moto', 
        'perfil-pilotagem', 'experiencia-desejada', 
        'nivel-aventura', 'companhia'
    ];
    
    return requiredFields.every(fieldId => {
        const field = document.getElementById(fieldId);
        return field && field.value.trim() !== '';
    });
}

function validateField(event) {
    const field = event.target;
    const value = field.value.trim();
    
    clearFieldError(event);
    
    if (field.hasAttribute('required') && !value) {
        showFieldError(field, 'Este campo é obrigatório');
        return false;
    }
    
    // Validações específicas
    if (field.type === 'number') {
        const num = parseFloat(value);
        const min = parseFloat(field.min);
        const max = parseFloat(field.max);
        
        if (min && num < min) {
            showFieldError(field, `Valor mínimo: ${min}`);
            return false;
        }
        
        if (max && num > max) {
            showFieldError(field, `Valor máximo: ${max}`);
            return false;
        }
    }
    
    return true;
}

function showFieldError(field, message) {
    clearFieldError({ target: field });
    
    field.classList.add('border-red-500');
    
    const error = document.createElement('div');
    error.className = 'field-error text-red-400 text-sm mt-1';
    error.textContent = message;
    
    field.parentNode.appendChild(error);
}

function clearFieldError(event) {
    const field = event.target;
    field.classList.remove('border-red-500');
    
    const error = field.parentNode.querySelector('.field-error');
    if (error) {
        error.remove();
    }
}

function showLoading() {
    const loading = document.getElementById('loading-role');
    const resultsSection = document.getElementById('results-section');
    
    if (loading && resultsSection) {
        loading.classList.remove('hidden');
        resultsSection.classList.remove('hidden');
        
        // Scroll para loading
        setTimeout(() => {
            loading.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center' 
            });
        }, 100);
    }
}

function hideLoading() {
    const loading = document.getElementById('loading-role');
    if (loading) {
        loading.classList.add('hidden');
    }
}

function hideResults() {
    const resultsSection = document.getElementById('results-section');
    if (resultsSection) {
        resultsSection.classList.add('hidden');
    }
}

function showError(message) {
    hideLoading();
    showNotification(`❌ ${message}`, 'error');
}

function showNotification(message, type = 'info') {
    // Remove notificação anterior
    const existing = document.querySelector('.notification');
    if (existing) {
        existing.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = `notification fixed top-20 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm transition-all duration-300`;
    
    const colors = {
        success: 'bg-green-800 border-green-600 text-green-100',
        error: 'bg-red-800 border-red-600 text-red-100',
        warning: 'bg-yellow-800 border-yellow-600 text-yellow-100',
        info: 'bg-blue-800 border-blue-600 text-blue-100'
    };
    
    notification.className += ` border ${colors[type] || colors.info}`;
    notification.innerHTML = `
        <div class="flex items-center justify-between">
            <span>${message}</span>
            <button onclick="this.parentElement.parentElement.remove()" class="ml-4 text-xl">&times;</button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove após 5 segundos
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

// Funções de ação dos resultados
function shareRoteiro(index) {
    if (!currentResults[index]) return;
    
    const roteiro = currentResults[index];
    const text = `🏍️ Confira este roteiro incrível!\n\n${roteiro.titulo}\n${roteiro.resumo}\n\n💰 ${roteiro.custo_total_estimado} | 🛣️ ${roteiro.distancia_total}\n\nGerado no Gerador de Rolês: ${window.location.href}`;
    
    if (navigator.share) {
        navigator.share({
            title: roteiro.titulo,
            text: text,
            url: window.location.href
        });
    } else {
        navigator.clipboard.writeText(text).then(() => {
            showNotification('✅ Roteiro copiado para área de transferência!', 'success');
        });
    }
    
    trackEvent('share_roteiro', { index, title: roteiro.titulo });
}

function saveRoteiro(index) {
    if (!currentResults[index]) return;
    
    const saved = JSON.parse(localStorage.getItem('roteiros_salvos') || '[]');
    const roteiro = {
        ...currentResults[index],
        saved_at: new Date().toISOString(),
        id: Date.now()
    };
    
    saved.push(roteiro);
    localStorage.setItem('roteiros_salvos', JSON.stringify(saved));
    
    showNotification('✅ Roteiro salvo com sucesso!', 'success');
    trackEvent('save_roteiro', { index, title: roteiro.titulo });
}

function exportToPDF(index) {
    showNotification('📄 Função de exportar PDF em desenvolvimento', 'info');
    trackEvent('export_pdf_requested', { index });
}

// Persistência de dados
function saveFormData() {
    const formData = getFormData();
    localStorage.setItem('gerador_form_data', JSON.stringify(formData));
}

function loadSavedData() {
    try {
        const saved = localStorage.getItem('gerador_form_data');
        if (!saved) return;
        
        const data = JSON.parse(saved);
        
        // Preenche campos salvos
        Object.keys(data).forEach(key => {
            const element = document.getElementById(key.replace(/([A-Z])/g, '-$1').toLowerCase());
            if (element && data[key]) {
                if (element.type === 'checkbox') {
                    element.checked = data[key];
                } else {
                    element.value = data[key];
                }
            }
        });
        
        // Preferências
        if (data.preferencias && Array.isArray(data.preferencias)) {
            data.preferencias.forEach(pref => {
                const checkbox = Array.from(document.querySelectorAll('input[type="checkbox"]')).find(cb => {
                    return cb.closest('label').textContent.trim() === pref;
                });
                if (checkbox) checkbox.checked = true;
            });
        }
        
    } catch (error) {
        console.error('Erro ao carregar dados salvos:', error);
    }
}

function saveToHistory(formData, results) {
    try {
        const history = JSON.parse(localStorage.getItem('gerador_history') || '[]');
        const entry = {
            timestamp: new Date().toISOString(),
            formData,
            results,
            id: Date.now()
        };
        
        history.unshift(entry);
        
        // Mantém apenas os últimos 10
        if (history.length > 10) {
            history.splice(10);
        }
        
        localStorage.setItem('gerador_history', JSON.stringify(history));
    } catch (error) {
        console.error('Erro ao salvar histórico:', error);
    }
}

// PWA
function initializePWA() {
    // Service Worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js').catch(err => {
            console.error('SW registration failed:', err);
        });
    }
}

// Analytics e tracking
function trackPageView() {
    trackEvent('page_view', { page: 'gerador-roles' });
}

function trackConversion(type) {
    trackEvent('conversion', { type });
}

function trackError(type, message) {
    trackEvent('error', { type, message });
}

function trackEvent(eventName, data = {}) {
    // Implementar analytics (Google Analytics, etc.)
    console.log('📊 Analytics:', eventName, data);
    
    // Exemplo com Google Analytics 4
    if (typeof gtag !== 'undefined') {
        gtag('event', eventName, data);
    }
}

// Utilitários
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function handleScroll() {
    // Implementar lazy loading ou outros efeitos de scroll se necessário
}

// Exportar funções principais para uso global
window.GeradorRoles = {
    shareRoteiro,
    saveRoteiro,
    exportToPDF,
    showNotification
};

console.log('✅ Gerador de Rolês carregado com sucesso!');