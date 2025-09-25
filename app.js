document.addEventListener('DOMContentLoaded', function () {
    // ===== FUNCIONALIDADES DE NAVEGAÇÃO E UX =====
    
    // Menu mobile toggle
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (mobileMenuToggle && mobileMenu) {
        mobileMenuToggle.addEventListener('click', function() {
            const isExpanded = mobileMenuToggle.getAttribute('aria-expanded') === 'true';
            
            mobileMenuToggle.classList.toggle('active');
            mobileMenu.classList.toggle('show');
            document.body.classList.toggle('menu-open');
            
            // Update ARIA attributes
            mobileMenuToggle.setAttribute('aria-expanded', !isExpanded);
            mobileMenuToggle.setAttribute('aria-label', isExpanded ? 'Abrir menu de navegação' : 'Fechar menu de navegação');
            
            // Focus management
            if (!isExpanded) {
                // Menu opening - focus first link
                const firstLink = mobileMenu.querySelector('.nav-link');
                if (firstLink) setTimeout(() => firstLink.focus(), 300);
            }
        });
        
        // Keyboard navigation for menu toggle
        mobileMenuToggle.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                mobileMenuToggle.click();
            }
        });
        
        // Fechar menu ao clicar nos links
        mobileMenu.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', function() {
                mobileMenuToggle.classList.remove('active');
                mobileMenu.classList.remove('show');
                document.body.classList.remove('menu-open');
                mobileMenuToggle.setAttribute('aria-expanded', 'false');
                mobileMenuToggle.setAttribute('aria-label', 'Abrir menu de navegação');
            });
        });
        
        // Fechar menu ao clicar fora
        document.addEventListener('click', function(e) {
            if (!mobileMenuToggle.contains(e.target) && !mobileMenu.contains(e.target)) {
                mobileMenuToggle.classList.remove('active');
                mobileMenu.classList.remove('show');
                document.body.classList.remove('menu-open');
                mobileMenuToggle.setAttribute('aria-expanded', 'false');
                mobileMenuToggle.setAttribute('aria-label', 'Abrir menu de navegação');
            }
        });
        
        // Close menu on Escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && mobileMenu.classList.contains('show')) {
                mobileMenuToggle.classList.remove('active');
                mobileMenu.classList.remove('show');
                document.body.classList.remove('menu-open');
                mobileMenuToggle.setAttribute('aria-expanded', 'false');
                mobileMenuToggle.setAttribute('aria-label', 'Abrir menu de navegação');
                mobileMenuToggle.focus();
            }
        });
    }
    
    // Header scroll effect
    const header = document.querySelector('.site-nav');
    
    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;
        
        if (header) {
            if (currentScrollY > 100) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }
    });
    
    // Scroll to top button
    const scrollToTopBtn = document.getElementById('scroll-to-top');
    if (scrollToTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                scrollToTopBtn.classList.add('show');
            } else {
                scrollToTopBtn.classList.remove('show');
            }
        });
        
        scrollToTopBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
    
    // Active navigation link highlighting
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section[id]');
    
    function updateActiveNavLink() {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 150;
            const sectionHeight = section.offsetHeight;
            if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + current) {
                link.classList.add('active');
            }
        });
    }
    
    window.addEventListener('scroll', updateActiveNavLink);
    updateActiveNavLink(); // Call once on load
    
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                const headerHeight = header ? header.offsetHeight : 0;
                const targetPosition = targetElement.offsetTop - headerHeight - 20;
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Animate elements on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in-up');
            }
        });
    }, observerOptions);
    
    // Observe cards and sections
    document.querySelectorAll('.card, section > div').forEach(el => {
        observer.observe(el);
    });
    
    // ===== CONFIGURAÇÃO API E FUNCIONALIDADES EXISTENTES =====
    
    // Configuração para chamadas Gemini API.
    // Usar URLs definidas em config.js com nova chave da API
    const API_KEY = "AIzaSyCiHRVozYYmHB-5W64QdJzn9dQYAyRl9Tk"; // Nova chave da API
    const API_URL_GENERATE_TEXT = window.SOP_CONFIG?.textUrl 
        ?? `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${API_KEY}`;

    // Safe DOM helpers
    const $ = id => document.getElementById(id);
    function showModal(message) {
        const msgEl = $('modal-message');
        const modal = $('modal');
        if (msgEl) msgEl.textContent = message;
        if (modal) modal.classList.remove('hidden');
    }
    function hideModal() { const modal = $('modal'); if (modal) modal.classList.add('hidden'); }
    const modalCloseBtn = $('modal-close-btn'); if (modalCloseBtn) modalCloseBtn.addEventListener('click', hideModal);

    async function fetchWithExponentialBackoff(url, options, retries = 3, delay = 1000) {
        console.log(`Tentando requisição para: ${url} (tentativas restantes: ${retries})`);
        
        try {
            const response = await fetch(url, options);
            
            console.log(`Status da resposta: ${response.status}`);
            
            if (response.status === 429 && retries > 0) {
                console.log(`Rate limit hit, aguardando ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
                return fetchWithExponentialBackoff(url, options, retries - 1, delay * 2);
            }
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error(`Erro na API: ${response.status} - ${errorText}`);
                throw new Error(`API call failed with status: ${response.status} - ${errorText}`);
            }
            
            const jsonResponse = await response.json();
            console.log('Resposta da API recebida com sucesso');
            return jsonResponse;
            
        } catch (error) {
            console.error(`Erro na requisição:`, error);
            
            if (retries > 0 && (error.name === 'TypeError' || error.message.includes('fetch'))) {
                console.log(`Erro de rede, tentando novamente em ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
                return fetchWithExponentialBackoff(url, options, retries - 1, delay * 2);
            }
            
            throw error;
        }
    }

    // Local fallback generators (simple, deterministic) to make the site usable offline

    function localGenerateEvent({ input }) {
        return `Evento: ${input}\nTema sugerido: "Noite da Irmandade"\nAtividades: Música ao vivo, roda de histórias, campeonato de sinuca.\nCardápio sugerido: Churrasco (faixa de preço por pessoa R$30-50), bebidas conforme tabela do bar.\nConvite: Venha celebrar com a gente — confirme presença aqui no site.`;
    }

    function localGenerateInstagram({ input }) {
        return `Legenda: Hoje a estrada nos chama. ${input} #SonsOfPeaky #Irmandade #Motociclismo\nHashtags: #motos #motoclube #rideout #brotherhood\nCTA: Marque os irmãos que vão colar!`;
    }

    function localGenerateMessage() {
        const msgs = ['A estrada une quem tem coragem. Vem com a gente!', 'Irmãos na pista, sempre juntos.', 'Fortes na estrada, leais na vida.'];
        return msgs[Math.floor(Math.random() * msgs.length)];
    }

    // Utility to add confirm listeners
    function addConfirmButtonListeners() {
        document.querySelectorAll('.confirmar-btn').forEach(button => {
            if (!button.dataset.bound) {
                button.addEventListener('click', function (e) {
                    console.log('Botão de confirmação clicado');
                    const eventCard = e.target.closest('[id]') || e.target.closest('.p-4');
                    
                    if (!eventCard) {
                        console.error('Não foi possível encontrar o card do evento');
                        return showModal('Erro ao localizar evento. Tente recarregar a página.');
                    }
                    
                    let eventId = eventCard.id;
                    if (!eventId) {
                        eventId = `evento-${Date.now()}`;
                        eventCard.id = eventId;
                        console.log('ID gerado para evento:', eventId);
                    }
                    
                    const eventTitle = eventCard.querySelector('h3')?.textContent || 'Evento Sons of Peaky';
                    console.log('Abrindo modal para evento:', eventId, eventTitle);
                    openRSVPModal(eventId, eventTitle);
                });
                button.dataset.bound = '1';
            }
        });
    }
    addConfirmButtonListeners();

    // RSVP Modal logic
    function openRSVPModal(eventId, eventTitle) {
        const modal = document.getElementById('rsvp-modal');
        const titleEl = document.getElementById('rsvp-event-title');
        const nameInput = document.getElementById('rsvp-name');
        const statusEl = document.getElementById('rsvp-status');
        modal.classList.remove('hidden');
        titleEl.textContent = eventTitle;
        nameInput.value = '';
        statusEl.classList.add('hidden');
        modal.dataset.eventId = eventId;
    }
    function closeRSVPModal() {
        const modal = document.getElementById('rsvp-modal');
        modal.classList.add('hidden');
    }
    document.getElementById('rsvp-cancel-btn')?.addEventListener('click', closeRSVPModal);
    document.getElementById('rsvp-confirm-btn')?.addEventListener('click', function () {
        const modal = document.getElementById('rsvp-modal');
        const nameInput = document.getElementById('rsvp-name');
        const statusEl = document.getElementById('rsvp-status');
        const eventId = modal.dataset.eventId;
        const name = nameInput.value.trim();
        if (!name) {
            statusEl.textContent = 'Digite seu nome para confirmar.';
            statusEl.classList.remove('hidden');
            return;
        }
        // Persist attendee in localStorage
        const key = `sop_rsvp_${eventId}`;
        let attendees = [];
        try {
            attendees = JSON.parse(localStorage.getItem(key) || '[]');
        } catch {}
        if (!attendees.includes(name)) attendees.push(name);
        localStorage.setItem(key, JSON.stringify(attendees));
        closeRSVPModal();
        renderAttendees(eventId);
    });

    // Render attendee list in event card
    function renderAttendees(eventId) {
        const key = `sop_rsvp_${eventId}`;
        let attendees = [];
        try {
            attendees = JSON.parse(localStorage.getItem(key) || '[]');
        } catch {}
        const eventCard = document.getElementById(eventId);
        if (!eventCard) return;
        let list = eventCard.querySelector('.rsvp-list');
        if (!list) {
            list = document.createElement('div');
            list.className = 'rsvp-list mt-2';
            eventCard.appendChild(list);
        }
        if (attendees.length === 0) {
            list.innerHTML = '<span class="text-gray-400 text-sm">Nenhum confirmado ainda.</span>';
        } else {
            // Criar lista de participantes de forma mais legível
            const attendeesSpans = attendees.map(n => `<span>${n}</span>`).join(', ');
            list.innerHTML = `<span class="text-amber-400 font-bold">${attendees.length} confirmado(s):</span> <span class="text-gray-300">${attendeesSpans}</span>`;
        }
    }

    // Render attendees for all events on load
    function renderAllAttendees() {
        document.querySelectorAll('[id^="reuniao-"]').forEach(card => {
            renderAttendees(card.id);
        });
    }
    renderAllAttendees();

    // Estatutos: toggle panels and unlock Alta Cúpula
    document.querySelectorAll('[data-toggle]')?.forEach(btn => {
        btn.addEventListener('click', () => {
            const sel = btn.getAttribute('data-toggle');
            const panel = document.querySelector(sel);
            if (panel) panel.classList.toggle('hidden');
        });
    });

    // Proteção da seção Alta Cúpula - SEM persistência
    function showAcUnlocked() {
        const locked = document.getElementById('ac-locked');
        const content = document.getElementById('ac-content');
        if (locked && content) {
            locked.classList.add('hidden');
            content.classList.remove('hidden');
        }
    }
    
    function hideAcContent() {
        const locked = document.getElementById('ac-locked');
        const content = document.getElementById('ac-content');
        if (locked && content) {
            locked.classList.remove('hidden');
            content.classList.add('hidden');
        }
    }
    
    // Sempre inicia bloqueado
    hideAcContent();
    
    const acUnlockBtn = document.getElementById('ac-unlock-btn');
    if (acUnlockBtn) acUnlockBtn.addEventListener('click', () => {
        const pwd = (document.getElementById('ac-password')?.value || '').trim();
        const status = document.getElementById('ac-status');
        const correctPassword = window.SOP_CONFIG?.altaCupulaPassword ?? 'cangaiba';

        if (pwd.toLowerCase() === correctPassword.toLowerCase()) {
            if (status) status.classList.add('hidden');
            showAcUnlocked();
            // Limpar campo de senha
            const passwordField = document.getElementById('ac-password');
            if (passwordField) passwordField.value = '';
        } else if (status) {
            status.textContent = 'Senha incorreta. Acesso negado.';
            status.classList.remove('hidden');
        }
    });
    
    // Enter key support
    const passwordField = document.getElementById('ac-password');
    if (passwordField) {
        passwordField.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                acUnlockBtn?.click();
            }
        });
    }

    // Adiciona evento recorrente: toda quinta às 19:30
    (function ensureWeeklyMeeting() {
        const agendaList = document.querySelector('#agenda-container .space-y-4');
        if (!agendaList) return;
        // Próxima quinta-feira
        const now = new Date();
        const day = now.getDay(); // 0=Dom, 4=Qui
        const diffToThursday = (4 - day + 7) % 7 || 7; // se hoje for quinta, pegar a próxima
        const nextThu = new Date(now);
        nextThu.setDate(now.getDate() + diffToThursday);
        nextThu.setHours(19, 30, 0, 0);

        const dateStr = nextThu.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' });
        const eventId = `reuniao-${nextThu.getFullYear()}-${nextThu.getMonth()+1}-${nextThu.getDate()}`;
        if (document.getElementById(eventId)) return; // já inserido

        const html = `
            <div id="${eventId}" class="p-4 rounded-md bg-gray-900 border border-gray-700">
                <h3 class="text-lg font-bold text-amber-500">${dateStr} - Reunião Semanal (19:30)</h3>
                <p class="text-gray-400">Local: Galpão - Rua José Flavio, 420, Travessa 1A.</p>
                <button class="mt-2 px-4 py-2 bg-amber-600 text-gray-900 font-bold rounded-full transition-transform duration-300 hover:scale-105 confirmar-btn">Confirmar Presença</button>
                <button class="mt-2 px-4 py-2 bg-green-600 text-white font-bold rounded-full whatsapp-share-btn flex items-center gap-2"><img src="assets/img/whatsapp.png" alt="WhatsApp" style="width:20px;height:20px;"> Compartilhar no WhatsApp</button>
            </div>`;
        agendaList.insertAdjacentHTML('beforeend', html);
        addConfirmButtonListeners();
    })();

    // (Função renderizarSugestoes removida - não utilizada)
    
    // (Funções calcularCombustivel e estimarPedagios removidas - não utilizadas)
    
    // Função para compartilhar no WhatsApp
    window.compartilharWhatsApp = function(destino, data, horaSaida, pontos) {
        const texto = `🏍️ *ROLÊ SONS OF PEAKY* 🏍️\n\n` +
            `📍 *Destino:* ${destino}\n` +
            `📅 *Data:* ${data}\n` +
            `⏰ *Saída:* ${horaSaida}\n` +
            `🚩 *Ponto de Encontro:* ${pontos[0]?.local || 'Galpão SOP'}\n\n` +
            `Bora colar, irmãos! 🔥\n\n` +
            `_Por Ordem dos Sons of Peaky_ 💀`;
        
        const url = `https://wa.me/?text=${encodeURIComponent(texto)}`;
        window.open(url, '_blank');
    };
    
    // Função para copiar roteiro
    window.copiarRoteiro = function() {
        const roteiroDiv = document.querySelector('#role-avancado-output .bg-gray-900');
        if (roteiroDiv) {
            const texto = roteiroDiv.innerText;
            navigator.clipboard.writeText(texto).then(() => {
                showModal('✅ Roteiro copiado para a área de transferência!');
            }).catch(() => {
                showModal('❌ Erro ao copiar. Selecione e copie manualmente.');
            });
        }
    };
    
    // Função para salvar em PDF (placeholder - requer biblioteca adicional)
    window.salvarPDF = function(destino) {
        showModal(`📄 Funcionalidade de PDF em desenvolvimento!\n\nPor enquanto, use "Copiar Roteiro" ou "Compartilhar WhatsApp" para salvar as informações.\n\nDestino: ${destino}`);
    };
    
    // Inicialização automática de campos
    function inicializarCamposAutomaticos() {
        // Definir data padrão para o próximo sábado
        const hoje = new Date();
        const proximoSabado = new Date(hoje);
        proximoSabado.setDate(hoje.getDate() + (6 - hoje.getDay()));
        
        const roleData = $('role-data');
        if (roleData && !roleData.value) {
            roleData.value = proximoSabado.toISOString().split('T')[0];
        }
        
        // Sistema de experiências não precisa de contador de destinos
        // O botão mantém seu texto original do HTML
    }
    
    // Executar inicialização
    inicializarCamposAutomaticos();
    
    /* === SEÇÃO DESABILITADA - PONTOS DE ENCONTRO ===
    // Gerenciar pontos de encontro dinâmicos
    const addPontoBtn = $('add-ponto-btn');
    if (addPontoBtn) {
        addPontoBtn.addEventListener('click', function() {
            const container = $('pontos-container');
            if (container) {
                const novoPonto = document.createElement('div');
                novoPonto.className = 'ponto-encontro flex gap-3 items-center';
                novoPonto.innerHTML = `
                    <input type="text" class="flex-1 px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-gray-100 focus:border-amber-500 outline-none transition-colors" placeholder="Nome do local + endereço" />
                    <input type="time" class="px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-gray-100 focus:border-amber-500 outline-none transition-colors" />
                    <select class="px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-gray-100 focus:border-amber-500 outline-none transition-colors">
                        <option value="comboio">Comboio</option>
                        <option value="parada">Parada</option>
                    </select>
                    <button class="px-3 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm remove-ponto">×</button>
                `;
                container.appendChild(novoPonto);
                
                // Adicionar evento de remoção
                const removeBtn = novoPonto.querySelector('.remove-ponto');
                removeBtn.addEventListener('click', () => novoPonto.remove());
            }
        });
    }
    === FIM DA SEÇÃO DESABILITADA === */

    /* === SEÇÃO DESABILITADA - GERADOR AVANÇADO ===
    // Gerador de Rolê Avançado
    const gerarRoleAvancadoBtn = $('gerar-role-avancado-btn');
    if (gerarRoleAvancadoBtn) gerarRoleAvancadoBtn.addEventListener('click', async function () {
        const destino = $('role-destino')?.value.trim();
        const data = $('role-data')?.value;
        const horaSaida = $('role-saida-final')?.value;
        const perfil = $('role-perfil')?.value;
        const estrada = $('role-estrada')?.value;
        const grupo = $('role-grupo')?.value;
        const cilindrada = $('role-cilindrada')?.value;
        const tanque = $('role-tanque')?.value;
        const incluirPedagio = $('role-pedagio')?.checked;
        
        const outputDiv = $('role-avancado-output');
        const loadingIndicator = $('loading-indicator-role-avancado');

        if (!destino || !data) {
            if (outputDiv) {
                outputDiv.innerHTML = '<div class="text-red-400 p-4 bg-red-900 rounded-lg">❌ Por favor, primeiro escolha um destino sugerido na Etapa 2 e defina a data do rolê.</div>';
                outputDiv.classList.remove('hidden');
            }
            return;
        }

        if (outputDiv) {
            outputDiv.innerHTML = '';
            outputDiv.classList.remove('hidden');
        }
        if (loadingIndicator) {
            loadingIndicator.style.display = 'flex';
            loadingIndicator.classList.remove('hidden');
        }

        try {
            // Coletar pontos de encontro
            const pontos = [];
            const pontosElements = document.querySelectorAll('.ponto-encontro');
            pontosElements.forEach(ponto => {
                const local = ponto.querySelector('input[type="text"]').value.trim();
                const hora = ponto.querySelector('input[type="time"]').value;
                const tipo = ponto.querySelector('select').value;
                if (local && hora) {
                    pontos.push({ local, hora, tipo });
                }
            });

            let roteiro = null;
            if (API_URL_GENERATE_TEXT) {
                // Verificar se temos dados do destino selecionado
                const destinoInfo = window.destinoSelecionado || null;
                
                const prompt = `Atue como um especialista em planejamento de viagens de moto para o grupo Sons of Peaky e crie um roteiro COMPLETO e DETALHADO.

🎯 INFORMAÇÕES DA VIAGEM:
- Destino: ${destino}
- Tipo de rolê: ${tipo || 'Turístico'}
- Data: ${new Date(data).toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
- Horário de saída: ${horaSaida}
- Horário de volta desejado: ${horaVolta || 'Flexível'}

🏍️ CARACTERÍSTICAS DO GRUPO:
- Perfil de pilotagem: ${perfil}
- Tipo de estrada: ${estrada}
- Tamanho do grupo: ${grupo}
- Cilindrada predominante: ${cilindrada}cc
- Capacidade do tanque: ${tanque}L
- Incluir pedágios: ${incluirPedagio ? 'Sim' : 'Não'}

📍 PONTOS DE ENCONTRO:
${pontos.map(p => `- ${p.local} às ${p.hora} (${p.tipo})`).join('\n')}

${destinoInfo ? `
🎯 DADOS ESPECÍFICOS DO DESTINO (use para cálculos precisos):
- Distância real: ${destinoInfo.distancia}km (ida e volta)
- Tempo estimado de viagem: ${destinoInfo.tempoEstimado}
- Nível de dificuldade: ${destinoInfo.dificuldade}
- Pontos imperdíveis: ${destinoInfo.pontos?.join(', ') || 'A definir'}
- Custos conhecidos: Pedágio R$${destinoInfo.custos?.pedagio || 0}, Combustível R$${destinoInfo.custos?.combustivel || 0}
- Avisos importantes: ${destinoInfo.avisos?.join(' | ') || 'Nenhum'}
- Características: ${destinoInfo.tags?.join(', ') || ''}
` : ''}

CRIE UM ROTEIRO ÉPICO QUE INCLUA:

1. 📋 RESUMO EXECUTIVO:
   - Distância total ${destinoInfo ? `(${destinoInfo.distancia}km confirmados)` : 'estimada'}
   - Tempo de viagem considerando paradas
   - Custo total por pessoa detalhado
   - Nível de dificuldade e preparação necessária

2. ⏰ CRONOGRAMA MILITAR:
   - Timeline completa do dia
   - Margem de segurança em cada etapa
   - Pontos de reagrupamento
   - Horário crítico de retorno

3. 🛣️ ROTA DOS CAMPEÕES:
   - Melhor trajeto para motos
   - Trechos mais bonitos
   - Pontos perigosos a evitar
   - Rotas alternativas de emergência

4. ⛽ PARADAS ESTRATÉGICAS:
   - Postos confiáveis no trajeto
   - Restaurantes recomendados
   - Pontos turísticos pelo caminho
   - Banheiros e descanso
   - Pontos turísticos pelo caminho

5. 💰 ORÇAMENTO REAL:
   - Combustível baseado na cilindrada real (${cilindrada}cc)
   - Todos os pedágios do trajeto
   - Sugestões de alimentação com preços
   - Custos extras (estacionamento, ingressos)

6. 🛡️ SEGURANÇA DOS IRMÃOS:
   - Equipamentos obrigatórios
   - Condições da estrada
   - Pontos de apoio médico
   - Contatos de emergência locais

7. 🎯 EXPERIÊNCIA ÉPICA SONS OF PEAKY:
   - Melhores pontos para fotos do grupo
   - Experiências únicas do local
   - História e cultura local
   - O que não pode ser perdido

FORMATO: Seja detalhado, realista e mantenha o espírito aventureiro dos Sons of Peaky. Use dados reais de distâncias e custos atuais do Brasil.`;

                const payload = { contents: [{ parts: [{ text: prompt }] }] };
                const response = await fetchWithExponentialBackoff(API_URL_GENERATE_TEXT, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                
                roteiro = response?.candidates?.[0]?.content?.parts?.[0]?.text;
            }

            if (!roteiro) {
                roteiro = `⚠️ Conectando com a IA para gerar roteiro detalhado...
                
Por enquanto, aqui estão as informações básicas:
- Destino: ${destino}
- Data: ${new Date(data).toLocaleDateString('pt-BR')}
- Saída: ${horaSaida}
- Retorno desejado: ${horaVolta || 'Flexível'}
- Pontos de encontro: ${pontos.length} configurados

Um roteiro completo será gerado quando a conexão for estabelecida.`;
            }

            // Gerar convite visual avançado
            const conviteAvancado = `
                <div class="bg-gradient-to-br from-amber-900 via-orange-900 to-red-900 border-2 border-amber-400 rounded-xl p-8 shadow-2xl">
                    <div class="text-center space-y-6">
                        <div class="flex justify-center mb-6">
                            <img src="assets/img/SONSOFPEAKY_TRANSPARENTE_BRANCO.png" alt="Sons of Peaky" class="h-20 w-auto">
                        </div>
                        <h2 class="text-4xl font-bold text-amber-300 mb-4">🏍️ ROLÊ OFICIAL SOP 🏍️</h2>
                        <div class="bg-black bg-opacity-50 rounded-lg p-6 space-y-4">
                            <h3 class="text-2xl font-semibold text-white">${destino}</h3>
                            <div class="grid md:grid-cols-2 gap-4 text-lg">
                                <div class="text-amber-200">📅 ${new Date(data).toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}</div>
                                <div class="text-amber-200">🕒 Saída: ${horaSaida}</div>
                                <div class="text-amber-200">🏁 Volta: ${horaVolta || 'Flexível'}</div>
                                <div class="text-amber-200">👥 ${grupo} motos</div>
                            </div>
                            <div class="border-t border-amber-500 pt-4">
                                <p class="text-amber-100 font-semibold text-lg">Pontos de Encontro:</p>
                                ${pontos.map(p => `<p class="text-gray-200">📍 ${p.local} - ${p.hora}</p>`).join('')}
                            </div>
                        </div>
                        <div class="text-center">
                            <p class="text-amber-200 italic text-lg">"A estrada nos chama, irmãos!"</p>
                            <p class="text-sm text-gray-300 mt-2">Por Ordem dos Peaky Blinders</p>
                        </div>
                    </div>
                </div>
            `;

            if (outputDiv) {
                outputDiv.innerHTML = `
                    <div class="space-y-8">
                        <div class="bg-gradient-to-r from-blue-900 to-blue-800 border border-blue-600 rounded-xl p-6">
                            <h4 class="text-2xl font-bold text-blue-200 mb-4 flex items-center gap-2">
                                🗺️ Roteiro Detalhado
                            </h4>
                            <div class="prose prose-invert max-w-none whitespace-pre-wrap text-gray-200 leading-relaxed">
                                ${roteiro}
                            </div>
                        </div>
                        <div class="bg-gray-800 rounded-xl p-6">
                            <h4 class="text-xl font-bold text-amber-400 mb-4">📢 Convite para Compartilhar</h4>
                            ${conviteAvancado}
                            <div class="mt-6 flex flex-wrap gap-4 justify-center">
                                <button onclick="compartilharWhatsApp('${destino}', '${data}', '${horaSaida}', ${JSON.stringify(pontos).replace(/"/g, '&quot;')})" class="px-6 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg transition-colors flex items-center gap-2">
                                    <span>📱</span> Compartilhar no WhatsApp
                                </button>
                                <button onclick="copiarRoteiro()" class="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-colors flex items-center gap-2">
                                    <span>📋</span> Copiar Roteiro
                                </button>
                                <button onclick="salvarPDF('${destino}')" class="px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg transition-colors flex items-center gap-2">
                                    <span>📄</span> Salvar PDF
                                </button>
                            </div>
                        </div>
                    </div>
                `;
            }

        } catch (error) {
            console.error('Erro ao gerar roteiro avançado:', error);
            if (outputDiv) {
                outputDiv.innerHTML = '<div class="text-red-400 p-4 bg-red-900 rounded-lg">❌ Erro ao gerar roteiro. Tente novamente.</div>';
                outputDiv.classList.remove('hidden');
            }
        } finally {
            if (loadingIndicator) {
                loadingIndicator.style.display = 'none';
                loadingIndicator.classList.add('hidden');
            }
        }
    });
    === FIM DA SEÇÃO DESABILITADA === */

    // Gerador de Ideias de Eventos
    const gerarEventoBtn = $('gerar-evento-btn');
    if (gerarEventoBtn) gerarEventoBtn.addEventListener('click', async function () {
        const input = $('evento-input')?.value.trim();
        const outputDiv = $('evento-output');
        const loadingIndicator = $('loading-indicator-evento');
        if (!input) { 
            if (outputDiv) {
                outputDiv.textContent = 'Por favor, descreva o tipo de evento que você quer planejar.'; 
                outputDiv.classList.remove('hidden');
            }
            return; 
        }
        if (outputDiv) {
            outputDiv.textContent = '';
            outputDiv.classList.remove('hidden');
        }
        if (loadingIndicator) {
            loadingIndicator.style.display = 'flex';
            loadingIndicator.classList.remove('hidden');
        }
        try {
            let text = null;
            if (API_URL_GENERATE_TEXT) {
                const prompt = `Atue como um planejador de eventos especialista em atividades para grupos motociclísticos como o Sons of Peaky.

Crie uma proposta detalhada para o seguinte tipo de evento: ${input}

A proposta deve incluir:
1. Nome criativo para o evento
2. Programação completa com horários
3. Atividades específicas para motociclistas
4. Estimativa de custos por pessoa
5. Lista de necessidades/preparativos
6. Sugestões de comida e bebida
7. Dicas para o ambiente do galpão
8. Como divulgar o evento

Mantenha o tom fraternal e use linguagem adequada ao grupo Sons of Peaky. Seja específico e prático.`;

                const payload = { contents: [{ parts: [{ text: prompt }] }] };
                console.log('Gerando evento com API...');
                const response = await fetchWithExponentialBackoff(API_URL_GENERATE_TEXT, { 
                    method: 'POST', 
                    headers: { 'Content-Type': 'application/json' }, 
                    body: JSON.stringify(payload) 
                });
                console.log('Resposta da API para evento:', response);
                text = response?.candidates?.[0]?.content?.parts?.[0]?.text;
            }
            if (!text) text = localGenerateEvent({ input });
            if (outputDiv) outputDiv.textContent = text;
        } catch (error) {
            console.error('Erro ao gerar ideias de evento:', error);
            if ($('evento-output')) {
                $('evento-output').textContent = 'Ocorreu um erro ao conectar com o serviço. Tente novamente mais tarde.';
                $('evento-output').classList.remove('hidden');
            }
        } finally { 
            if (loadingIndicator) {
                loadingIndicator.style.display = 'none'; 
                loadingIndicator.classList.add('hidden');
            }
        }
    });

    // Gerador de Posts do Instagram
    const gerarInstagramBtn = $('gerar-instagram-btn');
    if (gerarInstagramBtn) gerarInstagramBtn.addEventListener('click', async function () {
        const input = $('instagram-input')?.value.trim();
        const outputDiv = $('instagram-output');
        const loadingIndicator = $('loading-indicator-instagram');
        if (!input) { 
            if (outputDiv) {
                outputDiv.textContent = 'Por favor, descreva o conteúdo do post para gerar a legenda e hashtags.'; 
                outputDiv.classList.remove('hidden');
            }
            return; 
        }
        if (outputDiv) {
            outputDiv.textContent = '';
            outputDiv.classList.remove('hidden');
        }
        if (loadingIndicator) {
            loadingIndicator.style.display = 'flex';
            loadingIndicator.classList.remove('hidden');
        }
        try {
            let text = null;
            if (API_URL_GENERATE_TEXT) {
                const prompt = `Atue como um especialista em marketing digital e redes sociais para grupos motociclísticos.

Crie uma legenda completa para Instagram sobre: ${input}

A legenda deve incluir:
1. Texto cativante e autêntico no estilo Sons of Peaky
2. Call to action apropriado
3. Hashtags relevantes (#sonsofpeaky #motociclismo #irmandade #peakyblinders)
4. Emojis adequados ao tema motociclístico
5. Menção ao galpão/local se aplicável
6. Tom fraternal e inspirador

Limite: máximo 300 caracteres para o texto principal + hashtags.
Use linguagem que conecte com motociclistas e o público do grupo.`;

                const payload = { contents: [{ parts: [{ text: prompt }] }] };
                console.log('Gerando post Instagram com API...');
                const response = await fetchWithExponentialBackoff(API_URL_GENERATE_TEXT, { 
                    method: 'POST', 
                    headers: { 'Content-Type': 'application/json' }, 
                    body: JSON.stringify(payload) 
                });
                console.log('Resposta da API para Instagram:', response);
                text = response?.candidates?.[0]?.content?.parts?.[0]?.text;
            }
            if (!text) text = localGenerateInstagram({ input });
            if (outputDiv) outputDiv.textContent = text;
        } catch (error) {
            console.error('Erro ao gerar post do Instagram:', error);
            if ($('instagram-output')) {
                $('instagram-output').textContent = 'Ocorreu um erro ao conectar com o serviço. Tente novamente mais tarde.';
                $('instagram-output').classList.remove('hidden');
            }
        } finally { 
            if (loadingIndicator) {
                loadingIndicator.style.display = 'none'; 
                loadingIndicator.classList.add('hidden');
            }
        }
    });

    // Mensagem do Dia
    const gerarMensagemBtn = $('gerar-mensagem-btn');
    if (gerarMensagemBtn) gerarMensagemBtn.addEventListener('click', async function () {
        const outputDiv = $('mensagem-output');
        const loadingIndicator = $('loading-indicator-mensagem');
        if (outputDiv) {
            outputDiv.textContent = '';
            outputDiv.classList.remove('hidden');
        }
        if (loadingIndicator) {
            loadingIndicator.style.display = 'flex';
            loadingIndicator.classList.remove('hidden');
        }
        try {
            let text = null;
            if (API_URL_GENERATE_TEXT) {
                const prompt = `Gere uma mensagem inspiradora e motivacional para o grupo de motociclistas Sons of Peaky.

A mensagem deve:
1. Ser concisa (máximo 2-3 frases)
2. Ter tom fraternal e inspirador
3. Conectar com temas como: estradas, liberdade, irmandade, aventura, lealdade
4. Usar linguagem que ressoe com motociclistas
5. Incluir uma referência sutil ao espírito Peaky Blinders (determinação, união)
6. Terminar com alguma frase marcante ou call to action

Exemplos de temas: superação, união do grupo, aventuras nas estradas, companheirismo, determinação.
Crie algo original e impactante para motivar os irmãos do grupo.`;

                const payload = { contents: [{ parts: [{ text: prompt }] }] };
                console.log('Gerando mensagem do dia com API...');
                const response = await fetchWithExponentialBackoff(API_URL_GENERATE_TEXT, { 
                    method: 'POST', 
                    headers: { 'Content-Type': 'application/json' }, 
                    body: JSON.stringify(payload) 
                });
                console.log('Resposta da API para mensagem:', response);
                text = response?.candidates?.[0]?.content?.parts?.[0]?.text;
            }
            if (!text) text = localGenerateMessage();
            if (outputDiv) outputDiv.textContent = text;
        } catch (error) {
            console.error('Erro ao gerar mensagem do dia:', error);
            if ($('mensagem-output')) {
                $('mensagem-output').textContent = 'Ocorreu um erro ao conectar com o serviço. Tente novamente mais tarde.';
                $('mensagem-output').classList.remove('hidden');
            }
        } finally { 
            if (loadingIndicator) {
                loadingIndicator.style.display = 'none'; 
                loadingIndicator.classList.add('hidden');
            }
        }
    });

    // Lógica para a Assinatura - Versão Pública (removida do site)
    const assinarBtn = $('assinar-btn');
    if (assinarBtn) assinarBtn.addEventListener('click', function () {
        const assinaturaInput = $('assinatura');
        const nome = assinaturaInput?.value.trim();
        if (nome) {
            showModal(`Obrigado, ${nome}! Seu acordo foi registrado. Bem-vindo à família Sons of Peaky.`);
            if (assinaturaInput) assinaturaInput.value = '';
        } else {
            showModal('Por favor, digite seu nome completo para assinar.');
        }
    });

    // Lógica para a Assinatura da Alta Cúpula
    const assinarAcBtn = $('assinar-ac-btn');
    if (assinarAcBtn) assinarAcBtn.addEventListener('click', function () {
        const assinaturaAcInput = $('assinatura-ac');
        const nome = assinaturaAcInput?.value.trim();
        if (nome) {
            showModal(`${nome}, seu compromisso com a Alta Cúpula foi registrado. Que sua liderança seja sempre guiada pelos valores da irmandade Sons of Peaky.`);
            if (assinaturaAcInput) assinaturaAcInput.value = '';
        } else {
            showModal('Por favor, digite seu nome completo para assinar o compromisso da Alta Cúpula.');
        }
    });

    // Mobile nav toggle
    const navToggle = document.getElementById('nav-toggle');
    const mainNavMenu = document.getElementById('main-nav-menu');
    // overlay used to close menu when clicking outside
    let mobileOverlay = document.createElement('div');
    mobileOverlay.className = 'mobile-overlay';
    document.body.appendChild(mobileOverlay);

    function openMobileMenu() {
        mainNavMenu.classList.add('mobile-menu-open');
        mainNavMenu.classList.remove('hidden');
        mobileOverlay.classList.add('open');
        navToggle.setAttribute('aria-expanded', 'true');
    }
    function closeMobileMenu() {
        mainNavMenu.classList.remove('mobile-menu-open');
        mainNavMenu.classList.add('hidden');
        mobileOverlay.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
    }

    if (navToggle && mainNavMenu) {
        navToggle.addEventListener('click', () => {
            const expanded = navToggle.getAttribute('aria-expanded') === 'true';
            if (expanded) closeMobileMenu(); else openMobileMenu();
        });

        // close when clicking outside
        mobileOverlay.addEventListener('click', closeMobileMenu);

        // close on Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeMobileMenu();
        });

        // close when clicking a link
        mainNavMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', (e) => {
            // allow anchor to navigate, then close
            setTimeout(() => closeMobileMenu(), 150);
        }));
    }

});

