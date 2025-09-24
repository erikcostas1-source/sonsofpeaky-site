/**
 * Sistema de Autenticação e Gestão de Usuários
 * Gerador de Rolês - Versão Empresarial
 */

class AuthManager {
    constructor() {
        this.currentUser = null;
        this.authToken = localStorage.getItem('auth_token');
        this.apiBaseUrl = window.location.hostname === 'localhost' 
            ? 'http://localhost:3000/api' 
            : 'https://api.gerador-roles.com';
        
        this.userPlans = {
            FREE: {
                name: 'Gratuito',
                monthlyGenerations: 5,
                features: ['roteiros_basicos', 'destinos_limitados'],
                price: 0
            },
            PREMIUM: {
                name: 'Premium',
                monthlyGenerations: 50,
                features: ['roteiros_avancados', 'todos_destinos', 'exportacao_pdf', 'suporte_prioritario'],
                price: 19.90
            },
            PRO: {
                name: 'Profissional',
                monthlyGenerations: 200,
                features: ['roteiros_personalizados', 'api_access', 'analytics', 'white_label', 'suporte_24h'],
                price: 49.90
            },
            ENTERPRISE: {
                name: 'Empresarial',
                monthlyGenerations: -1, // Ilimitado
                features: ['custom_integration', 'dedicated_support', 'custom_prompts', 'multi_tenant'],
                price: 199.90
            }
        };
        
        this.initialize();
    }

    async initialize() {
        if (this.authToken) {
            await this.validateToken();
        }
        this.setupAuthUI();
        this.setupEventListeners();
    }

