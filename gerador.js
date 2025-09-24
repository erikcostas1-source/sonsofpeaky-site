/**
 * Gerador de Rolês de Moto - JavaScript Principal
 * Sistema completo de geração de roteiros personalizados
 * Version: 2.0.1 - Fixed GitHub Pages
 */

console.log('🔧 Gerador.js carregado - Version 2.0.2 - Enhanced Error Handling');

/**
 * Função utilitária para acessar elementos DOM com segurança
 */
function safeGetElement(id, required = false) {
    const element = document.getElementById(id);
    if (!element && required) {
        console.error(`❌ Elemento obrigatório "${id}" não encontrado`);
        throw new Error(`Elemento DOM "${id}" não encontrado`);
    } else if (!element) {
        console.warn(`⚠️ Elemento "${id}" não encontrado`);
    }
    return element;
}

/**
 * Função utilitária para acessar elementos DOM com segurança (querySelector)
 */
function safeQuerySelector(selector, required = false) {
    const element = document.querySelector(selector);
    if (!element && required) {
        console.error(`❌ Elemento obrigatório "${selector}" não encontrado`);
        throw new Error(`Elemento DOM "${selector}" não encontrado`);
    } else if (!element) {
        console.warn(`⚠️ Elemento "${selector}" não encontrado`);
    }
    return element;
}

// Configuração da API - usando função serverless para segurança
function getAPIConfig() {
    console.log('🔍 getAPIConfig chamado - hostname:', window.location.hostname);
    // Força modo desenvolvimento se configurado
    const forceDevelopment = window.FORCE_DEVELOPMENT_MODE === true;
    
    // Detecta plataforma de hospedagem
    const isGitHubPages = window.location.hostname.includes('github.io');
    const isNetlify = window.location.hostname.includes('netlify.app') || window.location.hostname.includes('netlify.com');
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    
    // Determina se é desenvolvimento
    const isDevelopment = forceDevelopment || isLocalhost;
    
    if (isDevelopment) {
        // Para desenvolvimento local, usa API direta com chave de desenvolvimento
        const devKey = window.DEV_API_KEY || 'AIzaSyCiHRVozYYmHB-5W64QdJzn9dQYAyRl9Tk';
        console.log('🏠 Modo desenvolvimento detectado - usando API direta');
        
        return {
            apiUrl: `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${devKey}`,
            useServerless: false
        };
    } else if (isNetlify) {
        // Em Netlify, usa função serverless
        console.log('🌐 Netlify detectado - usando função serverless');
        return {
            apiUrl: '/.netlify/functions/generate-role',
            useServerless: true
        };
    } else if (isGitHubPages) {
        // Em GitHub Pages, não há API disponível - força fallback
        console.log('📖 GitHub Pages detectado - forçando fallback local');
        throw new Error('GitHub Pages: API não disponível - usando fallback local');
    } else {
        // Fallback padrão - sem API
        console.log('🔧 Ambiente desconhecido - forçando fallback local');
        throw new Error('Ambiente desconhecido: API não configurada - usando fallback local');
    }
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
    
    try {
        // Verifica se é um link colaborativo
        checkCollaborativeLink();
        
        // Define data atual - com verificação de elemento
        const dataRoleInput = safeGetElement('data-role');
        if (dataRoleInput) {
            const today = new Date().toISOString().split('T')[0];
            dataRoleInput.value = today;
        }
        
        // Carrega destinos se disponível
        if (typeof destinos !== 'undefined') {
            console.log(`📍 ${destinos.length} destinos carregados`);
        } else {
            console.warn('⚠️ Destinos não carregados - fallback será limitado');
        }
        
        // Carrega roteiro compartilhado se houver
        loadSharedRoteiro();
        
        // Inicializa PWA
        initializePWA();
        
        // Analytics
        trackPageView();
        
    } catch (error) {
        console.error('❌ Erro na inicialização:', error);
        // Continua a execução mesmo com erros
    }
}

/**
 * Configuração dos event listeners
 */
function setupEventListeners() {
    try {
        const form = safeGetElement('gerador-form');
        if (form) {
            form.addEventListener('submit', handleFormSubmit);
            
            // Auto-save no formulário
            const inputs = form.querySelectorAll('input, select, textarea');
            inputs.forEach(input => {
                input.addEventListener('change', saveFormData);
                input.addEventListener('input', debounce(saveFormData, 1000));
            });
        }
        
        // Smooth scroll para resultados
        window.addEventListener('scroll', handleScroll);
        
    } catch (error) {
        console.error('❌ Erro ao configurar event listeners:', error);
    }
}

/**
 * Configuração de validação do formulário
 */
