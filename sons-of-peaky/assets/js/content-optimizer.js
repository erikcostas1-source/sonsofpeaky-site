import { SOPConfig } from './config.js';

class SOPContentOptimizer {
    constructor() {
        this.config = SOPConfig;
        this.navigationState = {
            currentSection: 'home',
            previousSection: null,
            navigationHistory: [],
            userPath: []
        };
        
        this.contentStructure = this.defineContentStructure();
        this.init();
    }

    init() {
        this.setupIntelligentNavigation();
        this.optimizeContentFlow();
        this.implementPersonalization();
        this.setupUserExperienceTracking();
        this.createAdaptiveInterface();
        this.initializeContentReorganization();
    }

    defineContentStructure() {
        return {
            priority: [
                {
                    id: 'hero',
                    weight: 10,
                    userTypes: ['all'],
                    engagement: 'critical',
                    loadOrder: 1
                },
                {
                    id: 'ia-assistant',
                    weight: 9,
                    userTypes: ['new-visitor', 'returning-user'],
                    engagement: 'high',
                    loadOrder: 2
                },
                {
                    id: 'gerador-role',
                    weight: 9,
                    userTypes: ['active-user', 'motorcycle-enthusiast'],
                    engagement: 'high',
                    loadOrder: 2
                },
                {
                    id: 'historia',
                    weight: 7,
                    userTypes: ['new-visitor'],
                    engagement: 'medium',
                    loadOrder: 3
                },
                {
                    id: 'irmandade',
                    weight: 8,
                    userTypes: ['interested-member'],
                    engagement: 'high',
                    loadOrder: 3
                },
                {
                    id: 'agenda',
                    weight: 8,
                    userTypes: ['active-user', 'event-interested'],
                    engagement: 'high',
                    loadOrder: 4
                },
                {
                    id: 'missao',
                    weight: 6,
                    userTypes: ['potential-member'],
                    engagement: 'medium',
                    loadOrder: 5
                },
                {
                    id: 'ferramentas',
                    weight: 7,
                    userTypes: ['active-user'],
                    engagement: 'medium',
                    loadOrder: 6
                }
            ],

            sections: {
                'hero': {
                    title: 'Sons of Peaky',
                    subtitle: 'Irmandade de Motociclistas',
                    cta: 'Descubra Nossa História',
                    nextSuggested: ['ia-assistant', 'historia'],
                    keyMessages: ['irmandade', 'tradição', 'paixão']
                },
                'ia-assistant': {
                    title: 'IA Assistant',
                    subtitle: 'Seu companheiro inteligente',
                    cta: 'Conversar com IA',
                    nextSuggested: ['gerador-role', 'agenda'],
                    keyMessages: ['inteligência', 'personalização', 'suporte']
                },
                'gerador-role': {
                    title: 'Gerador de Rolês',
                    subtitle: 'IA para rotas perfeitas',
                    cta: 'Gerar Rolê Agora',
                    nextSuggested: ['agenda', 'ferramentas'],
                    keyMessages: ['aventura', 'personalização', 'tecnologia']
                },
                'historia': {
                    title: 'Nossa História',
                    subtitle: 'Desde 2021 construindo tradição',
                    cta: 'Conheça a Irmandade',
                    nextSuggested: ['irmandade', 'missao'],
                    keyMessages: ['origem', 'evolução', 'valores']
                },
                'irmandade': {
                    title: 'A Irmandade',
                    subtitle: 'Conheça nossa família',
                    cta: 'Fazer Parte',
                    nextSuggested: ['agenda', 'missao'],
                    keyMessages: ['família', 'união', 'respeito']
                },
                'agenda': {
                    title: 'Eventos & Rolês',
                    subtitle: 'Próximas aventuras',
                    cta: 'Ver Agenda Completa',
                    nextSuggested: ['gerador-role', 'ferramentas'],
                    keyMessages: ['eventos', 'comunidade', 'diversão']
                },
                'missao': {
                    title: 'Nossa Missão',
                    subtitle: 'Valores que nos guiam',
                    cta: 'Saiba Mais',
                    nextSuggested: ['irmandade', 'agenda'],
                    keyMessages: ['propósito', 'valores', 'compromisso']
                },
                'ferramentas': {
                    title: 'Ferramentas',
                    subtitle: 'Utilitários para motociclistas',
                    cta: 'Explorar Ferramentas',
                    nextSuggested: ['gerador-role', 'agenda'],
                    keyMessages: ['utilidade', 'praticidade', 'tecnologia']
                }
            }
        };
    }

    setupIntelligentNavigation() {
        // Smart menu that adapts based on user behavior
        const smartMenu = document.querySelector('.nav-menu') || this.createSmartMenu();
        
        // Track user preferences
        this.trackUserBehavior();
        
        // Dynamic menu reordering
        this.reorderMenuBasedOnUsage();
        
        // Contextual navigation suggestions
        this.setupContextualSuggestions();
        
        // Breadcrumb navigation
        this.setupBreadcrumbs();
    }

