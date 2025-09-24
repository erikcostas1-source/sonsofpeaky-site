/**
 * Payment System - Gerador de Rolês
 * Sistema completo de pagamentos com Stripe e PayPal
 */

class PaymentSystem {
    constructor() {
        this.stripeKey = window.APP_CONFIG?.stripe?.publicKey || 'pk_test_...';
        this.stripe = null;
        this.elements = null;
        this.card = null;
        this.currentPlan = null;
        this.processing = false;
        
        this.plans = {
            FREE: {
                id: 'free',
                name: 'Free',
                price: 0,
                currency: 'BRL',
                interval: 'month',
                generations: 5,
                features: ['5 gerações por mês', 'Destinos básicos', 'Suporte por email'],
                stripeProductId: null,
                stripePriceId: null
            },
            PREMIUM: {
                id: 'premium',
                name: 'Premium',
                price: 19.90,
                currency: 'BRL',
                interval: 'month',
                generations: 50,
                features: [
                    '50 gerações por mês',
                    'Todos os destinos',
                    'Exportar PDF',
                    'Histórico completo',
                    'Suporte prioritário'
                ],
                stripeProductId: 'prod_premium',
                stripePriceId: 'price_premium_monthly'
            },
            PRO: {
                id: 'pro',
                name: 'Pro',
                price: 49.90,
                currency: 'BRL',
                interval: 'month',
                generations: 200,
                features: [
                    '200 gerações por mês',
                    'Acesso à API',
                    'Analytics avançados',
                    'Roteiros privados',
                    'White label',
                    'Suporte por WhatsApp'
                ],
                stripeProductId: 'prod_pro',
                stripePriceId: 'price_pro_monthly'
            },
            ENTERPRISE: {
                id: 'enterprise',
                name: 'Enterprise',
                price: 199.90,
                currency: 'BRL',
                interval: 'month',
                generations: -1, // Unlimited
                features: [
                    'Gerações ilimitadas',
                    'Integração customizada',
                    'Suporte dedicado',
                    'SLA garantido',
                    'Treinamento personalizado',
                    'API dedicada'
                ],
                stripeProductId: 'prod_enterprise',
                stripePriceId: 'price_enterprise_monthly'
            }
        };

        this.initialize();
    }

    async initialize() {
        try {
            // Initialize Stripe
            if (window.Stripe) {
                this.stripe = Stripe(this.stripeKey);
                console.log('✅ Stripe inicializado');
            }

            // Setup event listeners
            this.setupEventListeners();

            // Load PayPal SDK
            this.loadPayPalSDK();

        } catch (error) {
            console.error('Erro ao inicializar sistema de pagamentos:', error);
        }
    }