function setupFormValidation() {
    try {
        const form = safeGetElement('gerador-form');
        if (form) {
            const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
            
            inputs.forEach(input => {
                input.addEventListener('blur', validateField);
                input.addEventListener('input', clearFieldError);
            });
            
            console.log(`✅ Validação configurada para ${inputs.length} campos`);
        }
    } catch (error) {
        console.error('❌ Erro ao configurar validação:', error);
    }
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
    
    // Salva dados do formulário para compartilhamento
    lastFormData = formData;
    
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
    
    // Tenta obter configuração da API
    let apiConfig;
    try {
        apiConfig = getAPIConfig();
        console.log('🔧 Usando API:', apiConfig.apiUrl.substring(0, 100) + '...');
        console.log('🔧 Configuração:', JSON.stringify(apiConfig, null, 2));
    } catch (configError) {
        console.log('⚠️ API não disponível:', configError.message);
        console.log('🔄 Usando fallback local diretamente');
        return generateFallbackResults(formData);
    }
    
    try {
        let requestBody, response;
        
        if (apiConfig.useServerless) {
            // Usando função serverless (produção)
            requestBody = {
                prompt: prompt
            };
            
            console.log('📤 Using serverless function');
            console.log('📡 URL:', apiConfig.apiUrl);
            
            response = await fetch(apiConfig.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });
        } else {
            // Usando API direta (desenvolvimento local)
            requestBody = {
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
            };
            
            console.log('📤 Using direct API (development)');
            console.log('📡 URL:', apiConfig.apiUrl);
            
            response = await fetch(apiConfig.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });
        }
        
        console.log('📨 Response received:', response.status, response.statusText);
        console.log('📨 Response headers:', [...response.headers.entries()]);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Erro HTTP:', errorText);
            throw new Error(`Erro na API: ${response.status} - ${response.statusText}: ${errorText}`);
        }
        
        const responseText = await response.text();
        console.log('📄 Response text completo:', responseText);
        
        let data;
        try {
            data = JSON.parse(responseText);
            console.log('📡 Resposta parseada da API:', JSON.stringify(data, null, 2));
        } catch (parseError) {
            console.error('❌ Erro ao parsear JSON:', parseError);
            console.error('📄 Texto que não pôde ser parseado:', responseText);
            throw new Error(`Erro ao parsear resposta da API: ${parseError.message}`);
        }
        
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
        
        // Tratamento específico para diferentes tipos de erro
        if (error.message.includes('405') || error.message.includes('Method Not Allowed')) {
            console.warn('⚠️ Erro 405: Tentativa de usar serverless no GitHub Pages');
            // Força uso da API direta como fallback
            try {
                console.log('🔄 Tentando novamente com API direta...');
                const directApiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyCiHRVozYYmHB-5W64QdJzn9dQYAyRl9Tk';
                
                const directRequestBody = {
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
                };
                
                const directResponse = await fetch(directApiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(directRequestBody)
                });
                
                if (directResponse.ok) {
                    const directData = await directResponse.json();
                    if (directData.candidates?.[0]?.content?.parts?.[0]?.text) {
                        const aiResponse = directData.candidates[0].content.parts[0].text;
                        const results = parseAIResponse(aiResponse, formData);
                        
                        // Salva no cache
                        cache.set(cacheKey, {
                            data: results,
                            timestamp: Date.now()
                        });
                        
                        return results;
                    }
                }
            } catch (fallbackError) {
                console.error('❌ Fallback API também falhou:', fallbackError);
            }
        }
        
        // Fallback para destinos locais se tudo falhar
        if (typeof destinos !== 'undefined') {
            console.log('🔄 Usando destinos locais como último recurso');
            return generateFallbackResults(formData);
        }
        
        // Se nada funcionar, lança um erro amigável
        throw new Error('Não foi possível gerar o rolê. Verifique sua conexão e tente novamente.');
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
        quilometragemDesejada,
        tipoMoto, 
        perfilPilotagem,
        experienciaDesejada,
        nivelAventura,
        companhia,
        preferencias
    } = formData;
    
    const consumoMoto = getConsumoMoto(tipoMoto);
    const velocidadeMedia = getVelocidadeMedia(perfilPilotagem);
    
    // Monta informações de quilometragem
    const quilometragemInfo = quilometragemDesejada ? getQuilometragemRange(quilometragemDesejada) : 'Não especificada';
    
    // Monta informações de orçamento
    const orcamentoInfo = orcamento ? `R$ ${orcamento}` : 'Não especificado (sem limite definido)';
    
    return `
Você é um especialista em turismo rodoviário e motociclismo no Brasil. Crie um roteiro detalhado para um rolê de moto baseado nestas informações:

DADOS OBRIGATÓRIOS DO ROLÊ:
- Ponto de partida: ${enderecoPartida}
- Data: ${dataRole}
- Horário de saída: ${horarioSaida}
- Horário de volta: ${horarioVolta}
- Tipo de moto: ${tipoMoto} (consumo: ${consumoMoto}km/l)
- Perfil de pilotagem: ${perfilPilotagem} (velocidade média: ${velocidadeMedia}km/h)

PREFERÊNCIAS OPCIONAIS (use como balizadores):
- Quilometragem desejada: ${quilometragemInfo}
- Orçamento: ${orcamentoInfo}
- Nível de aventura: ${nivelAventura}
- Companhia: ${companhia}
- Interesses específicos: ${preferencias.join(', ') || 'Nenhum específico'}

EXPERIÊNCIA DESEJADA:
${experienciaDesejada}

INSTRUÇÕES PARA 3 SUGESTÕES DE ROTEIRO:
1. PRIORIDADE MÁXIMA: Respeite rigorosamente os horários de saída e volta
2. Crie EXATAMENTE 3 sugestões diferentes baseadas na experiência desejada:
   - SUGESTÃO 1 (ECONÔMICA): Foco em menor custo, destinos gratuitos/baratos
   - SUGESTÃO 2 (EQUILIBRADA): Balance entre custo, aventura e conforto  
   - SUGESTÃO 3 (PREMIUM): Experiência completa, sem limite de orçamento

3. Se quilometragem foi especificada, mantenha-se dentro da faixa para todas as 3
4. Cada sugestão deve ter 2-3 destinos/paradas principais diferentes

Para cada destino em cada sugestão, forneça:
   - Nome completo e endereço exato
   - Distância e tempo de viagem desde o ponto anterior
   - Descrição detalhada do que fazer/ver
   - Custo estimado por pessoa
   - Dicas específicas para motociclistas (condições da estrada, melhor horário, equipamentos, segurança)
   - Horário sugerido de chegada e permanência

Calcule custos realistas para cada sugestão:
   - Combustível (preço atual ~R$ 5,50/litro)
   - Alimentação (café da manhã, almoço, lanche)
   - Eventuais taxas de entrada
   - Estacionamento para moto

Considere a logística:
   - Condições das estradas (asfalto, terra, curvas, subidas)
   - Locais para parar e descansar
   - Postos de combustível no trajeto
   - Segurança para motos (guarda-volumes, vigilância)
   - TEMPO TOTAL compatível com horários de saída e volta
   - Condições climáticas da região
   - Equipamentos recomendados (capacete, proteção, capa de chuva)
   - Documentação necessária
   - Telefone de emergência local

5. Formate a resposta em JSON válido com esta estrutura:
{
  "sugestoes": [
    {
      "id": 1,
      "tipo": "ECONÔMICA",
      "titulo": "Nome do Roteiro Econômico",
      "resumo": "Descrição focada em baixo custo",
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
          "dicas_motociclista": [
            "Condições da estrada (ex: 'Asfalto em bom estado, mas cuidado com curvas acentuadas')",
            "Segurança local (ex: 'Local com boa vigilância, estacionamento gratuito para motos')",
            "Equipamentos (ex: 'Recomendado capacete extra para trilha, protetor de joelho')",
            "Melhor horário (ex: 'Evite entre 12h-14h devido ao sol forte na subida')",
            "Emergência (ex: 'Posto de saúde a 5km, sinal de celular instável na serra')"
          ],
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
    },
    {
      "id": 2,
      "tipo": "EQUILIBRADA",
      "titulo": "Nome do Roteiro Equilibrado",
      "resumo": "Descrição balanceada",
      "distancia_total": "XXX km",
      "tempo_total": "X horas",
      "custo_total_estimado": "R$ XXX",
      "nivel_dificuldade": "Fácil/Moderado/Difícil",
      "destinos": [...],
      "custos_detalhados": {...},
      "observacoes": [...]
    },
    {
      "id": 3,
      "tipo": "PREMIUM", 
      "titulo": "Nome do Roteiro Premium",
      "resumo": "Descrição experiência completa",
      "distancia_total": "XXX km",
      "tempo_total": "X horas",
      "custo_total_estimado": "R$ XXX",
      "nivel_dificuldade": "Fácil/Moderado/Difícil", 
      "destinos": [...],
      "custos_detalhados": {...},
      "observacoes": [...]
    }
  ]
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
        
        if (!data.sugestoes || !Array.isArray(data.sugestoes) || data.sugestoes.length !== 3) {
            throw new Error('Formato de resposta inválido - esperado 3 sugestões');
        }
        
        return data.sugestoes;
        
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
    
    // Salva os roteiros globalmente para compartilhamento  
    generatedRoteiros = results;
    
    // Limpa completamente o container
    container.innerHTML = '';
    
    // Cria header de seleção
    const header = document.createElement('div');
    header.className = 'text-center mb-8';
    header.innerHTML = `
        <h2 class="text-3xl font-bold text-gold-primary mb-4">🎯 Escolha Sua Aventura</h2>
        <p class="text-gray-300 text-lg">Gerou 3 sugestões personalizadas para você. Escolha a que mais combina com seu estilo!</p>
        
        <div class="mt-6">
            <button onclick="shareForVoting()" class="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors shadow-lg">
                🗳️ Compartilhar para Votação
            </button>
            <p class="text-gray-400 text-sm mt-2">Deixe seu grupo votar na melhor opção!</p>
        </div>
    `;
    container.appendChild(header);
    
    // Cria container das sugestões
    const suggestionsContainer = document.createElement('div');
    suggestionsContainer.className = 'grid md:grid-cols-3 gap-6 mb-8';
    suggestionsContainer.id = 'suggestions-grid';
    
    results.forEach((roteiro, index) => {
        const suggestionCard = createSuggestionCard(roteiro, index);
        suggestionsContainer.appendChild(suggestionCard);
    });
    
    container.appendChild(suggestionsContainer);
    
    // Container para roteiro selecionado (inicialmente oculto)
    const selectedContainer = document.createElement('div');
    selectedContainer.id = 'selected-roteiro';
    selectedContainer.className = 'hidden';
    container.appendChild(selectedContainer);
    
    // Cria checklist de dicas
    const checklistContainer = createChecklistSummary(results);
    container.appendChild(checklistContainer);
    
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
 * Cria resumo checklist de todas as dicas
 */
function createChecklistSummary(roteiros) {
    const checklistContainer = document.createElement('div');
    checklistContainer.className = 'bg-gradient-to-r from-blue-900 to-purple-900 rounded-xl p-6 mb-8';
    checklistContainer.innerHTML = `
        <div class="flex justify-between items-center mb-4">
            <h3 class="text-2xl font-bold text-white">📋 Checklist do Role</h3>
            <button onclick="toggleChecklist()" class="text-white hover:text-blue-300 transition-colors">
                <i class="fas fa-chevron-down" id="checklist-arrow"></i>
            </button>
        </div>
        <p class="text-blue-200 mb-4">Todas as dicas importantes para não esquecer nada!</p>
        <div id="checklist-content" class="hidden">
            ${generateFullChecklist(roteiros)}
        </div>
    `;
    
    return checklistContainer;
}

/**
 * Gera checklist completo com todas as dicas
 */
function generateFullChecklist(roteiros) {
    const allTips = new Set();
    
    // Coleta todas as dicas únicas de todos os roteiros
    roteiros.forEach(roteiro => {
        if (roteiro.destinos) {
            roteiro.destinos.forEach(destino => {
                if (destino.dicas_motociclista) {
                    destino.dicas_motociclista.forEach(dica => {
                        // Extrai a dica limpa (remove prefixos como "Condições da estrada:")
                        const cleanTip = dica.replace(/^[^:]+:\s*/, '').trim();
                        if (cleanTip.length > 10) { // Só adiciona dicas significativas
                            allTips.add(cleanTip);
                        }
                    });
                }
            });
        }
    });
    
    // Categoriza as dicas
    const categories = {
        '🛡️ Equipamentos': [],
        '📞 Reservas e Contatos': [],
        '🛣️ Estrada e Navegação': [],
        '⏰ Horários e Clima': [],
        '🚨 Segurança e Emergência': [],
        '💡 Outras Dicas': []
    };
    
    allTips.forEach(tip => {
        const lowerTip = tip.toLowerCase();
        if (lowerTip.includes('equipamento') || lowerTip.includes('capacete') || lowerTip.includes('proteção') || lowerTip.includes('roupas') || lowerTip.includes('lanterna')) {
            categories['🛡️ Equipamentos'].push(tip);
        } else if (lowerTip.includes('reserva') || lowerTip.includes('ligar') || lowerTip.includes('telefone') || lowerTip.includes('contato')) {
            categories['📞 Reservas e Contatos'].push(tip);
        } else if (lowerTip.includes('estrada') || lowerTip.includes('trajeto') || lowerTip.includes('curva') || lowerTip.includes('subida') || lowerTip.includes('asfalto')) {
            categories['🛣️ Estrada e Navegação'].push(tip);
        } else if (lowerTip.includes('horário') || lowerTip.includes('clima') || lowerTip.includes('sol') || lowerTip.includes('chuva') || lowerTip.includes('evite')) {
            categories['⏰ Horários e Clima'].push(tip);
        } else if (lowerTip.includes('emergência') || lowerTip.includes('segurança') || lowerTip.includes('saúde') || lowerTip.includes('sinal')) {
            categories['🚨 Segurança e Emergência'].push(tip);
        } else {
            categories['💡 Outras Dicas'].push(tip);
        }
    });
    
    let checklistHTML = '<div class="grid md:grid-cols-2 gap-4">';
    
    Object.entries(categories).forEach(([category, tips]) => {
        if (tips.length > 0) {
            checklistHTML += `
                <div class="bg-white bg-opacity-10 rounded-lg p-4">
                    <h4 class="text-lg font-bold text-white mb-3">${category}</h4>
                    <div class="space-y-2">
                        ${tips.map(tip => `
                            <label class="flex items-start gap-3 text-blue-100 hover:text-white cursor-pointer transition-colors">
                                <input type="checkbox" class="mt-1 rounded border-blue-300 text-blue-600 focus:ring-blue-500">
                                <span class="text-sm">${tip}</span>
                            </label>
                        `).join('')}
                    </div>
                </div>
            `;
        }
    });
    
    checklistHTML += '</div>';
    
    return checklistHTML;
}

/**
 * Toggle do checklist
 */
function toggleChecklist() {
    const content = document.getElementById('checklist-content');
    const arrow = document.getElementById('checklist-arrow');
    
    if (content && arrow) {
        content.classList.toggle('hidden');
        arrow.classList.toggle('fa-chevron-down');
        arrow.classList.toggle('fa-chevron-up');
    }
}

/**
 * Cria um card de sugestão (preview)
 */
function createSuggestionCard(roteiro, index) {
    const card = document.createElement('div');
    card.className = 'suggestion-card cursor-pointer transform transition-all duration-300 hover:scale-105';
    card.onclick = () => selectRoteiro(index);
    
    // Cores por tipo
    const typeColors = {
        'ECONÔMICA': 'from-green-600 to-green-800 border-green-500',
        'EQUILIBRADA': 'from-blue-600 to-blue-800 border-blue-500', 
        'PREMIUM': 'from-purple-600 to-purple-800 border-purple-500'
    };
    
    const typeIcons = {
        'ECONÔMICA': '💚',
        'EQUILIBRADA': '⚖️',
        'PREMIUM': '👑'
    };
    
    const colorClass = typeColors[roteiro.tipo] || 'from-gray-600 to-gray-800 border-gray-500';
    
    card.innerHTML = `
        <div class="bg-gradient-to-br ${colorClass} p-6 rounded-xl border-2 hover:border-opacity-100 border-opacity-50 transition-all">
            <div class="text-center mb-4">
                <div class="text-4xl mb-2">${typeIcons[roteiro.tipo]}</div>
                <div class="bg-black bg-opacity-30 px-3 py-1 rounded-full text-sm font-bold text-white mb-2">
                    ${roteiro.tipo}
                </div>
                <h3 class="text-xl font-bold text-white mb-2">${roteiro.titulo}</h3>
                <p class="text-gray-200 text-sm">${roteiro.resumo}</p>
            </div>
            
            <div class="space-y-3 mb-6">
                <div class="flex justify-between items-center bg-black bg-opacity-30 p-3 rounded-lg">
                    <span class="text-white font-semibold">💰 Custo Total</span>
                    <span class="text-white font-bold text-lg">${roteiro.custo_total_estimado}</span>
                </div>
                
                <div class="grid grid-cols-2 gap-2 text-sm">
                    <div class="bg-black bg-opacity-30 p-2 rounded text-center">
                        <div class="text-white font-semibold">📍 ${roteiro.distancia_total}</div>
                        <div class="text-gray-300">Distância</div>
                    </div>
                    <div class="bg-black bg-opacity-30 p-2 rounded text-center">
                        <div class="text-white font-semibold">⏱️ ${roteiro.tempo_total}</div>
                        <div class="text-gray-300">Tempo</div>
                    </div>
                </div>
                
                <div class="bg-black bg-opacity-30 p-3 rounded-lg">
                    <div class="text-white font-semibold mb-2">📍 Principais Destinos:</div>
                    <div class="space-y-1">
                        ${roteiro.destinos.slice(0, 2).map(d => `
                            <div class="text-gray-200 text-sm">• ${d.nome}</div>
                        `).join('')}
                        ${roteiro.destinos.length > 2 ? `<div class="text-gray-300 text-xs">+ ${roteiro.destinos.length - 2} destinos...</div>` : ''}
                    </div>
                </div>
            </div>
            
            <div class="text-center">
                <button class="bg-white text-black font-bold py-3 px-6 rounded-full hover:bg-gray-100 transition-colors w-full">
                    ✨ Escolher Este Roteiro
                </button>
            </div>
        </div>
    `;
    
    return card;
}

/**
 * Cria um card de resultado completo (expandido)
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
                        <div class="mt-4">
                            <h6 class="text-gold-primary font-semibold mb-3">🏍️ Dicas Especializadas:</h6>
                            <div class="space-y-2">
                                ${destino.dicas_motociclista.map(dica => {
                                    const icon = dica.toLowerCase().includes('estrada') ? '🛣️' :
                                               dica.toLowerCase().includes('segurança') ? '🔒' :
                                               dica.toLowerCase().includes('equipamento') ? '🛡️' :
                                               dica.toLowerCase().includes('horário') ? '⏰' :
                                               dica.toLowerCase().includes('emergência') ? '🚨' : '💡';
                                    return `<div class="bg-gray-600 rounded-lg p-2">
                                        <span class="text-lg mr-2">${icon}</span>
                                        <span class="text-gray-200 text-sm">${dica}</span>
                                    </div>`;
                                }).join('')}
                            </div>
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
        
        <!-- Botões de Ação -->
        <div class="mt-6 pt-4 border-t border-gray-700">
            <!-- Compartilhamento Social -->
            <div class="mb-4">
                <h5 class="text-gold-primary font-semibold mb-3">📱 Compartilhar com o Grupo</h5>
                <div class="flex flex-wrap gap-2">
                    <button onclick="shareWhatsApp(${index})" class="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm transition-colors">
                        <i class="fab fa-whatsapp mr-2"></i>WhatsApp
                    </button>
                    <button onclick="shareInstagram(${index})" class="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-3 py-2 rounded-lg text-sm transition-colors">
                        <i class="fab fa-instagram mr-2"></i>Instagram
                    </button>
                    <button onclick="shareLink(${index})" class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm transition-colors">
                        <i class="fas fa-link mr-2"></i>Link de Convite
                    </button>
                    <button onclick="generateQRCode(${index})" class="bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-lg text-sm transition-colors">
                        <i class="fas fa-qrcode mr-2"></i>QR Code
                    </button>
                </div>
            </div>
            
            <!-- Ferramentas -->
            <div class="mb-4">
                <h5 class="text-gold-primary font-semibold mb-3">🛠️ Ferramentas</h5>
                <div class="flex flex-wrap gap-2">
                    <button onclick="addToCalendar(${index})" class="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm transition-colors">
                        <i class="fas fa-calendar-plus mr-2"></i>Google Calendar
                    </button>
                    <button onclick="showMap(${index})" class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm transition-colors">
                        <i class="fas fa-map-marked-alt mr-2"></i>Ver no Mapa
                    </button>
                    <button onclick="saveRoteiro(${index})" class="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-2 rounded-lg text-sm transition-colors">
                        <i class="fas fa-bookmark mr-2"></i>Salvar Favorito
                    </button>
                    <button onclick="downloadPDF(${index})" class="bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-lg text-sm transition-colors">
                        <i class="fas fa-file-pdf mr-2"></i>Download PDF
                    </button>
                </div>
            </div>
        </div>
    `;
    
    return card;
}

