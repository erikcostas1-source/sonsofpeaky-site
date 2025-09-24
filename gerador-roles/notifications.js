/**
 * Sistema de Notificações Completo
 * Gerador de Rolês - Push notifications, email templates, in-app alerts
 */

class NotificationManager {
    constructor() {
        this.notifications = [];
        this.preferences = {};
        this.pushRegistration = null;
        this.emailTemplates = {};
        this.notificationQueue = [];
        this.isOnline = navigator.onLine;
        
        this.init();
    }

    async init() {
        await this.loadPreferences();
        await this.initializePushNotifications();
        this.setupEventListeners();
        this.loadEmailTemplates();
        this.startNotificationProcessor();
        this.setupOfflineSync();
    }

    async loadPreferences() {
        try {
            this.preferences = await db.getUserNotificationPreferences() || {
                email: {
                    savedRoutes: true,
                    newDestinations: true,
                    planUpdates: true,
                    newsletter: false,
                    weeklyDigest: true
                },
                push: {
                    generationComplete: true,
                    limitReached: true,
                    personalizedSuggestions: false,
                    promotions: false
                },
                inApp: {
                    tips: true,
                    updates: true,
                    promotions: true
                },
                schedule: {
                    doNotDisturbStart: '22:00',
                    doNotDisturbEnd: '08:00',
                    timezone: 'America/Sao_Paulo'
                }
            };
        } catch (error) {
            console.error('Erro ao carregar preferências de notificação:', error);
            this.preferences = this.getDefaultPreferences();
        }
    }

    getDefaultPreferences() {
        return {
            email: {
                savedRoutes: true,
                newDestinations: true,
                planUpdates: true,
                newsletter: false,
                weeklyDigest: true
            },
            push: {
                generationComplete: true,
                limitReached: true,
                personalizedSuggestions: false,
                promotions: false
            },
            inApp: {
                tips: true,
                updates: true,
                promotions: true
            },
            schedule: {
                doNotDisturbStart: '22:00',
                doNotDisturbEnd: '08:00',
                timezone: 'America/Sao_Paulo'
            }
        };
    }

    async initializePushNotifications() {
        if ('serviceWorker' in navigator && 'PushManager' in window) {
            try {
                // Register service worker
                const registration = await navigator.serviceWorker.register('/sw.js');
                console.log('Service Worker registrado:', registration);

                // Request notification permission
                const permission = await Notification.requestPermission();
                
                if (permission === 'granted') {
                    await this.subscribeToPush(registration);
                }
            } catch (error) {
                console.error('Erro ao inicializar push notifications:', error);
            }
        }
    }

    async subscribeToPush(registration) {
        try {
            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: this.urlBase64ToUint8Array(
                    'BOqDhJhTgHvBr6Hv4gBj8yM9G_2A8uF1vK9mN3oL8rX2yU7wT5rS4qP1o9nK6jD5hG3fA2uE9mL8rX2yU7wT5r'
                )
            });

            // Send subscription to server
            await this.sendSubscriptionToServer(subscription);
            this.pushRegistration = subscription;
            
