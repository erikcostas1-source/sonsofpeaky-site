/**
 * SONS OF PEAKY - APLICAÇÃO PRINCIPAL REVOLUCIONÁRIA
 * Sistema modular de alto desempenho com funcionalidades inovadoras
 */

class SOPApp {
    constructor() {
        this.modules = new Map();
        this.config = {
            apiEndpoints: {
                gemini: window.SOP_CONFIG?.textUrl || this.getGeminiEndpoint(),
                backup: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=AIzaSyCiHRVozYYmHB-5W64QdJzn9dQYAyRl9Tk'
            },
            performance: {
                lazyLoadOffset: 100,
                debounceDelay: 300,
                animationDuration: 250
            },
            features: {
                offlineMode: true,
                analytics: true,
                darkMode: true,
                animations: !window.matchMedia('(prefers-reduced-motion: reduce)').matches
            }
        };
        
        this.state = {
            isLoaded: false,
            currentSection: 'hero',
            userPreferences: this.loadUserPreferences(),
            connectionStatus: navigator.onLine
        };
        
        this.init();
    }
    
    async init() {
        console.log('🚀 Inicializando Sons of Peaky App...');
        
        try {
            // Registrar service worker primeiro
            await this.registerServiceWorker();
            
            // Configurar módulos principais
            await this.setupModules();
            
            // Configurar event listeners
            this.setupEventListeners();
            
            // Configurar observadores de performance
            this.setupPerformanceObservers();
            
            // Carregar conteúdo dinâmico
            await this.loadDynamicContent();
            
            // Configurar PWA features
            this.setupPWAFeatures();
            
            // Remover loading screen
            this.hideLoadingScreen();
            
            this.state.isLoaded = true;
            console.log('✅ Sons of Peaky App carregado com sucesso!');
            
        } catch (error) {
            console.error('❌ Erro ao inicializar aplicação:', error);
            this.handleInitError(error);
        }
    }
    
    getGeminiEndpoint() {
        // Usar a configuração do SOP_CONFIG ou fallback para nova API
        return window.SOP_CONFIG?.textUrl || 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=AIzaSyCiHRVozYYmHB-5W64QdJzn9dQYAyRl9Tk';
    }
    
    async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/sw.js');
                console.log('🔧 Service Worker registrado:', registration.scope);
                