/**
 * Utilitários
 */
function getFormData() {
    try {
        const preferencias = [];
        document.querySelectorAll('input[type="checkbox"]:checked').forEach(cb => {
            const label = cb.closest('label');
            if (label) {
                preferencias.push(label.textContent.trim());
            }
        });
        
        // Função helper para obter valor com fallback
        const getFieldValue = (id, defaultValue = '') => {
            const element = safeGetElement(id);
            return element ? element.value : defaultValue;
        };
        
        // Campos obrigatórios
        const enderecoPartida = getFieldValue('endereco-partida');
        const dataRole = getFieldValue('data-role');
        const horarioSaida = getFieldValue('horario-saida');
        const horarioVolta = getFieldValue('horario-volta');
        const tipoMoto = getFieldValue('tipo-moto');
        const perfilPilotagem = getFieldValue('perfil-pilotagem');
        const experienciaDesejada = getFieldValue('experiencia-desejada');
        
        // Validação de campos obrigatórios
        if (!enderecoPartida || !dataRole || !horarioSaida || !horarioVolta || !tipoMoto || !perfilPilotagem || !experienciaDesejada) {
            throw new Error('Campos obrigatórios não preenchidos');
        }
        
        // Campos opcionais
        const orcamentoValue = getFieldValue('orcamento-role');
        const quilometragemValue = getFieldValue('quilometragem-desejada');
        
        return {
            // Obrigatórios
            enderecoPartida,
            dataRole,
            horarioSaida,
            horarioVolta,
            tipoMoto,
            perfilPilotagem,
            experienciaDesejada,
            
            // Opcionais (com valores padrão)
            orcamento: orcamentoValue ? parseInt(orcamentoValue) : null,
            quilometragemDesejada: quilometragemValue || null,
            nivelAventura: getFieldValue('nivel-aventura', 'moderado'),
            companhia: getFieldValue('companhia', 'dupla'),
            preferenciasExtras: getFieldValue('preferencias-extras'),
            preferencias: preferencias
        };
        
    } catch (error) {
        console.error('❌ Erro ao coletar dados do formulário:', error);
        throw new Error('Erro ao processar formulário. Verifique se todos os campos obrigatórios estão preenchidos.');
    }
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

function getQuilometragemRange(tipo) {
    const ranges = {
        'curto': '50-100 km (ideal para meio período)',
        'medio': '100-200 km (dia completo relaxado)',
        'longo': '200-300 km (dia de aventura)',
        'muito-longo': '300+ km (épico de longa distância)'
    };
    return ranges[tipo] || 'Não especificada';
}

function validateForm() {
    // Apenas campos OBRIGATÓRIOS para traçar a rota
    const requiredFields = [
        'endereco-partida', 'data-role', 'horario-saida', 
        'horario-volta', 'tipo-moto', 'perfil-pilotagem', 
        'experiencia-desejada'
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
    const submitButton = document.querySelector('button[type="submit"]');
    
    if (loading && resultsSection) {
        loading.classList.remove('hidden');
        resultsSection.classList.remove('hidden');
        
        // Atualiza o botão
        if (submitButton) {
            submitButton.disabled = true;
            submitButton.innerHTML = `
                <div class="flex items-center justify-center">
                    <div class="animate-spin w-5 h-5 border-3 border-white border-t-transparent rounded-full mr-3"></div>
                    🤖 Gerando 3 Sugestões...
                </div>
            `;
            submitButton.classList.add('opacity-75', 'cursor-not-allowed');
        }
        
        // Scroll para loading
        setTimeout(() => {
            loading.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center' 
            });
        }, 100);
        
        // Mostra notificação
        showNotification('🧠 IA analisando suas preferências...', 'info');
    }
}

