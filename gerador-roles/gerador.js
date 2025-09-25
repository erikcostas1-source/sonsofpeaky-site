/**
 * Gerador de Rolês de Moto - JavaScript Principal
 * Sistema completo de geração de roteiros personalizados
 * Version: 2.0.3 - 100% IA Generativa + Cache Busting
 */

console.log('🔧 Gerador.js carregado - Version 2.0.3 - 100% IA Generativa');

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

/**
 * Classe para gerenciar serviços de API (Gemini, Unsplash)
 * Encapsula a lógica de configuração, chamadas e cache.
 */
class ApiService {
    constructor() {
        this.cache = new Map();
        this.CACHE_DURATION = 1000 * 60 * 30; // 30 minutos
    }

    /**
     * Obtém a API key de forma segura, priorizando variáveis de ambiente
     */
    getSecureApiKey(environment = 'production') {
        // Tenta buscar de variáveis de ambiente primeiro
        const envKey = window.GOOGLE_GEMINI_API_KEY || process?.env?.GOOGLE_GEMINI_API_KEY;
        if (envKey && envKey !== 'undefined') {
            return envKey;
        }

        // Tenta buscar da configuração do projeto
        const configKey = window.GERADOR_CONFIG?.apiKey || window.DEV_API_KEY;
        if (configKey && configKey !== 'SUA_CHAVE_AQUI') {
            return configKey;
        }

        // Fallback para chaves conhecidas (apenas para demonstração/desenvolvimento)
        console.warn('⚠️ Usando API key de fallback - configure GOOGLE_GEMINI_API_KEY');
        return 'AIzaSyCiHRVozYYmHB-5W64QdJzn9dQYAyRl9Tk';
    }

    /**
     * Determina a configuração da API com base no ambiente.
     */
    getAPIConfig() {
        console.log('🔍 getAPIConfig chamado - hostname:', window.location.hostname);
        const forceDevelopment = window.FORCE_DEVELOPMENT_MODE === true;
        const isNetlify = window.location.hostname.includes('netlify.app');
        const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        const isDevelopment = forceDevelopment || isLocalhost;

        if (isDevelopment) {
            const devKey = this.getSecureApiKey('development');
            console.log('🏠 Modo desenvolvimento detectado - usando API direta');
            return {
                apiUrl: `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${devKey}`,
                useServerless: false
            };
        }
        if (isNetlify) {
            console.log('🌐 Netlify detectado - usando função serverless');
            return { apiUrl: '/.netlify/functions/generate-role', useServerless: true };
        }
        // Para GitHub Pages e outros, a chave de produção é usada.
        const prodKey = this.getSecureApiKey('production');
        console.log('🌐 Produção detectada - usando API direta');
        return {
            apiUrl: `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${prodKey}`,
            useServerless: false
        };
    }