                // Escutar atualizações
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            this.showUpdateNotification();
                        }
                    });
                });
                
            } catch (error) {
                console.warn('Service Worker falhou:', error);
            }
        }
    }
    
    async setupModules() {
        // Módulo de Navegação
        this.modules.set('navigation', new NavigationModule(this));
        
        // Módulo de Seções Dinâmicas
        this.modules.set('sections', new SectionsModule(this));
        
        // Módulo de Performance
        this.modules.set('performance', new PerformanceModule(this));
        
        // Módulo de Analytics
        if (this.config.features.analytics) {
            this.modules.set('analytics', new AnalyticsModule(this));
        }
        
        // Módulo de Geração de Conteúdo IA
        this.modules.set('contentGenerator', new ContentGeneratorModule(this));
        
        console.log(`📦 ${this.modules.size} módulos configurados`);
    }
    
    setupEventListeners() {
        // Scroll performance otimizado
        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    this.handleScroll();
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });
        
        // Resize otimizado
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.handleResize();
            }, this.config.performance.debounceDelay);
        });
        
        // Visibilidade da página
        document.addEventListener('visibilitychange', () => {
            this.handleVisibilityChange();
        });
        
        // Status de conexão
        window.addEventListener('online', () => this.handleConnectionChange(true));
        window.addEventListener('offline', () => this.handleConnectionChange(false));
        
        // Atalhos de teclado
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });
    }
    
    setupPerformanceObservers() {
        // Intersection Observer para lazy loading
        if ('IntersectionObserver' in window) {
            this.intersectionObserver = new IntersectionObserver(
                (entries) => this.handleIntersection(entries),
                { 
                    rootMargin: `${this.config.performance.lazyLoadOffset}px`,
                    threshold: [0, 0.25, 0.5, 0.75, 1]
                }
            );
            
            // Observar elementos lazy
            document.querySelectorAll('[data-lazy]').forEach(el => {
                this.intersectionObserver.observe(el);
            });
        }
        
        // Performance Observer para Web Vitals
        if ('PerformanceObserver' in window) {
            this.setupWebVitalsObserver();
        }
    }
    
    setupWebVitalsObserver() {
        try {
            // Observar Largest Contentful Paint
            new PerformanceObserver((entryList) => {
                const entries = entryList.getEntries();
                const lastEntry = entries[entries.length - 1];
                this.trackMetric('LCP', lastEntry.startTime);
            }).observe({ entryTypes: ['largest-contentful-paint'] });
            
            // Observar First Input Delay
            new PerformanceObserver((entryList) => {
                const entries = entryList.getEntries();
                entries.forEach(entry => {
                    this.trackMetric('FID', entry.processingStart - entry.startTime);
                });
            }).observe({ entryTypes: ['first-input'] });
            
            // Observar Cumulative Layout Shift
            new PerformanceObserver((entryList) => {
                let cumulativeScore = 0;
                const entries = entryList.getEntries();
                entries.forEach(entry => {
                    if (!entry.hadRecentInput) {
                        cumulativeScore += entry.value;
                    }
                });
                this.trackMetric('CLS', cumulativeScore);
            }).observe({ entryTypes: ['layout-shift'] });
            
        } catch (error) {
            console.warn('Performance Observer não suportado:', error);
        }
    }
    
    async loadDynamicContent() {
        const sectionsContainer = document.getElementById('sections-container');
        if (!sectionsContainer) return;
        
        // Carregar seções principais
        const sections = await this.getSectionsContent();
        sectionsContainer.innerHTML = sections;
        
        // Configurar lazy loading para imagens
        this.setupLazyImages();
        
        // Aplicar animações de entrada
        if (this.config.features.animations) {
            this.animateElements();
        }
    }
    
    async getSectionsContent() {
        // Conteúdo das seções principais (preservando o conteúdo original mas otimizado)
        return `
            <!-- História Section -->
            <section id="historia" class="section-historia py-20 bg-gradient-to-b from-bg-primary via-bg-secondary to-bg-primary">
                <div class="container mx-auto px-4">
                    <h2 class="section-title text-center mb-16">Como Tudo Começou</h2>
                    
                    <div class="max-w-6xl mx-auto">
                        <!-- Timeline Visual -->
                        <div class="timeline-container relative">
                            <div class="timeline-line absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-gold-primary to-accent-primary"></div>
                            
                            <!-- 2021 - Fundação -->
                            <div class="timeline-item mb-16 flex items-center relative">
                                <div class="timeline-content w-5/12 pr-8 text-right">
                                    <div class="bg-bg-secondary border border-border-primary rounded-xl p-6 hover:border-gold-primary transition-all duration-300">
                                        <h3 class="text-2xl font-bold text-gold-primary mb-4">25 de Maio, 2021</h3>
                                        <h4 class="text-xl font-semibold text-white mb-3">A Ideia Original</h4>
                                        <p class="text-text-secondary">Erik e Ricardo (Brutos) tiveram uma ideia simples mas revolucionária: por que gastar dinheiro em bares quando podemos ter nosso próprio espaço?</p>
                                    </div>
                                </div>
                                
                                <div class="timeline-marker absolute left-1/2 transform -translate-x-1/2 w-6 h-6 bg-gold-primary rounded-full border-4 border-bg-primary z-10"></div>
                                
                                <div class="w-5/12 pl-8">
                                    <img src="assets/img/historia-fundacao.webp" alt="Fundação SOP" class="rounded-xl shadow-lg" data-lazy="true" loading="lazy">
                                </div>
                            </div>
                            
                            <!-- 2021 - Galpão -->
                            <div class="timeline-item mb-16 flex items-center relative">
                                <div class="w-5/12 pr-8">
                                    <img src="assets/img/historia-galpao.webp" alt="Primeiro Galpão" class="rounded-xl shadow-lg" data-lazy="true" loading="lazy">
                                </div>
                                
                                <div class="timeline-marker absolute left-1/2 transform -translate-x-1/2 w-6 h-6 bg-accent-primary rounded-full border-4 border-bg-primary z-10"></div>
                                
                                <div class="timeline-content w-5/12 pl-8">
                                    <div class="bg-bg-secondary border border-border-primary rounded-xl p-6 hover:border-accent-primary transition-all duration-300">
                                        <h3 class="text-2xl font-bold text-accent-primary mb-4">16 de Julho, 2021</h3>
                                        <h4 class="text-xl font-semibold text-white mb-3">O Galpão Vazio</h4>
                                        <p class="text-text-secondary">100m², completamente vazio, sem luz, só poeira cinza. Na Rua José Flavio, Penha. Para muitos, um lugar abandonado. Para eles, a realização de um sonho.</p>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- 2025 - Presente -->
                            <div class="timeline-item flex items-center relative">
                                <div class="timeline-content w-5/12 pr-8 text-right">
                                    <div class="bg-gradient-to-br from-gold-primary/20 to-accent-primary/20 border border-gold-primary rounded-xl p-6">
                                        <h3 class="text-2xl font-bold text-gold-primary mb-4">2025 - Presente</h3>
                                        <h4 class="text-xl font-semibold text-white mb-3">O Movimento Hoje</h4>
                                        <p class="text-text-secondary mb-4">9 membros da Alta Cúpula, 100+ comunidade ativa, equipamentos de última geração e uma família que cresce a cada dia.</p>
                                        <div class="grid grid-cols-3 gap-4 text-center">
                                            <div>
                                                <div class="text-2xl font-bold text-gold-primary">9</div>
                                                <div class="text-xs text-text-muted">Alta Cúpula</div>
                                            </div>
                                            <div>
                                                <div class="text-2xl font-bold text-gold-primary">100+</div>
                                                <div class="text-xs text-text-muted">Comunidade</div>
                                            </div>
                                            <div>
                                                <div class="text-2xl font-bold text-gold-primary">4</div>
                                                <div class="text-xs text-text-muted">Anos</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="timeline-marker absolute left-1/2 transform -translate-x-1/2 w-8 h-8 bg-gradient-to-br from-gold-primary to-accent-primary rounded-full border-4 border-bg-primary z-10 animate-pulse"></div>
                                
                                <div class="w-5/12 pl-8">
                                    <img src="assets/img/historia-presente.webp" alt="SOP Hoje" class="rounded-xl shadow-lg" data-lazy="true" loading="lazy">
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            
            <!-- Irmandade Section -->
            <section id="irmandade" class="section-irmandade py-20">
                <div class="container mx-auto px-4">
                    <h2 class="section-title text-center mb-16">O Caminho para a Irmandade</h2>
                    
                    <div class="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-start">
                        <!-- Conteúdo Principal -->
                        <div class="space-y-8">
                            <div class="prose prose-invert max-w-none">
                                <h3 class="text-gold-primary font-bold text-2xl mb-6">A Jornada da Confiança</h3>
                                <p class="text-lg leading-relaxed text-text-secondary mb-6">
                                    Desde 2021, quando Erik e Brutos transformaram uma ideia simples em realidade, 
                                    a irmandade Sons of Peaky cresceu através da confiança mútua, franqueza e intimidade.
                                </p>
                                <p class="text-lg leading-relaxed text-text-secondary">
                                    Para se tornar um Membro, é necessário um convite formal feito por um Membro da Alta Cúpula. 
                                    Esse convite surge naturalmente, após demonstrar através de suas atitudes que você 
                                    compartilha dos valores que construímos ao longo desta jornada.
                                </p>
                            </div>
                            
                            <!-- Níveis de Participação -->
                            <div class="membership-levels space-y-6">
                                <!-- Frequentadores -->
                                <div class="membership-card bg-bg-secondary border border-border-primary rounded-xl p-6 hover:border-accent-primary transition-all duration-300">
                                    <div class="flex items-center gap-4 mb-4">
                                        <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-2xl">🤝</div>
                                        <div>
                                            <h4 class="text-xl font-bold text-white">Frequentadores</h4>
                                            <p class="text-sm text-text-muted">Entrada livre, coração aberto</p>
                                        </div>
                                    </div>
                                    <p class="text-text-secondary mb-4">O frequentador é sempre bem-vindo para compartilhar a energia do galpão, respeitando o estatuto e a boa vizinhança.</p>
                                    <div class="grid sm:grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span class="text-accent-primary font-semibold">Vantagens:</span>
                                            <p class="text-text-secondary">Acesso ao galpão, convivência com a irmandade</p>
                                        </div>
                                        <div>
                                            <span class="text-accent-primary font-semibold">Contribuição:</span>
                                            <p class="text-text-secondary">Respeito às regras, consumo via Pix</p>
                                        </div>
                                    </div>
                                </div>
                                
                                <!-- Membros -->
                                <div class="membership-card bg-bg-secondary border border-border-primary rounded-xl p-6 hover:border-gold-primary transition-all duration-300">
                                    <div class="flex items-center gap-4 mb-4">
                                        <div class="w-12 h-12 bg-gradient-to-br from-gold-primary to-gold-light rounded-full flex items-center justify-center text-2xl">🏍️</div>
                                        <div>
                                            <h4 class="text-xl font-bold text-white">Membros</h4>
                                            <p class="text-sm text-text-muted">Família estendida</p>
                                        </div>
                                    </div>
                                    <p class="text-text-secondary mb-4">O Membro é parte do nosso círculo interno, uma família estendida com voz ativa e responsabilidades.</p>
                                    <div class="grid sm:grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span class="text-gold-primary font-semibold">Vantagens:</span>
                                            <p class="text-text-secondary">Voz ativa, propor membros, acesso prioritário</p>
                                        </div>
                                        <div>
                                            <span class="text-gold-primary font-semibold">Contribuição:</span>
                                            <p class="text-text-secondary">R$ 100,00/mês + organização</p>
                                        </div>
                                    </div>
                                </div>
                                
                                <!-- Alta Cúpula -->
                                <div class="membership-card bg-gradient-to-br from-gold-primary/20 to-accent-primary/20 border border-gold-primary rounded-xl p-6">
                                    <div class="flex items-center gap-4 mb-4">
                                        <div class="w-12 h-12 bg-gradient-to-br from-gold-primary to-accent-primary rounded-full flex items-center justify-center text-2xl">👑</div>
                                        <div>
                                            <h4 class="text-xl font-bold text-gold-light">Membros da Alta Cúpula</h4>
                                            <p class="text-sm text-gold-light/80">Pilar da irmandade</p>
                                        </div>
                                    </div>
                                    <p class="text-gold-light/90 mb-4">A Alta Cúpula é o pilar da irmandade. Sua posição não é de poder, mas de referência e responsabilidade.</p>
                                    <div class="grid sm:grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span class="text-gold-light font-semibold">Vantagens:</span>
                                            <p class="text-gold-light/80">Liderança, decisão final, acesso total</p>
                                        </div>
                                        <div>
                                            <span class="text-gold-light font-semibold">Contribuição:</span>
                                            <p class="text-gold-light/80">R$ 250,00/mês + zeladoria</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Call to Action Sidebar -->
                        <div class="lg:sticky lg:top-32">
                            <div class="cta-sidebar bg-gradient-to-br from-bg-secondary to-bg-tertiary border border-gold-primary rounded-xl p-8 text-center shadow-xl">
                                <h3 class="text-2xl font-bold text-gold-primary mb-6">Junte-se à Irmandade</h3>
                                <p class="text-text-secondary mb-8">
                                    Interessado em fazer parte da família Sons of Peaky? 
                                    Conheça nossos valores e comece sua jornada.
                                </p>
                                
                                <div class="space-y-4 mb-8">
                                    <a href="#estatutos" class="block w-full py-4 px-6 bg-gold-primary hover:bg-gold-light text-bg-primary font-bold rounded-lg transition-all duration-300 hover:scale-105">
                                        📋 Ver Estatutos
                                    </a>
                                    <button onclick="window.sopAI?.sendCustomMessage('Como posso me tornar membro do Sons of Peaky?', {autoOpen: true})" class="w-full py-4 px-6 bg-accent-primary hover:bg-accent-hover text-bg-primary font-bold rounded-lg transition-all duration-300">
                                        🤖 Perguntar à IA
                                    </button>
                                    <a href="#contato" class="block w-full py-4 px-6 bg-transparent border-2 border-accent-primary hover:bg-accent-primary text-accent-primary hover:text-bg-primary font-bold rounded-lg transition-all duration-300">
                                        📱 Entrar em Contato
                                    </a>
                                </div>
                                
                                <div class="text-xs text-text-muted border-t border-border-primary pt-6">
                                    O convite para ser membro é feito por um Membro da Alta Cúpula após frequentar o galpão e demonstrar alinhamento com nossos valores.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            
            <!-- Mais seções seriam adicionadas aqui... -->
        `;
    }
    
    setupLazyImages() {
        const lazyImages = document.querySelectorAll('img[data-lazy]');
        
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        
                        // Criar placeholder se não existir
                        if (!img.dataset.loaded) {
                            this.createImagePlaceholder(img);
                        }
                        
                        // Carregar imagem
                        const tempImg = new Image();
                        tempImg.onload = () => {
                            img.src = tempImg.src;
                            img.classList.add('loaded');
                            img.dataset.loaded = 'true';
                        };
                        tempImg.src = img.dataset.src || img.src;
                        
                        imageObserver.unobserve(img);
                    }
                });
            });
            
            lazyImages.forEach(img => imageObserver.observe(img));
        }
    }
    
    createImagePlaceholder(img) {
        const placeholder = document.createElement('div');
        placeholder.className = 'image-placeholder';
        placeholder.style.cssText = `
            width: ${img.width || 300}px;
            height: ${img.height || 200}px;
            background: linear-gradient(90deg, var(--bg-secondary) 0%, var(--bg-tertiary) 50%, var(--bg-secondary) 100%);
            background-size: 200% 100%;
            animation: shimmer 1.5s infinite;
            border-radius: 0.75rem;
        `;
        
        img.parentNode.insertBefore(placeholder, img);
        
        // Remover placeholder quando imagem carregar
        img.addEventListener('load', () => {
            if (placeholder.parentNode) {
                placeholder.remove();
            }
        });
    }
    
    animateElements() {
        const animateOnScroll = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, { threshold: 0.1 });
        
        // Animar elementos com classe especial
        document.querySelectorAll('.animate-on-scroll').forEach(el => {
            animateOnScroll.observe(el);
        });
    }
    
    setupPWAFeatures() {
        // Install prompt
        let deferredPrompt;
        
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            this.showInstallPrompt();
        });
        
        window.addEventListener('appinstalled', () => {
            console.log('PWA instalado com sucesso!');
            this.trackEvent('pwa_installed');
        });
    }
    
    showInstallPrompt() {
        // Criar botão de instalação discreto
        const installButton = document.createElement('button');
        installButton.innerHTML = '📱 Instalar App';
        installButton.className = 'install-prompt fixed bottom-20 right-4 bg-accent-primary text-bg-primary px-4 py-2 rounded-lg shadow-lg z-50 transition-all duration-300 hover:scale-105';
        
        installButton.addEventListener('click', async () => {
            if (deferredPrompt) {
                deferredPrompt.prompt();
                const { outcome } = await deferredPrompt.userChoice;
                
                if (outcome === 'accepted') {
                    console.log('Usuário aceitou instalar');
                } else {
                    console.log('Usuário rejeitou instalar');
                }
                
                deferredPrompt = null;
                installButton.remove();
            }
        });
        
        document.body.appendChild(installButton);
        
        // Remover após 10 segundos se não clicado
        setTimeout(() => {
            if (installButton.parentNode) {
                installButton.remove();
            }
        }, 10000);
    }
    
    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.style.opacity = '0';
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 300);
        }
    }
    
    handleScroll() {
        const scrollY = window.scrollY;
        
        // Update header on scroll
        const header = document.getElementById('header');
        if (header) {
            if (scrollY > 100) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }
        
        // Update active navigation
        this.updateActiveNavigation();
        
        // Parallax effects
        this.handleParallax(scrollY);
    }
    
    updateActiveNavigation() {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-link');
        
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
        
        this.state.currentSection = current;
    }
    
    handleParallax(scrollY) {
        // Parallax sutil para elementos específicos
        const parallaxElements = document.querySelectorAll('[data-parallax]');
        
        parallaxElements.forEach(element => {
            const speed = parseFloat(element.dataset.parallax) || 0.5;
            const yPos = -(scrollY * speed);
            element.style.transform = `translateY(${yPos}px)`;
        });
    }
    
    handleResize() {
        // Ajustar layouts responsivos
        this.updateResponsiveLayouts();
        
        // Recalcular elementos fixos
        this.recalculateFixedElements();
    }
    
    handleVisibilityChange() {
        if (document.hidden) {
            // Página não visível - pausar animações pesadas
            this.pauseNonEssentialAnimations();
        } else {
            // Página visível - retomar animações
            this.resumeAnimations();
        }
    }
    
    handleConnectionChange(isOnline) {
        this.state.connectionStatus = isOnline;
        
        if (isOnline) {
            this.showNotification('Conexão restaurada! 🔄', 'success');
            this.syncOfflineData();
        } else {
            this.showNotification('Modo offline ativado 📴', 'warning');
        }
    }
    
    handleKeyboardShortcuts(e) {
        // Atalhos apenas com modificadores para evitar conflitos
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case '/':
                    e.preventDefault();
                    document.getElementById('ai-chat-input')?.focus();
                    break;
                case 'h':
                    e.preventDefault();
                    document.getElementById('hero')?.scrollIntoView({ behavior: 'smooth' });
                    break;
            }
        }
    }
    
    trackMetric(name, value) {
        if (this.modules.has('analytics')) {
            this.modules.get('analytics').trackMetric(name, value);
        }
    }
    
    trackEvent(eventName, eventData = {}) {
        if (this.modules.has('analytics')) {
            this.modules.get('analytics').trackEvent(eventName, eventData);
        }
    }
    
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type} fixed top-20 right-4 bg-bg-secondary border border-border-primary rounded-lg p-4 shadow-xl z-50 transform translate-x-full transition-transform duration-300`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Mostrar
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Esconder
        setTimeout(() => {
            notification.style.transform = 'translateX(full)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }, 3000);
    }
    
    loadUserPreferences() {
        try {
            return JSON.parse(localStorage.getItem('sop_preferences') || '{}');
        } catch {
            return {};
        }
    }
    
    saveUserPreferences() {
        try {
            localStorage.setItem('sop_preferences', JSON.stringify(this.state.userPreferences));
        } catch (error) {
            console.warn('Não foi possível salvar preferências:', error);
        }
    }
    
    handleInitError(error) {
        console.error('Erro crítico na inicialização:', error);
        
        // Mostrar mensagem de erro amigável
        const errorDiv = document.createElement('div');
        errorDiv.innerHTML = `
            <div class="error-fallback fixed inset-0 bg-bg-primary flex items-center justify-center z-50">
                <div class="text-center max-w-md mx-auto p-8">
                    <h2 class="text-2xl font-bold text-error mb-4">Ops! 😅</h2>
                    <p class="text-text-secondary mb-6">Algo deu errado ao carregar o site. Mas não se preocupe!</p>
                    <button onclick="window.location.reload()" class="bg-accent-primary text-bg-primary px-6 py-3 rounded-lg font-bold hover:bg-accent-hover transition-colors">
                        🔄 Tentar Novamente
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(errorDiv);
    }
}