function hideLoading() {
    const loading = document.getElementById('loading-role');
    const submitButton = document.querySelector('button[type="submit"]');
    
    if (loading) {
        loading.classList.add('hidden');
    }
    
    // Restaura o botão
    if (submitButton) {
        submitButton.disabled = false;
        submitButton.innerHTML = `
            <i class="fas fa-magic mr-2"></i>
            🚀 Criar Rolê Perfeito
        `;
        submitButton.classList.remove('opacity-75', 'cursor-not-allowed');
    }
}

function hideResults() {
    const resultsSection = document.getElementById('results-section');
    if (resultsSection) {
        resultsSection.classList.add('hidden');
    }
    
    // Reset global variables
    generatedRoteiros = [];
    currentResults = [];
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

// ===============================
// FUNÇÕES DE COMPARTILHAMENTO
// ===============================

let generatedRoteiros = []; // Armazena os roteiros gerados

/**
 * Gerar link único para votação colaborativa
 */
function generateCollaborativeLink(roteiros, formData) {
    const roteiroData = {
        id: Date.now().toString(36) + Math.random().toString(36).substr(2),
        roteiros: roteiros,
        formData: formData,
        criado: new Date().toISOString(),
        votos: {},
        status: 'voting' // voting, decided
    };
    
    // Salva na lista de roteiros colaborativos
    const colaborativos = JSON.parse(localStorage.getItem('sop_roteiros_colaborativos') || '[]');
    colaborativos.push(roteiroData);
    localStorage.setItem('sop_roteiros_colaborativos', JSON.stringify(colaborativos));
    
    return `${window.location.origin}${window.location.pathname}?collaborative=${roteiroData.id}`;
}

/**
 * Compartilhar para votação colaborativa
 */
function shareForVoting() {
    if (!generatedRoteiros || generatedRoteiros.length === 0) return;
    
    const collaborativeLink = generateCollaborativeLink(generatedRoteiros, lastFormData);
    
    const texto = `🏍️ *Votação de Role - Sons of Peaky*\n\n` +
        `Ajude a escolher o melhor roteiro entre 3 opções:\n\n` +
        `📅 *Saída:* ${lastFormData.pontoPartida}\n` +
        `🕐 *Horário:* ${lastFormData.horarioPreferido}\n` +
        `🎯 *Experiência:* ${lastFormData.experienciaDesejada}\n\n` +
        `🗳️ *Vote aqui:* ${collaborativeLink}\n\n` +
        `#SonsOfPeaky #MotoRole`;
    
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(texto)}`;
    window.open(whatsappUrl, '_blank');
    
    // Copia o link também
    navigator.clipboard.writeText(collaborativeLink).then(() => {
        showNotification('🔗 Link de votação copiado e WhatsApp aberto!', 'success');
    });
    
    trackEvent('share_collaborative_voting', { link: collaborativeLink });
}

/**
 * Verifica se é um link colaborativo
 */
function checkCollaborativeLink() {
    const urlParams = new URLSearchParams(window.location.search);
    const collaborativeId = urlParams.get('collaborative');
    
    if (collaborativeId) {
        loadCollaborativeVoting(collaborativeId);
    }
}

/**
 * Carrega interface de votação colaborativa
 */
function loadCollaborativeVoting(collaborativeId) {
    const colaborativos = JSON.parse(localStorage.getItem('sop_roteiros_colaborativos') || '[]');
    const roteiroData = colaborativos.find(r => r.id === collaborativeId);
    
    if (!roteiroData) {
        showNotification('❌ Link de votação não encontrado ou expirado!', 'error');
        return;
    }
    
    // Esconde o formulário e mostra interface de votação
    const formContainer = document.querySelector('.form-container, form').parentElement;
    if (formContainer) {
        formContainer.style.display = 'none';
    }
    
    // Cria interface de votação
    const votingContainer = document.createElement('div');
    votingContainer.className = 'container mx-auto px-4 py-8';
    votingContainer.innerHTML = `
        <div class="text-center mb-8">
            <h1 class="text-4xl font-bold text-gold-primary mb-4">🗳️ Votação de Role</h1>
            <p class="text-gray-300 text-lg">Vote no melhor roteiro para o grupo!</p>
            <div class="bg-gray-800 rounded-lg p-4 mt-4 inline-block">
                <p class="text-sm text-gray-400">📅 Saída: ${roteiroData.formData.pontoPartida}</p>
                <p class="text-sm text-gray-400">🕐 Horário: ${roteiroData.formData.horarioPreferido}</p>
                <p class="text-sm text-gray-400">🎯 Experiência: ${roteiroData.formData.experienciaDesejada}</p>
            </div>
        </div>
        
        <div class="grid md:grid-cols-3 gap-6 mb-8" id="voting-suggestions">
            ${roteiroData.roteiros.map((roteiro, index) => createVotingCard(roteiro, index, collaborativeId, roteiroData.votos)).join('')}
        </div>
        
        <div class="text-center">
            <div class="bg-gray-800 rounded-lg p-4 inline-block">
                <h3 class="text-lg font-bold text-gold-primary mb-2">📊 Resultado da Votação</h3>
                <div id="voting-results">
                    ${generateVotingResults(roteiroData.votos, roteiroData.roteiros)}
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(votingContainer);
}

