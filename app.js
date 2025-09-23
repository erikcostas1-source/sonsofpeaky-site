document.addEventListener('DOMContentLoaded', function () {
    // Configuração para chamadas Gemini API (opcional). Se deixar vazio, usaremos fallbacks locais.
    const API_KEY = ""; // <-- Coloque sua chave aqui se quiser usar a API remota
    const API_URL_GENERATE_TEXT = API_KEY ? `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${API_KEY}` : null;
    const API_URL_GENERATE_IMAGE = API_KEY ? `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${API_KEY}` : null;

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

    async function fetchWithExponentialBackoff(url, options, retries = 5, delay = 1000) {
        try {
            const response = await fetch(url, options);
            if (response.status === 429 && retries > 0) {
                await new Promise(resolve => setTimeout(resolve, delay));
                return fetchWithExponentialBackoff(url, options, retries - 1, delay * 2);
            }
            if (!response.ok) throw new Error(`API call failed with status: ${response.status}`);
            return await response.json();
        } catch (error) {
            if (retries > 0) {
                await new Promise(resolve => setTimeout(resolve, delay));
                return fetchWithExponentialBackoff(url, options, retries - 1, delay * 2);
            }
            throw error;
        }
    }

    // Local fallback generators (simple, deterministic) to make the site usable offline
    function localGenerateRide({ input, km, date }) {
        const destinations = ['Paraty', 'Ilhabela', 'Serra da Mantiqueira', 'Campos do Jordão', 'Serra do Rio do Rastro'];
        const destination = destinations[Math.min(destinations.length - 1, Math.floor(km / 80))] || 'Cidade Próxima';
        return `Destino: ${destination}\nRoteiro: Saída do galpão, paradas estratégicas para fotos, almoço típico e retorno ao entardecer.\nTempo estimado: ${Math.max(1, Math.round((km / 80) * 1.2))}h (ida) + permanência + ${Math.max(1, Math.round((km / 80) * 1.2))}h (volta)\nPedágio estimado: R$ ${Math.max(0, Math.round(km * 0.05)).toFixed(2)}\nConvite: "Rolê dia ${new Date(date).toLocaleDateString('pt-BR')} — junte-se aos irmãos do Sons of Peaky!"`;
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
                button.addEventListener('click', () => showModal('Sua presença foi confirmada! Te vejo na estrada.'));
                button.dataset.bound = '1';
            }
        });
    }
    addConfirmButtonListeners();

    // Gerador de Rolê (usa API se disponível, caso contrário fallback local)
    const gerarRoleBtn = $('gerar-role-btn');
    if (gerarRoleBtn) gerarRoleBtn.addEventListener('click', async function () {
        const input = $('role-input')?.value.trim();
        const km = $('role-km-input')?.value.trim();
        const date = $('role-date-input')?.value.trim();
        const outputDiv = $('role-output');
        const loadingIndicator = $('loading-indicator-role');

        if (!input || !km || !date) {
            if (outputDiv) outputDiv.textContent = 'Por favor, preencha todos os campos para gerar o rolê.';
            return;
        }
        if (outputDiv) outputDiv.innerHTML = '';
        if (loadingIndicator) loadingIndicator.style.display = 'flex';

        try {
            let generatedText = null;
            let imageUrl = '';

            if (API_KEY && API_URL_GENERATE_TEXT) {
                const promptText = `Atue como um especialista em roteiros de viagem de moto para o grupo Sons of Peaky...`;
                const payloadText = { contents: [{ parts: [{ text: promptText }] }] };
                const responseText = await fetchWithExponentialBackoff(API_URL_GENERATE_TEXT, {
                    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payloadText)
                });
                generatedText = responseText?.candidates?.[0]?.content?.parts?.[0]?.text;
            }

            if (!generatedText) {
                generatedText = localGenerateRide({ input, km: Number(km), date });
            }

            // Image generation only if API_KEY provided
            if (API_KEY && API_URL_GENERATE_IMAGE) {
                const promptImage = `Cartaz de convite para rolê de moto Sons of Peaky`;
                const payloadImage = { instances: { prompt: promptImage }, parameters: { sampleCount: 1 } };
                try {
                    const responseImage = await fetchWithExponentialBackoff(API_URL_GENERATE_IMAGE, {
                        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payloadImage)
                    });
                    const base64Data = responseImage?.predictions?.[0]?.bytesBase64Encoded;
                    if (base64Data) imageUrl = `data:image/png;base64,${base64Data}`;
                } catch (e) {
                    console.warn('Imagem remota não gerada, usando fallback.');
                }
            }

            // Fallback image (placeholder) if none
            if (!imageUrl) imageUrl = 'https://placehold.co/600x300/111827/fb923c?text=Convite+Rol%C3%AA';

            if (outputDiv) outputDiv.innerHTML = `\n                    <div class="space-y-4">\n                        <h4 class="text-lg font-bold text-white">Detalhes do Rolê:</h4>\n                        <div class="p-4 rounded-md bg-gray-900 border border-gray-700 whitespace-pre-wrap">${generatedText}</div>\n                        <h4 class="text-lg font-bold text-white">Convite Gerado:</h4>\n                        <div class="flex justify-center">\n                            <img src="${imageUrl}" alt="Convite para o Rolê" class="rounded-lg shadow-md max-w-full h-auto">\n                        </div>\n                    </div>\n                `;

            // Adicionar o rolê à agenda
            const agendaContainer = document.querySelector('#agenda-container .space-y-4');
            if (agendaContainer) {
                const newEventHTML = `\n                        <div class="p-4 rounded-md bg-gray-900 border border-gray-700">\n                            <h3 class="text-lg font-bold text-amber-500">${new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })} - ${input}</h3>\n                            <p class="text-gray-400">Ponto de encontro: Galpão. Distância: ${km}km.</p>\n                            <button class="mt-2 px-4 py-2 bg-amber-600 text-gray-900 font-bold rounded-full transition-transform duration-300 hover:scale-105 confirmar-btn">Confirmar Presença</button>\n                        </div>\n                    `;
                agendaContainer.insertAdjacentHTML('afterbegin', newEventHTML);
                addConfirmButtonListeners();
            }

        } catch (error) {
            console.error('Erro ao gerar rolê:', error);
            if ($('role-output')) $('role-output').textContent = 'Ocorreu um erro ao conectar com o serviço. Tente novamente mais tarde.';
        } finally {
            if ($('loading-indicator-role')) $('loading-indicator-role').style.display = 'none';
        }
    });

    // Gerador de Ideias de Eventos
    const gerarEventoBtn = $('gerar-evento-btn');
    if (gerarEventoBtn) gerarEventoBtn.addEventListener('click', async function () {
        const input = $('evento-input')?.value.trim();
        const outputDiv = $('evento-output');
        const loadingIndicator = $('loading-indicator-evento');
        if (!input) { if (outputDiv) outputDiv.textContent = 'Por favor, descreva o tipo de evento que você quer planejar.'; return; }
        if (outputDiv) outputDiv.textContent = '';
        if (loadingIndicator) loadingIndicator.style.display = 'flex';
        try {
            let text = null;
            if (API_KEY && API_URL_GENERATE_TEXT) {
                const prompt = `Atue como um planejador de eventos...`;
                const payload = { contents: [{ parts: [{ text: prompt }] }] };
                const response = await fetchWithExponentialBackoff(API_URL_GENERATE_TEXT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
                text = response?.candidates?.[0]?.content?.parts?.[0]?.text;
            }
            if (!text) text = localGenerateEvent({ input });
            if (outputDiv) outputDiv.textContent = text;
        } catch (error) {
            console.error('Erro ao gerar ideias de evento:', error);
            if ($('evento-output')) $('evento-output').textContent = 'Ocorreu um erro ao conectar com o serviço. Tente novamente mais tarde.';
        } finally { if (loadingIndicator) loadingIndicator.style.display = 'none'; }
    });

    // Gerador de Posts do Instagram
    const gerarInstagramBtn = $('gerar-instagram-btn');
    if (gerarInstagramBtn) gerarInstagramBtn.addEventListener('click', async function () {
        const input = $('instagram-input')?.value.trim();
        const outputDiv = $('instagram-output');
        const loadingIndicator = $('loading-indicator-instagram');
        if (!input) { if (outputDiv) outputDiv.textContent = 'Por favor, descreva o conteúdo do post para gerar a legenda e hashtags.'; return; }
        if (outputDiv) outputDiv.textContent = '';
        if (loadingIndicator) loadingIndicator.style.display = 'flex';
        try {
            let text = null;
            if (API_KEY && API_URL_GENERATE_TEXT) {
                const prompt = `Atue como um especialista em marketing digital...`;
                const payload = { contents: [{ parts: [{ text: prompt }] }] };
                const response = await fetchWithExponentialBackoff(API_URL_GENERATE_TEXT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
                text = response?.candidates?.[0]?.content?.parts?.[0]?.text;
            }
            if (!text) text = localGenerateInstagram({ input });
            if (outputDiv) outputDiv.textContent = text;
        } catch (error) {
            console.error('Erro ao gerar post do Instagram:', error);
            if ($('instagram-output')) $('instagram-output').textContent = 'Ocorreu um erro ao conectar com o serviço. Tente novamente mais tarde.';
        } finally { if (loadingIndicator) loadingIndicator.style.display = 'none'; }
    });

    // Mensagem do Dia
    const gerarMensagemBtn = $('gerar-mensagem-btn');
    if (gerarMensagemBtn) gerarMensagemBtn.addEventListener('click', async function () {
        const outputDiv = $('mensagem-output');
        const loadingIndicator = $('loading-indicator-mensagem');
        if (outputDiv) outputDiv.textContent = '';
        if (loadingIndicator) loadingIndicator.style.display = 'flex';
        try {
            let text = null;
            if (API_KEY && API_URL_GENERATE_TEXT) {
                const prompt = `Gere uma mensagem curta e inspiradora...`;
                const payload = { contents: [{ parts: [{ text: prompt }] }] };
                const response = await fetchWithExponentialBackoff(API_URL_GENERATE_TEXT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
                text = response?.candidates?.[0]?.content?.parts?.[0]?.text;
            }
            if (!text) text = localGenerateMessage();
            if (outputDiv) outputDiv.textContent = text;
        } catch (error) {
            console.error('Erro ao gerar mensagem do dia:', error);
            if ($('mensagem-output')) $('mensagem-output').textContent = 'Ocorreu um erro ao conectar com o serviço. Tente novamente mais tarde.';
        } finally { if (loadingIndicator) loadingIndicator.style.display = 'none'; }
    });

    // Lógica para a Assinatura (substituído 'alert' por 'showModal')
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