// Módulos auxiliares simplificados
class NavigationModule {
    constructor(app) {
        this.app = app;
        this.setupNavigation();
    }
    
    setupNavigation() {
        // Menu mobile
        const mobileToggle = document.getElementById('mobile-menu-toggle');
        const mobileMenu = document.getElementById('mobile-menu');
        
        if (mobileToggle && mobileMenu) {
            mobileToggle.addEventListener('click', () => {
                const isOpen = mobileMenu.classList.contains('show');
                
                if (isOpen) {
                    mobileMenu.classList.remove('show');
                    mobileToggle.classList.remove('active');
                } else {
                    mobileMenu.classList.add('show');
                    mobileToggle.classList.add('active');
                }
                
                mobileToggle.setAttribute('aria-expanded', !isOpen);
            });
        }
        
        // Smooth scroll para links internos
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a[href^="#"]');
            if (link) {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                const target = document.getElementById(targetId);
                
                if (target) {
                    target.scrollIntoView({ 
                        behavior: 'smooth',
                        block: 'start'
                    });
                    
                    // Fechar menu mobile se aberto
                    if (mobileMenu && mobileMenu.classList.contains('show')) {
                        mobileMenu.classList.remove('show');
                        mobileToggle.classList.remove('active');
                    }
                }
            }
        });
    }
}