/**
 * Cria card de votação
 */
function createVotingCard(roteiro, index, collaborativeId, votos) {
    const voteCount = Object.values(votos).filter(v => v === index).length;
    const hasVoted = localStorage.getItem(`voted_${collaborativeId}`) !== null;
    const userVote = localStorage.getItem(`voted_${collaborativeId}`);
    const isUserChoice = userVote == index;
    
    return `
        <div class="bg-gray-800 rounded-xl p-6 hover:bg-gray-750 transition-colors ${isUserChoice ? 'ring-2 ring-gold-primary' : ''}">
            <div class="text-center mb-4">
                <div class="bg-gradient-to-r ${index === 0 ? 'from-green-600 to-green-700' : index === 1 ? 'from-blue-600 to-blue-700' : 'from-purple-600 to-purple-700'} text-white px-3 py-1 rounded-full text-sm font-bold inline-block">
                    ${roteiro.tipo}
                </div>
            </div>
            
            <h3 class="text-xl font-bold text-white mb-3 text-center">${roteiro.titulo}</h3>
            
            <div class="space-y-2 mb-6">
                <div class="flex justify-between">
                    <span class="text-gray-400">💰 Custo:</span>
                    <span class="text-gold-secondary font-semibold">${roteiro.custo_total_estimado}</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-gray-400">📍 Distância:</span>
                    <span class="text-white">${roteiro.distancia_total}</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-gray-400">⏱️ Tempo:</span>
                    <span class="text-white">${roteiro.tempo_total}</span>
                </div>
            </div>
            
            <p class="text-gray-300 text-sm mb-6">${roteiro.resumo}</p>
            
            <div class="text-center">
                ${hasVoted ? 
                    `<div class="mb-4">
                        <span class="text-lg">📊 ${voteCount} voto${voteCount !== 1 ? 's' : ''}</span>
                        ${isUserChoice ? '<div class="text-gold-primary text-sm mt-1">✅ Seu voto</div>' : ''}
                    </div>` 
                    : 
                    `<button onclick="voteForRoteiro('${collaborativeId}', ${index})" class="bg-gold-primary hover:bg-gold-secondary text-black px-6 py-3 rounded-lg font-bold transition-colors w-full">
                        🗳️ Votar Neste
                    </button>`
                }
            </div>
        </div>
    `;
}

/**
 * Votar em roteiro
 */
function voteForRoteiro(collaborativeId, roteiroIndex) {
    const userId = localStorage.getItem('sop_user_id') || generateUserId();
    localStorage.setItem('sop_user_id', userId);
    
    // Carrega dados colaborativos
    const colaborativos = JSON.parse(localStorage.getItem('sop_roteiros_colaborativos') || '[]');
    const roteiroData = colaborativos.find(r => r.id === collaborativeId);
    
    if (!roteiroData) return;
    
    // Registra o voto
    roteiroData.votos[userId] = roteiroIndex;
    localStorage.setItem('sop_roteiros_colaborativos', JSON.stringify(colaborativos));
    
    // Marca que o usuário votou
    localStorage.setItem(`voted_${collaborativeId}`, roteiroIndex);
    
    // Recarrega a interface
    loadCollaborativeVoting(collaborativeId);
    
    showNotification('✅ Voto registrado com sucesso!', 'success');
}

/**
 * Gera ID único do usuário
 */
function generateUserId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Gera resultados da votação
 */
function generateVotingResults(votos, roteiros) {
    const results = [0, 1, 2].map(index => ({
        index,
        count: Object.values(votos).filter(v => v === index).length,
        roteiro: roteiros[index]
    }));
    
    results.sort((a, b) => b.count - a.count);
    
    const totalVotes = Object.keys(votos).length;
    
    if (totalVotes === 0) {
        return '<p class="text-gray-400">Nenhum voto ainda</p>';
    }
    
    return results.map((result, position) => {
        const percentage = totalVotes > 0 ? (result.count / totalVotes * 100).toFixed(1) : 0;
        const medal = position === 0 ? '🥇' : position === 1 ? '🥈' : '🥉';
        
        return `
            <div class="flex justify-between items-center py-2 ${position === 0 ? 'text-gold-primary font-bold' : 'text-gray-300'}">
                <span>${medal} ${result.roteiro.tipo}</span>
                <span>${result.count} voto${result.count !== 1 ? 's' : ''} (${percentage}%)</span>
            </div>
        `;
    }).join('');
}

/**
 * Compartilhar no WhatsApp
 */