    async validateToken() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/auth/validate`, {
                headers: {
                    'Authorization': `Bearer ${this.authToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                this.currentUser = await response.json();
                this.updateUI();
            } else {
                this.logout();
            }
        } catch (error) {
            console.error('Erro ao validar token:', error);
            this.logout();
        }
    }

    setupAuthUI() {
        // Criar modal de autenticação
        const authModal = this.createAuthModal();
        document.body.appendChild(authModal);

        // Criar interface de usuário logado
        const userInterface = this.createUserInterface();
        document.body.appendChild(userInterface);

        // Criar modais de planos
        const plansModal = this.createPlansModal();
        document.body.appendChild(plansModal);
    }

    createAuthModal() {
        const modal = document.createElement('div');
        modal.id = 'auth-modal';
        modal.className = 'modal-overlay hidden';
        modal.innerHTML = `
            <div class="modal-content max-w-md mx-auto bg-gray-900 rounded-lg p-6">
                <div class="flex justify-between items-center mb-6">
                    <h2 id="auth-modal-title" class="text-2xl font-bold text-white">Entrar</h2>
                    <button id="close-auth-modal" class="text-gray-400 hover:text-white">
                        <i class="fas fa-times text-xl"></i>
                    </button>
                </div>

                <!-- Login Form -->
                <form id="login-form" class="space-y-4">
                    <div>
                        <label for="login-email" class="block text-sm font-medium text-gray-300 mb-2">Email</label>
                        <input id="login-email" type="email" required
                               class="input-field w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-600 text-white">
                    </div>
                    <div>
                        <label for="login-password" class="block text-sm font-medium text-gray-300 mb-2">Senha</label>
                        <input id="login-password" type="password" required
                               class="input-field w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-600 text-white">
                    </div>
                    <div class="flex items-center justify-between">
                        <label class="flex items-center">
                            <input type="checkbox" id="remember-me" class="mr-2">
                            <span class="text-sm text-gray-300">Lembrar de mim</span>
                        </label>
                        <button type="button" id="forgot-password" class="text-sm text-gold-primary hover:text-gold-secondary">
                            Esqueci a senha
                        </button>
                    </div>
                    <button type="submit" class="btn-primary w-full">
                        <i class="fas fa-sign-in-alt mr-2"></i>Entrar
                    </button>
                </form>

                <!-- Register Form -->
                <form id="register-form" class="space-y-4 hidden">
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label for="register-name" class="block text-sm font-medium text-gray-300 mb-2">Nome</label>
                            <input id="register-name" type="text" required
                                   class="input-field w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-600 text-white">
                        </div>
                        <div>
                            <label for="register-lastname" class="block text-sm font-medium text-gray-300 mb-2">Sobrenome</label>
                            <input id="register-lastname" type="text" required
                                   class="input-field w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-600 text-white">
                        </div>
                    </div>
                    <div>
                        <label for="register-email" class="block text-sm font-medium text-gray-300 mb-2">Email</label>
                        <input id="register-email" type="email" required
                               class="input-field w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-600 text-white">
                    </div>
                    <div>
                        <label for="register-phone" class="block text-sm font-medium text-gray-300 mb-2">Telefone</label>
                        <input id="register-phone" type="tel"
                               class="input-field w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-600 text-white"
                               placeholder="(11) 99999-9999">
                    </div>
                    <div>
                        <label for="register-password" class="block text-sm font-medium text-gray-300 mb-2">Senha</label>
                        <input id="register-password" type="password" required
                               class="input-field w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-600 text-white">
                        <div class="text-xs text-gray-400 mt-1">Mínimo 8 caracteres, 1 maiúscula, 1 número</div>
                    </div>
                    <div>
                        <label for="register-confirm-password" class="block text-sm font-medium text-gray-300 mb-2">Confirmar Senha</label>
                        <input id="register-confirm-password" type="password" required
                               class="input-field w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-600 text-white">
                    </div>
                    <div>
                        <label for="register-location" class="block text-sm font-medium text-gray-300 mb-2">Localização</label>
                        <input id="register-location" type="text"
                               class="input-field w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-600 text-white"
                               placeholder="Cidade, Estado">
                    </div>
                    <div>
                        <label for="register-bike" class="block text-sm font-medium text-gray-300 mb-2">Moto Principal</label>
                        <select id="register-bike" class="input-field w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-600 text-white">
                            <option value="">Selecione sua moto</option>
                            <option value="125cc">125-150cc</option>
                            <option value="250cc">250-400cc</option>
                            <option value="600cc">600-800cc</option>
                            <option value="1000cc">1000cc+</option>
                        </select>
                    </div>
                    <div>
                        <label class="flex items-center">
                            <input type="checkbox" id="accept-terms" required class="mr-2">
                            <span class="text-sm text-gray-300">
                                Aceito os <a href="#" class="text-gold-primary">Termos de Uso</a> e 
                                <a href="#" class="text-gold-primary">Política de Privacidade</a>
                            </span>
                        </label>
                    </div>
                    <div>
                        <label class="flex items-center">
                            <input type="checkbox" id="newsletter" class="mr-2">
                            <span class="text-sm text-gray-300">Receber novidades e dicas por email</span>
                        </label>
                    </div>
                    <button type="submit" class="btn-primary w-full">
                        <i class="fas fa-user-plus mr-2"></i>Criar Conta
                    </button>
                </form>

                <!-- Forgot Password Form -->
                <form id="forgot-password-form" class="space-y-4 hidden">
                    <div>
                        <label for="forgot-email" class="block text-sm font-medium text-gray-300 mb-2">Email</label>
                        <input id="forgot-email" type="email" required
                               class="input-field w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-600 text-white">
                    </div>
                    <button type="submit" class="btn-primary w-full">
                        <i class="fas fa-envelope mr-2"></i>Enviar Link de Recuperação
                    </button>
                </form>

                <!-- Form Toggle Buttons -->
                <div class="mt-6 text-center">
                    <div id="login-toggle" class="hidden">
                        <span class="text-gray-400">Não tem conta? </span>
                        <button id="show-register" type="button" class="text-gold-primary hover:text-gold-secondary">
                            Criar conta
                        </button>
                    </div>
                    <div id="register-toggle" class="hidden">
                        <span class="text-gray-400">Já tem conta? </span>
                        <button id="show-login" type="button" class="text-gold-primary hover:text-gold-secondary">
                            Entrar
                        </button>
                    </div>
                    <div id="forgot-toggle" class="hidden">
                        <button id="back-to-login" type="button" class="text-gold-primary hover:text-gold-secondary">
                            <i class="fas fa-arrow-left mr-2"></i>Voltar ao login
                        </button>
                    </div>
                </div>

                <!-- Social Login -->
                <div class="mt-6">
                    <div class="relative">
                        <div class="absolute inset-0 flex items-center">
                            <div class="w-full border-t border-gray-600"></div>
                        </div>
                        <div class="relative flex justify-center text-sm">
                            <span class="px-2 bg-gray-900 text-gray-400">ou continue com</span>
                        </div>
                    </div>
                    <div class="mt-4 grid grid-cols-2 gap-3">
                        <button type="button" id="google-login" class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm transition-colors">
                            <i class="fab fa-google mr-2"></i>Google
                        </button>
                        <button type="button" id="facebook-login" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors">
                            <i class="fab fa-facebook mr-2"></i>Facebook
                        </button>
                    </div>
                </div>
            </div>
        `;
        return modal;
    }

    createUserInterface() {
        const userInterface = document.createElement('div');
        userInterface.id = 'user-interface';
        userInterface.className = 'hidden';
        userInterface.innerHTML = `
            <!-- User Menu -->
            <div id="user-menu" class="relative">
                <button id="user-menu-button" class="flex items-center space-x-2 bg-gray-800 rounded-full px-4 py-2 hover:bg-gray-700 transition-colors">
                    <div id="user-avatar" class="w-8 h-8 bg-gold-primary rounded-full flex items-center justify-center">
                        <i class="fas fa-user text-black text-sm"></i>
                    </div>
                    <span id="user-name" class="text-white font-medium"></span>
                    <i class="fas fa-chevron-down text-gray-400 text-sm"></i>
                </button>
                
                <div id="user-dropdown" class="absolute right-0 mt-2 w-64 bg-gray-800 rounded-lg shadow-lg z-50 hidden">
                    <div class="px-4 py-3 border-b border-gray-700">
                        <div class="flex items-center space-x-3">
                            <div id="dropdown-avatar" class="w-12 h-12 bg-gold-primary rounded-full flex items-center justify-center">
                                <i class="fas fa-user text-black"></i>
                            </div>
                            <div>
                                <div id="dropdown-name" class="font-medium text-white"></div>
                                <div id="dropdown-email" class="text-sm text-gray-400"></div>
                                <div id="dropdown-plan" class="text-xs bg-gold-primary text-black px-2 py-1 rounded-full inline-block mt-1"></div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="py-2">
                        <a href="#" id="view-profile" class="flex items-center px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors">
                            <i class="fas fa-user-circle mr-3 w-4"></i>Meu Perfil
                        </a>
                        <a href="#" id="my-roteiros" class="flex items-center px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors">
                            <i class="fas fa-route mr-3 w-4"></i>Meus Roteiros
                        </a>
                        <a href="#" id="usage-stats" class="flex items-center px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors">
                            <i class="fas fa-chart-bar mr-3 w-4"></i>Estatísticas
                        </a>
                        <a href="#" id="billing" class="flex items-center px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors">
                            <i class="fas fa-credit-card mr-3 w-4"></i>Cobrança
                        </a>
                        <a href="#" id="settings" class="flex items-center px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors">
                            <i class="fas fa-cog mr-3 w-4"></i>Configurações
                        </a>
                    </div>
                    
                    <div class="border-t border-gray-700 py-2">
                        <a href="#" id="upgrade-plan" class="flex items-center px-4 py-2 text-gold-primary hover:bg-gray-700 transition-colors">
                            <i class="fas fa-crown mr-3 w-4"></i>Upgrade do Plano
                        </a>
                        <a href="#" id="help-support" class="flex items-center px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors">
                            <i class="fas fa-question-circle mr-3 w-4"></i>Ajuda & Suporte
                        </a>
                        <button id="logout" class="flex items-center w-full px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors">
                            <i class="fas fa-sign-out-alt mr-3 w-4"></i>Sair
                        </button>
                    </div>
                </div>
            </div>
        `;
        return userInterface;
    }

    createPlansModal() {
        const modal = document.createElement('div');
        modal.id = 'plans-modal';
        modal.className = 'modal-overlay hidden';
        modal.innerHTML = `
            <div class="modal-content max-w-5xl mx-auto bg-gray-900 rounded-lg p-6">
                <div class="flex justify-between items-center mb-8">
                    <h2 class="text-3xl font-bold text-white">Escolha seu Plano</h2>
                    <button id="close-plans-modal" class="text-gray-400 hover:text-white">
                        <i class="fas fa-times text-xl"></i>
                    </button>
                </div>

                <div id="billing-toggle" class="flex justify-center mb-8">
                    <div class="bg-gray-800 rounded-lg p-1 flex">
                        <button id="monthly-billing" class="px-6 py-2 rounded-lg bg-gold-primary text-black font-medium">
                            Mensal
                        </button>
                        <button id="yearly-billing" class="px-6 py-2 rounded-lg text-white">
                            Anual <span class="text-green-400 text-sm">(20% OFF)</span>
                        </button>
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" id="plans-grid">
                    <!-- Plans will be dynamically generated -->
                </div>

                <div class="mt-8 text-center">
                    <p class="text-gray-400 text-sm mb-4">
                        Todos os planos incluem: Suporte por email, Atualizações gratuitas, Backup automático
                    </p>
                    <div class="flex justify-center space-x-6 text-sm text-gray-400">
                        <a href="#" class="hover:text-white">Comparar Planos</a>
                        <a href="#" class="hover:text-white">FAQ</a>
                        <a href="#" class="hover:text-white">Contato</a>
                    </div>
                </div>
            </div>
        `;
        return modal;
    }

    setupEventListeners() {
        // Auth modal events
        document.addEventListener('click', (e) => {
            if (e.target.id === 'show-login-modal') {
                this.showAuthModal('login');
            } else if (e.target.id === 'show-register-modal') {
                this.showAuthModal('register');
            } else if (e.target.id === 'close-auth-modal') {
                this.hideAuthModal();
            } else if (e.target.id === 'show-register') {
                this.switchAuthForm('register');
            } else if (e.target.id === 'show-login') {
                this.switchAuthForm('login');
            } else if (e.target.id === 'forgot-password') {
                this.switchAuthForm('forgot');
            } else if (e.target.id === 'back-to-login') {
                this.switchAuthForm('login');
            }
        });

        // Form submissions
        document.getElementById('login-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin(e);
        });

        document.getElementById('register-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleRegister(e);
        });

        document.getElementById('forgot-password-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleForgotPassword(e);
        });

        // User menu events
        document.addEventListener('click', (e) => {
            const userMenuButton = document.getElementById('user-menu-button');
            const userDropdown = document.getElementById('user-dropdown');
            
            if (e.target.closest('#user-menu-button')) {
                userDropdown?.classList.toggle('hidden');
            } else if (!e.target.closest('#user-dropdown')) {
                userDropdown?.classList.add('hidden');
            }

            if (e.target.id === 'logout') {
                this.logout();
            } else if (e.target.id === 'upgrade-plan') {
                this.showPlansModal();
            }
        });

        // Plans modal events
        document.getElementById('close-plans-modal')?.addEventListener('click', () => {
            this.hidePlansModal();
        });
    }

    showAuthModal(type = 'login') {
        const modal = document.getElementById('auth-modal');
        modal.classList.remove('hidden');
        this.switchAuthForm(type);
    }

    hideAuthModal() {
        const modal = document.getElementById('auth-modal');
        modal.classList.add('hidden');
    }

    switchAuthForm(type) {
        const loginForm = document.getElementById('login-form');
        const registerForm = document.getElementById('register-form');
        const forgotForm = document.getElementById('forgot-password-form');
        const title = document.getElementById('auth-modal-title');
        const loginToggle = document.getElementById('login-toggle');
        const registerToggle = document.getElementById('register-toggle');
        const forgotToggle = document.getElementById('forgot-toggle');

        // Hide all forms and toggles
        [loginForm, registerForm, forgotForm].forEach(form => form?.classList.add('hidden'));
        [loginToggle, registerToggle, forgotToggle].forEach(toggle => toggle?.classList.add('hidden'));

        switch (type) {
            case 'login':
                loginForm?.classList.remove('hidden');
                loginToggle?.classList.remove('hidden');
                title.textContent = 'Entrar';
                break;
            case 'register':
                registerForm?.classList.remove('hidden');
                registerToggle?.classList.remove('hidden');
                title.textContent = 'Criar Conta';
                break;
            case 'forgot':
                forgotForm?.classList.remove('hidden');
                forgotToggle?.classList.remove('hidden');
                title.textContent = 'Recuperar Senha';
                break;
        }
    }

    async handleLogin(event) {
        const formData = new FormData(event.target);
        const email = formData.get('email') || document.getElementById('login-email').value;
        const password = formData.get('password') || document.getElementById('login-password').value;
        const rememberMe = document.getElementById('remember-me').checked;

        try {
            const response = await fetch(`${this.apiBaseUrl}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password, rememberMe })
            });

            const data = await response.json();

            if (response.ok) {
                this.authToken = data.token;
                this.currentUser = data.user;
                
                localStorage.setItem('auth_token', this.authToken);
                if (rememberMe) {
                    localStorage.setItem('remember_user', 'true');
                }

                this.hideAuthModal();
                this.updateUI();
                this.showNotification('Login realizado com sucesso!', 'success');
            } else {
                this.showNotification(data.message || 'Erro no login', 'error');
            }
        } catch (error) {
            console.error('Erro no login:', error);
            this.showNotification('Erro de conexão. Tente novamente.', 'error');
        }
    }

    async handleRegister(event) {
        const form = event.target;
        const password = document.getElementById('register-password').value;
        const confirmPassword = document.getElementById('register-confirm-password').value;

        if (password !== confirmPassword) {
            this.showNotification('As senhas não coincidem', 'error');
            return;
        }

        if (!this.validatePassword(password)) {
            this.showNotification('Senha deve ter pelo menos 8 caracteres, 1 maiúscula e 1 número', 'error');
            return;
        }

        const userData = {
            name: document.getElementById('register-name').value,
            lastname: document.getElementById('register-lastname').value,
            email: document.getElementById('register-email').value,
            phone: document.getElementById('register-phone').value,
            password: password,
            location: document.getElementById('register-location').value,
            bike: document.getElementById('register-bike').value,
            newsletter: document.getElementById('newsletter').checked,
            plan: 'FREE'
        };

        try {
            const response = await fetch(`${this.apiBaseUrl}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });

            const data = await response.json();

            if (response.ok) {
                this.showNotification('Conta criada com sucesso! Verifique seu email.', 'success');
                this.switchAuthForm('login');
                document.getElementById('login-email').value = userData.email;
            } else {
                this.showNotification(data.message || 'Erro ao criar conta', 'error');
            }
        } catch (error) {
            console.error('Erro no registro:', error);
            this.showNotification('Erro de conexão. Tente novamente.', 'error');
        }
    }

    async handleForgotPassword(event) {
        const email = document.getElementById('forgot-email').value;

        try {
            const response = await fetch(`${this.apiBaseUrl}/auth/forgot-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email })
            });

            const data = await response.json();

            if (response.ok) {
                this.showNotification('Link de recuperação enviado para seu email!', 'success');
                this.switchAuthForm('login');
            } else {
                this.showNotification(data.message || 'Erro ao enviar email', 'error');
            }
        } catch (error) {
            console.error('Erro ao recuperar senha:', error);
            this.showNotification('Erro de conexão. Tente novamente.', 'error');
        }
    }

    validatePassword(password) {
        const minLength = password.length >= 8;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasNumber = /\d/.test(password);
        
        return minLength && hasUpperCase && hasNumber;
    }

    logout() {
        this.currentUser = null;
        this.authToken = null;
        localStorage.removeItem('auth_token');
        localStorage.removeItem('remember_user');
        this.updateUI();
        this.showNotification('Logout realizado com sucesso!', 'success');
    }

    updateUI() {
        const authButtons = document.querySelectorAll('[id*="login"], [id*="register"]');
        const userInterface = document.getElementById('user-interface');
        
        if (this.currentUser) {
            // Hide auth buttons
            authButtons.forEach(btn => btn.style.display = 'none');
            
            // Show user interface
            userInterface?.classList.remove('hidden');
            
            // Update user info
            document.getElementById('user-name').textContent = this.currentUser.name;
            document.getElementById('dropdown-name').textContent = `${this.currentUser.name} ${this.currentUser.lastname}`;
            document.getElementById('dropdown-email').textContent = this.currentUser.email;
            document.getElementById('dropdown-plan').textContent = this.userPlans[this.currentUser.plan]?.name || 'Free';
            
            // Update generation limits
            this.updateGenerationLimits();
            
            // Enable premium features if applicable
            this.updateFeatureAccess();
            
        } else {
            // Show auth buttons
            authButtons.forEach(btn => btn.style.display = 'block');
            
            // Hide user interface
            userInterface?.classList.add('hidden');
            
            // Reset to free tier limitations
            this.resetToFreeAccess();
        }
    }

    updateGenerationLimits() {
        const plan = this.userPlans[this.currentUser?.plan || 'FREE'];
        const used = this.currentUser?.monthlyGenerationsUsed || 0;
        const limit = plan.monthlyGenerations;
        
        // Update UI with generation count
        const generationCounter = document.createElement('div');
        generationCounter.id = 'generation-counter';
        generationCounter.className = 'text-sm text-gray-400 mt-2';
        generationCounter.innerHTML = limit === -1 
            ? `<i class="fas fa-infinity text-gold-primary mr-1"></i>Gerações ilimitadas`
            : `${used}/${limit} gerações este mês`;
            
        // Add to header if not exists
        const header = document.querySelector('header nav');
        if (header && !document.getElementById('generation-counter')) {
            header.appendChild(generationCounter);
        }
    }

    updateFeatureAccess() {
        const plan = this.userPlans[this.currentUser?.plan || 'FREE'];
        const features = plan.features;
        
        // Enable/disable features based on plan
        this.toggleFeature('exportacao_pdf', features.includes('exportacao_pdf'));
        this.toggleFeature('roteiros_avancados', features.includes('roteiros_avancados'));
        this.toggleFeature('analytics', features.includes('analytics'));
        this.toggleFeature('api_access', features.includes('api_access'));
    }

    toggleFeature(feature, enabled) {
        const elements = document.querySelectorAll(`[data-feature="${feature}"]`);
        elements.forEach(element => {
            if (enabled) {
                element.classList.remove('disabled');
                element.removeAttribute('disabled');
            } else {
                element.classList.add('disabled');
                element.setAttribute('disabled', 'true');
            }
        });
    }

    resetToFreeAccess() {
        // Disable all premium features
        Object.keys(this.userPlans.PREMIUM.features).forEach(feature => {
            this.toggleFeature(feature, false);
        });
        
        // Remove generation counter
        document.getElementById('generation-counter')?.remove();
    }

    showPlansModal() {
        const modal = document.getElementById('plans-modal');
        modal.classList.remove('hidden');
        this.renderPlans();
    }

    hidePlansModal() {
        const modal = document.getElementById('plans-modal');
        modal.classList.add('hidden');
    }

    renderPlans() {
        const grid = document.getElementById('plans-grid');
        const isYearly = document.getElementById('yearly-billing').classList.contains('bg-gold-primary');
        
        grid.innerHTML = Object.entries(this.userPlans).map(([key, plan]) => {
            const price = isYearly ? (plan.price * 12 * 0.8).toFixed(2) : plan.price.toFixed(2);
            const period = isYearly ? '/ano' : '/mês';
            const isCurrentPlan = this.currentUser?.plan === key;
            const isPopular = key === 'PREMIUM';
            
            return `
                <div class="plan-card relative bg-gray-800 rounded-lg p-6 ${isPopular ? 'ring-2 ring-gold-primary' : ''} ${isCurrentPlan ? 'opacity-75' : ''}">
                    ${isPopular ? '<div class="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gold-primary text-black px-4 py-1 rounded-full text-sm font-bold">Mais Popular</div>' : ''}
                    
                    <div class="text-center">
                        <h3 class="text-xl font-bold text-white mb-2">${plan.name}</h3>
                        <div class="mb-4">
                            <span class="text-3xl font-bold text-white">R$ ${price}</span>
                            <span class="text-gray-400">${period}</span>
                        </div>
                        <div class="text-sm text-gray-400 mb-6">
                            ${plan.monthlyGenerations === -1 ? 'Gerações ilimitadas' : `${plan.monthlyGenerations} gerações/mês`}
                        </div>
                    </div>
                    
                    <ul class="space-y-3 text-sm mb-6">
                        ${plan.features.map(feature => `
                            <li class="flex items-center text-gray-300">
                                <i class="fas fa-check text-green-400 mr-3"></i>
                                ${this.getFeatureName(feature)}
                            </li>
                        `).join('')}
                    </ul>
                    
                    <button 
                        class="w-full ${isCurrentPlan ? 'bg-gray-600 cursor-not-allowed' : 'btn-primary'} ${isPopular && !isCurrentPlan ? 'bg-gold-primary hover:bg-gold-secondary' : ''}"
                        ${isCurrentPlan ? 'disabled' : ''}
                        onclick="authManager.selectPlan('${key}')">
                        ${isCurrentPlan ? 'Plano Atual' : 'Selecionar Plano'}
                    </button>
                </div>
            `;
        }).join('');
    }

    getFeatureName(feature) {
        const names = {
            'roteiros_basicos': 'Roteiros básicos',
            'destinos_limitados': 'Destinos selecionados',
            'roteiros_avancados': 'Roteiros avançados com IA',
            'todos_destinos': 'Todos os destinos do Brasil',
            'exportacao_pdf': 'Exportação para PDF',
            'suporte_prioritario': 'Suporte prioritário',
            'roteiros_personalizados': 'Roteiros 100% personalizados',
            'api_access': 'Acesso à API',
            'analytics': 'Analytics detalhados',
            'white_label': 'White label disponível',
            'suporte_24h': 'Suporte 24/7',
            'custom_integration': 'Integração customizada',
            'dedicated_support': 'Suporte dedicado',
            'custom_prompts': 'Prompts customizados',
            'multi_tenant': 'Multi-tenant'
        };
        
        return names[feature] || feature;
    }

    async selectPlan(planKey) {
        if (!this.currentUser) {
            this.showAuthModal('register');
            return;
        }

        // Redirect to payment processing
        const plan = this.userPlans[planKey];
        const checkoutData = {
            planKey,
            planName: plan.name,
            price: plan.price,
            userId: this.currentUser.id,
            features: plan.features
        };

        try {
            const response = await fetch(`${this.apiBaseUrl}/billing/create-checkout`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.authToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(checkoutData)
            });

            const data = await response.json();

            if (response.ok) {
                // Redirect to payment processor
                window.location.href = data.checkoutUrl;
            } else {
                this.showNotification(data.message || 'Erro ao processar pagamento', 'error');
            }
        } catch (error) {
            console.error('Erro ao criar checkout:', error);
            this.showNotification('Erro de conexão. Tente novamente.', 'error');
        }
    }

    showNotification(message, type = 'info') {
        // Use the existing notification system
        if (window.GeradorRoles?.showNotification) {
            window.GeradorRoles.showNotification(message, type);
        } else {
            alert(message);
        }
    }
}

// Initialize Auth Manager
const authManager = new AuthManager();

// Export for global access
window.authManager = authManager;

console.log('✅ Sistema de Autenticação carregado');