    createSmartMenu() {
        const nav = document.querySelector('nav') || document.createElement('nav');
        nav.className = 'smart-navigation';
        nav.innerHTML = `
            <div class="nav-container">
                <div class="nav-brand">
                    <img src="assets/img/SOP_LOGO_HEADER.svg" alt="Sons of Peaky" class="nav-logo">
                </div>
                
                <div class="nav-menu adaptive-menu" id="adaptiveMenu">
                    <a href="#hero" class="nav-item priority-high" data-section="hero">
                        <i class="icon-home"></i>
                        <span>Início</span>
                    </a>
                    <a href="#ia-assistant" class="nav-item priority-high" data-section="ia-assistant">
                        <i class="icon-ai"></i>
                        <span>IA Assistant</span>
                    </a>
                    <a href="#gerador-role" class="nav-item priority-high" data-section="gerador-role">
                        <i class="icon-route"></i>
                        <span>Gerar Rolê</span>
                    </a>
                    <a href="#historia" class="nav-item priority-medium" data-section="historia">
                        <i class="icon-history"></i>
                        <span>História</span>
                    </a>
                    <a href="#irmandade" class="nav-item priority-high" data-section="irmandade">
                        <i class="icon-users"></i>
                        <span>Irmandade</span>
                    </a>
                    <a href="#agenda" class="nav-item priority-high" data-section="agenda">
                        <i class="icon-calendar"></i>
                        <span>Eventos</span>
                    </a>
                    <a href="#missao" class="nav-item priority-medium" data-section="missao">
                        <i class="icon-target"></i>
                        <span>Missão</span>
                    </a>
                    <a href="#ferramentas" class="nav-item priority-medium" data-section="ferramentas">
                        <i class="icon-tools"></i>
                        <span>Ferramentas</span>
                    </a>
                </div>
                
                <div class="nav-actions">
                    <button class="nav-suggestion-btn" id="navSuggestionBtn">
                        <i class="icon-suggestion"></i>
                        <span>Sugestões</span>
                    </button>
                    <button class="nav-mobile-toggle" id="navMobileToggle">
                        <span></span>
                        <span></span>
                        <span></span>
                    </button>
                </div>
            </div>
            
            <div class="nav-suggestions" id="navSuggestions">
                <h4>Sugerido para você:</h4>
                <div class="suggestions-list" id="suggestionsList"></div>
            </div>
        `;
        
        if (!document.querySelector('nav')) {
            document.body.insertBefore(nav, document.body.firstChild);
        }
        
        return nav;
    }