function shareWhatsApp(index) {
    const roteiro = generatedRoteiros[index];
    if (!roteiro) return;
    
    const message = `🏍️ *${roteiro.titulo}* 🏍️

📅 *Detalhes do Rolê:*
📍 Distância: ${roteiro.distancia_total}
⏱️ Tempo: ${roteiro.tempo_total}
💰 Custo: ${roteiro.custo_total_estimado}
🎢 Dificuldade: ${roteiro.nivel_dificuldade}

🗺️ *Destinos:*
${roteiro.destinos.map((d, i) => `${i + 1}. ${d.nome}\n   📍 ${d.endereco}\n   💰 ${d.custo_estimado}`).join('\n\n')}

🔗 *Quer participar?* Acesse: ${generateRoleLink(index)}

_Gerado por Sons of Peaky - Gerador de Rolês IA_`;

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    
    trackEvent('share', { type: 'whatsapp', roteiro: roteiro.titulo });
}

/**
 * Compartilhar no Instagram (gera card visual)
 */
function shareInstagram(index) {
    const roteiro = generatedRoteiros[index];
    if (!roteiro) return;
    
    generateInstagramCard(roteiro, index);
}

/**
 * Gerar link de convite
 */
function shareLink(index) {
    const link = generateRoleLink(index);
    
    if (navigator.share) {
        navigator.share({
            title: generatedRoteiros[index].titulo,
            text: `Participe do nosso rolê de moto: ${generatedRoteiros[index].titulo}`,
            url: link
        });
    } else {
        navigator.clipboard.writeText(link).then(() => {
            showNotification('Link copiado para a área de transferência!', 'success');
        });
    }
    
    trackEvent('share', { type: 'link', roteiro: generatedRoteiros[index].titulo });
}

/**
 * Gerar QR Code
 */
function generateQRCode(index) {
    const link = generateRoleLink(index);
    const qrModal = document.createElement('div');
    qrModal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    qrModal.innerHTML = `
        <div class="bg-gray-800 p-6 rounded-lg max-w-sm w-full mx-4">
            <h3 class="text-xl font-bold text-white mb-4 text-center">📱 QR Code do Rolê</h3>
            <div class="bg-white p-4 rounded-lg mb-4 flex justify-center">
                <canvas id="qr-canvas" width="200" height="200"></canvas>
            </div>
            <p class="text-gray-300 text-sm text-center mb-4">Compartilhe este QR Code para que seus amigos acessem os detalhes do rolê</p>
            <div class="flex gap-2">
                <button onclick="downloadQR()" class="flex-1 bg-blue-600 text-white py-2 rounded">Download</button>
                <button onclick="closeModal()" class="flex-1 bg-gray-600 text-white py-2 rounded">Fechar</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(qrModal);
    generateQRCanvas(link, 'qr-canvas');
    
    window.closeModal = () => {
        document.body.removeChild(qrModal);
        delete window.closeModal;
        delete window.downloadQR;
    };
    
    window.downloadQR = () => {
        const canvas = document.getElementById('qr-canvas');
        const link = document.createElement('a');
        link.download = `role-qr-${generatedRoteiros[index].titulo.replace(/[^a-zA-Z0-9]/g, '-')}.png`;
        link.href = canvas.toDataURL();
        link.click();
    };
}

/**
 * Adicionar ao Google Calendar
 */
function addToCalendar(index) {
    const roteiro = generatedRoteiros[index];
    if (!roteiro) return;
    
    // Precisamos dos dados do formulário original para pegar data/horários
    const formData = getLastFormData();
    if (!formData) {
        showNotification('Dados do formulário não encontrados', 'error');
        return;
    }
    
    // Cria modal de confirmação para múltiplas entradas
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4';
    modal.innerHTML = `
        <div class="bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-auto">
            <div class="p-6 border-b border-gray-700">
                <div class="flex justify-between items-center">
                    <h2 class="text-2xl font-bold text-gold-primary">📅 Adicionar ao Google Calendar</h2>
                    <button onclick="closeCalendarModal()" class="text-gray-400 hover:text-white text-xl">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
            
            <div class="p-6">
                <div class="mb-6">
                    <h3 class="text-lg font-bold text-white mb-3">Escolha como adicionar:</h3>
                    <div class="space-y-3">
                        <button onclick="createSingleEvent(${index})" class="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg transition-colors text-left">
                            <div class="font-bold">📍 Evento Único</div>
                            <div class="text-sm text-blue-200">Um evento para todo o rolê (${formData.horarioSaida} - ${formData.horarioVolta})</div>
                        </button>
                        
                        <button onclick="createMultipleEvents(${index})" class="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-lg transition-colors text-left">
                            <div class="font-bold">🎯 Paradas Separadas</div>
                            <div class="text-sm text-purple-200">Uma entrada para cada destino com horários específicos</div>
                        </button>
                    </div>
                </div>
                
                <div class="bg-gray-700 rounded-lg p-4">
                    <h4 class="text-gold-primary font-bold mb-3">📋 Checklist será incluído:</h4>
                    <div class="text-sm text-gray-300 space-y-1">
                        ${generateCalendarChecklist(roteiro)}
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Funções do modal
    window.closeCalendarModal = () => {
        document.body.removeChild(modal);
        delete window.closeCalendarModal;
        delete window.createSingleEvent;
        delete window.createMultipleEvents;
    };
    
    window.createSingleEvent = (idx) => {
        createSingleCalendarEvent(idx);
        closeCalendarModal();
    };
    
    window.createMultipleEvents = (idx) => {
        createMultipleCalendarEvents(idx);
        closeCalendarModal();
    };
}

/**
 * Gera checklist para o calendário
 */
function generateCalendarChecklist(roteiro) {
    const allTips = new Set();
    
    if (roteiro.destinos) {
        roteiro.destinos.forEach(destino => {
            if (destino.dicas_motociclista) {
                destino.dicas_motociclista.forEach(dica => {
                    const cleanTip = dica.replace(/^[^:]+:\s*/, '').trim();
                    if (cleanTip.length > 10) {
                        allTips.add(`• ${cleanTip}`);
                    }
                });
            }
        });
    }
    
    return Array.from(allTips).slice(0, 5).join('\\n') + (allTips.size > 5 ? '\\n• E mais...' : '');
}

/**
 * Cria evento único no Google Calendar
 */