    /**
     * Busca uma imagem de destino no Unsplash.
     */
    async fetchDestinationImage(destinationName) {
        const unsplashConfig = window.GERADOR_CONFIG?.thirdParty?.unsplash;
        if (!unsplashConfig?.apiKey || unsplashConfig.apiKey === 'SUA_CHAVE_DE_ACESSO_UNSPLASH') {
            console.warn('⚠️ Chave da API do Unsplash não configurada. Usando imagem padrão.');
            return '../assets/img/card-mapas.jpg';
        }

        const query = encodeURIComponent(`${destinationName} moto viagem`);
        const url = `${unsplashConfig.apiUrl}?query=${query}&per_page=1&orientation=landscape&client_id=${unsplashConfig.apiKey}`;

        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Erro na API do Unsplash: ${response.statusText}`);
            const data = await response.json();
            return data.results?.[0]?.urls?.regular || '../assets/img/card-mapas.jpg';
        } catch (error) {
            console.error('Erro ao buscar imagem no Unsplash:', error);
            return '../assets/img/card-mapas.jpg';
        }
    }
    
    /**
     * Obtém roteiros da IA, utilizando cache.
     */
    async getRoteiros(prompt, formData) {
        const cacheKey = this.generateCacheKey(prompt, formData);
        const cached = this.getCachedResponse(cacheKey);
        
        if (cached) {
            console.log('📦 Usando resposta do cache');
            return cached;
        }

        const config = this.getAPIConfig();
        const requestBody = {
            contents: [{
                parts: [{
                    text: prompt
                }]
            }],
            generationConfig: {
                temperature: 0.8,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 2048
            }
        };

        try {
            const response = await fetch(config.apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: config.useServerless ? JSON.stringify({ prompt }) : JSON.stringify(requestBody)
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            let responseText;

            if (config.useServerless) {
                responseText = data.response || data.text || JSON.stringify(data);
            } else {
                responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || 
                               JSON.stringify(data);
            }

            this.setCachedResponse(cacheKey, responseText);
            return responseText;
        } catch (error) {
            console.error('❌ Erro na API:', error);
            throw error;
        }
    }

    /**
     * Gera chave de cache baseada no prompt e dados do formulário
     */
    generateCacheKey(prompt, formData) {
        const keyData = {
            prompt: prompt.substring(0, 100),
            endereco: formData.enderecoPartida,
            experiencia: formData.experienciaDesejada,
            orcamento: formData.orcamento
        };
        return btoa(JSON.stringify(keyData)).substring(0, 20);
    }

    /**
     * Obtém resposta do cache
     */
    getCachedResponse(key) {
        const cached = this.cache.get(key);
        if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
            return cached.data;
        }
        this.cache.delete(key);
        return null;
    }

    /**
     * Salva resposta no cache
     */
    setCachedResponse(key, data) {
        this.cache.set(key, {
            data,
            timestamp: Date.now()
        });
    }
}

// Instanciar o serviço de API
const apiService = new ApiService();

// Configuração da API - usando apiService para consistência
function getAPIConfig() {
    return apiService.getAPIConfig();
}

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
        if (window.destinos && window.destinos.length > 0) {
            console.log(`📍 ${window.destinos.length} destinos carregados`);
        } else if (window.DESTINOS_DATABASE) {
            const totalDestinos = Object.values(window.DESTINOS_DATABASE).flat().length;
            console.log(`📍 ${totalDestinos} destinos carregados via DESTINOS_DATABASE`);
        } else {
            console.warn('⚠️ Destinos não carregados - fallback será limitado');
        }
        
        // Carrega roteiro compartilhado se houver
        loadSharedRoteiro();
        
        // Inicializa PWA
        initializePWA();
        
        // Adiciona botão de Histórico no header
        const headerActions = safeQuerySelector('header .flex.items-center.space-x-4');
        if (headerActions && !safeGetElement('history-btn')) {
            const historyButton = document.createElement('button');
            historyButton.id = 'history-btn';
            historyButton.className = 'text-white hover:text-gold-primary transition-colors hidden md:flex items-center';
            historyButton.innerHTML = '<i class="fas fa-history mr-1"></i>Histórico';
            historyButton.onclick = () => showHistoryModal();
            headerActions.insertBefore(historyButton, headerActions.querySelector('#mobile-menu-btn'));
        }
        
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
    
    const formData = getFormData(true); // true = validação rigorosa para submissão
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
    const cacheKey = JSON.stringify({ prompt: formData.experienciaDesejada, partida: formData.enderecoPartida });
    
    // Verifica cache
    if (apiService.cache.has(cacheKey) && !window.FORCE_RELOAD) {
        const cached = apiService.cache.get(cacheKey);
        if (Date.now() - cached.timestamp < apiService.CACHE_DURATION) {
            console.log('📦 Usando resultado do cache');
            return cached.data;
        }
        apiService.cache.delete(cacheKey);
    }
    
    const prompt = buildAdvancedPrompt(formData); // Usando o novo prompt
    console.log('🧠 Prompt gerado:', prompt.substring(0, 300) + '...');
    
    try {
        // A lógica de chamada foi movida para a ApiService para melhor organização.
        // A função generateRole agora apenas orquestra.
        const finalResponse = await apiService.getRoteiros(prompt, formData);

        const results = parseAdvancedAIResponse(finalResponse, formData); // Usando o novo parser
        
        // Busca imagens para cada sugestão
        const imagePromises = results.map(roteiro => apiService.fetchDestinationImage(roteiro.titulo));
        const images = await Promise.all(imagePromises);
        results.forEach((roteiro, index) => {
            roteiro.imageUrl = images[index];
        });

        // Salva no cache através do serviço
        apiService.cache.set(cacheKey, {
            data: results,
            timestamp: Date.now()
        });
        
        return results;
        
    } catch (error) {
        console.error('❌ Erro na geração via IA:', error);
        // Notificar usuário e re-throw com mensagem mais clara
        showNotification('❌ Erro na geração do roteiro. Verifique sua conexão.', 'error');
        throw new Error('Não foi possível gerar o rolê via IA. Verifique sua conexão com a internet e tente novamente.');
    }
}

/**
 * Constrói o prompt AVANÇADO para a IA (movido de app.js)
 */
function buildAdvancedPrompt(formData) {
    const {
        experienciaDesejada,
        enderecoPartida,
        capacidadeTanque,
        consumoMedio,
        perfilPilotagem,
        horarioSaida,
        horarioVolta
    } = formData;

    const tempoDisponivel = calcularTempoDisponivel(formData);
    
    // Determina descrição da moto baseada no consumo
    let consumoMotoDesc;
    if (consumoMedio <= 18) {
        consumoMotoDesc = '1000cc+ (big trail/esportiva)';
    } else if (consumoMedio <= 25) {
        consumoMotoDesc = '600-800cc (esportiva)';
    } else if (consumoMedio <= 35) {
        consumoMotoDesc = '250-400cc (média)';
    } else {
        consumoMotoDesc = '125-150cc (econômica)';
    }

    return `Você é um especialista mundial em rolês de motociclismo. Sua missão é sugerir 3 experiências REAIS e específicas que atendam exatamente ao que foi pedido.

🏍️ INFORMAÇÕES DO MOTOCICLISTA:
- Rolê desejado: "${experienciaDesejada}"
- Ponto de partida: ${enderecoPartida}
- Moto: ${consumoMotoDesc} (Consumo: ${consumoMedio} km/L)
- Capacidade do tanque: ${capacidadeTanque}L
- Perfil de pilotagem: ${perfilPilotagem}
- Tempo disponível: ${tempoDisponivel}h (${horarioSaida} às ${horarioVolta})

🎯 SUA MISSÃO:
Sugira 3 experiências REAIS e específicas. Para cada sugestão, forneça:

1. NOME DO LOCAL (estabelecimento específico, atração, restaurante, etc.)
2. ENDEREÇO COMPLETO (rua, número, cidade, estado, CEP se possível)
3. EXPERIÊNCIA DETALHADA (o que exatamente vai vivenciar lá)
4. DISTÂNCIA E TEMPO (km de ${enderecoPartida} e tempo de viagem de moto)
5. CUSTOS DETALHADOS:
   - Gasolina (considere consumo de ${consumoMedio} km/L, preço R$6,50/L)
   - Pedágios de moto (valores reais das rodovias)
   - Gastos no local (alimentação, ingressos, etc.)
   - Total estimado
6. LOGÍSTICA (melhor rota, horários recomendados, dicas importantes)
7. POR QUE É PERFEITO (como atende à experiência desejada)

IMPORTANTE - OBRIGATÓRIO:
- Use lugares REAIS e específicos (nomes de estabelecimentos, cidades, atrações)
- SEMPRE inclua ENDEREÇO COMPLETO com rua, número, cidade, estado
- Considere o tempo disponível para ser viável
- Seja preciso nos custos e distâncias reais
- Foque na EXPERIÊNCIA, não apenas no destino
- Se o orçamento for limitado, respeite-o

Formato de resposta: JSON com array "sugestoes", cada item com: nome, endereco, experiencia, distancia, tempoViagem, custos{gasolina, pedagio, local, total}, logistica, porquePerfeito`;
}


/**
 * Constrói o prompt para a IA
 */
function buildPrompt(formData) {
    const { 
        enderecoPartida, 
        horarioSaida, 
        horarioVolta,
        orcamento, 
        experienciaDesejada,
        preferencias
    } = formData;
    
    // Monta informações de quilometragem - usando diretamente no prompt
    
    // Monta informações de orçamento
    const orcamentoInfo = orcamento ? `R$ ${orcamento}` : 'Não especificado (sem limite definido)';
    
    const tempoDisponivel = calcularTempoDisponivel(formData);
    
    // Determina número máximo de destinos baseado no tempo disponível
    let maxDestinos;
    if (tempoDisponivel <= 4) {
        maxDestinos = 1;
    } else if (tempoDisponivel <= 6) {
        maxDestinos = 2;
    } else {
        maxDestinos = 3;
    }
    
    return `
Especialista em turismo rodoviário brasileiro. Crie 3 roteiros de moto baseado em:

🎯 EXPERIÊNCIA DESEJADA (PRIORIDADE MÁXIMA):
"${experienciaDesejada}"
→ OBRIGATÓRIO: Inclua destinos que atendam EXATAMENTE esta experiência

DADOS TÉCNICOS:
- Saída: ${enderecoPartida}  
- Janela: ${horarioSaida} às ${horarioVolta} (${tempoDisponivel}h disponíveis)
- Orçamento: ${orcamentoInfo}
- Interesses: ${preferencias.join(', ') || 'Variados'}

REGRAS CRÍTICAS:
1. EXPERIÊNCIA EM PRIMEIRO LUGAR: Se pediu "café da manhã", inclua local específico para café
2. TEMPO REALISTA: Máximo ${maxDestinos} ${maxDestinos === 1 ? 'destino' : 'destinos'} para ${tempoDisponivel}h disponíveis
3. DESTINOS ESPECÍFICOS: Nomes reais + endereços completos
4. DICAS REAIS: Específicas do local sugerido

CRIAR 3 ROTEIROS (${maxDestinos} ${maxDestinos === 1 ? 'destino' : 'destinos'} cada):
1. ECONÔMICA: Atende experiência com menor custo
2. EQUILIBRADA: Atende experiência com custo-benefício
3. PREMIUM: Atende experiência sem limite de custo

FORMATO JSON:
{
  "sugestoes": [
    {
      "tipo": "ECONÔMICA",
      "titulo": "Nome Específico do Roteiro",
      "resumo": "Descrição dos destinos reais",
      "distancia_total": "XXX km",
      "tempo_total": "X horas",
      "custo_total_estimado": "R$ XXX",
      "destinos": [
        {
          "nome": "Nome ESPECÍFICO do Local Real",
          "endereco": "Endereço COMPLETO (rua, número, cidade, estado)",
          "distancia_anterior": "XX km (do ponto anterior)",
          "tempo_permanencia": "Xh",
          "horario_chegada": "HH:MM",
          "descricao": "O que fazer especificamente neste local",
          "custo_estimado": "R$ XX (valor real de entrada/consumo)",
          "dicas_motociclista": [
            "Dica ESPECÍFICA sobre a estrada/acesso",
            "Dica ESPECÍFICA sobre estacionamento",
            "Dica ESPECÍFICA sobre o local"
          ]
        }
      ],
      "custos_detalhados": {
        "combustivel": "R$ XX",
        "alimentacao": "R$ XX",
        "entradas": "R$ XX",
        "outros": "R$ XX"
      }
    }
  ]
}

IMPORTANTE: Responda APENAS com JSON válido. Use locais reais do Brasil.`;
}

/**
 * Processa a resposta AVANÇADA da IA (movido de app.js e adaptado)
 */
function parseAdvancedAIResponse(response, formData) {
    try {
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('JSON não encontrado na resposta da IA.');
        }
        const data = JSON.parse(jsonMatch[0]);

        if (!data.sugestoes || !Array.isArray(data.sugestoes)) {
            throw new Error('Formato de resposta da IA inválido.');
        }

        return data.sugestoes.map(sugestao => {
            // Determina o tipo da sugestão baseado na descrição
            let tipo = 'EQUILIBRADA';
            const descricao = sugestao.porquePerfeito?.toLowerCase() || '';
            if (descricao.includes('econômico')) {
                tipo = 'ECONÔMICA';
            } else if (descricao.includes('premium')) {
                tipo = 'PREMIUM';
            }

            return {
                // Mapeia para o formato esperado pela nova função de renderização
                tipo,
            titulo: sugestao.nome,
            resumo: sugestao.experiencia,
            distancia_total: sugestao.distancia,
            tempo_total: sugestao.tempoViagem,
            custo_total_estimado: `R$ ${sugestao.custos?.total || 0}`,
            nivel_dificuldade: 'Moderado', // Pode ser extraído da logística no futuro
            destinos: [{
                nome: sugestao.nome,
                endereco: sugestao.endereco,
                descricao: sugestao.experiencia,
                dicas_motociclista: sugestao.logistica ? sugestao.logistica.split('\n') : []
            }],
            custos_detalhados: {
                combustivel: `R$ ${sugestao.custos?.gasolina || 0}`,
                alimentacao: `R$ ${sugestao.custos?.local || 0}`,
                entradas: `R$ ${sugestao.custos?.pedagio || 0}`, // Usando pedagio como entradas por enquanto
                outros: 'R$ 0',
                total: `R$ ${sugestao.custos?.total || 0}`
            },
                porquePerfeito: sugestao.porquePerfeito,
                logistica: sugestao.logistica,
                observacoes: [],
                dicas_importantes: []
            };
        });

    } catch (error) {
        console.error('Erro ao processar resposta avançada da IA:', error);
        // Fallback para parsing manual se o JSON falhar
        return parseResponseManually(response, formData);
    }
}

/**
 * Exibe os resultados na tela usando o novo layout de cards (movido de app.js)
 */
function displayAdvancedResults(sugestoes) {
    const container = safeGetElement('sugestoes-role', true);
    const resultsSection = safeGetElement('results-section', true);

    container.innerHTML = sugestoes.map((sugestao, index) => {
        return `
            <div class="experiencia-card" data-index="${index}" onclick="selectRoteiro(${index})">
                <div class="experiencia-card-image-container">
                    <img src="${sugestao.imageUrl || 'assets/img/card-mapas.jpg'}" 
                         alt="Imagem de ${sugestao.titulo}" 
                         class="experiencia-card-image"
                         loading="lazy">
                </div>
                <div class="experiencia-card-header">
                    <div class="flex-1">
                        <h3 class="experiencia-card-title">${sugestao.titulo}</h3>
                        <p class="experiencia-card-address">${sugestao.destinos[0]?.endereco || 'Localização a ser definida'}</p>
                    </div>
                    <div class="experiencia-card-cost">
                        ${sugestao.custo_total_estimado || 'R$ --'}
                    </div>
                </div>

                <div class="experiencia-card-body">
                    <div class="info-group">
                        <h4 class="info-group-title">✨ Sua Experiência</h4>
                        <p class="info-group-text">${sugestao.resumo}</p>
                    </div>
                    <div class="info-group">
                        <h4 class="info-group-title">🎯 Por que é Ideal</h4>
                        <p class="info-group-text">${sugestao.porquePerfeito || 'Perfeito para sua experiência desejada!'}</p>
                    </div>
                </div>

                <div class="experiencia-card-footer">
                    <div class="stats">
                        <div class="stat-item">🛣️ ${sugestao.distancia_total || '~?'}</div>
                        <div class="stat-item">⏱️ ${sugestao.tempo_total || '~?'}</div>
                    </div>
                    <div class="actions">
                        <button class="btn-choose-experience">
                            Ver Detalhes
                        </button>
                        </div>
                </div>
            </div>
        `;
    }).join('');

    resultsSection.classList.remove('hidden');
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

    // Atualiza a variável global para funções de compartilhamento
    window.generatedRoteiros = sugestoes;
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
        
        // Validação e limpeza de dados para evitar null/undefined
        const cleanedSugestoes = data.sugestoes.map((sugestao, index) => {
            const tipos = ['ECONÔMICA', 'EQUILIBRADA', 'PREMIUM'];
            return {
                tipo: sugestao.tipo || tipos[index] || 'EQUILIBRADA',
                titulo: sugestao.titulo || `Roteiro ${tipos[index] || 'Personalizado'}`,
                resumo: sugestao.resumo || 'Roteiro gerado pela IA',
                distancia_total: sugestao.distancia_total || '-- km',
                tempo_total: sugestao.tempo_total || '-- horas',
                custo_total_estimado: sugestao.custo_total_estimado || calculateFallbackCost(formData, tipos[index]),
                nivel_dificuldade: sugestao.nivel_dificuldade || 'Moderado',
                destinos: Array.isArray(sugestao.destinos) && sugestao.destinos.length > 0 ? 
                    sugestao.destinos.map((d, destIndex) => ({
                        nome: d?.nome || 'Destino',
                        endereco: d?.endereco || 'Endereço não especificado',
                        distancia_anterior: d?.distancia_anterior || d?.distancia || `${20 + (destIndex * 15)} km`,
                        tempo_permanencia: d?.tempo_permanencia || d?.tempo_parada || '30 min',
                        horario_chegada: d?.horario_chegada || `${8 + destIndex}:${(destIndex * 30) % 60}0`,
                        descricao: d?.descricao || 'Local interessante',
                        custo_estimado: d?.custo_estimado || 'R$ --',
                        dicas_motociclista: d?.dicas_motociclista || [
                            'Verificar condições da estrada',
                            'Estacionar em local seguro',
                            'Levar equipamentos de proteção'
                        ]
                    })) : generateFallbackDestinos(formData, tipos[index]),
                custos_detalhados: sugestao.custos_detalhados || (() => {
                    const combustivel = calculateCostByType(formData, tipos[index], 'combustivel');
                    const alimentacao = calculateCostByType(formData, tipos[index], 'alimentacao');
                    const entradas = calculateCostByType(formData, tipos[index], 'entradas');
                    const outros = calculateCostByType(formData, tipos[index], 'outros');
                    
                    // Calcular total somando todos os custos
                    const totalValue = 
                        parseInt(combustivel.replace('R$ ', '')) +
                        parseInt(alimentacao.replace('R$ ', '')) +
                        parseInt(entradas.replace('R$ ', '')) +
                        parseInt(outros.replace('R$ ', ''));
                    
                    return {
                        combustivel,
                        alimentacao,
                        entradas,
                        outros,
                        total: `R$ ${totalValue}`
                    };
                })(),
                observacoes: Array.isArray(sugestao.observacoes) ? sugestao.observacoes : 
                    generateObservacoesPercurso(formData, tipos[index], sugestao.destinos),
                dicas_importantes: Array.isArray(sugestao.dicas_importantes) ? sugestao.dicas_importantes : [
                    'Verificar combustível',
                    'Levar equipamentos de segurança',
                    'Conferir previsão do tempo'
                ],
                horario_sugerido_saida: sugestao.horario_sugerido_saida || formData.horarioSaida || '08:00',
                horario_estimado_volta: sugestao.horario_estimado_volta || formData.horarioVolta || '18:00'
            };
        });
        
        return cleanedSugestoes;
        
    } catch (error) {
        console.error('❌ Erro ao processar resposta da IA:', error);
        console.log('📝 Resposta original:', response);
        
        // Fallback para parsing manual
        return parseResponseManually(response, formData);
    }
}

/**
 * Calcula custos realistas por categoria baseado no tipo de roteiro
 */
function calculateCostByType(formData, tipo, categoria) {
    const tempoDisponivel = calcularTempoDisponivel(formData);
    
    // Determina distância estimada baseada no tipo
    let distanciaEstimada;
    if (tipo === 'ECONÔMICA') {
        distanciaEstimada = 120;
    } else if (tipo === 'EQUILIBRADA') {
        distanciaEstimada = 200;
    } else {
        distanciaEstimada = 300;
    }
    
    // Custos base realistas para 2024
    const custosBase = {
        'combustivel': {
            'ECONÔMICA': Math.round(distanciaEstimada / 25 * 5.50), // 25km/l, R$5,50/l
            'EQUILIBRADA': Math.round(distanciaEstimada / 22 * 5.50), // Motos maiores
            'PREMIUM': Math.round(distanciaEstimada / 18 * 5.50) // Motos premium
        },
        'alimentacao': {
            'ECONÔMICA': tempoDisponivel >= 8 ? 60 : 35, // Lanchonete/padaria
            'EQUILIBRADA': tempoDisponivel >= 8 ? 120 : 80, // Restaurante simples
            'PREMIUM': tempoDisponivel >= 8 ? 250 : 150 // Restaurante premium
        },
        'entradas': {
            'ECONÔMICA': 0, // Apenas locais gratuitos
            'EQUILIBRADA': 25, // Algumas atrações pagas
            'PREMIUM': 80 // Experiências premium
        },
        'outros': {
            'ECONÔMICA': 20, // Estacionamento, pedágio
            'EQUILIBRADA': 45, // + lembrancinha
            'PREMIUM': 100 // Gorjetas, serviços extras
        }
    };
    
    const custo = custosBase[categoria]?.[tipo] || 30;
    return `R$ ${custo}`;
}

/**
 * Calcula custos de forma inteligente baseado no tipo de roteiro
 */
function calculateSmartCosts(formData, tipoRoteiro, index) {
    const tempoDisponivel = calcularTempoDisponivel(formData);
    
    // Determina distância estimada baseada no índice do roteiro
    let distanciaEstimada;
    if (index === 0) {
        distanciaEstimada = 120;
    } else if (index === 1) {
        distanciaEstimada = 200;
    } else {
        distanciaEstimada = 300;
    }
    
    // Combustível - sempre presente, calculado pelos dados reais da moto
    const consumoReal = formData.consumoMedio || 22; // km/l do usuário ou padrão
    const precoCombustivel = 6.60; // R$ por litro (valor atual)
    const litrosNecessarios = distanciaEstimada / consumoReal;
    const combustivelCusto = Math.round(litrosNecessarios * precoCombustivel);
    
    // Alimentação - sempre presente, varia por tempo e tipo
    const alimentacaoMultipliers = [0.7, 1.0, 1.8]; // Econômico, Equilibrado, Premium
    const alimentacaoBase = tempoDisponivel >= 8 ? 80 : 40; // Almoço completo vs lanche
    const alimentacaoCusto = Math.round(alimentacaoBase * alimentacaoMultipliers[index]);
    
    // Entradas - apenas se experiência inclui turismo/aventura
    const experiencia = formData.experienciaDesejada || '';
    const temTurismo = experiencia.includes('turismo') || experiencia.includes('paisagem') || experiencia.includes('aventura');
    const entradasCusto = temTurismo ? [0, 25, 80][index] : 0;
    
    // Outros - baseado na distância e experiência
    let outrosCusto = 0;
    const isLongDistance = distanciaEstimada > 150;
    if (isLongDistance) outrosCusto += 15; // Pedágio
    if (index === 2) outrosCusto += 30; // Serviços premium
    if (experiencia.includes('aventura')) outrosCusto += 20; // Equipamentos
    
    // Total
    const total = combustivelCusto + alimentacaoCusto + entradasCusto + outrosCusto;
    
    return {
        combustivel: `R$ ${combustivelCusto}`,
        alimentacao: `R$ ${alimentacaoCusto}`,
        entradas: entradasCusto > 0 ? `R$ ${entradasCusto}` : null,
        outros: outrosCusto > 0 ? `R$ ${outrosCusto}` : null,
        total: total
    };
}

/**
 * Gera cronograma horário inteligente para o roteiro
 */
function generateSmartTimeline(formData, destinos) {
    const horarioSaida = formData.horarioSaida || '08:00';
    const horarioVolta = formData.horarioVolta || '17:00';
    
    // Converter horários para minutos
    const [saidaHoras, saidaMinutos] = horarioSaida.split(':').map(n => parseInt(n));
    const [voltaHoras, voltaMinutos] = horarioVolta.split(':').map(n => parseInt(n));
    
    const saidaTotal = saidaHoras * 60 + saidaMinutos;
    const voltaTotal = voltaHoras * 60 + voltaMinutos;
    const tempoDisponivel = voltaTotal - saidaTotal; // em minutos
    
    if (!destinos || destinos.length === 0) return [];
    
    // Calcular tempo por destino (incluindo tempo de viagem e permanência)
    const tempoViagem = Math.floor(tempoDisponivel * 0.4); // 40% do tempo viajando
    const tempoPermanencia = tempoDisponivel - tempoViagem; // 60% permanecendo
    const tempoPorDestino = Math.floor(tempoPermanencia / destinos.length);
    
    let cronograma = [];
    let horarioAtual = saidaTotal;
    
    // Ponto de partida
    cronograma.push({
        horario: formatMinutesToTime(horarioAtual),
        evento: `🏠 Saída do ponto de partida`,
        endereco: formData.enderecoPartida || 'Ponto de partida',
        tipo: 'saida'
    });
    
    // Calcular paradas de combustível necessárias
    const distanciaTotal = destinos.length > 0 ? `${120 + (destinos.length * 40)} km` : '120 km';
    const paradasCombustivel = calculateFuelStops(formData, distanciaTotal);
    
    // Para cada destino
    destinos.forEach((destino, index) => {
        // Verificar se precisa de parada para combustível antes deste destino
        const paradaCombustivel = paradasCombustivel.find(p => p.distancia_km === Math.round((120 + (index * 40))));
        
        if (paradaCombustivel) {
            const tempoParadaCombustivel = 15; // 15 minutos para abastecer
            horarioAtual += tempoParadaCombustivel;
            
            cronograma.push({
                horario: formatMinutesToTime(horarioAtual),
                evento: paradaCombustivel.nome,
                endereco: paradaCombustivel.endereco,
                descricao: `${paradaCombustivel.observacao} - ${paradaCombustivel.custo_abastecimento}`,
                tempo_permanencia: '15min',
                tipo: 'combustivel'
            });
        }
        
        // Tempo de viagem até o destino
        const tempoViagem = Math.floor(30 + (index * 15)); // 30-60 min entre destinos
        horarioAtual += tempoViagem;
        
        cronograma.push({
            horario: formatMinutesToTime(horarioAtual),
            evento: `🏍️ Chegada - ${destino.nome}`,
            endereco: destino.endereco_completo || destino.nome,
            descricao: destino.descricao,
            tempo_permanencia: `${Math.floor(tempoPorDestino / 60)}h ${tempoPorDestino % 60}min`,
            tipo: 'chegada'
        });
        
        // Tempo de permanência no destino
        horarioAtual += tempoPorDestino;
        
        if (index < destinos.length - 1) {
            cronograma.push({
                horario: formatMinutesToTime(horarioAtual),
                evento: `🚀 Saída - ${destino.nome}`,
                endereco: `Próximo destino: ${destinos[index + 1].nome}`,
                tipo: 'saida_destino'
            });
        }
    });
    
    // Viagem de volta
    const tempoVoltaCasa = Math.floor(60 + Math.random() * 30); // 60-90 min
    horarioAtual += tempoVoltaCasa;
    
    cronograma.push({
        horario: formatMinutesToTime(Math.min(horarioAtual, voltaTotal)),
        evento: `🏠 Chegada em casa`,
        endereco: 'De volta ao lar, doce lar',
        tipo: 'chegada_final'
    });
    
    return cronograma;
}

/**
 * Converte minutos para formato HH:MM
 */
function formatMinutesToTime(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

/**
 * Calcula se são necessárias paradas para combustível e onde
 */
function calculateFuelStops(formData, distanciaTotal) {
    if (!formData.autonomia || !distanciaTotal) return [];
    
    const autonomiaReal = formData.autonomia * 0.8; // Margem de segurança de 20%
    const distanciaNum = parseFloat(distanciaTotal.replace(' km', ''));
    
    if (distanciaNum <= autonomiaReal) {
        return []; // Não precisa parar para abastecer
    }
    
    // Calcular quantas paradas são necessárias
    const paradasNecessarias = Math.ceil(distanciaNum / autonomiaReal) - 1;
    const distanciaEntreParadas = distanciaNum / (paradasNecessarias + 1);
    
    const postos = [
        { nome: "Posto Ipiranga", endereco: "Rodovia Presidente Dutra, km 15", preco: 6.60 },
        { nome: "Shell Select", endereco: "Via Anhanguera, km 25", preco: 6.65 },
        { nome: "BR Mania", endereco: "Rodovia Fernão Dias, km 18", preco: 6.55 },
        { nome: "Petrobras", endereco: "Rodovia Castelo Branco, km 22", preco: 6.58 }
    ];
    
    const paradasCombustivel = [];
    for (let i = 0; i < paradasNecessarias; i++) {
        const posto = postos[i % postos.length];
        const distanciaParada = Math.round(distanciaEntreParadas * (i + 1));
        const litrosNecessarios = Math.round(formData.capacidadeTanque * 0.8); // Encher 80% do tanque
        const custoAbastecimento = Math.round(litrosNecessarios * posto.preco);
        
        paradasCombustivel.push({
            nome: `⛽ ${posto.nome}`,
            endereco: posto.endereco,
            distancia_km: distanciaParada,
            tipo: 'combustivel',
            litros_necessarios: litrosNecessarios,
            custo_abastecimento: `R$ ${custoAbastecimento}`,
            preco_litro: `R$ ${posto.preco.toFixed(2)}`,
            observacao: `Parada obrigatória - Autonomia restante: ${Math.round(autonomiaReal - distanciaParada)} km`
        });
    }
    
    return paradasCombustivel;
}

/**
 * Calcula custo estimado quando IA não fornece
 */
function calculateFallbackCost(formData, tipo) {
    const baseOrcamento = formData.orcamento || 200;
    const multipliers = {
        'ECONÔMICA': 0.7,
        'EQUILIBRADA': 1.0,
        'PREMIUM': 1.4
    };
    const custo = Math.round(baseOrcamento * (multipliers[tipo] || 1.0));
    return `R$ ${custo}`;
}

/**
 * Retorna características distintivas por tipo de roteiro
 */
function getTypeCharacteristics(tipo) {
    const characteristics = {
        'ECONÔMICA': {
            icon: '💰',
            features: ['Menor custo', 'Postos baratos', 'Lanchonetes locais', 'Roteiro otimizado'],
            color: 'text-green-400'
        },
        'EQUILIBRADA': {
            icon: '⚖️',
            features: ['Custo-benefício', 'Mix de experiências', 'Paradas estratégicas', 'Tempo ideal'],
            color: 'text-blue-400'
        },
        'PREMIUM': {
            icon: '👑',
            features: ['Experiência completa', 'Restaurantes premium', 'Hospedagem', 'Máximo conforto'],
            color: 'text-purple-400'
        }
    };
    
    const char = characteristics[tipo] || characteristics['EQUILIBRADA'];
    
    return `
        <div class="bg-black bg-opacity-30 p-3 rounded-lg">
            <div class="text-white font-semibold mb-2">${char.icon} Diferenciais:</div>
            <div class="grid grid-cols-2 gap-1 text-xs">
                ${char.features.map(feature => `
                    <div class="flex items-center">
                        <span class="w-2 h-2 bg-gold-primary rounded-full mr-2"></span>
                        <span class="${char.color}">${feature}</span>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

/**
 * Banco de destinos reais com endereços específicos e características
 */
const DESTINOS_REAIS = {
    'ECONÔMICA': [
        {
            nome: 'Padaria Central de Atibaia',
            endereco: 'Rua 13 de Maio, 45 - Centro, Atibaia - SP',
            distancia_sp: 65,
            custo_entrada: 25,
            tempo_permanencia: '1h30',
            experiencias: ['café da manhã', 'comida tradicional'],
            dicas_reais: [
                'Pão de açúcar famoso na região há 40 anos',
                'Estacionamento para motos na lateral da padaria',
                'Funciona das 6h às 12h - chegue cedo'
            ]
        },
        {
            nome: 'Mirante da Serra da Cantareira',
            endereco: 'Estrada da Cantareira, km 12 - Horto Florestal, São Paulo - SP',
            distancia_sp: 35,
            custo_entrada: 0,
            tempo_permanencia: '1h',
            experiencias: ['estrada bonita', 'vista', 'natureza'],
            dicas_reais: [
                'Estrada sinuosa com curvas fechadas - reduzir velocidade',
                'Estacionamento gratuito no Horto Florestal',
                'Melhor vista pela manhã (menos neblina)'
            ]
        }
    ],
    'EQUILIBRADA': [
        {
            nome: 'Café da Fazenda - São Roque',
            endereco: 'Estrada do Vinho, km 15 - Zona Rural, São Roque - SP',
            distancia_sp: 85,
            custo_entrada: 45,
            tempo_permanencia: '2h',
            experiencias: ['café da manhã', 'estrada bonita', 'natureza'],
            dicas_reais: [
                'Café colonial servido até 11h nos fins de semana',
                'Estrada rural asfaltada com paisagem vinícola',
                'Estacionamento coberto para motos disponível'
            ]
        },
        {
            nome: 'Pico do Itapeva - Campos do Jordão',
            endereco: 'Estrada do Itapeva, s/n - Campos do Jordão, SP',
            distancia_sp: 180,
            custo_entrada: 15,
            tempo_permanencia: '2h',
            experiencias: ['estrada bonita', 'vista', 'aventura'],
            dicas_reais: [
                'Estrada de terra nos últimos 3km - moto trail ideal',
                'Temperatura 10°C menor que na cidade',
                'Melhor pôr do sol da região (17h no inverno)'
            ]
        }
    ],
    'PREMIUM': [
        {
            nome: 'Hotel Toriba - Brunch Premium',
            endereco: 'Av. Ernesto Diederichsen, 2962 - Campos do Jordão, SP',
            distancia_sp: 185,
            custo_entrada: 180,
            tempo_permanencia: '3h',
            experiencias: ['café da manhã', 'luxo', 'vista'],
            dicas_reais: [
                'Brunch premium servido até 12h nos fins de semana',
                'Valet parking gratuito para motos no hotel',
                'Reserve com antecedência (alta procura)'
            ]
        },
        {
            nome: 'Estrada Romântica - Monte Verde',
            endereco: 'MG-295, km 23 - Monte Verde, Camanducaia - MG',
            distancia_sp: 145,
            custo_entrada: 0,
            tempo_permanencia: '2h',
            experiencias: ['estrada bonita', 'vista', 'natureza'],
            dicas_reais: [
                'Uma das estradas mais bonitas da região sudeste',
                'Mirantes naturais a cada 5km do percurso',
                'Estrada asfaltada em excelente estado'
            ]
        }
    ]
};

/**
 * Calcula tempo disponível baseado nos horários
 */
function calcularTempoDisponivel(formData) {
    const saida = parseHorario(formData.horarioSaida || '08:00');
    const volta = parseHorario(formData.horarioVolta || '18:00');
    
    let tempoDisponivel = volta - saida;
    if (tempoDisponivel < 0) tempoDisponivel += 24 * 60; // Caso passe da meia-noite
    
    return Math.floor(tempoDisponivel / 60); // Retorna em horas
}

/**
 * Converte horário "HH:MM" para minutos desde 00:00
 */
function parseHorario(horario) {
    const [horas, minutos] = horario.split(':').map(Number);
    return horas * 60 + (minutos || 0);
}

/**
 * Converte minutos para formato "HH:MM"
 */
function formatarHorario(minutos) {
    const horas = Math.floor(minutos / 60) % 24;
    const mins = minutos % 60;
    return `${horas.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

/**
 * Calcula distância entre dois destinos
 */
function calcularDistanciaEntre(destinoA, destinoB) {
    // Matriz simplificada de distâncias entre destinos conhecidos
    const distancias = {
        'Mirante da Serra da Cantareira': { 'Centro Histórico de Atibaia': 45 },
        'Pico do Itapeva - Campos do Jordão': { 'Cachoeira dos Pretos - Joanópolis': 85 },
        'Hotel Toriba - Campos do Jordão': { 'Restaurante Baden Baden - Campos do Jordão': 8 }
    };
    
    return distancias[destinoA.nome]?.[destinoB.nome] || 30; // Fallback 30km
}

/**
 * Gera observações específicas do percurso baseadas nos destinos reais
 */
function generateObservacoesPercurso(formData, tipo, destinos) {
    const tempoDisponivel = calcularTempoDisponivel(formData);
    const observacoes = [];
    
    // Observações baseadas no tipo de roteiro
    if (tipo === 'ECONÔMICA') {
        observacoes.push('Roteiro otimizado para menor gasto - priorizando locais gratuitos');
        observacoes.push('Abastecimento em postos mais baratos do percurso');
    } else if (tipo === 'EQUILIBRADA') {
        observacoes.push('Roteiro balanceado entre custo e experiência');
        observacoes.push('Mix de atrações gratuitas e pagas para melhor custo-benefício');
    } else if (tipo === 'PREMIUM') {
        observacoes.push('Roteiro premium com foco na experiência completa');
        observacoes.push('Inclui paradas em estabelecimentos renomados');
    }
    
    // Observações baseadas nos destinos específicos
    if (destinos && Array.isArray(destinos)) {
        const temSerra = destinos.some(d => 
            d.nome?.toLowerCase().includes('serra') || 
            d.nome?.toLowerCase().includes('campos') ||
            d.nome?.toLowerCase().includes('cantareira')
        );
        
        const temLitoral = destinos.some(d => 
            d.endereco?.toLowerCase().includes('ubatuba') ||
            d.endereco?.toLowerCase().includes('bertioga') ||
            d.endereco?.toLowerCase().includes('ilhabela')
        );
        
        if (temSerra) {
            observacoes.push('Percurso serrano: levar agasalho (temperatura até 10°C menor)');
            observacoes.push('Estradas sinuosas - reduzir velocidade em curvas fechadas');
        }
        
        if (temLitoral) {
            observacoes.push('Percurso litorâneo: atenção à maresia e protetor solar');
        }
        
        // Observação sobre primeira parada
        if (destinos[0]?.nome) {
            observacoes.push(`Primeira parada: ${destinos[0].nome} - confirmar horário de funcionamento`);
        }
    }
    
    // Observação sobre tempo disponível
    if (tempoDisponivel <= 6) {
        observacoes.push('Roteiro compacto para aproveitar janela de 6h disponíveis');
    } else if (tempoDisponivel >= 10) {
        observacoes.push('Tempo amplo permite paradas extras para fotos e descanso');
    }
    
    return observacoes.slice(0, 4); // Máximo 4 observações
}

/**
 * Seleciona destinos baseados na experiência desejada
 */
function selecionarDestinosPorExperiencia(destinosDisponiveis, experienciaDesejada) {
    if (!experienciaDesejada) return destinosDisponiveis;
    
    const experienciaLower = experienciaDesejada.toLowerCase();
    
    // Priorizar destinos que atendem a experiência
    const destinosPrioritarios = destinosDisponiveis.filter(dest => 
        dest.experiencias?.some(exp => experienciaLower.includes(exp))
    );
    
    // Se encontrou destinos específicos, usar eles primeiro
    if (destinosPrioritarios.length > 0) {
        return [...destinosPrioritarios, ...destinosDisponiveis.filter(d => !destinosPrioritarios.includes(d))];
    }
    
    return destinosDisponiveis;
}

/**
 * Gera destinos realistas quando IA não fornece
 */
function generateFallbackDestinos(formData, tipo) {
    const destinosDisponiveis = DESTINOS_REAIS[tipo] || DESTINOS_REAIS['EQUILIBRADA'];
    const destinosOrdenados = selecionarDestinosPorExperiencia(destinosDisponiveis, formData.experienciaDesejada);

    // Validar janela de tempo disponível - mais restritivo
    const tempoDisponivel = calcularTempoDisponivel(formData);
    let quantidadeDestinos = destinosDisponiveis.length;
    
    // Ajustar quantidade baseado no tempo disponível (mais conservador)
    if (tempoDisponivel <= 4) {
        quantidadeDestinos = 1; // Apenas 1 destino para até 4h
    } else if (tempoDisponivel <= 6) {
        quantidadeDestinos = Math.min(2, quantidadeDestinos); // Máximo 2 destinos em 6h
    } else if (tempoDisponivel <= 8) {
        quantidadeDestinos = Math.min(3, quantidadeDestinos); // Máximo 3 destinos em 8h
    }
    
    const destinosSelecionados = destinosOrdenados.slice(0, quantidadeDestinos);
    let distanciaAcumulada = 0;
    let horarioAtual = parseHorario(formData.horarioSaida || '08:00');

    return destinosSelecionados.map((dest, index) => {
        // Calcular distância real do ponto anterior
        const distanciaDestino = index === 0 ? 
            dest.distancia_sp : // Distância de SP para primeiro destino
            calcularDistanciaEntre(destinosSelecionados[index-1], dest); // Entre destinos
        
        distanciaAcumulada += distanciaDestino;
        
        // Calcular tempo de viagem (60km/h média)
        const tempoViagem = Math.ceil(distanciaDestino / 60 * 60); // em minutos
        horarioAtual += tempoViagem;
        
        const horarioChegada = formatarHorario(horarioAtual);
        
        // Adicionar tempo de permanência para próximo cálculo
        const tempoPermanencia = parseInt(dest.tempo_permanencia) * 60; // converter para minutos
        horarioAtual += tempoPermanencia;

        return {
            nome: dest.nome,
            endereco: dest.endereco,
            distancia_anterior: `${distanciaDestino} km`,
            tempo_permanencia: dest.tempo_permanencia,
            horario_chegada: horarioChegada,
            descricao: `${dest.nome} - Local específico com entrada ${dest.custo_entrada > 0 ? 'R$ ' + dest.custo_entrada : 'gratuita'}.`,
            custo_estimado: `R$ ${dest.custo_entrada}`,
            dicas_motociclista: dest.dicas_reais
        };
    });
}

/**
 * Parsing manual da resposta como fallback - SEMPRE 3 SUGESTÕES
 */
function parseResponseManually(response, formData) {
    console.log('🔄 Gerando 3 sugestões de fallback');
    
    const tipos = ['ECONÔMICA', 'EQUILIBRADA', 'PREMIUM'];
    const nomes = ['Roteiro Econômico', 'Roteiro Equilibrado', 'Roteiro Premium'];
    const resumos = [
        'Roteiro focado em baixo custo com destinos gratuitos',
        'Roteiro com balance entre custo e experiência', 
        'Roteiro completo com experiências premium'
    ];
    
    return tipos.map((tipo, index) => {
        // Calcular custos detalhados inteligentemente
        const custosCalculados = calculateSmartCosts(formData, tipo, index);
        const { combustivel, alimentacao, entradas, outros, total: totalValue } = custosCalculados;

        return {
            tipo: tipo,
            titulo: nomes[index],
            resumo: resumos[index],
            distancia_total: `${120 + (index * 40)} km`,
            tempo_total: `${6 + index} horas`,
            custo_total_estimado: calculateFallbackCost(formData, tipo),
            nivel_dificuldade: ['Fácil', 'Moderado', 'Moderado'][index],
            destinos: generateFallbackDestinos(formData, tipo),
            custos_detalhados: {
                combustivel,
                alimentacao,
                entradas: entradas || null,
                outros: outros || null,
                total: `R$ ${totalValue}`
            },
            observacoes: generateObservacoesPercurso(formData, tipo, generateFallbackDestinos(formData, tipo)),
            cronograma: generateSmartTimeline(formData, generateFallbackDestinos(formData, tipo)),
            dicas_importantes: [
                'Verificar combustível antes da saída',
                'Levar equipamentos de segurança',
                'Conferir previsão do tempo'
            ],
            horario_sugerido_saida: formData.horarioSaida || '08:00',
            horario_estimado_volta: formData.horarioVolta || '18:00'
        };
    });
}

/**
 * FALLBACK DESABILITADO - Apenas IA generativa deve ser usada
 * Esta função foi desabilitada conforme solicitação do usuário
 */
function generateFallbackResults(formData) {
    throw new Error('Fallback desabilitado - apenas IA generativa deve ser usada');
}

/**
 * Exibe os resultados na tela
 */
function displayResults(results) {
    const container = safeGetElement('sugestoes-role', true);
    const resultsSection = safeGetElement('results-section', true);
    
    if (!results || results.length === 0) {
        showError('Nenhum resultado para exibir.');
        return;
    }
    
    // Salva os roteiros globalmente para compartilhamento  
    generatedRoteiros = results;
    
    // Limpa completamente o container
    container.innerHTML = ''; // Limpa antes de renderizar
    
    // Container para roteiro selecionado (inicialmente oculto)
    const selectedContainer = document.createElement('div');
    selectedContainer.id = 'selected-roteiro';
    selectedContainer.className = 'hidden';
    container.appendChild(selectedContainer);
    
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

    // Usa a nova função de renderização para os cards de experiência
    displayAdvancedResults(results);
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
 * Gera checklist inteligente e útil para motociclistas
 */
function generateFullChecklist(roteiros) {
    const formData = getLastFormData();
    const isLongTrip = formData?.autonomia > 200;
    const hasWeatherRisk = new Date(formData?.dataRole || Date.now()).getMonth() >= 10 || new Date(formData?.dataRole || Date.now()).getMonth() <= 3; // Inverno
    
    const checklistCategories = [
        {
            title: '🛡️ Equipamentos de Segurança',
            items: [
                'Capacete em perfeito estado e fechado corretamente',
                'Jaqueta com proteções (cotovelo, ombro, costa)',
                'Luvas de couro ou com proteção',
                'Calça com proteções ou calça jeans reforçada',
                'Bota ou calçado fechado e resistente',
                'Refletivos ou colete de alta visibilidade'
            ],
            priority: 'critical'
        },
        {
            title: '📋 Documentação e Identificação',
            items: [
                'CNH válida e dentro da validade',
                'Documento da moto (CRLV) atualizado',
                'RG ou documento com foto',
                'Cartão do seguro (se tiver)',
                'Comprovante de pagamento do IPVA',
                'Telefone de emergência anotado'
            ],
            priority: 'critical'
        },
        {
            title: '🔧 Manutenção e Verificações',
            items: [
                'Nível de óleo do motor',
                'Pressão dos pneus (dianteiro e traseiro)',
                'Estado dos pneus (desgaste e objetos)',
                'Funcionamento dos freios',
                'Corrente limpa e lubrificada',
                'Luzes (farol, lanterna, setas, freio)',
                'Buzina funcionando',
                'Espelhos ajustados e limpos'
            ],
            priority: 'high'
        },
        {
            title: '⛽ Combustível e Autonomia',
            items: [
                `Tanque cheio (${formData?.capacidadeTanque || 15}L)`,
                `Autonomia verificada (~${Math.round(formData?.autonomia || 300)}km)`,
                'Localização de postos no percurso',
                'Dinheiro/cartão para combustível',
                'Reserva de combustível considerando trânsito'
            ],
            priority: 'high'
        },
        {
            title: '🌤️ Clima e Condições',
            items: [
                'Previsão do tempo checada',
                hasWeatherRisk ? 'Capa de chuva ou jaqueta impermeável' : 'Protetor solar',
                hasWeatherRisk ? 'Luvas extras para chuva' : 'Óculos de sol',
                'Roupas adequadas para temperatura',
                'Verificar condições das estradas'
            ],
            priority: 'medium'
        },
        {
            title: '📱 Comunicação e Navegação',
            items: [
                'Celular carregado (100%)',
                'Carregador portátil ou USB da moto',
                'GPS ou app de navegação configurado',
                'Suporte de celular na moto',
                'Contatos de emergência salvos',
                'App de motociclistas (Waze, etc.)'
            ],
            priority: 'medium'
        },
        {
            title: '🎒 Kit de Emergência',
            items: [
                'Kit de primeiros socorros básico',
                'Água (pelo menos 500ml)',
                'Lanche energético',
                'Dinheiro em espécie',
                'Chaves reserva',
                isLongTrip ? 'Kit básico de ferramentas' : null,
                isLongTrip ? 'Corda ou elástico' : null,
                'Sacos plásticos (proteção)'
            ].filter(item => item !== null),
            priority: 'medium'
        }
    ];

    // Gerar HTML do checklist
    let checklistHTML = '<div class="space-y-6">';
    
    checklistCategories.forEach(category => {
        const priorityColors = {
            'critical': 'border-red-500 bg-red-900 bg-opacity-20',
            'high': 'border-orange-500 bg-orange-900 bg-opacity-20',
            'medium': 'border-blue-500 bg-blue-900 bg-opacity-20'
        };
        
        const priorityIcons = {
            'critical': '🚨',
            'high': '⚠️',
            'medium': 'ℹ️'
        };
        
        checklistHTML += `
            <div class="border-l-4 ${priorityColors[category.priority]} p-4 rounded-lg">
                <h4 class="font-bold text-white mb-3 flex items-center">
                    ${priorityIcons[category.priority]} ${category.title}
                </h4>
                <div class="grid md:grid-cols-2 gap-2">
                    ${category.items.map((item, index) => `
                        <label class="flex items-start space-x-3 p-2 hover:bg-gray-700 rounded cursor-pointer">
                            <input type="checkbox" class="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-blue-500" 
                                   id="check-${category.title.replace(/[^a-z0-9]/gi, '')}-${index}">
                            <span class="text-gray-300 text-sm leading-relaxed">${item}</span>
                        </label>
                    `).join('')}
                </div>
            </div>
        `;
    });
    
    checklistHTML += `
        <div class="text-center mt-6">
            <button onclick="markAllAsChecked()" class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg mr-2">
                ✅ Marcar Tudo OK
            </button>
            <button onclick="resetChecklist()" class="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg">
                🔄 Resetar Lista
            </button>
        </div>
    </div>`;

    return checklistHTML;
}

/**
 * Marca todos os itens do checklist como verificados
 */
function markAllAsChecked() {
    const checkboxes = document.querySelectorAll('#checklist-content input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.checked = true;
    });
    showNotification('✅ Todos os itens marcados como OK!', 'success');
}

/**
 * Função auxiliar para renderizar custos detalhados
 */
function renderCustosDetalhados(custos) {
    if (!custos) return '';
    
    const itens = [];
    if (custos.combustivel) {
        itens.push(`<div class="cost-item"><span>⛽ Combustível</span><span class="font-bold">${custos.combustivel}</span></div>`);
    }
    if (custos.alimentacao) {
        itens.push(`<div class="cost-item"><span>🍽️ Alimentação</span><span class="font-bold">${custos.alimentacao}</span></div>`);
    }
    if (custos.entradas) {
        itens.push(`<div class="cost-item"><span>🎫 Entradas (Atrações Turísticas)</span><span class="font-bold">${custos.entradas}</span></div>`);
    }
    if (custos.outros) {
        itens.push(`<div class="cost-item"><span>🔧 Outros (Pedágio, Estacionamento)</span><span class="font-bold">${custos.outros}</span></div>`);
    }
    
    return `
        <div class="cost-display mb-6">
            <h4 class="text-lg font-bold text-green-400 mb-3">💰 Custos Detalhados</h4>
            <div class="space-y-2">
                ${itens.join('')}
                <div class="cost-item border-t border-gray-600 pt-2 mt-3">
                    <span class="text-lg">💎 TOTAL</span>
                    <span class="font-bold text-lg text-gold-primary">${custos.total}</span>
                </div>
            </div>
        </div>
    `;
}

/**
 * Função auxiliar para renderizar seção de votação
 */
function renderVotingSection(hasVoted, voteCount, isUserChoice, collaborativeId, index) {
    if (hasVoted) {
        const voteText = voteCount === 1 ? 'voto' : 'votos';
        const userVoteIndicator = isUserChoice ? '<div class="text-gold-primary text-sm mt-1">✅ Seu voto</div>' : '';
        return `
            <div class="mb-4">
                <span class="text-lg">📊 ${voteCount} ${voteText}</span>
                ${userVoteIndicator}
            </div>
        `;
    } else {
        return `<button onclick="voteForRoteiro('${collaborativeId}', ${index})" class="bg-gold-primary hover:bg-gold-secondary text-black px-6 py-3 rounded-lg font-bold transition-colors w-full">🗳️ Votar Neste</button>`;
    }
}

/**
 * Reset do checklist
 */
function resetChecklist() {
    const checkboxes = document.querySelectorAll('#checklist-content input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.checked = false;
    });
    showNotification('🔄 Lista resetada!', 'info');
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
 * Cria um card de resultado completo (expandido)
 */
function createAdvancedResultCard(roteiro, index) {
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
                    
                    ${destino.dicas_motociclista?.length > 0 ? `
                        <div class="mt-4">
                            <h6 class="text-gold-primary font-semibold mb-3">🏍️ Dicas Especializadas:</h6>
                            <div class="space-y-2">
                                ${destino.dicas_motociclista.map(dica => {
                                    // Determina ícone baseado no conteúdo da dica
                                    const dicaLower = dica.toLowerCase();
                                    let icon = '💡'; // ícone padrão
                                    if (dicaLower.includes('estrada')) {
                                        icon = '🛣️';
                                    } else if (dicaLower.includes('segurança')) {
                                        icon = '🔒';
                                    } else if (dicaLower.includes('equipamento')) {
                                        icon = '🛡️';
                                    } else if (dicaLower.includes('horário')) {
                                        icon = '⏰';
                                    } else if (dicaLower.includes('emergência')) {
                                        icon = '🚨';
                                    }
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
        
        ${renderCustosDetalhados(roteiro.custos_detalhados)}
        
        ${roteiro.cronograma?.length > 0 ? `
            <div class="bg-blue-900 bg-opacity-30 p-4 rounded-lg mb-4">
                <h4 class="text-lg font-bold text-blue-400 mb-3">⏰ Cronograma do Rolê</h4>
                <div class="space-y-3">
                    ${roteiro.cronograma.map(item => {
                        const bgColorMap = {
                            'saida': 'bg-green-600',
                            'chegada': 'bg-blue-600',
                            'saida_destino': 'bg-orange-600',
                            'chegada_final': 'bg-purple-600',
                            'combustivel': 'bg-red-600'
                        };
                        return `
                        <div class="flex items-start space-x-3 p-3 bg-gray-700 rounded-lg">
                            <div class="flex-shrink-0">
                                <div class="w-12 h-12 ${bgColorMap[item.tipo]} rounded-full flex items-center justify-center text-white font-bold">
                                    ${item.horario}
                                </div>
                            </div>
                            <div class="flex-grow">
                                <div class="font-semibold text-white mb-1">${item.evento}</div>
                                <div class="text-sm text-gray-300">${item.endereco}</div>
                                ${item.descricao ? `<div class="text-xs text-gray-400 mt-1">${item.descricao}</div>` : ''}
                                ${item.tempo_permanencia ? `<div class="text-xs text-blue-300 mt-1">⏱️ Tempo no local: ${item.tempo_permanencia}</div>` : ''}
                            </div>
                        </div>`;
                    }).join('')}
                </div>
            </div>
        ` : ''}
        
        ${roteiro.observacoes?.length > 0 ? `
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
        const horarioSaida = getFieldValue('horario-saida');
        const horarioVolta = getFieldValue('horario-volta');
        const consumoMedio = getFieldValue('consumo-medio');
        const perfilPilotagem = getFieldValue('perfil-pilotagem');
        const experienciaDesejada = getFieldValue('experiencia-desejada');
        
        // Validação para submissão (mais rigorosa)
        const isForSubmission = arguments[0] === true;
        const hasRequiredFields = enderecoPartida && horarioSaida && horarioVolta && consumoMedio && perfilPilotagem && experienciaDesejada;
        
        if (isForSubmission && !hasRequiredFields) {
            throw new Error('Campos obrigatórios não preenchidos');
        } else if (!hasRequiredFields) {
            console.log('⚠️ Alguns campos obrigatórios ainda não foram preenchidos');
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
            capacidadeTanque: parseFloat(capacidadeTanque),
            consumoMedio: parseFloat(consumoMedio),
            perfilPilotagem,
            experienciaDesejada,
            
            // Calculado baseado nos dados da moto
            autonomia: capacidadeTanque && consumoMedio ? (parseFloat(capacidadeTanque) * parseFloat(consumoMedio)) : null,
            
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
        'horario-volta', 'capacidade-tanque', 'consumo-medio', 'perfil-pilotagem',
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

    // Adiciona classe de erro ao campo e ao seu contêiner
    field.classList.add('border-red-500', 'focus:border-red-500', 'focus:ring-red-500/20');
    field.closest('.form-field-container')?.classList.add('has-error');
    
    const error = document.createElement('div');
    error.className = 'field-error text-red-400 text-xs mt-1 flex items-center gap-1';
    error.innerHTML = `
        <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path></svg>
        <span>${message}</span>
    `;
    
    // Insere a mensagem de erro após o campo
    field.parentNode.insertBefore(error, field.nextSibling);
}

function clearFieldError(event) {
    const field = event.target;
    field.classList.remove('border-red-500', 'focus:border-red-500', 'focus:ring-red-500/20');
    field.closest('.form-field-container')?.classList.remove('has-error');
    
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
    try {
        const formData = getFormData();
        localStorage.setItem('gerador_form_data', JSON.stringify(formData));
    } catch (error) {
        console.error('Erro ao salvar dados do formulário:', error);
        // Degradação graceful - formulário continua funcionando
        if (error.name === 'QuotaExceededError') {
            console.warn('LocalStorage cheio - limpando dados antigos');
            localStorage.removeItem('gerador_form_data');
        }
    }
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

/**
 * Exibe o modal com o histórico de rolês gerados.
 */
function showHistoryModal() {
    const history = getHistory();
    const modalId = 'history-modal';

    // Remove modal antigo se existir
    const existingModal = document.getElementById(modalId);
    if (existingModal) existingModal.remove();

    const modal = document.createElement('div');
    modal.id = modalId;
    modal.className = 'fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4';
    modal.innerHTML = `
        <div class="bg-gray-900 rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col border border-gray-700 shadow-2xl">
            <!-- Header -->
            <div class="p-6 border-b border-gray-700 flex justify-between items-center flex-shrink-0">
                <h2 class="text-2xl font-bold text-gold-primary">📜 Histórico de Rolês</h2>
                <button onclick="this.closest('#${modalId}').remove()" class="text-gray-400 hover:text-white text-2xl">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            
            <!-- Conteúdo -->
            <div class="p-6 overflow-y-auto">
                ${history.length === 0 ? `
                    <div class="text-center py-12">
                        <div class="text-6xl mb-4">🗺️</div>
                        <h3 class="text-xl text-gray-400 mb-2">Nenhum rolê no histórico</h3>
                        <p class="text-gray-500">Gere seu primeiro rolê para que ele apareça aqui!</p>
                    </div>
                ` : `
                    <div class="space-y-4">
                        ${history.map((entry, index) => createHistoryEntry(entry, index)).join('')}
                    </div>
                `}
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    trackEvent('history_viewed');
}

/**
 * Cria o HTML para uma entrada do histórico.
 */
function createHistoryEntry(entry, index) {
    const firstSuggestion = entry.results[0];
    return `
        <div class="bg-gray-800 rounded-lg p-4 hover:bg-gray-700/50 transition-colors">
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <div>
                    <p class="text-sm text-gray-400">${new Date(entry.timestamp).toLocaleString('pt-BR')}</p>
                    <h4 class="text-lg font-bold text-white">${firstSuggestion?.titulo || 'Rolê Personalizado'}</h4>
                    <p class="text-sm text-gray-300">${entry.formData.experienciaDesejada}</p>
                </div>
                <div class="flex gap-2 mt-3 sm:mt-0">
                    <button onclick="reuseHistoryEntry(${index})" class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm font-semibold">Reutilizar</button>
                    <button onclick="deleteHistoryEntry(${index})" class="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm font-semibold">Excluir</button>
                </div>
            </div>
        </div>
    `;
}

/**
 * Reutiliza os dados de uma entrada do histórico para preencher o formulário.
 */
function reuseHistoryEntry(index) {
    const history = getHistory();
    const entry = history[index];
    if (!entry) return;

    Object.keys(entry.formData).forEach(key => {
        const elementId = key.replace(/([A-Z])/g, '-$1').toLowerCase();
        const element = document.getElementById(elementId);
        if (element) {
            element.value = entry.formData[key];
        }
    });

    showNotification('📝 Formulário preenchido com dados do histórico!', 'success');
    document.getElementById('history-modal')?.remove();
    window.scrollTo({ top: document.getElementById('gerador-form').offsetTop, behavior: 'smooth' });
}

/**
 * Deleta uma entrada do histórico.
 */
function deleteHistoryEntry(index) {
    if (!confirm('Tem certeza que deseja excluir este item do histórico?')) return;
    deleteFromHistory(index);
    showHistoryModal(); // Recarrega o modal
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

/**
 * Retorna o histórico salvo.
 */
function getHistory() {
    try {
        return JSON.parse(localStorage.getItem('gerador_history') || '[]');
    } catch {
        return [];
    }
}

/**
 * Deleta um item do histórico pelo índice.
 */
function deleteFromHistory(index) {
    const history = getHistory();
    history.splice(index, 1);
    localStorage.setItem('gerador_history', JSON.stringify(history));
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
        id: Date.now().toString(36) + Math.random().toString(36).substring(2),
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
    
    // Determina a cor do gradiente baseada no índice
    let gradientClass;
    if (index === 0) {
        gradientClass = 'from-green-600 to-green-700';
    } else if (index === 1) {
        gradientClass = 'from-blue-600 to-blue-700';
    } else {
        gradientClass = 'from-purple-600 to-purple-700';
    }

    return `
        <div class="bg-gray-800 rounded-xl p-6 hover:bg-gray-750 transition-colors ${isUserChoice ? 'ring-2 ring-gold-primary' : ''}">
            <div class="text-center mb-4">
                <div class="bg-gradient-to-r ${gradientClass} text-white px-3 py-1 rounded-full text-sm font-bold inline-block">
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
                ${renderVotingSection(hasVoted, voteCount, isUserChoice, collaborativeId, index)}
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
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
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
        
        // Determina a medalha baseada na posição
        let medal;
        if (position === 0) {
            medal = '🥇';
        } else if (position === 1) {
            medal = '🥈';
        } else {
            medal = '🥉';
        }
        
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
    // Criar descrição do evento de forma mais legível
    const destinosList = roteiro.destinos.map(d => `• ${d.nome} - ${d.endereco}`).join('\\n');
    const eventDescription = [
        roteiro.resumo,
        '',
        '📍 DESTINOS:',
        destinosList,
        '',
        '📋 CHECKLIST:',
        checklist,
        '',
        `💰 Custo: ${roteiro.custo_total_estimado}`,
        `📏 Distância: ${roteiro.distancia_total}`
    ].join('\\n');
    
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
    // Criar descrição do evento principal de forma mais legível
    const roteiroList = roteiro.destinos.map(d => `• ${d.nome}`).join('\\n');
    const mainEventDescription = [
        '🚀 INÍCIO DO ROLÊ',
        '',
        '📋 CHECKLIST COMPLETO:',
        checklist,
        '',
        '🎯 ROTEIRO:',
        roteiroList,
        '',
        `💰 Custo Total: ${roteiro.custo_total_estimado}`
    ].join('\\n');
    
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
    const roteiroId = Date.now().toString(36) + Math.random().toString(36).substring(2);
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
    const suggestionsGrid = document.querySelector('.experiencia-grid');
    if (suggestionsGrid) suggestionsGrid.classList.add('hidden');
    
    setTimeout(() => {
        suggestionsGrid.classList.add('hidden');
        
        // Mostra o roteiro expandido
        const selectedContainer = document.getElementById('selected-roteiro');
        selectedContainer.classList.remove('hidden');
        
        // Formatar dados do passeio
        const formData = lastFormData || {};
        const dataFormatada = formData.dataRole ? new Date(formData.dataRole).toLocaleDateString('pt-BR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }) : 'Data não informada';
        
        selectedContainer.innerHTML = `
            <div class="text-center mb-6">
                <h2 class="text-3xl font-bold text-gold-primary mb-2">🎉 Roteiro Selecionado!</h2>
                <p class="text-gray-300 mb-4">Agora você pode compartilhar com seus amigos e organizar o grupo</p>
                
                <!-- Dados do Passeio -->
                <div class="bg-card rounded-lg p-4 mb-4 text-left max-w-2xl mx-auto">
                    <h3 class="text-lg font-semibold text-gold-primary mb-3 text-center">📋 Dados do Passeio</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div class="flex items-center">
                            <span class="text-gold-primary mr-2">📅</span>
                            <span class="text-gray-300">Data: <strong class="text-white">${dataFormatada}</strong></span>
                        </div>
                        <div class="flex items-center">
                            <span class="text-gold-primary mr-2">🕐</span>
                            <span class="text-gray-300">Saída: <strong class="text-white">${formData.horarioSaida || 'Não informado'}</strong></span>
                        </div>
                        <div class="flex items-center">
                            <span class="text-gold-primary mr-2">🕕</span>
                            <span class="text-gray-300">Retorno: <strong class="text-white">${formData.horarioVolta || 'Não informado'}</strong></span>
                        </div>
                        <div class="flex items-center">
                            <span class="text-gold-primary mr-2">🏍️</span>
                            <span class="text-gray-300">Moto: <strong class="text-white">${formData.capacidadeTanque || 0}L | ${formData.consumoMedio || 0}km/L</strong></span>
                        </div>
                        ${formData.autonomia ? `
                        <div class="flex items-center">
                            <span class="text-gold-primary mr-2">📏</span>
                            <span class="text-gray-300">Autonomia: <strong class="text-white">${Math.round(formData.autonomia)}km</strong></span>
                        </div>` : ''}
                        <div class="flex items-center md:col-span-2">
                            <span class="text-gold-primary mr-2">📍</span>
                            <span class="text-gray-300">Ponto de Saída: <strong class="text-white">${formData.enderecoPartida || 'Não informado'}</strong></span>
                        </div>
                    </div>
                </div>
                
                <button onclick="showSuggestions()" class="text-blue-400 underline mt-2 hover:text-blue-300">
                    ← Voltar para as opções
                </button>
            </div>
        `;
        
        const expandedCard = createAdvancedResultCard(roteiro, index);
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
    const suggestionsGrid = document.querySelector('.experiencia-grid');
    const selectedContainer = document.getElementById('selected-roteiro');
    
    // Esconde roteiro expandido
    selectedContainer.classList.add('hidden');
    
    // Mostra sugestões novamente (se existirem)
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
                console.error('Erro ao processar rolê compartilhado:', error);
                showNotification('❌ Erro ao carregar rolê compartilhado', 'error');
                // Retry logic ou fallback
                if (error.name === 'SyntaxError') {
                    console.warn('Dados corrompidos detectados');
                }
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