class SectionsModule {
    constructor(app) {
        this.app = app;
    }
}

class PerformanceModule {
    constructor(app) {
        this.app = app;
        this.metrics = {};
    }
    
    trackMetric(name, value) {
        this.metrics[name] = value;
        console.log(`📊 ${name}: ${value}ms`);
    }
}

class AnalyticsModule {
    constructor(app) {
        this.app = app;
        this.events = [];
    }
    
    trackEvent(name, data) {
        const event = {
            name,
            data,
            timestamp: Date.now(),
            url: location.pathname
        };
        
        this.events.push(event);
        console.log('📈 Event:', event);
        
        // Manter apenas os últimos 100 eventos
        if (this.events.length > 100) {
            this.events.splice(0, this.events.length - 100);
        }
    }
    
    trackMetric(name, value) {
        this.trackEvent('performance_metric', { metric: name, value });
    }
}

class ContentGeneratorModule {
    constructor(app) {
        this.app = app;
    }
}

// Inicializar aplicação quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    window.sopApp = new SOPApp();
});

// CSS adicional para animações
const additionalCSS = `
<style>
@keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
}

.animate-on-scroll {
    opacity: 0;
    transform: translateY(30px);
    transition: all 0.6s ease;
}

.animate-on-scroll.animate-in {
    opacity: 1;
    transform: translateY(0);
}

.timeline-item {
    opacity: 0;
    transform: translateY(20px);
    animation: fadeInUp 0.6s ease forwards;
}

.timeline-item:nth-child(1) { animation-delay: 0.1s; }
.timeline-item:nth-child(2) { animation-delay: 0.2s; }
.timeline-item:nth-child(3) { animation-delay: 0.3s; }

.membership-card {
    transform: translateY(10px);
    opacity: 0;
    animation: slideInUp 0.5s ease forwards;
}

.membership-card:nth-child(1) { animation-delay: 0.1s; }
.membership-card:nth-child(2) { animation-delay: 0.2s; }
.membership-card:nth-child(3) { animation-delay: 0.3s; }

@keyframes slideInUp {
    to {
        transform: translateY(0);
        opacity: 1;
    }
}

@media (max-width: 1024px) {
    .timeline-item {
        flex-direction: column;
        text-align: center;
    }
    
    .timeline-content {
        width: 100% !important;
        padding: 0 !important;
        text-align: center !important;
        margin-bottom: 1rem;
    }
    
    .timeline-line {
        display: none;
    }
}
</style>
`;

document.head.insertAdjacentHTML('beforeend', additionalCSS);