function createSingleCalendarEvent(index) {
    const roteiro = generatedRoteiros[index];
    const formData = getLastFormData();
    
    const startDate = new Date(`${formData.dataRole}T${formData.horarioSaida}`);
    const endDate = new Date(`${formData.dataRole}T${formData.horarioVolta}`);
    
    const eventTitle = `🏍️ ${roteiro.titulo}`;
    const checklist = generateCalendarChecklist(roteiro);
    const eventDescription = `${roteiro.resumo}\\n\\n📍 DESTINOS:\\n${roteiro.destinos.map(d => `• ${d.nome} - ${d.endereco}`).join('\\n')}\\n\\n📋 CHECKLIST:\\n${checklist}\\n\\n💰 Custo: ${roteiro.custo_total_estimado}\\n📏 Distância: ${roteiro.distancia_total}`;
    
    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(eventTitle)}&dates=${startDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z/${endDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z&details=${encodeURIComponent(eventDescription)}&location=${encodeURIComponent(formData.pontoPartida)}`;
    
    window.open(googleCalendarUrl, '_blank');
    showNotification('📅 Evento único criado no Google Calendar!', 'success');
    trackEvent('calendar_export', { roteiro: roteiro.titulo, type: 'single' });
}

/**
 * Cria múltiplos eventos no Google Calendar
 */
function createMultipleCalendarEvents(index) {
    const roteiro = generatedRoteiros[index];
    const formData = getLastFormData();
    
    let currentTime = new Date(`${formData.dataRole}T${formData.horarioSaida}`);
    
    // Evento principal de partida
    const mainEventTitle = `🏍️ ${roteiro.titulo} - SAÍDA`;
    const checklist = generateCalendarChecklist(roteiro);
    const mainEventDescription = `🚀 INÍCIO DO ROLÊ\\n\\n📋 CHECKLIST COMPLETO:\\n${checklist}\\n\\n🎯 ROTEIRO:\\n${roteiro.destinos.map(d => `• ${d.nome}`).join('\\n')}\\n\\n💰 Custo Total: ${roteiro.custo_total_estimado}`;
    
    const mainEventEnd = new Date(currentTime.getTime() + 30 * 60000); // 30 min depois
    
    const mainUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(mainEventTitle)}&dates=${currentTime.toISOString().replace(/[-:]/g, '').split('.')[0]}Z/${mainEventEnd.toISOString().replace(/[-:]/g, '').split('.')[0]}Z&details=${encodeURIComponent(mainEventDescription)}&location=${encodeURIComponent(formData.pontoPartida)}`;
    
    window.open(mainUrl, '_blank');
    
    // Eventos para cada destino (com delay para não sobrecarregar)
    roteiro.destinos.forEach((destino, idx) => {
        setTimeout(() => {
            if (destino.horario_chegada) {
                const [hours, minutes] = destino.horario_chegada.split(':');
                const eventStart = new Date(`${formData.dataRole}T${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`);
                const eventEnd = new Date(eventStart.getTime() + (parseInt(destino.tempo_permanencia) || 60) * 60000);
                
                const eventTitle = `📍 ${destino.nome}`;
                const destinoDicas = destino.dicas_motociclista ? destino.dicas_motociclista.map(d => `• ${d}`).join('\\n') : '';
                const eventDescription = `${destino.descricao}\\n\\n⏱️ Tempo de permanência: ${destino.tempo_permanencia || '60'} min\\n\\n💰 Custo estimado: ${destino.custo_estimado}\\n\\n🏍️ DICAS ESPECÍFICAS:\\n${destinoDicas}`;
                
                const destUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(eventTitle)}&dates=${eventStart.toISOString().replace(/[-:]/g, '').split('.')[0]}Z/${eventEnd.toISOString().replace(/[-:]/g, '').split('.')[0]}Z&details=${encodeURIComponent(eventDescription)}&location=${encodeURIComponent(destino.endereco)}`;
                
                window.open(destUrl, '_blank');
            }
        }, idx * 1000); // Delay de 1s entre cada abertura
    });
    
    showNotification(`📅 ${roteiro.destinos.length + 1} eventos criados no Google Calendar!`, 'success');
    trackEvent('calendar_export', { roteiro: roteiro.titulo, type: 'multiple', count: roteiro.destinos.length + 1 });
}

/**
 * Mostrar no mapa
 */
function showMap(index) {
    const roteiro = generatedRoteiros[index];
    if (!roteiro) return;
    
    const mapModal = document.createElement('div');
    mapModal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    mapModal.innerHTML = `
        <div class="bg-gray-800 p-6 rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-auto">
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-xl font-bold text-white">🗺️ Mapa do Roteiro</h3>
                <button onclick="closeMapModal()" class="text-gray-400 hover:text-white">
                    <i class="fas fa-times text-xl"></i>
                </button>
            </div>
            <div class="space-y-3">
                ${roteiro.destinos.map((destino, i) => `
                    <div class="bg-gray-700 p-3 rounded flex items-center justify-between">
                        <div>
                            <strong class="text-white">${i + 1}. ${destino.nome}</strong>
                            <p class="text-gray-400 text-sm">${destino.endereco}</p>
                        </div>
                        <button onclick="openGoogleMaps('${destino.endereco}')" class="bg-blue-600 text-white px-3 py-1 rounded text-sm">
                            Abrir no Maps
                        </button>
                    </div>
                `).join('')}
            </div>
            <div class="mt-4 text-center">
                <button onclick="openFullRoute(${index})" class="bg-green-600 text-white px-6 py-2 rounded">
                    🗺️ Ver Rota Completa no Google Maps
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(mapModal);
    
    window.closeMapModal = () => {
        document.body.removeChild(mapModal);
        delete window.closeMapModal;
        delete window.openGoogleMaps;
        delete window.openFullRoute;
    };
    
    window.openGoogleMaps = (endereco) => {
        window.open(`https://www.google.com/maps/search/${encodeURIComponent(endereco)}`, '_blank');
    };
    
    window.openFullRoute = (roteiroIndex) => {
        const formData = getLastFormData();
        const roteiro = generatedRoteiros[roteiroIndex];
        
        const origem = encodeURIComponent(formData.enderecoPartida);
        const destinos = roteiro.destinos.map(d => encodeURIComponent(d.endereco)).join('/');
        
        const mapsUrl = `https://www.google.com/maps/dir/${origem}/${destinos}`;
        window.open(mapsUrl, '_blank');
    };
}

/**
 * Download PDF
 */
function downloadPDF(index) {
    const roteiro = generatedRoteiros[index];
    if (!roteiro) return;
    
    // Para implementação futura - usar jsPDF ou similar
    showNotification('Funcionalidade de PDF em desenvolvimento', 'info');
    trackEvent('pdf_download', { roteiro: roteiro.titulo });
}

// Funções auxiliares para compartilhamento
function generateRoleLink(index) {
    const roteiro = generatedRoteiros[index];
    const baseUrl = window.location.origin + window.location.pathname;
    
    // Salva o roteiro no localStorage com ID único
    const roteiroId = Date.now().toString(36) + Math.random().toString(36).substr(2);
    localStorage.setItem(`role_${roteiroId}`, JSON.stringify({
        roteiro: roteiro,
        formData: getLastFormData(),
        timestamp: Date.now()
    }));
    
    return `${baseUrl}?role=${roteiroId}`;
}

function generateQRCanvas(text, canvasId) {
    // Implementação básica de QR Code - para produção usar biblioteca como qrcode.js
    const canvas = document.getElementById(canvasId);
    const ctx = canvas.getContext('2d');
    
    // Placeholder - desenha um quadrado com texto
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, 200, 200);
    ctx.fillStyle = '#fff';
    ctx.fillRect(20, 20, 160, 160);
    ctx.fillStyle = '#000';
    ctx.font = '12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('QR CODE', 100, 100);
    ctx.fillText('(Em desenvolvimento)', 100, 120);
}

function generateInstagramCard(roteiro, index) {
    // Cria card visual para Instagram
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1080;
    const ctx = canvas.getContext('2d');
    
    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, 1080);
    gradient.addColorStop(0, '#000000');
    gradient.addColorStop(1, '#1a1a1a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1080, 1080);
    
    // Título
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(roteiro.titulo, 540, 200);
    
    // Informações
    ctx.fillStyle = '#ffffff';
    ctx.font = '32px Arial';
    ctx.fillText(`💰 ${roteiro.custo_total_estimado}`, 540, 300);
    ctx.fillText(`📍 ${roteiro.distancia_total}`, 540, 350);
    ctx.fillText(`⏱️ ${roteiro.tempo_total}`, 540, 400);
    
    // QR Code placeholder
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(390, 500, 300, 300);
    ctx.fillStyle = '#000000';
    ctx.font = '24px Arial';
    ctx.fillText('Sons of Peaky', 540, 650);
    ctx.fillText('Gerador de Rolês', 540, 680);
    
    // Download
    const link = document.createElement('a');
    link.download = `instagram-${roteiro.titulo.replace(/[^a-zA-Z0-9]/g, '-')}.png`;
    link.href = canvas.toDataURL();
    link.click();
    
    showNotification('Card do Instagram baixado!', 'success');
}

let lastFormData = null;
function getLastFormData() {
    return lastFormData;
}

/**
 * Seleciona um roteiro e expande com opções de compartilhamento
 */
function selectRoteiro(index) {
    const roteiro = generatedRoteiros[index];
    if (!roteiro) return;
    
    // Esconde as sugestões com animação
    const suggestionsGrid = document.getElementById('suggestions-grid');
    suggestionsGrid.style.transform = 'translateY(-20px)';
    suggestionsGrid.style.opacity = '0';
    
    setTimeout(() => {
        suggestionsGrid.classList.add('hidden');
        
        // Mostra o roteiro expandido
        const selectedContainer = document.getElementById('selected-roteiro');
        selectedContainer.classList.remove('hidden');
        selectedContainer.innerHTML = `
            <div class="text-center mb-6">
                <h2 class="text-3xl font-bold text-gold-primary mb-2">🎉 Roteiro Selecionado!</h2>
                <p class="text-gray-300">Agora você pode compartilhar com seus amigos e organizar o grupo</p>
                <button onclick="showSuggestions()" class="text-blue-400 underline mt-2 hover:text-blue-300">
                    ← Voltar para as opções
                </button>
            </div>
        `;
        
        const expandedCard = createResultCard(roteiro, index);
        expandedCard.classList.add('animate-fade-in');
        selectedContainer.appendChild(expandedCard);
        
        // Scroll suave para o card expandido
        setTimeout(() => {
            selectedContainer.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
            });
        }, 100);
        
    }, 300);
    
    trackEvent('roteiro_selected', { 
        tipo: roteiro.tipo, 
        titulo: roteiro.titulo 
    });
}

/**
 * Volta para as sugestões
 */
function showSuggestions() {
    const suggestionsGrid = document.getElementById('suggestions-grid');
    const selectedContainer = document.getElementById('selected-roteiro');
    
    // Esconde roteiro expandido
    selectedContainer.classList.add('hidden');
    
    // Mostra sugestões novamente
    suggestionsGrid.classList.remove('hidden');
    suggestionsGrid.style.transform = 'translateY(0)';
    suggestionsGrid.style.opacity = '1';
    
    // Scroll suave para as sugestões
    setTimeout(() => {
        suggestionsGrid.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
        });
    }, 100);
}