    trackUserBehavior() {
        // Track section visits
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
                    this.recordSectionVisit(entry.target.id);
                    this.updateNavigationState(entry.target.id);
                }
            });
        }, { threshold: 0.5 });

        document.querySelectorAll('section[id]').forEach(section => {
            observer.observe(section);
        });

        // Track clicks and interactions
        document.addEventListener('click', (e) => {
            this.recordInteraction(e.target);
        });

        // Track time spent on sections
        this.trackTimeOnSections();
    }

    recordSectionVisit(sectionId) {
        const visits = this.getUserData('sectionVisits', {});
        visits[sectionId] = (visits[sectionId] || 0) + 1;
        this.setUserData('sectionVisits', visits);

        // Update user path
        this.navigationState.userPath.push({
            section: sectionId,
            timestamp: Date.now(),
            source: 'scroll'
        });

        this.optimizeForUser();
    }

    recordInteraction(element) {
        const interactions = this.getUserData('interactions', {});
        const elementType = this.getElementType(element);
        const elementId = element.id || element.className || 'unknown';
        
        const key = `${elementType}-${elementId}`;
        interactions[key] = (interactions[key] || 0) + 1;
        
        this.setUserData('interactions', interactions);
    }

    getElementType(element) {
        if (element.matches('button')) return 'button';
        if (element.matches('a')) return 'link';
        if (element.matches('.nav-item')) return 'navigation';
        if (element.matches('.cta-button')) return 'cta';
        if (element.matches('.ia-action')) return 'ia-interaction';
        return 'element';
    }

    trackTimeOnSections() {
        let currentSection = null;
        let startTime = Date.now();

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    if (currentSection && currentSection !== entry.target.id) {
                        this.recordTimeSpent(currentSection, Date.now() - startTime);
                    }
                    currentSection = entry.target.id;
                    startTime = Date.now();
                }
            });
        });

        document.querySelectorAll('section[id]').forEach(section => {
            observer.observe(section);
        });
    }

    recordTimeSpent(sectionId, timeSpent) {
        const times = this.getUserData('timeSpent', {});
        times[sectionId] = (times[sectionId] || 0) + timeSpent;
        this.setUserData('timeSpent', times);
    }

    optimizeForUser() {
        const userProfile = this.buildUserProfile();
        this.personalizeContent(userProfile);
        this.updateNavigationSuggestions(userProfile);
        this.reorderContentPriorities(userProfile);
    }

    buildUserProfile() {
        const visits = this.getUserData('sectionVisits', {});
        const interactions = this.getUserData('interactions', {});
        const timeSpent = this.getUserData('timeSpent', {});
        const totalVisits = this.getUserData('totalVisits', 0);

        // Determine user type
        let userType = 'new-visitor';
        if (totalVisits > 5) userType = 'returning-user';
        if (visits['gerador-role'] > 3) userType = 'active-user';
        if (visits['irmandade'] > 2 && timeSpent['irmandade'] > 30000) userType = 'interested-member';
        if (visits['agenda'] > 2) userType = 'event-interested';

        // Determine interests
        const interests = [];
        if (visits['gerador-role'] > 1) interests.push('route-generation');
        if (visits['ia-assistant'] > 1) interests.push('ai-features');
        if (visits['agenda'] > 1) interests.push('events');
        if (visits['irmandade'] > 1) interests.push('community');
        if (visits['historia'] > 1) interests.push('history');

        return {
            type: userType,
            interests,
            behavior: {
                totalVisits: totalVisits + 1,
                mostVisitedSection: Object.keys(visits).reduce((a, b) => visits[a] > visits[b] ? a : b, 'hero'),
                averageTimePerSection: Object.values(timeSpent).reduce((a, b) => a + b, 0) / Object.keys(timeSpent).length || 0,
                preferredFeatures: Object.keys(interactions).filter(key => interactions[key] > 2)
            }
        };
    }

    personalizeContent(userProfile) {
        // Personalize hero section
        this.personalizeHeroSection(userProfile);
        
        // Show relevant CTAs
        this.showRelevantCTAs(userProfile);
        
        // Customize IA assistant responses
        this.customizeIAResponses(userProfile);
        
        // Highlight preferred features
        this.highlightPreferredFeatures(userProfile);
    }

    personalizeHeroSection(userProfile) {
        const hero = document.querySelector('#hero');
        if (!hero) return;

        const personalizedMessages = {
            'new-visitor': {
                title: 'Bem-vindo à Sons of Peaky',
                subtitle: 'Descubra nossa irmandade de motociclistas',
                cta: 'Conheça Nossa História'
            },
            'returning-user': {
                title: 'Que bom ter você de volta!',
                subtitle: 'Veja as novidades da irmandade',
                cta: 'Ver Últimas Atualizações'
            },
            'active-user': {
                title: 'Pronto para o próximo rolê?',
                subtitle: 'Use nossa IA para descobrir novos destinos',
                cta: 'Gerar Novo Rolê'
            },
            'interested-member': {
                title: 'Interessado em fazer parte?',
                subtitle: 'Conheça melhor nossa irmandade',
                cta: 'Falar com a Irmandade'
            },
            'event-interested': {
                title: 'Não perca nossos eventos!',
                subtitle: 'Confira a agenda atualizada',
                cta: 'Ver Próximos Eventos'
            }
        };

        const message = personalizedMessages[userProfile.type] || personalizedMessages['new-visitor'];
        
        const heroTitle = hero.querySelector('h1');
        const heroSubtitle = hero.querySelector('.hero-subtitle');
        const heroCTA = hero.querySelector('.hero-cta');

        if (heroTitle) heroTitle.textContent = message.title;
        if (heroSubtitle) heroSubtitle.textContent = message.subtitle;
        if (heroCTA) heroCTA.textContent = message.cta;
    }

    showRelevantCTAs(userProfile) {
        // Hide/show CTAs based on user interests
        const ctaMap = {
            'route-generation': ['.cta-gerador-role', '.cta-ia-assistant'],
            'ai-features': ['.cta-ia-assistant', '.cta-gerador-role'],
            'events': ['.cta-agenda', '.cta-participar'],
            'community': ['.cta-irmandade', '.cta-participar'],
            'history': ['.cta-historia', '.cta-irmandade']
        };

        // Show primary CTAs for user interests
        userProfile.interests.forEach(interest => {
            const ctaSelectors = ctaMap[interest] || [];
            ctaSelectors.forEach(selector => {
                const cta = document.querySelector(selector);
                if (cta) {
                    cta.classList.add('priority-high');
                    cta.style.order = '-1';
                }
            });
        });
    }

    customizeIAResponses(userProfile) {
        // Send user profile to IA assistant for contextualized responses
        if (window.SOPAIAssistant) {
            window.SOPAIAssistant.setUserProfile(userProfile);
        }
    }

    highlightPreferredFeatures(userProfile) {
        userProfile.behavior.preferredFeatures.forEach(feature => {
            const elements = document.querySelectorAll(`[data-feature="${feature}"]`);
            elements.forEach(el => {
                el.classList.add('user-preferred');
            });
        });
    }

    updateNavigationSuggestions(userProfile) {
        const suggestionsList = document.getElementById('suggestionsList');
        if (!suggestionsList) return;

        const suggestions = this.generateNavigationSuggestions(userProfile);
        
        suggestionsList.innerHTML = suggestions.map(suggestion => `
            <a href="#${suggestion.section}" class="suggestion-item" data-section="${suggestion.section}">
                <i class="${suggestion.icon}"></i>
                <div class="suggestion-content">
                    <h5>${suggestion.title}</h5>
                    <p>${suggestion.reason}</p>
                </div>
                <span class="suggestion-score">${suggestion.score}%</span>
            </a>
        `).join('');
    }

    generateNavigationSuggestions(userProfile) {
        const sections = this.contentStructure.sections;
        const suggestions = [];

        Object.entries(sections).forEach(([sectionId, section]) => {
            const score = this.calculateSuggestionScore(sectionId, userProfile);
            if (score > 60) {
                suggestions.push({
                    section: sectionId,
                    title: section.title,
                    reason: this.getSuggestionReason(sectionId, userProfile),
                    score: score,
                    icon: this.getSectionIcon(sectionId)
                });
            }
        });

        return suggestions.sort((a, b) => b.score - a.score).slice(0, 3);
    }

    calculateSuggestionScore(sectionId, userProfile) {
        let score = 50; // Base score

        // User type relevance
        const section = this.contentStructure.priority.find(p => p.id === sectionId);
        if (section && section.userTypes.includes(userProfile.type)) {
            score += 20;
        }

        // Interest alignment
        const interestMap = {
            'ia-assistant': 'ai-features',
            'gerador-role': 'route-generation',
            'agenda': 'events',
            'irmandade': 'community',
            'historia': 'history'
        };

        if (userProfile.interests.includes(interestMap[sectionId])) {
            score += 25;
        }

        // Visit frequency (lower score for frequently visited)
        const visits = this.getUserData('sectionVisits', {});
        if (visits[sectionId] && visits[sectionId] > 3) {
            score -= 15;
        }

        // Time spent (higher score for sections with low time but high interest)
        const timeSpent = this.getUserData('timeSpent', {});
        if (timeSpent[sectionId] && timeSpent[sectionId] < 10000) {
            score += 10;
        }

        return Math.min(100, Math.max(0, score));
    }

    getSuggestionReason(sectionId, userProfile) {
        const reasons = {
            'ia-assistant': 'Baseado no seu interesse em IA',
            'gerador-role': 'Perfeito para planejar seu próximo rolê',
            'agenda': 'Novos eventos disponíveis',
            'irmandade': 'Conheça melhor nossa família',
            'historia': 'Descubra nossas origens',
            'missao': 'Entenda nossos valores',
            'ferramentas': 'Utilitários que podem te ajudar'
        };

        return reasons[sectionId] || 'Conteúdo relevante para você';
    }

    getSectionIcon(sectionId) {
        const icons = {
            'hero': 'icon-home',
            'ia-assistant': 'icon-ai',
            'gerador-role': 'icon-route',
            'historia': 'icon-history',
            'irmandade': 'icon-users',
            'agenda': 'icon-calendar',
            'missao': 'icon-target',
            'ferramentas': 'icon-tools'
        };

        return icons[sectionId] || 'icon-default';
    }

    reorderContentPriorities(userProfile) {
        // Dynamically reorder sections based on user preferences
        const priorities = this.contentStructure.priority;
        const userVisits = this.getUserData('sectionVisits', {});
        
        // Calculate new priorities
        const newPriorities = priorities.map(item => ({
            ...item,
            dynamicWeight: this.calculateDynamicWeight(item, userProfile, userVisits)
        })).sort((a, b) => b.dynamicWeight - a.dynamicWeight);

        // Apply visual reordering (for mobile especially)
        this.applyContentReordering(newPriorities);
    }

    calculateDynamicWeight(item, userProfile, userVisits) {
        let weight = item.weight;

        // User type bonus
        if (item.userTypes.includes(userProfile.type)) {
            weight += 2;
        }

        // Interest bonus
        const interestMap = {
            'ia-assistant': 'ai-features',
            'gerador-role': 'route-generation',
            'agenda': 'events',
            'irmandade': 'community',
            'historia': 'history'
        };

        if (userProfile.interests.includes(interestMap[item.id])) {
            weight += 3;
        }

        // Visit frequency penalty (don't over-prioritize already seen content)
        if (userVisits[item.id] && userVisits[item.id] > 2) {
            weight -= 1;
        }

        return weight;
    }

    applyContentReordering(newPriorities) {
        const container = document.querySelector('main');
        if (!container) return;

        // On mobile, reorder sections
        if (window.innerWidth <= 768) {
            newPriorities.forEach((item, index) => {
                const section = document.getElementById(item.id);
                if (section) {
                    section.style.order = index;
                }
            });
        }
    }

    setupContextualSuggestions() {
        // Show contextual suggestions when user scrolls
        let suggestionTimeout;
        
        window.addEventListener('scroll', () => {
            clearTimeout(suggestionTimeout);
            suggestionTimeout = setTimeout(() => {
                this.showContextualSuggestions();
            }, 1000);
        });
    }

    showContextualSuggestions() {
        const currentSection = this.getCurrentSection();
        const suggestions = this.contentStructure.sections[currentSection]?.nextSuggested;
        
        if (suggestions) {
            this.displayFloatingSuggestions(suggestions);
        }
    }

    displayFloatingSuggestions(suggestions) {
        // Remove existing suggestions
        const existing = document.querySelector('.floating-suggestions');
        if (existing) existing.remove();

        const suggestionDiv = document.createElement('div');
        suggestionDiv.className = 'floating-suggestions';
        suggestionDiv.innerHTML = `
            <div class="suggestions-header">
                <h4>Continue explorando:</h4>
                <button class="close-suggestions">×</button>
            </div>
            <div class="suggestions-grid">
                ${suggestions.map(sectionId => `
                    <a href="#${sectionId}" class="floating-suggestion" data-section="${sectionId}">
                        <i class="${this.getSectionIcon(sectionId)}"></i>
                        <span>${this.contentStructure.sections[sectionId].title}</span>
                    </a>
                `).join('')}
            </div>
        `;

        document.body.appendChild(suggestionDiv);

        // Auto-hide after 10 seconds
        setTimeout(() => {
            if (suggestionDiv.parentNode) {
                suggestionDiv.remove();
            }
        }, 10000);

        // Close button
        suggestionDiv.querySelector('.close-suggestions').addEventListener('click', () => {
            suggestionDiv.remove();
        });
    }

    getCurrentSection() {
        const sections = document.querySelectorAll('section[id]');
        const scrollPos = window.scrollY + window.innerHeight / 2;

        for (let section of sections) {
            const rect = section.getBoundingClientRect();
            const sectionTop = rect.top + window.scrollY;
            const sectionBottom = sectionTop + rect.height;

            if (scrollPos >= sectionTop && scrollPos <= sectionBottom) {
                return section.id;
            }
        }

        return 'hero';
    }

    setupBreadcrumbs() {
        const breadcrumbContainer = document.createElement('nav');
        breadcrumbContainer.className = 'breadcrumb-navigation';
        breadcrumbContainer.setAttribute('aria-label', 'Navegação estrutural');
        
        const header = document.querySelector('header') || document.querySelector('nav');
        if (header) {
            header.after(breadcrumbContainer);
        }

        this.updateBreadcrumbs();
        
        // Update on navigation
        window.addEventListener('hashchange', () => {
            this.updateBreadcrumbs();
        });
    }

    updateBreadcrumbs() {
        const breadcrumbContainer = document.querySelector('.breadcrumb-navigation');
        if (!breadcrumbContainer) return;

        const currentSection = window.location.hash.replace('#', '') || 'hero';
        const path = this.buildBreadcrumbPath(currentSection);

        breadcrumbContainer.innerHTML = `
            <ol class="breadcrumb-list">
                ${path.map((item, index) => `
                    <li class="breadcrumb-item ${index === path.length - 1 ? 'current' : ''}">
                        ${index === path.length - 1 ? 
                            `<span aria-current="page">${item.title}</span>` :
                            `<a href="#${item.id}">${item.title}</a>`
                        }
                    </li>
                `).join('')}
            </ol>
        `;
    }

    buildBreadcrumbPath(currentSection) {
        const path = [{ id: 'hero', title: 'Início' }];
        
        if (currentSection !== 'hero') {
            const section = this.contentStructure.sections[currentSection];
            if (section) {
                path.push({ id: currentSection, title: section.title });
            }
        }

        return path;
    }

    // User data management
    getUserData(key, defaultValue = null) {
        try {
            const data = localStorage.getItem(`sop-${key}`);
            return data ? JSON.parse(data) : defaultValue;
        } catch (e) {
            return defaultValue;
        }
    }

    setUserData(key, value) {
        try {
            localStorage.setItem(`sop-${key}`, JSON.stringify(value));
        } catch (e) {
            console.warn('Could not save user data:', e);
        }
    }

    updateNavigationState(sectionId) {
        this.navigationState.previousSection = this.navigationState.currentSection;
        this.navigationState.currentSection = sectionId;
        this.navigationState.navigationHistory.push({
            section: sectionId,
            timestamp: Date.now()
        });

        // Keep only last 10 navigation events
        if (this.navigationState.navigationHistory.length > 10) {
            this.navigationState.navigationHistory.shift();
        }
    }

    optimizeContentFlow() {
        // Implement smooth scrolling between sections
        this.setupSmoothScrolling();
        
        // Add progress indicators
        this.addProgressIndicators();
        
        // Implement lazy loading for heavy content
        this.setupLazyLoading();
        
        // Add reading time estimates
        this.addReadingTimeEstimates();
    }

    setupSmoothScrolling() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                    
                    // Update URL without triggering hashchange
                    history.pushState(null, null, anchor.getAttribute('href'));
                }
            });
        });
    }

    addProgressIndicators() {
        const progressContainer = document.createElement('div');
        progressContainer.className = 'reading-progress';
        progressContainer.innerHTML = `
            <div class="progress-bar">
                <div class="progress-fill"></div>
            </div>
            <div class="section-indicators">
                ${Object.keys(this.contentStructure.sections).map(sectionId => `
                    <div class="section-dot" data-section="${sectionId}"></div>
                `).join('')}
            </div>
        `;

        document.body.appendChild(progressContainer);

        // Update progress on scroll
        window.addEventListener('scroll', () => {
            this.updateReadingProgress();
        });
    }

    updateReadingProgress() {
        const progressFill = document.querySelector('.progress-fill');
        const sectionDots = document.querySelectorAll('.section-dot');
        
        if (!progressFill || !sectionDots.length) return;

        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = (scrollTop / docHeight) * 100;

        progressFill.style.width = `${Math.min(100, Math.max(0, scrollPercent))}%`;

        // Update section dots
        const currentSection = this.getCurrentSection();
        sectionDots.forEach(dot => {
            dot.classList.toggle('active', dot.dataset.section === currentSection);
        });
    }

    setupLazyLoading() {
        // Lazy load images
        const images = document.querySelectorAll('img[data-src]');
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    imageObserver.unobserve(img);
                }
            });
        });

        images.forEach(img => imageObserver.observe(img));

        // Lazy load sections
        const sections = document.querySelectorAll('section[data-lazy]');
        const sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.loadSectionContent(entry.target);
                    sectionObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        sections.forEach(section => sectionObserver.observe(section));
    }

    loadSectionContent(section) {
        const contentLoader = section.dataset.lazy;
        if (contentLoader && this[contentLoader]) {
            this[contentLoader](section);
        }
    }

    addReadingTimeEstimates() {
        document.querySelectorAll('section').forEach(section => {
            const text = section.textContent;
            const wordCount = text.split(/\s+/).length;
            const readingTime = Math.ceil(wordCount / 200); // 200 words per minute

            if (readingTime > 1) {
                const estimate = document.createElement('div');
                estimate.className = 'reading-time-estimate';
                estimate.textContent = `${readingTime} min de leitura`;
                
                const header = section.querySelector('h1, h2, h3');
                if (header) {
                    header.after(estimate);
                }
            }
        });
    }

    createAdaptiveInterface() {
        // Create interface that adapts to device and user preferences
        this.detectUserDevice();
        this.setupAccessibilityFeatures();
        this.createCustomizationPanel();
    }

    detectUserDevice() {
        const userAgent = navigator.userAgent;
        const deviceInfo = {
            isMobile: /Mobile|Android|iPhone|iPad/.test(userAgent),
            isTablet: /iPad|Tablet/.test(userAgent),
            isDesktop: !/Mobile|Tablet/.test(userAgent),
            hasTouch: 'ontouchstart' in window,
            screenSize: {
                width: window.screen.width,
                height: window.screen.height
            },
            viewportSize: {
                width: window.innerWidth,
                height: window.innerHeight
            }
        };

        this.setUserData('deviceInfo', deviceInfo);
        this.adaptInterfaceForDevice(deviceInfo);
    }

    adaptInterfaceForDevice(deviceInfo) {
        const body = document.body;
        
        // Add device classes
        body.classList.toggle('mobile-device', deviceInfo.isMobile);
        body.classList.toggle('tablet-device', deviceInfo.isTablet);
        body.classList.toggle('desktop-device', deviceInfo.isDesktop);
        body.classList.toggle('touch-device', deviceInfo.hasTouch);

        // Adapt navigation for device
        if (deviceInfo.isMobile) {
            this.optimizeForMobile();
        } else if (deviceInfo.isTablet) {
            this.optimizeForTablet();
        } else {
            this.optimizeForDesktop();
        }
    }

    optimizeForMobile() {
        // Mobile-specific optimizations
        const nav = document.querySelector('.smart-navigation');
        if (nav) {
            nav.classList.add('mobile-optimized');
            
            // Add mobile-specific features
            this.addMobileSwipeNavigation();
            this.optimizeMobileCTAs();
        }
    }

    optimizeForTablet() {
        // Tablet-specific optimizations
        const nav = document.querySelector('.smart-navigation');
        if (nav) {
            nav.classList.add('tablet-optimized');
        }
    }

    optimizeForDesktop() {
        // Desktop-specific optimizations
        const nav = document.querySelector('.smart-navigation');
        if (nav) {
            nav.classList.add('desktop-optimized');
            
            // Add desktop-specific features
            this.addKeyboardNavigation();
            this.addMouseHoverEffects();
        }
    }

    addMobileSwipeNavigation() {
        let startX, startY;
        
        document.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        });

        document.addEventListener('touchmove', (e) => {
            if (!startX || !startY) return;

            const endX = e.touches[0].clientX;
            const endY = e.touches[0].clientY;
            
            const diffX = startX - endX;
            const diffY = startY - endY;

            // Horizontal swipe detected
            if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
                if (diffX > 0) {
                    // Swipe left - next section
                    this.navigateToNextSection();
                } else {
                    // Swipe right - previous section
                    this.navigateToPreviousSection();
                }
            }

            startX = null;
            startY = null;
        });
    }

    navigateToNextSection() {
        const sections = Object.keys(this.contentStructure.sections);
        const currentIndex = sections.indexOf(this.navigationState.currentSection);
        const nextIndex = (currentIndex + 1) % sections.length;
        const nextSection = sections[nextIndex];
        
        document.getElementById(nextSection)?.scrollIntoView({ behavior: 'smooth' });
    }

    navigateToPreviousSection() {
        const sections = Object.keys(this.contentStructure.sections);
        const currentIndex = sections.indexOf(this.navigationState.currentSection);
        const prevIndex = currentIndex === 0 ? sections.length - 1 : currentIndex - 1;
        const prevSection = sections[prevIndex];
        
        document.getElementById(prevSection)?.scrollIntoView({ behavior: 'smooth' });
    }

    optimizeMobileCTAs() {
        // Make CTAs more prominent on mobile
        const ctas = document.querySelectorAll('.cta-button');
        ctas.forEach(cta => {
            cta.classList.add('mobile-optimized');
        });
    }

    addKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 'ArrowDown':
                case 'PageDown':
                    e.preventDefault();
                    this.navigateToNextSection();
                    break;
                case 'ArrowUp':
                case 'PageUp':
                    e.preventDefault();
                    this.navigateToPreviousSection();
                    break;
                case 'Home':
                    e.preventDefault();
                    document.getElementById('hero')?.scrollIntoView({ behavior: 'smooth' });
                    break;
                case 'End':
                    e.preventDefault();
                    document.getElementById('contato')?.scrollIntoView({ behavior: 'smooth' });
                    break;
            }
        });
    }

    addMouseHoverEffects() {
        // Add enhanced hover effects for desktop
        const interactiveElements = document.querySelectorAll('.nav-item, .cta-button, .card');
        interactiveElements.forEach(el => {
            el.classList.add('desktop-hover-effects');
        });
    }

    setupAccessibilityFeatures() {
        // High contrast mode
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
        this.updateColorScheme(prefersDark.matches);
        prefersDark.addEventListener('change', (e) => {
            this.updateColorScheme(e.matches);
        });

        // Reduced motion
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
        this.updateMotionPreference(prefersReducedMotion.matches);
        prefersReducedMotion.addEventListener('change', (e) => {
            this.updateMotionPreference(e.matches);
        });

        // Focus management
        this.setupFocusManagement();
        
        // Screen reader optimizations
        this.setupScreenReaderOptimizations();
    }

    updateColorScheme(isDark) {
        document.body.classList.toggle('dark-theme', isDark);
        document.body.classList.toggle('light-theme', !isDark);
    }

    updateMotionPreference(reduceMotion) {
        document.body.classList.toggle('reduce-motion', reduceMotion);
    }

    setupFocusManagement() {
        // Ensure proper focus management for keyboard navigation
        const focusableElements = 'a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])';
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                const focusable = Array.from(document.querySelectorAll(focusableElements));
                const index = focusable.indexOf(document.activeElement);
                
                if (e.shiftKey) {
                    if (index === 0) {
                        e.preventDefault();
                        focusable[focusable.length - 1].focus();
                    }
                } else {
                    if (index === focusable.length - 1) {
                        e.preventDefault();
                        focusable[0].focus();
                    }
                }
            }
        });
    }

    setupScreenReaderOptimizations() {
        // Add aria-live regions for dynamic content
        const liveRegion = document.createElement('div');
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'false');
        liveRegion.className = 'sr-only live-region';
        document.body.appendChild(liveRegion);

        // Announce section changes
        window.addEventListener('hashchange', () => {
            const currentSection = this.getCurrentSection();
            const sectionTitle = this.contentStructure.sections[currentSection]?.title;
            if (sectionTitle) {
                liveRegion.textContent = `Navegou para seção: ${sectionTitle}`;
            }
        });
    }

    createCustomizationPanel() {
        const panel = document.createElement('div');
        panel.className = 'customization-panel';
        panel.innerHTML = `
            <button class="customization-toggle" aria-label="Personalizar interface">
                <i class="icon-settings"></i>
            </button>
            <div class="customization-content">
                <h3>Personalizar Interface</h3>
                
                <div class="customization-group">
                    <h4>Tema</h4>
                    <label class="toggle">
                        <input type="checkbox" id="darkModeToggle">
                        <span class="toggle-slider"></span>
                        Modo Escuro
                    </label>
                </div>
                
                <div class="customization-group">
                    <h4>Acessibilidade</h4>
                    <label class="toggle">
                        <input type="checkbox" id="reduceMotionToggle">
                        <span class="toggle-slider"></span>
                        Reduzir Animações
                    </label>
                    <label class="toggle">
                        <input type="checkbox" id="highContrastToggle">
                        <span class="toggle-slider"></span>
                        Alto Contraste
                    </label>
                </div>
                
                <div class="customization-group">
                    <h4>Navegação</h4>
                    <label class="toggle">
                        <input type="checkbox" id="floatingSuggestionsToggle" checked>
                        <span class="toggle-slider"></span>
                        Sugestões Flutuantes
                    </label>
                    <label class="toggle">
                        <input type="checkbox" id="progressIndicatorToggle" checked>
                        <span class="toggle-slider"></span>
                        Indicador de Progresso
                    </label>
                </div>
                
                <div class="customization-group">
                    <h4>Dados</h4>
                    <button class="btn btn-secondary" id="resetUserDataBtn">
                        Limpar Dados Pessoais
                    </button>
                    <button class="btn btn-primary" id="exportUserDataBtn">
                        Exportar Preferências
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(panel);
        this.setupCustomizationPanelEvents();
    }

    setupCustomizationPanelEvents() {
        const toggle = document.querySelector('.customization-toggle');
        const panel = document.querySelector('.customization-panel');
        
        toggle.addEventListener('click', () => {
            panel.classList.toggle('open');
        });

        // Theme toggle
        const darkModeToggle = document.getElementById('darkModeToggle');
        darkModeToggle.checked = this.getUserData('darkMode', false);
        darkModeToggle.addEventListener('change', (e) => {
            this.setUserData('darkMode', e.target.checked);
            this.updateColorScheme(e.target.checked);
        });

        // Accessibility toggles
        const reduceMotionToggle = document.getElementById('reduceMotionToggle');
        reduceMotionToggle.checked = this.getUserData('reduceMotion', false);
        reduceMotionToggle.addEventListener('change', (e) => {
            this.setUserData('reduceMotion', e.target.checked);
            this.updateMotionPreference(e.target.checked);
        });

        const highContrastToggle = document.getElementById('highContrastToggle');
        highContrastToggle.checked = this.getUserData('highContrast', false);
        highContrastToggle.addEventListener('change', (e) => {
            this.setUserData('highContrast', e.target.checked);
            document.body.classList.toggle('high-contrast', e.target.checked);
        });

        // Navigation toggles
        const floatingSuggestionsToggle = document.getElementById('floatingSuggestionsToggle');
        floatingSuggestionsToggle.checked = this.getUserData('floatingSuggestions', true);
        floatingSuggestionsToggle.addEventListener('change', (e) => {
            this.setUserData('floatingSuggestions', e.target.checked);
        });

        const progressIndicatorToggle = document.getElementById('progressIndicatorToggle');
        progressIndicatorToggle.checked = this.getUserData('progressIndicator', true);
        progressIndicatorToggle.addEventListener('change', (e) => {
            this.setUserData('progressIndicator', e.target.checked);
            document.querySelector('.reading-progress')?.classList.toggle('hidden', !e.target.checked);
        });

        // Data management
        document.getElementById('resetUserDataBtn').addEventListener('click', () => {
            if (confirm('Tem certeza que deseja limpar todos os dados pessoais?')) {
                this.resetUserData();
            }
        });

        document.getElementById('exportUserDataBtn').addEventListener('click', () => {
            this.exportUserData();
        });
    }

    resetUserData() {
        const keys = ['sectionVisits', 'interactions', 'timeSpent', 'totalVisits', 'userProfile'];
        keys.forEach(key => localStorage.removeItem(`sop-${key}`));
        
        // Refresh page to reset interface
        window.location.reload();
    }

    exportUserData() {
        const userData = {
            sectionVisits: this.getUserData('sectionVisits', {}),
            interactions: this.getUserData('interactions', {}),
            timeSpent: this.getUserData('timeSpent', {}),
            totalVisits: this.getUserData('totalVisits', 0),
            preferences: {
                darkMode: this.getUserData('darkMode', false),
                reduceMotion: this.getUserData('reduceMotion', false),
                highContrast: this.getUserData('highContrast', false),
                floatingSuggestions: this.getUserData('floatingSuggestions', true),
                progressIndicator: this.getUserData('progressIndicator', true)
            },
            exportDate: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(userData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'sop-user-preferences.json';
        a.click();
        URL.revokeObjectURL(url);
    }

    initializeContentReorganization() {
        // Update total visits counter
        const totalVisits = this.getUserData('totalVisits', 0) + 1;
        this.setUserData('totalVisits', totalVisits);

        // Initialize optimization
        this.optimizeForUser();

        // Setup periodic optimization
        setInterval(() => {
            this.optimizeForUser();
        }, 30000); // Every 30 seconds
    }

    // Public API for external integration
    getOptimizationData() {
        return {
            userProfile: this.buildUserProfile(),
            navigationState: this.navigationState,
            contentStructure: this.contentStructure
        };
    }

    forceOptimization() {
        this.optimizeForUser();
    }

    updateUserPreference(key, value) {
        this.setUserData(key, value);
        this.optimizeForUser();
    }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.SOPContentOptimizer = new SOPContentOptimizer();
    });
} else {
    window.SOPContentOptimizer = new SOPContentOptimizer();
}

export { SOPContentOptimizer };