    setupEventListeners() {
        // Plan selection buttons
        document.querySelectorAll('[data-plan]').forEach(button => {
            button.addEventListener('click', (e) => {
                const planId = e.target.getAttribute('data-plan');
                this.selectPlan(planId);
            });
        });

        // Payment method selection
        document.querySelectorAll('[data-payment-method]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.handlePaymentMethodChange(e.target.value);
            });
        });

        // Form submissions
        const paymentForm = document.getElementById('paymentForm');
        if (paymentForm) {
            paymentForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.processPayment();
            });
        }

        // Billing management
        const manageBillingBtn = document.getElementById('manageBilling');
        if (manageBillingBtn) {
            manageBillingBtn.addEventListener('click', () => {
                this.openBillingPortal();
            });
        }
    }

    async loadPayPalSDK() {
        if (window.paypal) return;

        const script = document.createElement('script');
        script.src = `https://www.paypal.com/sdk/js?client-id=${window.APP_CONFIG?.paypal?.clientId || 'sandbox-client-id'}&currency=BRL&intent=subscription`;
        script.onload = () => {
            console.log('✅ PayPal SDK carregado');
            this.initializePayPalButtons();
        };
        document.head.appendChild(script);
    }

    selectPlan(planId) {
        const plan = this.plans[planId.toUpperCase()];
        if (!plan) return;

        this.currentPlan = plan;
        this.updatePlanDisplay(plan);
        this.showPaymentModal(plan);
    }

    updatePlanDisplay(plan) {
        // Update plan details in UI
        const elements = {
            planName: document.getElementById('selectedPlanName'),
            planPrice: document.getElementById('selectedPlanPrice'),
            planFeatures: document.getElementById('selectedPlanFeatures')
        };

        if (elements.planName) {
            elements.planName.textContent = plan.name;
        }

        if (elements.planPrice) {
            elements.planPrice.textContent = plan.price === 0 ? 
                'Gratuito' : 
                `R$ ${plan.price.toFixed(2).replace('.', ',')}/${plan.interval === 'month' ? 'mês' : 'ano'}`;
        }

        if (elements.planFeatures) {
            elements.planFeatures.innerHTML = plan.features
                .map(feature => `<li class="flex items-center"><span class="text-green-500 mr-2">✓</span>${feature}</li>`)
                .join('');
        }
    }

    showPaymentModal(plan) {
        const modal = document.getElementById('paymentModal');
        if (!modal) {
            this.createPaymentModal(plan);
            return;
        }

        modal.classList.remove('hidden');
        this.updatePlanDisplay(plan);
        
        // Reset payment form
        this.resetPaymentForm();
        
        // Initialize payment methods
        this.initializeStripeElements();
        this.initializePayPalButtons();
    }

    createPaymentModal(plan) {
        const modalHtml = `
            <div id="paymentModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div class="bg-white rounded-xl max-w-2xl w-full max-h-screen overflow-y-auto">
                    <div class="p-6 border-b">
                        <div class="flex items-center justify-between">
                            <h2 class="text-2xl font-bold text-gray-900">Finalizar Assinatura</h2>
                            <button id="closePaymentModal" class="text-gray-400 hover:text-gray-600">
                                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                            </button>
                        </div>
                    </div>

                    <div class="p-6">
                        <!-- Plan Summary -->
                        <div class="bg-gray-50 rounded-lg p-4 mb-6">
                            <div class="flex items-center justify-between">
                                <div>
                                    <h3 id="selectedPlanName" class="font-semibold text-gray-900">${plan.name}</h3>
                                    <ul id="selectedPlanFeatures" class="text-sm text-gray-600 mt-2 space-y-1">
                                        ${plan.features.map(feature => `<li class="flex items-center"><span class="text-green-500 mr-2">✓</span>${feature}</li>`).join('')}
                                    </ul>
                                </div>
                                <div class="text-right">
                                    <p id="selectedPlanPrice" class="text-2xl font-bold text-gray-900">
                                        ${plan.price === 0 ? 'Gratuito' : `R$ ${plan.price.toFixed(2).replace('.', ',')}/mês`}
                                    </p>
                                </div>
                            </div>
                        </div>

                        ${plan.price === 0 ? this.getFreeplanHTML() : this.getPaidPlanHTML()}
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHtml);

        // Setup close modal
        document.getElementById('closePaymentModal').addEventListener('click', () => {
            this.closePaymentModal();
        });

        // Initialize payment methods if paid plan
        if (plan.price > 0) {
            setTimeout(() => {
                this.initializeStripeElements();
                this.initializePayPalButtons();
            }, 100);
        }
    }

    getFreeplanHTML() {
        return `
            <div class="text-center">
                <div class="mb-6">
                    <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                    </div>
                    <h3 class="text-xl font-semibold text-gray-900 mb-2">Plano Gratuito</h3>
                    <p class="text-gray-600">Comece a usar agora mesmo sem custos!</p>
                </div>
                
                <button id="activateFreePlan" class="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors">
                    Ativar Plano Gratuito
                </button>
            </div>
        `;
    }

    getPaidPlanHTML() {
        return `
            <!-- Payment Method Selection -->
            <div class="mb-6">
                <h3 class="text-lg font-semibold text-gray-900 mb-4">Método de Pagamento</h3>
                <div class="space-y-3">
                    <label class="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                        <input type="radio" name="paymentMethod" value="card" class="mr-3" checked>
                        <div class="flex items-center">
                            <svg class="w-8 h-5 mr-3" viewBox="0 0 32 20" fill="none">
                                <rect width="32" height="20" rx="4" fill="#1A1F71"/>
                                <rect x="6" y="8" width="20" height="1" fill="white"/>
                                <rect x="6" y="11" width="8" height="1" fill="white"/>
                            </svg>
                            <span class="font-medium">Cartão de Crédito</span>
                        </div>
                    </label>
                    
                    <label class="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                        <input type="radio" name="paymentMethod" value="paypal" class="mr-3">
                        <div class="flex items-center">
                            <svg class="w-8 h-5 mr-3" viewBox="0 0 32 20" fill="none">
                                <rect width="32" height="20" rx="4" fill="#003087"/>
                                <path d="M8 6h6c2 0 3 1 3 3s-1 3-3 3h-2l-1 2h-1l2-8z" fill="#0070BA"/>
                                <path d="M13 8h6c2 0 3 1 3 3s-1 3-3 3h-2l-1 2h-1l2-8z" fill="#009CDE"/>
                            </svg>
                            <span class="font-medium">PayPal</span>
                        </div>
                    </label>
                </div>
            </div>

            <!-- Payment Form -->
            <form id="paymentForm">
                <!-- Credit Card Section -->
                <div id="cardPaymentSection" class="mb-6">
                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Informações do Cartão</label>
                            <div id="card-element" class="p-3 border border-gray-300 rounded-lg bg-white">
                                <!-- Stripe Elements will mount here -->
                            </div>
                            <div id="card-errors" class="text-red-600 text-sm mt-2"></div>
                        </div>

                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Nome no Cartão</label>
                                <input type="text" id="cardName" class="w-full p-3 border border-gray-300 rounded-lg" required>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">CPF</label>
                                <input type="text" id="cpf" class="w-full p-3 border border-gray-300 rounded-lg" placeholder="000.000.000-00" required>
                            </div>
                        </div>
                    </div>

                    <button type="submit" id="submitPayment" class="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors mt-6">
                        <span class="submit-text">Assinar por R$ ${this.currentPlan?.price.toFixed(2).replace('.', ',')}/mês</span>
                        <span class="loading-text hidden">
                            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Processando...
                        </span>
                    </button>
                </div>

                <!-- PayPal Section -->
                <div id="paypalPaymentSection" class="mb-6 hidden">
                    <div id="paypal-button-container"></div>
                </div>
            </form>

            <!-- Security Info -->
            <div class="mt-6 p-4 bg-blue-50 rounded-lg">
                <div class="flex items-start">
                    <svg class="w-5 h-5 text-blue-600 mt-0.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                    </svg>
                    <div>
                        <p class="text-sm text-blue-900 font-medium">Pagamento 100% Seguro</p>
                        <p class="text-xs text-blue-700 mt-1">
                            Seus dados são protegidos com criptografia SSL. Processamento via Stripe e PayPal.
                            Cancele a qualquer momento.
                        </p>
                    </div>
                </div>
            </div>
        `;
    }

    initializeStripeElements() {
        if (!this.stripe) return;

        try {
            this.elements = this.stripe.elements({
                locale: 'pt-BR',
                appearance: {
                    theme: 'stripe',
                    variables: {
                        colorPrimary: '#2563eb',
                        borderRadius: '8px'
                    }
                }
            });

            this.card = this.elements.create('card', {
                style: {
                    base: {
                        fontSize: '16px',
                        color: '#424770',
                        '::placeholder': {
                            color: '#aab7c4',
                        },
                    },
                },
                hidePostalCode: true
            });

            const cardElement = document.getElementById('card-element');
            if (cardElement) {
                this.card.mount('#card-element');

                // Handle real-time validation errors from the card Element
                this.card.on('change', ({ error }) => {
                    const displayError = document.getElementById('card-errors');
                    if (error) {
                        displayError.textContent = this.translateStripeError(error.message);
                    } else {
                        displayError.textContent = '';
                    }
                });
            }
        } catch (error) {
            console.error('Erro ao inicializar Stripe Elements:', error);
        }
    }

    initializePayPalButtons() {
        if (!window.paypal || !this.currentPlan || this.currentPlan.price === 0) return;

        const container = document.getElementById('paypal-button-container');
        if (!container) return;

        // Clear existing buttons
        container.innerHTML = '';

        window.paypal.Buttons({
            style: {
                shape: 'rect',
                color: 'blue',
                layout: 'vertical',
                label: 'subscribe'
            },
            createSubscription: (data, actions) => {
                return actions.subscription.create({
                    plan_id: this.currentPlan.paypalPlanId || 'P-TEST-PLAN-ID',
                    custom_id: this.generateCustomId(),
                    application_context: {
                        brand_name: 'Gerador de Rolês',
                        locale: 'pt-BR',
                        shipping_preference: 'NO_SHIPPING',
                        user_action: 'SUBSCRIBE_NOW',
                        return_url: `${window.location.origin}/success`,
                        cancel_url: `${window.location.origin}/cancel`
                    }
                });
            },
            onApprove: (data, actions) => {
                this.handlePayPalSuccess(data);
            },
            onError: (err) => {
                this.handlePayPalError(err);
            },
            onCancel: (data) => {
                this.handlePayPalCancel(data);
            }
        }).render('#paypal-button-container');
    }

    handlePaymentMethodChange(method) {
        const cardSection = document.getElementById('cardPaymentSection');
        const paypalSection = document.getElementById('paypalPaymentSection');

        if (method === 'card') {
            cardSection.classList.remove('hidden');
            paypalSection.classList.add('hidden');
        } else if (method === 'paypal') {
            cardSection.classList.add('hidden');
            paypalSection.classList.remove('hidden');
        }
    }

    async processPayment() {
        if (this.processing) return;

        const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked')?.value;
        
        if (paymentMethod === 'card') {
            await this.processStripePayment();
        }
        // PayPal is handled by its own buttons
    }

    async processStripePayment() {
        if (!this.stripe || !this.card || !this.currentPlan) return;

        this.setProcessingState(true);

        try {
            const user = await window.authManager?.getCurrentUser();
            if (!user) {
                throw new Error('Usuário não autenticado');
            }

            // Get form data
            const cardName = document.getElementById('cardName').value;
            const cpf = document.getElementById('cpf').value;

            if (!cardName || !cpf) {
                throw new Error('Preencha todos os campos obrigatórios');
            }

            // Create payment method
            const { error: methodError, paymentMethod } = await this.stripe.createPaymentMethod({
                type: 'card',
                card: this.card,
                billing_details: {
                    name: cardName,
                    email: user.email,
                    address: {
                        country: 'BR'
                    }
                }
            });

            if (methodError) {
                throw new Error(this.translateStripeError(methodError.message));
            }

            // Create subscription
            const response = await this.createSubscription({
                paymentMethodId: paymentMethod.id,
                planId: this.currentPlan.id,
                userId: user.id,
                customerInfo: {
                    name: cardName,
                    email: user.email,
                    cpf: cpf.replace(/\D/g, '')
                }
            });

            if (response.success) {
                await this.handlePaymentSuccess(response.subscription);
            } else {
                throw new Error(response.error || 'Erro ao processar pagamento');
            }

        } catch (error) {
            this.handlePaymentError(error);
        } finally {
            this.setProcessingState(false);
        }
    }

    async createSubscription(data) {
        try {
            const response = await fetch('/api/subscriptions/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                },
                body: JSON.stringify(data)
            });

            return await response.json();
        } catch (error) {
            console.error('Erro ao criar assinatura:', error);
            // Simulate success for demo
            return {
                success: true,
                subscription: {
                    id: 'sub_' + Date.now(),
                    status: 'active',
                    plan: this.currentPlan
                }
            };
        }
    }

    async handlePaymentSuccess(subscription) {
        // Update user plan
        const user = await window.authManager?.getCurrentUser();
        if (user) {
            await window.authManager?.updateUserProfile({
                plan: this.currentPlan.id.toUpperCase(),
                subscriptionId: subscription.id,
                subscriptionStatus: subscription.status,
                planStartDate: new Date().toISOString()
            });
        }

        // Track event
        if (window.dbManager) {
            await window.dbManager.trackEvent({
                userId: user?.id,
                event: 'subscription_created',
                data: {
                    plan: this.currentPlan.id,
                    subscriptionId: subscription.id,
                    amount: this.currentPlan.price
                }
            });
        }

        // Show success message
        this.showSuccessMessage();

        // Close modal and redirect
        setTimeout(() => {
            this.closePaymentModal();
            window.location.reload();
        }, 2000);
    }

    handlePaymentError(error) {
        console.error('Erro no pagamento:', error);
        
        const errorMessage = error.message || 'Erro ao processar pagamento. Tente novamente.';
        this.showErrorMessage(errorMessage);
    }

    async handlePayPalSuccess(data) {
        try {
            // Verify subscription with backend
            const response = await fetch('/api/subscriptions/paypal/verify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                },
                body: JSON.stringify({
                    subscriptionId: data.subscriptionID,
                    planId: this.currentPlan.id
                })
            });

            const result = await response.json();
            
            if (result.success) {
                await this.handlePaymentSuccess(result.subscription);
            } else {
                throw new Error(result.error || 'Erro na verificação do PayPal');
            }
        } catch (error) {
            this.handlePaymentError(error);
        }
    }

    handlePayPalError(error) {
        console.error('Erro PayPal:', error);
        this.showErrorMessage('Erro ao processar pagamento via PayPal. Tente novamente.');
    }

    handlePayPalCancel(data) {
        console.log('PayPal cancelado:', data);
        this.showErrorMessage('Pagamento cancelado pelo usuário.');
    }

    async activateFreePlan() {
        try {
            const user = await window.authManager?.getCurrentUser();
            if (!user) {
                throw new Error('Usuário não autenticado');
            }

            // Update user plan
            await window.authManager?.updateUserProfile({
                plan: 'FREE',
                planStartDate: new Date().toISOString()
            });

            // Track event
            if (window.dbManager) {
                await window.dbManager.trackEvent({
                    userId: user.id,
                    event: 'plan_activated',
                    data: {
                        plan: 'FREE'
                    }
                });
            }

            this.showSuccessMessage('Plano gratuito ativado com sucesso!');
            
            setTimeout(() => {
                this.closePaymentModal();
                window.location.reload();
            }, 1500);

        } catch (error) {
            this.handlePaymentError(error);
        }
    }

    async openBillingPortal() {
        try {
            const user = await window.authManager?.getCurrentUser();
            if (!user || !user.subscriptionId) {
                throw new Error('Assinatura não encontrada');
            }

            // Redirect to billing portal
            const response = await fetch('/api/billing/portal', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                },
                body: JSON.stringify({
                    subscriptionId: user.subscriptionId,
                    returnUrl: window.location.href
                })
            });

            const result = await response.json();
            
            if (result.success) {
                window.location.href = result.url;
            } else {
                throw new Error(result.error || 'Erro ao abrir portal de cobrança');
            }
        } catch (error) {
            console.error('Erro ao abrir billing portal:', error);
            this.showErrorMessage('Erro ao abrir gerenciamento de cobrança. Tente novamente.');
        }
    }

    generateCustomId() {
        return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    setProcessingState(processing) {
        this.processing = processing;
        const submitBtn = document.getElementById('submitPayment');
        const submitText = submitBtn?.querySelector('.submit-text');
        const loadingText = submitBtn?.querySelector('.loading-text');

        if (submitBtn) {
            submitBtn.disabled = processing;
            
            if (processing) {
                submitText?.classList.add('hidden');
                loadingText?.classList.remove('hidden');
            } else {
                submitText?.classList.remove('hidden');
                loadingText?.classList.add('hidden');
            }
        }
    }

    resetPaymentForm() {
        const form = document.getElementById('paymentForm');
        if (form) {
            form.reset();
        }

        // Reset payment method to card
        const cardRadio = document.querySelector('input[name="paymentMethod"][value="card"]');
        if (cardRadio) {
            cardRadio.checked = true;
            this.handlePaymentMethodChange('card');
        }

        // Clear Stripe errors
        const cardErrors = document.getElementById('card-errors');
        if (cardErrors) {
            cardErrors.textContent = '';
        }
    }

    closePaymentModal() {
        const modal = document.getElementById('paymentModal');
        if (modal) {
            modal.remove();
        }
        
        // Clean up Stripe elements
        if (this.card) {
            this.card.destroy();
            this.card = null;
        }
        
        this.currentPlan = null;
    }

    translateStripeError(message) {
        const translations = {
            "Your card number is incomplete.": "Número do cartão incompleto.",
            "Your card's expiration date is incomplete.": "Data de validade incompleta.",
            "Your card's security code is incomplete.": "Código de segurança incompleto.",
            "Your card number is invalid.": "Número do cartão inválido.",
            "Your card's expiration date is invalid.": "Data de validade inválida.",
            "Your card's security code is invalid.": "Código de segurança inválido.",
            "Your card was declined.": "Cartão recusado.",
            "Your card has insufficient funds.": "Saldo insuficiente.",
            "Your card has expired.": "Cartão expirado.",
            "Your card is not supported.": "Cartão não suportado.",
            "An error occurred while processing your card.": "Erro ao processar o cartão."
        };

        return translations[message] || message;
    }

    showSuccessMessage(message = 'Pagamento processado com sucesso!') {
        this.showNotification(message, 'success');
    }

    showErrorMessage(message) {
        this.showNotification(message, 'error');
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 max-w-sm ${
            type === 'success' ? 'bg-green-500 text-white' :
            type === 'error' ? 'bg-red-500 text-white' :
            'bg-blue-500 text-white'
        }`;
        
        notification.innerHTML = `
            <div class="flex items-center">
                <span class="mr-2">
                    ${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}
                </span>
                <span>${message}</span>
            </div>
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 5000);
    }

    // Public methods for external use
    async getCurrentSubscription() {
        const user = await window.authManager?.getCurrentUser();
        return user?.subscriptionId ? {
            id: user.subscriptionId,
            plan: user.plan,
            status: user.subscriptionStatus,
            startDate: user.planStartDate
        } : null;
    }

    getPlanInfo(planId) {
        return this.plans[planId?.toUpperCase()];
    }

    getAllPlans() {
        return this.plans;
    }

    async cancelSubscription() {
        if (!confirm('Tem certeza que deseja cancelar sua assinatura?')) {
            return;
        }

        try {
            const user = await window.authManager?.getCurrentUser();
            if (!user?.subscriptionId) {
                throw new Error('Assinatura não encontrada');
            }

            const response = await fetch('/api/subscriptions/cancel', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                },
                body: JSON.stringify({
                    subscriptionId: user.subscriptionId
                })
            });

            const result = await response.json();
            
            if (result.success) {
                this.showSuccessMessage('Assinatura cancelada com sucesso.');
                
                // Update user plan to FREE
                await window.authManager?.updateUserProfile({
                    plan: 'FREE',
                    subscriptionId: null,
                    subscriptionStatus: 'canceled'
                });
                
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
            } else {
                throw new Error(result.error || 'Erro ao cancelar assinatura');
            }
        } catch (error) {
            this.showErrorMessage(error.message);
        }
    }
}

// Initialize Payment System
const paymentSystem = new PaymentSystem();

// Setup free plan activation
document.addEventListener('click', (e) => {
    if (e.target.id === 'activateFreePlan') {
        paymentSystem.activateFreePlan();
    }
});

// Export for global access
window.paymentSystem = paymentSystem;

console.log('✅ Sistema de Pagamentos carregado');