/**
 * Salvar roteiro nos favoritos
 */
function saveRoteiro(index) {
    const roteiro = generatedRoteiros[index];
    if (!roteiro) return;
    
    const favoritos = JSON.parse(localStorage.getItem('sop_roteiros_favoritos') || '[]');
    
    // Verifica se já existe
    const jaExiste = favoritos.some(fav => fav.roteiro.titulo === roteiro.titulo);
    if (jaExiste) {
        showNotification(`⚠️ "${roteiro.titulo}" já está nos favoritos!`, 'warning');
        return;
    }
    
    const roteiroFavorito = {
        id: Date.now().toString(36),
        roteiro: roteiro,
        formData: lastFormData,
        dataSalvo: new Date().toISOString(),
        titulo: roteiro.titulo
    };
    
    favoritos.push(roteiroFavorito);
    localStorage.setItem('sop_roteiros_favoritos', JSON.stringify(favoritos));
    
    showNotification(`✅ "${roteiro.titulo}" salvo nos favoritos! Clique em "Favoritos" no menu para ver.`, 'success');
    trackEvent('save_favorite', { roteiro: roteiro.titulo });
}

/**
 * Mostrar modal de favoritos
 */
function showFavoritos() {
    const favoritos = JSON.parse(localStorage.getItem('sop_roteiros_favoritos') || '[]');
    
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4';
    modal.innerHTML = `
        <div class="bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div class="p-6 border-b border-gray-700">
                <div class="flex justify-between items-center">
                    <h2 class="text-2xl font-bold text-gold-primary">❤️ Seus Rolês Favoritos</h2>
                    <button onclick="closeFavoritosModal()" class="text-gray-400 hover:text-white text-xl">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <p class="text-gray-400 mt-2">${favoritos.length} rolês salvos</p>
            </div>
            
            <div class="p-6">
                ${favoritos.length === 0 ? `
                    <div class="text-center py-12">
                        <div class="text-6xl mb-4">💔</div>
                        <h3 class="text-xl text-gray-400 mb-2">Nenhum rolê salvo ainda</h3>
                        <p class="text-gray-500">Gere um rolê e clique em "Salvar Favorito" para começar sua coleção!</p>
                    </div>
                ` : `
                    <div class="grid gap-4">
                        ${favoritos.map((fav, index) => `
                            <div class="bg-gray-700 rounded-lg p-4 hover:bg-gray-650 transition-colors">
                                <div class="flex justify-between items-start mb-3">
                                    <div>
                                        <h3 class="text-lg font-bold text-white">${fav.roteiro.titulo}</h3>
                                        <p class="text-gray-400 text-sm">${fav.roteiro.tipo || 'Roteiro'} • Salvo em ${new Date(fav.dataSalvo).toLocaleDateString('pt-BR')}</p>
                                    </div>
                                    <div class="text-right">
                                        <div class="text-gold-primary font-bold">${fav.roteiro.custo_total_estimado}</div>
                                        <div class="text-gray-400 text-sm">${fav.roteiro.distancia_total}</div>
                                    </div>
                                </div>
                                
                                <p class="text-gray-300 text-sm mb-3">${fav.roteiro.resumo}</p>
                                
                                <div class="flex gap-2">
                                    <button onclick="reuseRoteiro('${fav.id}')" class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm">
                                        🔄 Reutilizar
                                    </button>
                                    <button onclick="shareRoteiroFavorito('${fav.id}')" class="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm">
                                        📱 Compartilhar
                                    </button>
                                    <button onclick="deleteFavorito('${fav.id}')" class="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm">
                                        🗑️ Excluir
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `}
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Funções do modal
    window.closeFavoritosModal = () => {
        document.body.removeChild(modal);
        delete window.closeFavoritosModal;
        delete window.reuseRoteiro;
        delete window.shareRoteiroFavorito;
        delete window.deleteFavorito;
    };
    
    window.reuseRoteiro = (id) => {
        const favoritos = JSON.parse(localStorage.getItem('sop_roteiros_favoritos') || '[]');
        const favorito = favoritos.find(f => f.id === id);
        if (favorito) {
            // Preenche o formulário com os dados salvos
            if (favorito.formData) {
                Object.keys(favorito.formData).forEach(key => {
                    const element = document.getElementById(key.replace(/([A-Z])/g, '-$1').toLowerCase());
                    if (element) {
                        element.value = favorito.formData[key];
                    }
                });
            }
            closeFavoritosModal();
            showNotification('📝 Formulário preenchido com dados do favorito!', 'success');
        }
    };
    
    window.shareRoteiroFavorito = (id) => {
        const favoritos = JSON.parse(localStorage.getItem('sop_roteiros_favoritos') || '[]');
        const favorito = favoritos.find(f => f.id === id);
        if (favorito) {
            generatedRoteiros = [favorito.roteiro];
            shareWhatsApp(0);
        }
    };
    
    window.deleteFavorito = (id) => {
        const favoritos = JSON.parse(localStorage.getItem('sop_roteiros_favoritos') || '[]');
        const updatedFavoritos = favoritos.filter(f => f.id !== id);
        localStorage.setItem('sop_roteiros_favoritos', JSON.stringify(updatedFavoritos));
        closeFavoritosModal();
        showFavoritos(); // Reabre com lista atualizada
        showNotification('🗑️ Favorito excluído!', 'success');
    };
}

/**
 * Carregar roteiro compartilhado via URL
 */
function loadSharedRoteiro() {
    const urlParams = new URLSearchParams(window.location.search);
    const roleId = urlParams.get('role');
    
    if (roleId) {
        const sharedData = localStorage.getItem(`role_${roleId}`);
        if (sharedData) {
            try {
                const data = JSON.parse(sharedData);
                
                // Verifica se não é muito antigo (7 dias)
                if (Date.now() - data.timestamp < 7 * 24 * 60 * 60 * 1000) {
                    generatedRoteiros = [data.roteiro];
                    lastFormData = data.formData;
                    displayResults([data.roteiro]);
                    
                    showNotification('🔗 Rolê compartilhado carregado!', 'info');
                    
                    // Remove o parâmetro da URL
                    window.history.replaceState({}, document.title, window.location.pathname);
                } else {
                    showNotification('❌ Link do rolê expirado (7 dias)', 'error');
                }
            } catch (error) {
                showNotification('❌ Erro ao carregar rolê compartilhado', 'error');
            }
        } else {
            showNotification('❌ Rolê compartilhado não encontrado', 'error');
        }
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