// ===== FUNÇÕES AUXILIARES PARA GERADOR DE ROLÊ =====
function compartilharWhatsApp(destino, data, horaSaida, pontos) {
    const dataFormatada = new Date(data).toLocaleDateString('pt-BR', { 
        weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' 
    });
    
    let mensagem = `🏍️ *ROLÊ OFICIAL SOP* 🏍️\n\n`;
    mensagem += `📍 *Destino:* ${destino}\n`;
    mensagem += `📅 *Data:* ${dataFormatada}\n`;
    mensagem += `🕒 *Saída:* ${horaSaida}\n\n`;
    mensagem += `*Pontos de Encontro:*\n`;
    
    pontos.forEach(ponto => {
        mensagem += `• ${ponto.local} - ${ponto.hora}\n`;
    });
    
    mensagem += `\n"A estrada nos chama, irmãos!"\n`;
    mensagem += `_Por Ordem dos Peaky Blinders_ 🔥\n\n`;
    mensagem += `Confirme sua presença! 👊`;
    
    const url = `https://wa.me/?text=${encodeURIComponent(mensagem)}`;
    window.open(url, '_blank');
}

function copiarRoteiro() {
    const roteiro = document.querySelector('#role-avancado-output .prose')?.textContent;
    if (!roteiro) {
        alert('❌ Nenhum roteiro encontrado para copiar.');
        return;
    }
    
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(roteiro).then(() => {
            alert('✅ Roteiro copiado para a área de transferência!');
        }).catch(err => {
            console.error('Erro ao copiar:', err);
            fallbackCopy(roteiro);
        });
    } else {
        fallbackCopy(roteiro);
    }
}

