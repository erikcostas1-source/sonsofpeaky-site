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
    let lastScrollY = window.scrollY;
    
    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;
        
        if (header) {
            if (currentScrollY > 100) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }
        
        lastScrollY = currentScrollY;
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
    // Preferir URLs vindas de window.SOP_CONFIG (config.js). Caso não existam, usar API_KEY local (opcional) ou fallback local.
    const API_KEY = ""; // opcional; deixe vazio para usar as URLs definidas em config.js
    const API_URL_GENERATE_TEXT = (window.SOP_CONFIG && window.SOP_CONFIG.textUrl)
        ? window.SOP_CONFIG.textUrl
        : (API_KEY ? `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${API_KEY}` : null);
    const API_URL_GENERATE_IMAGE = (window.SOP_CONFIG && window.SOP_CONFIG.imageUrl)
        ? window.SOP_CONFIG.imageUrl
        : (API_KEY ? `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${API_KEY}` : null);

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
    function localGenerateRide({ input, km, date }) {
        const kmNum = Number(km);
        const dateObj = new Date(date);
        
        // Determinar tipo de rolê baseado na distância
        let categoria, tempoViagem, sugestaoHorario;
        if (kmNum <= 100) {
            categoria = "Rolê Urbano/Regional";
            tempoViagem = "1-2h";
            sugestaoHorario = "14h00";
        } else if (kmNum <= 300) {
            categoria = "Rolê Intermediário";
            tempoViagem = "2-4h";
            sugestaoHorario = "08h00";
        } else {
            categoria = "Rolê Longo";
            tempoViagem = "4-6h";
            sugestaoHorario = "06h00";
        }

        const pedagogioEstimado = Math.max(0, Math.round(kmNum * 0.08));
        const combustivelEstimado = Math.round(kmNum * 0.12);
        
        return `🏍️ ROTEIRO DE ROLÊ - SONS OF PEAKY

📍 DESTINO: ${input.toUpperCase()}
📅 DATA: ${dateObj.toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
📏 DISTÂNCIA: ${kmNum}km (ida e volta)
⏱️ CATEGORIA: ${categoria}

🕐 PROGRAMAÇÃO:
• Concentração: 30min antes da saída no Galpão
• Saída: ${sugestaoHorario}
• Tempo de viagem: ${tempoViagem} cada trecho
• Chegada prevista: Final da tarde

🛣️ ROTA SUGERIDA:
• Ponto de encontro: Galpão - Rua José Flavio, 420, Travessa 1A
• Parada obrigatória: Combustível + checagem (km 50)
• Parada para alimentação: Meio do trajeto
• Pontos fotográficos: Conforme oportunidade

💰 CUSTOS ESTIMADOS:
• Pedágio: R$ ${pedagogioEstimado},00
• Combustível: R$ ${combustivelEstimado},00
• Alimentação: R$ 25-40 (por pessoa)

🔧 CHECKLIST:
✓ Documentos (CNH, documento da moto)
✓ Capacete em perfeitas condições
✓ Equipamentos de proteção
✓ Celular com bateria/carregador
✓ Dinheiro para pedágio/emergência

⚠️ SEGURANÇA:
• Manter distância segura
• Comunicação por gestos/intercomunicador
• Ponto de reagrupamento a cada 100km
• Contato de emergência: Líder do grupo

📞 CONFIRMAÇÃO: Confirme sua presença aqui no site
💬 DÚVIDAS: WhatsApp do grupo

Que as estradas nos levem e nos tragam em segurança! 
🔥 By Order of the Sons of Peaky 🔥`;
    }

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
            list.innerHTML = `<span class="text-amber-400 font-bold">${attendees.length} confirmado(s):</span> <span class="text-gray-300">${attendees.map(n => `<span>${n}</span>`).join(', ')}</span>`;
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

    const AC_UNLOCK_KEY = 'sop_ac_unlocked';
    function showAcUnlocked() {
        const locked = document.getElementById('ac-locked');
        const content = document.getElementById('ac-content');
        if (locked && content) {
            locked.classList.add('hidden');
            content.classList.remove('hidden');
        }
    }
    // Persist unlock state per browser
    if (localStorage.getItem(AC_UNLOCK_KEY) === '1') showAcUnlocked();
    const acUnlockBtn = document.getElementById('ac-unlock-btn');
    if (acUnlockBtn) acUnlockBtn.addEventListener('click', () => {
        const pwd = (document.getElementById('ac-password')?.value || '').trim();
        const status = document.getElementById('ac-status');
        if (pwd.toLowerCase() === 'cangaiba') {
            localStorage.setItem(AC_UNLOCK_KEY, '1');
            if (status) status.classList.add('hidden');
            showAcUnlocked();
        } else {
            if (status) status.classList.remove('hidden');
        }
    });

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

    // Gerador de Rolê (usa API se disponível, caso contrário fallback local)
    const gerarRoleBtn = $('gerar-role-btn');
    if (gerarRoleBtn) gerarRoleBtn.addEventListener('click', async function () {
        const input = $('role-input')?.value.trim();
        const km = $('role-km-input')?.value.trim();
        const date = $('role-date-input')?.value.trim();
        const outputDiv = $('role-output');
        const loadingIndicator = $('loading-indicator-role');

        if (!input || !km || !date) {
            if (outputDiv) {
                outputDiv.textContent = 'Por favor, preencha todos os campos para gerar o rolê.';
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
            let generatedText = null;
            let imageUrl = '';

            if (API_URL_GENERATE_TEXT) {
                const promptText = `Atue como um especialista em roteiros de viagem de moto para o grupo Sons of Peaky. 

Crie um roteiro detalhado para um rolê de moto com as seguintes informações:
- Destino/Tipo: ${input}
- Distância total: ${km}km (ida e volta)
- Data: ${date}

O roteiro deve incluir:
1. Ponto de encontro: Galpão - Rua José Flavio, 420, Travessa 1A
2. Horário sugerido de saída e chegada
3. Rota sugerida com pontos de interesse
4. Paradas recomendadas (combustível, alimentação, descanso)
5. Estimativa de tempo de viagem
6. Dicas de segurança específicas para o trajeto
7. O que levar (equipamentos, documentos)
8. Contatos de emergência locais se aplicável

Escreva de forma clara e objetiva, mantendo o tom fraternal do grupo Sons of Peaky. Use linguagem motociclística apropriada.`;

                const payloadText = { contents: [{ parts: [{ text: promptText }] }] };
                const responseText = await fetchWithExponentialBackoff(API_URL_GENERATE_TEXT, {
                    method: 'POST', 
                    headers: { 'Content-Type': 'application/json' }, 
                    body: JSON.stringify(payloadText)
                });
                
                // Debug logging
                console.log('Gemini API Response:', responseText);
                
                if (responseText?.candidates?.[0]?.content?.parts?.[0]?.text) {
                    generatedText = responseText.candidates[0].content.parts[0].text;
                } else if (responseText?.error) {
                    console.error('Gemini API Error:', responseText.error);
                    throw new Error(`API Error: ${responseText.error.message || 'Unknown error'}`);
                } else {
                    console.warn('Resposta inesperada da API:', responseText);
                    throw new Error('Resposta inválida da API');
                }
            }

            if (!generatedText) {
                generatedText = localGenerateRide({ input, km: Number(km), date });
            }

            // Image generation only if API available
            if (API_URL_GENERATE_IMAGE) {
                const promptImage = `Criar um cartaz de convite para rolê de moto do grupo Sons of Peaky. Estilo vintage com motos clássicas, cores âmbar e preto. Incluir texto: "${input}" e "Sons of Peaky". Design profissional e atrativo.`;
                const payloadImage = {
                    instances: [{
                        prompt: promptImage
                    }],
                    parameters: {
                        sampleCount: 1,
                        aspectRatio: "16:9"
                    }
                };
                try {
                    console.log('Tentando gerar imagem com payload:', payloadImage);
                    const responseImage = await fetchWithExponentialBackoff(API_URL_GENERATE_IMAGE, {
                        method: 'POST', 
                        headers: { 'Content-Type': 'application/json' }, 
                        body: JSON.stringify(payloadImage)
                    });
                    console.log('Resposta da API de imagem:', responseImage);
                    const base64Data = responseImage?.predictions?.[0]?.bytesBase64Encoded;
                    if (base64Data) {
                        imageUrl = `data:image/png;base64,${base64Data}`;
                    }
                } catch (e) {
                    console.warn('Imagem remota não gerada, usando fallback:', e);
                }
            }

            // Fallback image (placeholder) if none
            if (!imageUrl) imageUrl = 'https://placehold.co/600x300/111827/fb923c?text=Convite+Rol%C3%AA';

            if (outputDiv) outputDiv.innerHTML = `\n                    <div class="space-y-4">\n                        <h4 class="text-lg font-bold text-white">Detalhes do Rolê:</h4>\n                        <div class="p-4 rounded-md bg-gray-900 border border-gray-700 whitespace-pre-wrap">${generatedText}</div>\n                        <h4 class="text-lg font-bold text-white">Convite Gerado:</h4>\n                        <div class="flex justify-center">\n                            <img src="${imageUrl}" alt="Convite para o Rolê" class="rounded-lg shadow-md max-w-full h-auto">\n                        </div>\n                    </div>\n                `;

            // Adicionar o rolê à agenda
            const agendaContainer = document.querySelector('#agenda-container');
            if (agendaContainer) {
                const eventId = `role-${Date.now()}`;
                const newEventHTML = `
                        <div id="${eventId}" class="p-4 rounded-md bg-gray-900 border border-gray-700">
                            <h3 class="text-lg font-bold text-amber-500">${new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })} - ${input}</h3>
                            <p class="text-gray-400">Ponto de encontro: Galpão. Distância: ${km}km.</p>
                            <button class="mt-2 px-4 py-2 bg-amber-600 text-gray-900 font-bold rounded-full transition-transform duration-300 hover:scale-105 confirmar-btn">Confirmar Presença</button>
                        </div>
                    `;
                agendaContainer.insertAdjacentHTML('afterbegin', newEventHTML);
                addConfirmButtonListeners();
                renderAttendees(eventId);
            }

        } catch (error) {
            console.error('Erro ao gerar rolê:', error);
            console.log('Usando geração local como fallback...');
            
            // Fallback para geração local
            try {
                generatedText = localGenerateRide({ input, km: Number(km), date });
                
                if (outputDiv) {
                    outputDiv.innerHTML = `
                        <div class="space-y-4">
                            <h4 class="text-lg font-bold text-white">Roteiro Gerado (Offline):</h4>
                            <div class="p-4 rounded-md bg-gray-900 border border-gray-700 whitespace-pre-wrap">${generatedText}</div>
                        </div>
                    `;
                }
                
                // Adicionar à agenda mesmo com fallback
                const agendaContainer = document.querySelector('#agenda-container');
                if (agendaContainer) {
                    const eventId = `role-${Date.now()}`;
                    const newEventHTML = `
                            <div id="${eventId}" class="p-4 rounded-md bg-gray-900 border border-gray-700">
                                <h3 class="text-lg font-bold text-amber-500">${new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })} - ${input}</h3>
                                <p class="text-gray-400">Ponto de encontro: Galpão. Distância: ${km}km.</p>
                                <button class="mt-2 px-4 py-2 bg-amber-600 text-gray-900 font-bold rounded-full transition-transform duration-300 hover:scale-105 confirmar-btn">Confirmar Presença</button>
                            </div>
                        `;
                    agendaContainer.insertAdjacentHTML('afterbegin', newEventHTML);
                    addConfirmButtonListeners();
                    renderAttendees(eventId);
                }
                
            } catch (fallbackError) {
                console.error('Erro no fallback local:', fallbackError);
                if ($('role-output')) {
                    $('role-output').textContent = 'Ocorreu um erro ao gerar o roteiro. Tente novamente mais tarde.';
                    $('role-output').classList.remove('hidden');
                }
            }
        } finally {
            if ($('loading-indicator-role')) {
                $('loading-indicator-role').style.display = 'none';
                $('loading-indicator-role').classList.add('hidden');
            }
        }
    });

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