            console.log('Push subscription ativa:', subscription);
        } catch (error) {
            console.error('Erro ao subscrever push notifications:', error);
        }
    }

    async sendSubscriptionToServer(subscription) {
        try {
            await fetch('/api/notifications/subscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${await auth.getToken()}`
                },
                body: JSON.stringify({
                    subscription: subscription,
                    userId: await auth.getCurrentUserId()
                })
            });
        } catch (error) {
            console.error('Erro ao enviar subscription para servidor:', error);
        }
    }

    setupEventListeners() {
        // Online/offline events
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.processPendingNotifications();
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
        });

        // Listen for messages from service worker
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.addEventListener('message', (event) => {
                this.handleServiceWorkerMessage(event.data);
            });
        }
    }

    loadEmailTemplates() {
        this.emailTemplates = {
            welcome: {
                subject: 'Bem-vindo ao Gerador de Rolês! 🏍️',
                html: this.getWelcomeEmailTemplate(),
                text: 'Bem-vindo ao Gerador de Rolês! Descubra roteiros incríveis para suas aventuras de moto.'
            },
            generationComplete: {
                subject: 'Seu roteiro está pronto! 🎯',
                html: this.getGenerationCompleteTemplate(),
                text: 'Seu roteiro de moto foi gerado com sucesso! Acesse a plataforma para visualizar.'
            },
            limitReached: {
                subject: 'Limite de gerações atingido 📊',
                html: this.getLimitReachedTemplate(),
                text: 'Você atingiu o limite mensal de gerações. Considere fazer upgrade do seu plano.'
            },
            weeklyDigest: {
                subject: 'Seu resumo semanal de aventuras 📈',
                html: this.getWeeklyDigestTemplate(),
                text: 'Confira seu resumo semanal de atividades no Gerador de Rolês.'
            },
            planUpgrade: {
                subject: 'Upgrade realizado com sucesso! 🚀',
                html: this.getPlanUpgradeTemplate(),
                text: 'Parabéns! Seu plano foi atualizado e você já pode aproveitar os novos recursos.'
            },
            newsletter: {
                subject: 'Novidades e dicas para motociclistas 🏍️',
                html: this.getNewsletterTemplate(),
                text: 'Confira as últimas novidades e dicas exclusivas para motociclistas.'
            }
        };
    }

    // Email notification methods
    async sendEmailNotification(type, recipientEmail, data = {}) {
        if (!this.preferences.email[type] && type !== 'welcome') {
            return; // User has disabled this type of email
        }

        const template = this.emailTemplates[type];
        if (!template) {
            console.error('Template de email não encontrado:', type);
            return;
        }

        const notification = {
            id: this.generateNotificationId(),
            type: 'email',
            subType: type,
            recipient: recipientEmail,
            subject: this.processTemplate(template.subject, data),
            html: this.processTemplate(template.html, data),
            text: this.processTemplate(template.text, data),
            timestamp: new Date().toISOString(),
            status: 'pending'
        };

        if (this.isOnline) {
            await this.sendEmail(notification);
        } else {
            this.queueNotification(notification);
        }
    }

    async sendEmail(notification) {
        try {
            const response = await fetch('/api/notifications/email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${await auth.getToken()}`
                },
                body: JSON.stringify(notification)
            });

            if (response.ok) {
                notification.status = 'sent';
                console.log('Email enviado:', notification.id);
            } else {
                throw new Error('Falha ao enviar email');
            }
        } catch (error) {
            console.error('Erro ao enviar email:', error);
            notification.status = 'failed';
            this.queueNotification(notification);
        }
    }

    // Push notification methods
    async sendPushNotification(type, title, body, data = {}) {
        if (!this.preferences.push[type]) {
            return; // User has disabled this type of push notification
        }

        if (!this.canSendNotification()) {
            return; // Do not disturb period
        }

        const notification = {
            id: this.generateNotificationId(),
            type: 'push',
            subType: type,
            title: title,
            body: body,
            data: data,
            timestamp: new Date().toISOString(),
            status: 'pending'
        };

        if (this.isOnline && this.pushRegistration) {
            await this.sendPush(notification);
        } else {
            this.queueNotification(notification);
        }
    }

    async sendPush(notification) {
        try {
            const response = await fetch('/api/notifications/push', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${await auth.getToken()}`
                },
                body: JSON.stringify({
                    ...notification,
                    subscription: this.pushRegistration
                })
            });

            if (response.ok) {
                notification.status = 'sent';
                console.log('Push notification enviada:', notification.id);
            } else {
                throw new Error('Falha ao enviar push notification');
            }
        } catch (error) {
            console.error('Erro ao enviar push notification:', error);
            notification.status = 'failed';
            
            // Fallback to local notification
            this.showLocalNotification(notification);
        }
    }

    showLocalNotification(notification) {
        if (Notification.permission === 'granted') {
            const localNotif = new Notification(notification.title, {
                body: notification.body,
                icon: '/assets/img/SOP_LOGO_PRINCIPAL.svg',
                badge: '/assets/img/sopwatermark.png',
                tag: notification.id,
                data: notification.data
            });

            localNotif.addEventListener('click', () => {
                this.handleNotificationClick(notification);
                localNotif.close();
            });
        }
    }

    // In-app notification methods
    showInAppNotification(type, title, message, actions = [], duration = 5000) {
        if (!this.preferences.inApp[type]) {
            return;
        }

        const notification = {
            id: this.generateNotificationId(),
            type: 'inApp',
            subType: type,
            title: title,
            message: message,
            actions: actions,
            duration: duration,
            timestamp: new Date().toISOString()
        };

        this.displayInAppNotification(notification);
        this.notifications.push(notification);
    }

    displayInAppNotification(notification) {
        const container = this.getOrCreateNotificationContainer();
        const notificationElement = this.createNotificationElement(notification);
        
        container.appendChild(notificationElement);
        
        // Auto-remove after duration
        if (notification.duration > 0) {
            setTimeout(() => {
                this.removeInAppNotification(notification.id);
            }, notification.duration);
        }
    }

    createNotificationElement(notification) {
        const element = document.createElement('div');
        element.className = 'in-app-notification fade-in';
        element.dataset.id = notification.id;
        
        const typeIcons = {
            info: '📢',
            success: '✅',
            warning: '⚠️',
            error: '❌',
            tip: '💡',
            promotion: '🎉'
        };
        
        const icon = typeIcons[notification.subType] || '📢';
        
        element.innerHTML = `
            <div class="notification-content">
                <div class="notification-icon">${icon}</div>
                <div class="notification-text">
                    <div class="notification-title">${notification.title}</div>
                    <div class="notification-message">${notification.message}</div>
                </div>
                <button class="notification-close" onclick="notificationManager.removeInAppNotification('${notification.id}')">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>
            ${notification.actions.length > 0 ? this.createActionButtons(notification.actions) : ''}
        `;
        
        return element;
    }

    createActionButtons(actions) {
        const actionsHtml = actions.map(action => 
            `<button class="notification-action" onclick="${action.onclick}">${action.text}</button>`
        ).join('');
        
        return `<div class="notification-actions">${actionsHtml}</div>`;
    }

    getOrCreateNotificationContainer() {
        let container = document.getElementById('notificationContainer');
        if (!container) {
            container = document.createElement('div');
            container.id = 'notificationContainer';
            container.className = 'fixed top-4 right-4 z-50 space-y-2';
            document.body.appendChild(container);
        }
        return container;
    }

    removeInAppNotification(id) {
        const element = document.querySelector(`[data-id="${id}"]`);
        if (element) {
            element.classList.add('fade-out');
            setTimeout(() => {
                element.remove();
            }, 300);
        }
        
        this.notifications = this.notifications.filter(n => n.id !== id);
    }

    // Notification processing and queuing
    queueNotification(notification) {
        this.notificationQueue.push(notification);
        this.saveNotificationQueue();
    }

    startNotificationProcessor() {
        setInterval(() => {
            this.processPendingNotifications();
        }, 30000); // Check every 30 seconds
    }

    async processPendingNotifications() {
        if (!this.isOnline || this.notificationQueue.length === 0) {
            return;
        }

        const pendingNotifications = [...this.notificationQueue];
        this.notificationQueue = [];

        for (const notification of pendingNotifications) {
            try {
                if (notification.type === 'email') {
                    await this.sendEmail(notification);
                } else if (notification.type === 'push') {
                    await this.sendPush(notification);
                }
            } catch (error) {
                console.error('Erro ao processar notificação pendente:', error);
                this.queueNotification(notification);
            }
        }

        this.saveNotificationQueue();
    }

    // Utility methods
    canSendNotification() {
        const now = new Date();
        const hour = now.getHours();
        const minute = now.getMinutes();
        const currentTime = hour * 100 + minute;
        
        const dndStart = this.timeStringToNumber(this.preferences.schedule.doNotDisturbStart);
        const dndEnd = this.timeStringToNumber(this.preferences.schedule.doNotDisturbEnd);
        
        if (dndStart > dndEnd) {
            // Crosses midnight
            return !(currentTime >= dndStart || currentTime <= dndEnd);
        } else {
            return !(currentTime >= dndStart && currentTime <= dndEnd);
        }
    }

    timeStringToNumber(timeString) {
        const [hours, minutes] = timeString.split(':').map(Number);
        return hours * 100 + minutes;
    }

    generateNotificationId() {
        return 'notif_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    processTemplate(template, data) {
        return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
            return data[key] || match;
        });
    }

    handleNotificationClick(notification) {
        // Handle notification click based on type and data
        const { subType, data } = notification;
        
        switch (subType) {
            case 'generationComplete':
                if (data.routeId) {
                    window.location.href = `route.html?id=${data.routeId}`;
                }
                break;
            case 'limitReached':
                window.location.href = 'payment.html';
                break;
            case 'personalizedSuggestions':
                window.location.href = 'index.html';
                break;
            default:
                window.focus();
        }
    }

    handleServiceWorkerMessage(data) {
        if (data.type === 'notification-click') {
            this.handleNotificationClick(data.notification);
        }
    }

    setupOfflineSync() {
        // Save notification queue to localStorage for offline persistence
        this.loadNotificationQueue();
    }

    saveNotificationQueue() {
        localStorage.setItem('notificationQueue', JSON.stringify(this.notificationQueue));
    }

    loadNotificationQueue() {
        try {
            const saved = localStorage.getItem('notificationQueue');
            this.notificationQueue = saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error('Erro ao carregar fila de notificações:', error);
            this.notificationQueue = [];
        }
    }

    urlBase64ToUint8Array(base64String) {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding)
            .replace(/\-/g, '+')
            .replace(/_/g, '/');

        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);

        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    }

    // Public API methods
    async updatePreferences(newPreferences) {
        this.preferences = { ...this.preferences, ...newPreferences };
        await db.saveUserNotificationPreferences(this.preferences);
    }

    async testNotification(type) {
        const testData = {
            userName: 'Usuário Teste',
            routeName: 'Rota de Teste',
            destinationName: 'Destino Teste'
        };

        switch (type) {
            case 'push':
                await this.sendPushNotification('generationComplete', 
                    'Teste de Notificação', 
                    'Esta é uma notificação de teste para verificar se está funcionando.');
                break;
            case 'email':
                const user = await auth.getCurrentUser();
                await this.sendEmailNotification('generationComplete', user.email, testData);
                break;
            case 'inApp':
                this.showInAppNotification('info', 
                    'Teste de Notificação', 
                    'Esta é uma notificação in-app de teste.');
                break;
        }
    }

    getNotificationHistory() {
        return this.notifications.slice(-50); // Return last 50 notifications
    }

    clearNotificationHistory() {
        this.notifications = [];
    }

    // Email templates
    getWelcomeEmailTemplate() {
        return `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: white; padding: 40px 20px; text-align: center;">
                    <h1 style="margin: 0; font-size: 28px;">Bem-vindo ao Gerador de Rolês! 🏍️</h1>
                    <p style="margin: 10px 0 0; font-size: 16px; opacity: 0.9;">Descubra roteiros incríveis para suas aventuras de moto</p>
                </div>
                <div style="padding: 40px 20px;">
                    <p>Olá, {{userName}}!</p>
                    <p>É um prazer ter você conosco! O Gerador de Rolês foi criado especialmente para motociclistas que buscam aventuras únicas e roteiros personalizados.</p>
                    
                    <h3>🎯 O que você pode fazer:</h3>
                    <ul style="line-height: 1.6;">
                        <li>Gerar roteiros personalizados com IA</li>
                        <li>Descobrir destinos incríveis</li>
                        <li>Calcular custos de viagem</li>
                        <li>Salvar seus roteiros favoritos</li>
                        <li>Compartilhar aventuras com amigos</li>
                    </ul>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="{{appUrl}}" style="background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; display: inline-block;">Começar Agora</a>
                    </div>
                    
                    <p>Qualquer dúvida, estamos aqui para ajudar!</p>
                    <p>Boas estradas! 🛣️</p>
                </div>
            </div>
        `;
    }

    getGenerationCompleteTemplate() {
        return `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px 20px; text-align: center;">
                    <h1 style="margin: 0; font-size: 24px;">Seu roteiro está pronto! 🎯</h1>
                </div>
                <div style="padding: 30px 20px;">
                    <p>Olá, {{userName}}!</p>
                    <p>Seu roteiro personalizado "<strong>{{routeName}}</strong>" foi gerado com sucesso!</p>
                    
                    <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="margin: 0 0 10px; color: #1f2937;">📍 Destino Principal</h3>
                        <p style="margin: 0; font-size: 16px;">{{destinationName}}</p>
                    </div>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="{{routeUrl}}" style="background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; display: inline-block;">Ver Roteiro</a>
                    </div>
                    
                    <p>Boa viagem e aproveite cada quilômetro! 🏍️</p>
                </div>
            </div>
        `;
    }

    getLimitReachedTemplate() {
        return `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px 20px; text-align: center;">
                    <h1 style="margin: 0; font-size: 24px;">Limite de gerações atingido 📊</h1>
                </div>
                <div style="padding: 30px 20px;">
                    <p>Olá, {{userName}}!</p>
                    <p>Você atingiu o limite mensal de gerações do seu plano atual.</p>
                    
                    <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
                        <p style="margin: 0;"><strong>💡 Dica:</strong> Considere fazer upgrade do seu plano para gerar roteiros ilimitados e ter acesso a recursos exclusivos!</p>
                    </div>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="{{upgradeUrl}}" style="background: #f59e0b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; display: inline-block;">Ver Planos</a>
                    </div>
                    
                    <p>Continue planejando suas aventuras! 🏍️</p>
                </div>
            </div>
        `;
    }

    getWeeklyDigestTemplate() {
        return `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: white; padding: 30px 20px; text-align: center;">
                    <h1 style="margin: 0; font-size: 24px;">Seu resumo semanal 📈</h1>
                </div>
                <div style="padding: 30px 20px;">
                    <p>Olá, {{userName}}!</p>
                    <p>Aqui está o resumo das suas atividades esta semana:</p>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 25px 0;">
                        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; text-align: center;">
                            <div style="font-size: 24px; font-weight: bold; color: #2563eb;">{{weeklyGenerations}}</div>
                            <div style="font-size: 14px; color: #64748b;">Roteiros Gerados</div>
                        </div>
                        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; text-align: center;">
                            <div style="font-size: 24px; font-weight: bold; color: #10b981;">{{totalKm}}</div>
                            <div style="font-size: 14px; color: #64748b;">Km Planejados</div>
                        </div>
                    </div>
                    
                    <h3>🏆 Destino mais popular esta semana:</h3>
                    <p><strong>{{popularDestination}}</strong></p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="{{appUrl}}" style="background: #8b5cf6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; display: inline-block;">Gerar Novo Roteiro</a>
                    </div>
                </div>
            </div>
        `;
    }

    getPlanUpgradeTemplate() {
        return `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px 20px; text-align: center;">
                    <h1 style="margin: 0; font-size: 24px;">Upgrade realizado! 🚀</h1>
                </div>
                <div style="padding: 30px 20px;">
                    <p>Parabéns, {{userName}}!</p>
                    <p>Seu plano foi atualizado para <strong>{{newPlan}}</strong> e você já pode aproveitar todos os novos recursos!</p>
                    
                    <div style="background: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="margin: 0 0 15px; color: #065f46;">🎉 Novos recursos disponíveis:</h3>
                        <ul style="margin: 0; color: #064e3b;">
                            {{planFeatures}}
                        </ul>
                    </div>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="{{appUrl}}" style="background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; display: inline-block;">Explorar Recursos</a>
                    </div>
                    
                    <p>Obrigado por confiar em nós para suas aventuras! 🏍️</p>
                </div>
            </div>
        `;
    }

    getNewsletterTemplate() {
        return `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: white; padding: 30px 20px; text-align: center;">
                    <h1 style="margin: 0; font-size: 24px;">Newsletter Motociclista 🏍️</h1>
                    <p style="margin: 10px 0 0; opacity: 0.9;">Dicas, destinos e novidades</p>
                </div>
                <div style="padding: 30px 20px;">
                    <h2>🗞️ Destaques da Semana</h2>
                    {{newsletterContent}}
                    
                    <h3>💡 Dica da Semana</h3>
                    <div style="background: #eff6ff; padding: 20px; border-radius: 8px; border-left: 4px solid #2563eb;">
                        {{weeklyTip}}
                    </div>
                    
                    <h3>📍 Destino em Destaque</h3>
                    <p>{{featuredDestination}}</p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="{{unsubscribeUrl}}" style="color: #64748b; font-size: 12px; text-decoration: none;">Cancelar inscrição</a>
                    </div>
                </div>
            </div>
        `;
    }
}

// CSS for in-app notifications
const notificationStyles = `
    <style>
        .in-app-notification {
            background: white;
            border-radius: 12px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
            border: 1px solid #e2e8f0;
            min-width: 320px;
            max-width: 400px;
            overflow: hidden;
            transform: translateX(100%);
            animation: slideIn 0.3s ease-out forwards;
        }

        .in-app-notification.fade-out {
            animation: slideOut 0.3s ease-in forwards;
        }

        .notification-content {
            display: flex;
            align-items: flex-start;
            padding: 16px;
        }

        .notification-icon {
            font-size: 20px;
            margin-right: 12px;
            flex-shrink: 0;
        }

        .notification-text {
            flex: 1;
            min-width: 0;
        }

        .notification-title {
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 4px;
        }

        .notification-message {
            color: #6b7280;
            font-size: 14px;
            line-height: 1.4;
        }

        .notification-close {
            background: none;
            border: none;
            color: #9ca3af;
            cursor: pointer;
            padding: 4px;
            border-radius: 4px;
            flex-shrink: 0;
        }

        .notification-close:hover {
            background: #f3f4f6;
            color: #6b7280;
        }

        .notification-actions {
            padding: 0 16px 16px;
            display: flex;
            gap: 8px;
            justify-content: flex-end;
        }

        .notification-action {
            background: #2563eb;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 6px;
            font-size: 14px;
            cursor: pointer;
            transition: background 0.2s;
        }

        .notification-action:hover {
            background: #1d4ed8;
        }

        .notification-action.secondary {
            background: #f1f5f9;
            color: #64748b;
        }

        .notification-action.secondary:hover {
            background: #e2e8f0;
        }

        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }

        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }

        .fade-in {
            animation: fadeIn 0.3s ease-in-out;
        }

        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
    </style>
`;

// Inject notification styles
document.head.insertAdjacentHTML('beforeend', notificationStyles);

// Initialize notification manager
document.addEventListener('DOMContentLoaded', () => {
    window.notificationManager = new NotificationManager();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NotificationManager;
}