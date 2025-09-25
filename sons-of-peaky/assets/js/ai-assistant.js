/**
 * SONS OF PEAKY - AI ASSISTANT MODULE
 * Módulo revolucionário de assistente IA com integração Gemini API
 * Funcionalidades: Chat contextual, geração de rolês, recomendações personalizadas
 */

class SOPAIAssistant {
    constructor() {
        this.apiKey = window.SOP_CONFIG?.textUrl || this.getApiFromConfig();
        this.chatContainer = null;
        this.messagesContainer = null;
        this.inputField = null;
        this.isOpen = false;
        this.conversationHistory = [];
        this.userContext = this.loadUserContext();
        
        this.init();
    }
    
    getApiFromConfig() {
        // Usar a nova API atualizada
        return window.SOP_CONFIG?.textUrl || 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=AIzaSyCiHRVozYYmHB-5W64QdJzn9dQYAyRl9Tk';
    }
    
    init() {
        this.setupEventListeners();
        this.loadConversationHistory();
        this.setupKeyboardShortcuts();
    }
    
    setupEventListeners() {
        // Botões para abrir chat
        document.querySelectorAll('#ai-chat-toggle, #hero-ai-btn, .ai-link').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleChat();
            });
        });
        
        // Fechar chat
        document.addEventListener('click', (e) => {
            if (e.target.id === 'ai-chat-close') {
                this.closeChat();
            }
        });
        
        // Input e envio
        document.addEventListener('keypress', (e) => {
            if (e.target.id === 'ai-chat-input' && e.key === 'Enter') {
                e.preventDefault();
                this.sendMessage();
            }
        });
        
        document.addEventListener('click', (e) => {
            if (e.target.id === 'ai-chat-send') {
                this.sendMessage();
            }
        });
        
        // Quick actions
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('quick-action')) {
                const message = e.target.dataset.message;
                this.sendMessage(message);
            }
        });
    }
    
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Alt + A para abrir/fechar chat
            if (e.altKey && e.key === 'a') {
                e.preventDefault();
                this.toggleChat();
            }
            
            // Escape para fechar chat
            if (e.key === 'Escape' && this.isOpen) {
                this.closeChat();
            }
        });
    }
    
    toggleChat() {
        this.chatContainer = document.getElementById('ai-chat-container');
        if (!this.chatContainer) return;
        
        if (this.isOpen) {
            this.closeChat();
        } else {
            this.openChat();
        }
    }
    
    openChat() {
        this.chatContainer = document.getElementById('ai-chat-container');
        this.messagesContainer = document.getElementById('ai-chat-messages');
        this.inputField = document.getElementById('ai-chat-input');
        
        if (this.chatContainer) {
            this.chatContainer.classList.remove('hidden');
            this.chatContainer.classList.add('show');
            this.isOpen = true;
            
            // Focus no input após animação
            setTimeout(() => {
                if (this.inputField) {
                    this.inputField.focus();
                }
            }, 250);
            
            // Analytics
            this.trackEvent('ai_chat_opened');
        }
    }
    
    closeChat() {
        if (this.chatContainer) {
            this.chatContainer.classList.remove('show');
            setTimeout(() => {
                this.chatContainer.classList.add('hidden');
            }, 250);
            this.isOpen = false;
            
            // Analytics
            this.trackEvent('ai_chat_closed');
        }
    }
    
    async sendMessage(customMessage = null) {
        const message = customMessage || this.inputField?.value.trim();
        if (!message) return;
        
        // Limpar input
        if (this.inputField && !customMessage) {
            this.inputField.value = '';
        }
        
        // Adicionar mensagem do usuário
        this.addMessage(message, 'user');
        
        // Mostrar loading
        const loadingId = this.addLoadingMessage();
        
        try {
            // Preparar contexto da conversa
            const context = this.buildContext(message);
            
            // Fazer chamada para API
            const response = await this.callGeminiAPI(context);
            
            // Remover loading e adicionar resposta
            this.removeMessage(loadingId);
            this.addMessage(response, 'ai');
            
            // Salvar conversa
            this.saveConversation();
            
            // Analytics
            this.trackEvent('ai_message_sent', { message_length: message.length });
            
        } catch (error) {
            console.error('Erro no AI Assistant:', error);
            this.removeMessage(loadingId);
            this.addMessage('Desculpe, ocorreu um erro. Tente novamente em alguns segundos. 😔', 'ai');
            
            // Analytics
            this.trackEvent('ai_error', { error: error.message });
        }
    }
    
    buildContext(userMessage) {
        const sopContext = `Você é o assistente oficial do Sons of Peaky, um clube de motociclistas brasileiro fundado em 2021.

INFORMAÇÕES ESSENCIAIS SOBRE O SOP:
- Fundado em 25 de maio de 2021 por Erik e Ricardo (Brutos)
- Localização: Galpão na Rua José Flavio, 420, Travessa 1A, Penha, São Paulo, SP
- 9 membros da Alta Cúpula, 100+ comunidade ativa
- Valores: Confiança, franqueza, intimidade, lealdade
- Reuniões semanais: todas as quintas-feiras às 19:30
- Contribuições: Frequentadores (gratuito), Membros (R$ 100/mês), Alta Cúpula (R$ 250/mês)

TIPOS DE AJUDA QUE VOCÊ OFERECE:
1. História e valores do clube
2. Como se tornar membro (processo, requisitos, valores)
3. Geração de rolês personalizados de moto
4. Informações sobre eventos e agenda
5. Esclarecimentos sobre estatutos
6. Dicas sobre motociclismo e viagens
7. Informações sobre o galpão e suas facilidades

ESTILO DE COMUNICAÇÃO:
- Informal e amigável, use gírias de motociclistas
- Sempre mencione "irmandade" e "família"
- Use emojis relacionados a motos 🏍️ e fogo 🔥
- Seja acolhedor mas ressalte os valores do clube
- Sempre termine com "By Order of the Sons of Peaky 🔥"

HISTÓRICO DA CONVERSA:
${this.conversationHistory.slice(-10).map(msg => `${msg.sender}: ${msg.content}`).join('\n')}

MENSAGEM ATUAL DO USUÁRIO: ${userMessage}

Responda de forma útil, contextual e representando perfeitamente o espírito SOP.`;

        return sopContext;
    }
    
    async callGeminiAPI(context) {
        const payload = {
            contents: [{
                parts: [{
                    text: context
                }]
            }],
            generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 1024,
            }
        };
        
        // Usar a URL da API configurada ou fallback para nova versão
        let apiUrl = window.SOP_CONFIG?.textUrl || this.apiKey;
        if (!apiUrl.includes('http')) {
            apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${this.apiKey}`;
        }
        
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        
        if (!response.ok) {
            throw new Error(`API Error: ${response.status} - ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
            throw new Error('Resposta inválida da API');
        }
        
        return data.candidates[0].content.parts[0].text;
    }
    
    addMessage(content, sender) {
        if (!this.messagesContainer) return null;
        
        const messageId = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const messageElement = document.createElement('div');
        messageElement.id = messageId;
        messageElement.className = sender === 'user' ? 'user-message' : 'ai-message';
        
        if (sender === 'user') {
            messageElement.innerHTML = `
                <div class="message-content">
                    <p>${this.escapeHtml(content)}</p>
                </div>
            `;
        } else {
            messageElement.innerHTML = `
                <div class="ai-avatar">🤖</div>
                <div class="message-content">
                    ${this.formatAIResponse(content)}
                </div>
            `;
        }
        
        this.messagesContainer.appendChild(messageElement);
        this.scrollToBottom();
        
        // Salvar na história
        this.conversationHistory.push({
            id: messageId,
            sender,
            content,
            timestamp: new Date().toISOString()
        });
        
        return messageId;
    }
    
    addLoadingMessage() {
        if (!this.messagesContainer) return null;
        
        const loadingId = `loading-${Date.now()}`;
        const loadingElement = document.createElement('div');
        loadingElement.id = loadingId;
        loadingElement.className = 'ai-message';
        loadingElement.innerHTML = `
            <div class="ai-avatar">🤖</div>
            <div class="message-content">
                <div class="loading-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;
        
        this.messagesContainer.appendChild(loadingElement);
        this.scrollToBottom();
        
        return loadingId;
    }
    
    removeMessage(messageId) {
        const element = document.getElementById(messageId);
        if (element) {
            element.remove();
        }
    }
    
    formatAIResponse(content) {
        // Converter markdown simples para HTML
        let formatted = content
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n\n/g, '</p><p>')
            .replace(/\n/g, '<br>');
        
        // Adicionar parágrafos
        if (!formatted.startsWith('<p>')) {
            formatted = '<p>' + formatted + '</p>';
        }
        
        // Detectar listas
        formatted = formatted.replace(/• (.*?)(<br>|<\/p>)/g, '<li>$1</li>$2');
        if (formatted.includes('<li>')) {
            formatted = formatted.replace(/(<li>.*<\/li>)/g, '<ul>$1</ul>');
        }
        
        return formatted;
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    scrollToBottom() {
        if (this.messagesContainer) {
            this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
        }
    }
    
    saveConversation() {
        try {
            localStorage.setItem('sop_ai_conversation', JSON.stringify(this.conversationHistory));
        } catch (error) {
            console.warn('Não foi possível salvar a conversa:', error);
        }
    }
    
    loadConversationHistory() {
        try {
            const saved = localStorage.getItem('sop_ai_conversation');
            if (saved) {
                this.conversationHistory = JSON.parse(saved);
                // Limitar a 50 mensagens mais recentes
                if (this.conversationHistory.length > 50) {
                    this.conversationHistory = this.conversationHistory.slice(-50);
                }
            }
        } catch (error) {
            console.warn('Não foi possível carregar histórico:', error);
            this.conversationHistory = [];
        }
    }
    
    loadUserContext() {
        try {
            return JSON.parse(localStorage.getItem('sop_user_context') || '{}');
        } catch {
            return {};
        }
    }
    
    updateUserContext(key, value) {
        this.userContext[key] = value;
        try {
            localStorage.setItem('sop_user_context', JSON.stringify(this.userContext));
        } catch (error) {
            console.warn('Não foi possível salvar contexto:', error);
        }
    }
    
    trackEvent(eventName, eventData = {}) {
        // Analytics simples
        try {
            const event = {
                name: eventName,
                data: eventData,
                timestamp: new Date().toISOString(),
                url: window.location.href
            };
            
            console.log('AI Assistant Event:', event);
            
            // Salvar em localStorage para análise posterior
            const events = JSON.parse(localStorage.getItem('sop_ai_events') || '[]');
            events.push(event);
            
            // Manter apenas os últimos 100 eventos
            if (events.length > 100) {
                events.splice(0, events.length - 100);
            }
            
            localStorage.setItem('sop_ai_events', JSON.stringify(events));
        } catch (error) {
            console.warn('Erro ao rastrear evento:', error);
        }
    }
    
    // Método público para outros módulos interagirem
    sendCustomMessage(message, context = {}) {
        if (context.autoOpen && !this.isOpen) {
            this.openChat();
        }
        
        setTimeout(() => {
            this.sendMessage(message);
        }, context.autoOpen ? 300 : 0);
    }
    
    // Método para limpar conversa
    clearConversation() {
        this.conversationHistory = [];
        this.saveConversation();
        
        if (this.messagesContainer) {
            // Manter apenas a mensagem de boas-vindas
            const welcomeMessage = this.messagesContainer.querySelector('.ai-message');
            this.messagesContainer.innerHTML = '';
            if (welcomeMessage) {
                this.messagesContainer.appendChild(welcomeMessage);
            }
        }
        
        this.trackEvent('conversation_cleared');
    }
}

// Funcionalidades específicas do SOP integradas ao AI Assistant
class SOPAIFeatures extends SOPAIAssistant {
    constructor() {
        super();
        this.setupSpecialCommands();
    }
    
    setupSpecialCommands() {
        // Interceptar mensagens para comandos especiais
        const originalSendMessage = this.sendMessage.bind(this);
        
        this.sendMessage = async function(customMessage = null) {
            const message = customMessage || this.inputField?.value.trim();
            
            // Comandos especiais
            if (message.toLowerCase().includes('/gerar role') || message.toLowerCase().includes('gerar rolê')) {
                this.handleRoleGeneration(message);
                return;
            }
            
            if (message.toLowerCase().includes('/proximos eventos')) {
                this.handleEventsList();
                return;
            }
            
            if (message.toLowerCase().includes('/estatutos')) {
                this.handleStatuteInfo();
                return;
            }
            
            // Chamada normal da API
            return originalSendMessage(customMessage);
        };
    }
    
    async handleRoleGeneration(message) {
        // Limpar input
        if (this.inputField) {
            this.inputField.value = '';
        }
        
        // Adicionar mensagem do usuário
        this.addMessage(message, 'user');
        
        // Mostrar loading
        const loadingId = this.addLoadingMessage();
        
        try {
            // Criar prompt específico para geração de rolê
            const rolePrompt = `Usuário solicitou: "${message}"
            
Como assistente do Sons of Peaky, gere 3 sugestões ÉPICAS de rolês de moto personalizadas:

FORMATO DA RESPOSTA:
🏍️ **ROLÊ 1: [Nome do Destino]**
📍 **Local:** [Endereço completo]
📏 **Distância:** [km] (ida e volta)
⏱️ **Tempo:** [estimativa]
💰 **Custo estimado:** R$ [valor total]
🎯 **Experiência:** [descrição da experiência]
🛣️ **Rota sugerida:** [pontos principais]
💡 **Dica especial:** [algo único do local]

[Repetir para mais 2 rolês]

🔥 **Qual rolê vai escolher, irmão?** 🔥

By Order of the Sons of Peaky 🏍️`;

            const response = await this.callGeminiAPI(rolePrompt);
            
            // Remover loading e adicionar resposta
            this.removeMessage(loadingId);
            this.addMessage(response, 'ai');
            
            // Adicionar botões de ação
            this.addRoleActionButtons();
            
            this.trackEvent('role_generated');
            
        } catch (error) {
            console.error('Erro ao gerar rolê:', error);
            this.removeMessage(loadingId);
            this.addMessage('Ops, não consegui gerar rolês agora. Tente novamente! 😅', 'ai');
        }
    }
    
    handleEventsList() {
        // Integração com agenda existente
        const proximaReuniao = this.getNextThursday();
        
        const eventsList = `📅 **PRÓXIMOS EVENTOS - SONS OF PEAKY**

🔥 **REUNIÃO SEMANAL**
📅 Data: ${proximaReuniao}
🕐 Horário: 19:30
📍 Local: Galpão - Rua José Flavio, 420, Travessa 1A
👥 Aberto para: Todos os membros e frequentadores

🏍️ **PRÓXIMOS ROLÊS**
Em breve anunciaremos os rolês do mês! Fique ligado no grupo.

💬 Quer confirmar presença? Use o comando "confirmar presença" ou acesse a seção Agenda do site.

By Order of the Sons of Peaky 🔥`;

        this.addMessage('Quero saber sobre os próximos eventos', 'user');
        this.addMessage(eventsList, 'ai');
        
        this.trackEvent('events_listed');
    }
    
    handleStatuteInfo() {
        const statuteInfo = `📋 **ESTATUTOS - SONS OF PEAKY**

👥 **NÍVEIS DE PARTICIPAÇÃO:**

🤝 **FREQUENTADORES** (Gratuito)
• Acesso ao galpão para convivência
• Consumo pago via Pix
• Respeito às regras obrigatório

🏍️ **MEMBROS** (R$ 100/mês)
• Tudo do Frequentador +
• Voz ativa nas decisões
• Direito de propor novos membros
• Acesso prioritário aos eventos

👑 **ALTA CÚPULA** (R$ 250/mês)
• Tudo do Membro +
• Liderança e decisões finais
• Acesso total ao galpão
• Responsabilidades de zeladoria

🔑 **COMO VIRAR MEMBRO:**
Apenas por convite de um Membro da Alta Cúpula, após demonstrar alinhamento com nossos valores através de suas atitudes.

💪 **NOSSOS VALORES:**
Confiança • Franqueza • Intimidade • Lealdade

Quer conhecer mais? Venha no galpão e sinta a energia da irmandade!

By Order of the Sons of Peaky 🔥`;

        this.addMessage('Quero saber sobre os estatutos', 'user');
        this.addMessage(statuteInfo, 'ai');
        
        this.trackEvent('statutes_requested');
    }
    
    addRoleActionButtons() {
        if (!this.messagesContainer) return;
        
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'ai-message';
        actionsDiv.innerHTML = `
            <div class="ai-avatar">🤖</div>
            <div class="message-content">
                <div class="role-actions" style="display: flex; gap: 8px; margin-top: 12px; flex-wrap: wrap;">
                    <button onclick="window.sopAI.generateCustomRole()" class="quick-action" style="background: var(--accent-primary); color: white;">
                        🎯 Personalizar Rolê
                    </button>
                    <button onclick="window.sopAI.shareRole()" class="quick-action" style="background: var(--success); color: white;">
                        📱 Compartilhar no WhatsApp
                    </button>
                    <button onclick="window.sopAI.sendMessage('Como confirmo presença no rolê?')" class="quick-action">
                        ✅ Como Confirmar
                    </button>
                </div>
            </div>
        `;
        
        this.messagesContainer.appendChild(actionsDiv);
        this.scrollToBottom();
    }
    
    generateCustomRole() {
        const customPrompt = `Agora quero um rolê SUPER personalizado! Me fale:
        
1. Que tipo de experiência você quer? (aventura, gastronomia, natureza, história, etc.)
2. Quantos km quer percorrer? (até 100km, 100-300km, 300km+)
3. Orçamento aproximado? (econômico, moderado, premium)
4. Prefere ir sozinho ou em grupo?
5. Algum lugar específico que tem curiosidade?

Responda essas perguntas e criarei o rolê DOS SONHOS para você! 🏍️🔥`;

        this.sendMessage(customPrompt);
    }
    
    shareRole() {
        // Pegar última mensagem com rolê
        const lastAIMessage = [...this.messagesContainer.querySelectorAll('.ai-message')]
            .slice(-2, -1)[0]; // Penúltima mensagem (antes dos botões)
        
        if (lastAIMessage) {
            const roleContent = lastAIMessage.querySelector('.message-content').textContent;
            const whatsappText = encodeURIComponent(`🏍️ ROLÊ SONS OF PEAKY 🔥\n\n${roleContent}\n\nBora, irmãos?`);
            window.open(`https://wa.me/?text=${whatsappText}`, '_blank');
            
            this.trackEvent('role_shared');
        }
    }
    
    getNextThursday() {
        const now = new Date();
        const day = now.getDay(); // 0=Dom, 4=Qui
        const diffToThursday = (4 - day + 7) % 7 || 7;
        const nextThu = new Date(now);
        nextThu.setDate(now.getDate() + diffToThursday);
        
        return nextThu.toLocaleDateString('pt-BR', { 
            day: '2-digit', 
            month: 'long',
            year: 'numeric'
        });
    }
}