function fallbackCopy(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        const successful = document.execCommand('copy');
        if (successful) {
            alert('✅ Roteiro copiado para a área de transferência!');
        } else {
            alert('❌ Erro ao copiar o roteiro.');
        }
    } catch (err) {
        console.error('Fallback copy failed:', err);
        alert('❌ Não foi possível copiar o roteiro.');
    } finally {
        document.body.removeChild(textArea);
    }
}

function salvarPDF(destino) {
    alert('🚧 Funcionalidade em desenvolvimento!\n\nEm breve você poderá exportar o roteiro em PDF para impressão ou envio offline.');
}

// ===== FUNÇÃO PARA SEÇÕES COLAPSÁVEIS =====
function toggleSection(contentId, iconId) {
    const content = document.getElementById(contentId);
    const icon = document.getElementById(iconId);
    
    if (!content || !icon) return;
    
    if (content.style.maxHeight && content.style.maxHeight !== '0px') {
        // Fechar seção
        content.style.maxHeight = '0px';
        icon.style.transform = 'rotate(0deg)';
    } else {
        // Abrir seção - calcular altura total real incluindo conteúdo dinâmico
        content.style.maxHeight = 'none';
        icon.style.transform = 'rotate(180deg)';
        
        // Força recálculo de altura para conteúdo dinâmico
        const recalculateHeight = () => {
            if (content.style.maxHeight === 'none') {
                // Usar altura mínima maior para acomodar conteúdo dinâmico
                const height = Math.max(content.scrollHeight, 2000); // Mínimo 2000px
                content.style.maxHeight = height + 'px';
            }
        };
        
        // Recalcular altura imediatamente e após possíveis mudanças
        setTimeout(recalculateHeight, 10);
        setTimeout(recalculateHeight, 500); // Para conteúdo que demora a carregar
        
        // Adicionar observer para mudanças de conteúdo
        if (!content.heightObserver) {
            const observer = new MutationObserver(() => {
                if (content.style.maxHeight !== '0px') {
                    const newHeight = Math.max(content.scrollHeight, 2000);
                    content.style.maxHeight = newHeight + 'px';
                }
            });
            
            observer.observe(content, {
                childList: true,
                subtree: true,
                attributes: true,
                characterData: true
            });
            
            content.heightObserver = observer;
        }
    }
}