// Inicializar quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    // Aguardar elementos estarem disponíveis
    setTimeout(() => {
        window.sopAI = new SOPAIFeatures();
        console.log('🤖 SOP AI Assistant inicializado com sucesso!');
        
        // Adicionar CSS adicional para elementos específicos
        const additionalCSS = `
            <style>
                .loading-dots {
                    display: flex;
                    gap: 4px;
                    align-items: center;
                    padding: 8px 0;
                }
                
                .loading-dots span {
                    width: 8px;
                    height: 8px;
                    background: var(--accent-primary);
                    border-radius: 50%;
                    animation: pulse 1.4s ease-in-out infinite both;
                }
                
                .loading-dots span:nth-child(1) { animation-delay: -0.32s; }
                .loading-dots span:nth-child(2) { animation-delay: -0.16s; }
                .loading-dots span:nth-child(3) { animation-delay: 0s; }
                
                .role-actions button:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 4px 8px rgba(0,0,0,0.2);
                }
                
                @media (max-width: 640px) {
                    .role-actions {
                        flex-direction: column;
                    }
                    
                    .role-actions button {
                        width: 100%;
                        justify-content: center;
                    }
                }
            </style>
        `;
        
        document.head.insertAdjacentHTML('beforeend', additionalCSS);
        
    }, 500);
});

// Exportar para uso global
window.SOPAIAssistant = SOPAIFeatures;