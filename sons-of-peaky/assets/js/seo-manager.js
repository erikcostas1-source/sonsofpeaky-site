import { SOPConfig } from './config.js';

class SOPSEOManager {
    constructor() {
        this.config = SOPConfig;
        this.structuredData = this.createStructuredData();
        this.metaTags = this.createMetaTags();
        this.schemaMarkup = this.createSchemaMarkup();
        
        this.init();
    }

    init() {
        this.injectMetaTags();
        this.injectStructuredData();
        this.setupDynamicSEO();
        this.generateSitemap();
        this.setupOpenGraph();
        this.setupTwitterCards();
        this.setupCanonicalURLs();
        this.optimizeImages();
    }

    createMetaTags() {
        return {
            title: 'Sons of Peaky - Irmandade de Motociclistas em São Paulo | Rolês Exclusivos',
            description: 'Conheça a irmandade Sons of Peaky, grupo de motociclistas de São Paulo desde 2021. Participe de rolês exclusivos, eventos únicos e faça parte da nossa família. IA para planejamento de rotas.',
            keywords: [
                'motoclube são paulo',
                'irmandade motociclistas',
                'sons of peaky',
                'rolês de moto',
                'grupo motociclistas sp',
                'motoclubes brasil',
                'eventos moto',
                'irmandade peaky',
                'motociclistas sp',
                'planejamento rotas moto',
                'ia rotas motociclistas',
                'destinos moto brasil'
            ],
            author: 'Sons of Peaky',
            robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
            googlebot: 'index, follow, max-image-preview:large',
            viewport: 'width=device-width, initial-scale=1.0, viewport-fit=cover',
            charset: 'UTF-8',
            language: 'pt-BR',
            geo: {
                region: 'BR-SP',
                placename: 'São Paulo',
                position: '-23.5505;-46.6333'
            },
            mobile: {
                'apple-mobile-web-app-capable': 'yes',
                'apple-mobile-web-app-status-bar-style': 'black-translucent',
                'apple-mobile-web-app-title': 'Sons of Peaky',
                'mobile-web-app-capable': 'yes',
                'format-detection': 'telephone=no, address=no, email=no'
            }
        };
    }

    createStructuredData() {
        const baseURL = 'https://erikcostas1-source.github.io/sonsofpeaky-site';
        
        return {
            organization: {
                "@context": "https://schema.org",
                "@type": "Organization",
                "@id": `${baseURL}/#organization`,
                "name": "Sons of Peaky",
                "alternateName": "SOP",
                "description": "Irmandade de motociclistas em São Paulo desde 2021, focada em rolês exclusivos e eventos únicos para apaixonados por motocicletas.",
                "url": baseURL,
                "logo": {
                    "@type": "ImageObject",
                    "url": `${baseURL}/assets/img/SOP_LOGO_PRINCIPAL.svg`,
                    "width": 512,
                    "height": 512
                },
                "image": [
                    `${baseURL}/assets/img/SOP_LOGO_PRINCIPAL.svg`,
                    `${baseURL}/assets/img/PEAKY_OFICIAL.jpg`
                ],
                "foundingDate": "2021",
                "foundingLocation": {
                    "@type": "Place",
                    "address": {
                        "@type": "PostalAddress",
                        "addressLocality": "São Paulo",
                        "addressRegion": "SP",
                        "addressCountry": "BR"
                    }
                },
                "areaServed": {
                    "@type": "Place",
                    "name": "Brasil"
                },
                "memberOf": {
                    "@type": "Organization",
                    "name": "Comunidade Motociclística Brasileira"
                },
                "knowsAbout": [
                    "Motociclismo",
                    "Turismo de Moto",
                    "Eventos Motociclísticos",
                    "Rotas Turísticas",
                    "Irmandade"
                ],
                "sameAs": [
                    "https://github.com/erikcostas1-source/sonsofpeaky-site"
                ]
            },

            website: {
                "@context": "https://schema.org",
                "@type": "WebSite",
                "@id": `${baseURL}/#website`,
                "url": baseURL,
                "name": "Sons of Peaky",
                "description": "Site oficial da irmandade Sons of Peaky com IA para geração de rolês personalizados",
                "publisher": {
                    "@id": `${baseURL}/#organization`
                },
                "inLanguage": "pt-BR",
                "potentialAction": {
                    "@type": "SearchAction",
                    "target": {
                        "@type": "EntryPoint",
                        "urlTemplate": `${baseURL}/?search={search_term_string}`
                    },
                    "query-input": "required name=search_term_string"
                }
            },

            service: {
                "@context": "https://schema.org",
                "@type": "Service",
                "@id": `${baseURL}/#service`,
                "name": "Gerador de Rolês IA",
                "provider": {
                    "@id": `${baseURL}/#organization`
                },
                "description": "Serviço de inteligência artificial para geração personalizada de roteiros de viagem para motociclistas",
                "serviceType": "Planejamento de Viagens",
                "areaServed": "Brasil",
                "availableLanguage": "pt-BR",
                "category": "Turismo e Lazer",
                "hasOfferCatalog": {
                    "@type": "OfferCatalog",
                    "name": "Destinos Disponíveis",
                    "itemListElement": [
                        {
                            "@type": "Offer",
                            "itemOffered": {
                                "@type": "TouristTrip",
                                "name": "Rolê Personalizado",
                                "description": "Roteiro de viagem personalizado com IA"
                            }
                        }
                    ]
                }
            },

            breadcrumb: {
                "@context": "https://schema.org",
                "@type": "BreadcrumbList",
                "itemListElement": [
                    {
                        "@type": "ListItem",
                        "position": 1,
                        "name": "Home",
                        "item": baseURL
                    },
                    {
                        "@type": "ListItem",
                        "position": 2,
                        "name": "História",
                        "item": `${baseURL}/#historia`
                    },
                    {
                        "@type": "ListItem",
                        "position": 3,
                        "name": "Irmandade",
                        "item": `${baseURL}/#irmandade`
                    },
                    {
                        "@type": "ListItem",
                        "position": 4,
                        "name": "Missão",
                        "item": `${baseURL}/#missao`
                    },
                    {
                        "@type": "ListItem",
                        "position": 5,
                        "name": "Eventos",
                        "item": `${baseURL}/#agenda`
                    },
                    {
                        "@type": "ListItem",
                        "position": 6,
                        "name": "IA Assistant",
                        "item": `${baseURL}/#ia-assistant`
                    }
                ]
            }
        };
    }

    createSchemaMarkup() {
        return {
            faq: {
                "@context": "https://schema.org",
                "@type": "FAQPage",
                "mainEntity": [
                    {
                        "@type": "Question",
                        "name": "O que é a Sons of Peaky?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "A Sons of Peaky é uma irmandade de motociclistas fundada em 2021 em São Paulo, focada em criar experiências únicas através de rolês exclusivos e eventos especiais para apaixonados por motocicletas."
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "Como funciona o gerador de rolês IA?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Nosso gerador de rolês utiliza inteligência artificial para criar roteiros personalizados baseados no seu perfil, orçamento, tipo de moto e experiências desejadas. Inclui cálculos de combustível, pedágios e hospedagem."
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "Como posso participar da irmandade?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Entre em contato conosco através do site ou participe de nossos eventos abertos. Valorizamos respeito, lealdade e paixão pelas duas rodas."
                        }
                    }
                ]
            },

            howTo: {
                "@context": "https://schema.org",
                "@type": "HowTo",
                "name": "Como usar o Gerador de Rolês IA",
                "description": "Aprenda a gerar rolês personalizados com nossa IA",
                "image": {
                    "@type": "ImageObject",
                    "url": "https://erikcostas1-source.github.io/sonsofpeaky-site/assets/img/SOP_LOGO_PRINCIPAL.svg"
                },
                "step": [
                    {
                        "@type": "HowToStep",
                        "name": "Acesse o Gerador",
                        "text": "Clique no botão 'Gerar Rolê' no menu principal",
                        "image": {
                            "@type": "ImageObject",
                            "url": "https://erikcostas1-source.github.io/sonsofpeaky-site/assets/img/step1.webp"
                        }
                    },
                    {
                        "@type": "HowToStep",
                        "name": "Preencha suas Preferências",
                        "text": "Informe tipo de moto, orçamento, experiência desejada e preferências pessoais",
                        "image": {
                            "@type": "ImageObject",
                            "url": "https://erikcostas1-source.github.io/sonsofpeaky-site/assets/img/step2.webp"
                        }
                    },
                    {
                        "@type": "HowToStep",
                        "name": "Receba Sugestões Personalizadas",
                        "text": "Nossa IA gerará roteiros únicos com custos detalhados e endereços específicos",
                        "image": {
                            "@type": "ImageObject",
                            "url": "https://erikcostas1-source.github.io/sonsofpeaky-site/assets/img/step3.webp"
                        }
                    }
                ]
            }
        };
    }

    injectMetaTags() {
        const head = document.head;
        const meta = this.metaTags;

        // Title
        document.title = meta.title;

        // Basic meta tags
        this.createMetaTag('description', meta.description);
        this.createMetaTag('keywords', meta.keywords.join(', '));
        this.createMetaTag('author', meta.author);
        this.createMetaTag('robots', meta.robots);
        this.createMetaTag('googlebot', meta.googlebot);
        this.createMetaTag('viewport', meta.viewport);
        
        // Language and geo
        document.documentElement.lang = meta.language;
        this.createMetaTag('geo.region', meta.geo.region);
        this.createMetaTag('geo.placename', meta.geo.placename);
        this.createMetaTag('geo.position', meta.geo.position);

        // Mobile specific
        Object.entries(meta.mobile).forEach(([name, content]) => {
            this.createMetaTag(name, content);
        });

        // Charset
        if (!document.querySelector('meta[charset]')) {
            const charset = document.createElement('meta');
            charset.setAttribute('charset', meta.charset);
            head.insertBefore(charset, head.firstChild);
        }
    }

    createMetaTag(name, content) {
        const existing = document.querySelector(`meta[name="${name}"], meta[property="${name}"]`);
        if (existing) {
            existing.setAttribute('content', content);
        } else {
            const meta = document.createElement('meta');
            if (name.startsWith('og:') || name.startsWith('twitter:') || name.startsWith('apple-')) {
                meta.setAttribute('property', name);
            } else {
                meta.setAttribute('name', name);
            }
            meta.setAttribute('content', content);
            document.head.appendChild(meta);
        }
    }

    injectStructuredData() {
        Object.entries(this.structuredData).forEach(([key, data]) => {
            const script = document.createElement('script');
            script.type = 'application/ld+json';
            script.textContent = JSON.stringify(data, null, 2);
            script.id = `structured-data-${key}`;
            document.head.appendChild(script);
        });

        // FAQ Schema
        const faqScript = document.createElement('script');
        faqScript.type = 'application/ld+json';
        faqScript.textContent = JSON.stringify(this.schemaMarkup.faq, null, 2);
        faqScript.id = 'structured-data-faq';
        document.head.appendChild(faqScript);

        // HowTo Schema
        const howToScript = document.createElement('script');
        howToScript.type = 'application/ld+json';
        howToScript.textContent = JSON.stringify(this.schemaMarkup.howTo, null, 2);
        howToScript.id = 'structured-data-howto';
        document.head.appendChild(howToScript);
    }

    setupOpenGraph() {
        const baseURL = 'https://erikcostas1-source.github.io/sonsofpeaky-site';
        const ogTags = {
            'og:type': 'website',
            'og:title': this.metaTags.title,
            'og:description': this.metaTags.description,
            'og:url': baseURL,
            'og:site_name': 'Sons of Peaky',
            'og:locale': 'pt_BR',
            'og:image': `${baseURL}/assets/img/og-image.webp`,
            'og:image:alt': 'Sons of Peaky - Irmandade de Motociclistas',
            'og:image:width': '1200',
            'og:image:height': '630',
            'og:image:type': 'image/webp'
        };

        Object.entries(ogTags).forEach(([property, content]) => {
            this.createMetaTag(property, content);
        });
    }

    setupTwitterCards() {
        const baseURL = 'https://erikcostas1-source.github.io/sonsofpeaky-site';
        const twitterTags = {
            'twitter:card': 'summary_large_image',
            'twitter:title': this.metaTags.title,
            'twitter:description': this.metaTags.description,
            'twitter:image': `${baseURL}/assets/img/twitter-card.webp`,
            'twitter:image:alt': 'Sons of Peaky - Irmandade de Motociclistas',
            'twitter:creator': '@sonsofpeaky',
            'twitter:site': '@sonsofpeaky'
        };

        Object.entries(twitterTags).forEach(([name, content]) => {
            this.createMetaTag(name, content);
        });
    }

    setupCanonicalURLs() {
        const baseURL = 'https://erikcostas1-source.github.io/sonsofpeaky-site';
        const currentPath = window.location.pathname;
        const canonicalURL = `${baseURL}${currentPath}`;

        let canonical = document.querySelector('link[rel="canonical"]');
        if (!canonical) {
            canonical = document.createElement('link');
            canonical.rel = 'canonical';
            document.head.appendChild(canonical);
        }
        canonical.href = canonicalURL;

        // Alternate language links
        const alternate = document.createElement('link');
        alternate.rel = 'alternate';
        alternate.hreflang = 'pt-BR';
        alternate.href = canonicalURL;
        document.head.appendChild(alternate);
    }

    setupDynamicSEO() {
        // Monitor hash changes for dynamic SEO updates
        window.addEventListener('hashchange', () => {
            this.updateSEOForSection();
        });

        // Initial section SEO
        this.updateSEOForSection();
    }

    updateSEOForSection() {
        const hash = window.location.hash.replace('#', '');
        const sectionSEO = this.getSectionSEO(hash);
        
        if (sectionSEO) {
            document.title = sectionSEO.title;
            this.createMetaTag('description', sectionSEO.description);
            this.createMetaTag('og:title', sectionSEO.title);
            this.createMetaTag('og:description', sectionSEO.description);
            this.createMetaTag('twitter:title', sectionSEO.title);
            this.createMetaTag('twitter:description', sectionSEO.description);
        }
    }

    getSectionSEO(section) {
        const sections = {
            'historia': {
                title: 'História - Sons of Peaky | Nossa Jornada desde 2021',
                description: 'Conheça a história da irmandade Sons of Peaky, fundada em 2021 em São Paulo. Descubra como começamos e nossa evolução no mundo motociclístico.'
            },
            'irmandade': {
                title: 'Irmandade - Sons of Peaky | Conheça Nossa Família',
                description: 'Conheça os membros da irmandade Sons of Peaky. Uma família unida pela paixão por motocicletas e valores de respeito, lealdade e união.'
            },
            'missao': {
                title: 'Missão - Sons of Peaky | Nossos Valores e Propósito',
                description: 'Descubra a missão, visão e valores da Sons of Peaky. Nosso compromisso com a excelência em eventos motociclísticos e irmandade verdadeira.'
            },
            'agenda': {
                title: 'Eventos - Sons of Peaky | Rolês e Encontros Exclusivos',
                description: 'Confira nossa agenda de eventos, rolês exclusivos e encontros da irmandade Sons of Peaky. Participe de experiências únicas com motociclistas.'
            },
            'ia-assistant': {
                title: 'IA Assistant - Sons of Peaky | Gerador de Rolês Inteligente',
                description: 'Use nossa IA para gerar rolês personalizados, obter dicas de destinos e planejar suas viagens de moto com inteligência artificial avançada.'
            }
        };

        return sections[section] || null;
    }

    optimizeImages() {
        // Add loading="lazy" to images
        const images = document.querySelectorAll('img:not([loading])');
        images.forEach(img => {
            img.loading = 'lazy';
            img.decoding = 'async';
        });

        // Add preload hints for critical images
        const criticalImages = [
            '/assets/img/SOP_LOGO_PRINCIPAL.svg',
            '/assets/img/SOP_LOGO_HEADER.svg'
        ];

        criticalImages.forEach(src => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'image';
            link.href = src;
            document.head.appendChild(link);
        });
    }

    async generateSitemap() {
        const baseURL = 'https://erikcostas1-source.github.io/sonsofpeaky-site';
        const pages = [
            { url: '/', changefreq: 'weekly', priority: 1.0 },
            { url: '/#historia', changefreq: 'monthly', priority: 0.8 },
            { url: '/#irmandade', changefreq: 'monthly', priority: 0.8 },
            { url: '/#missao', changefreq: 'monthly', priority: 0.7 },
            { url: '/#agenda', changefreq: 'weekly', priority: 0.9 },
            { url: '/#ia-assistant', changefreq: 'daily', priority: 0.9 }
        ];

        const sitemap = this.createXMLSitemap(baseURL, pages);
        
        // Store sitemap for download/deployment
        localStorage.setItem('sop-sitemap', sitemap);
        
        return sitemap;
    }

    createXMLSitemap(baseURL, pages) {
        const now = new Date().toISOString().split('T')[0];
        
        let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
        xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
        
        pages.forEach(page => {
            xml += '  <url>\n';
            xml += `    <loc>${baseURL}${page.url}</loc>\n`;
            xml += `    <lastmod>${now}</lastmod>\n`;
            xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
            xml += `    <priority>${page.priority}</priority>\n`;
            xml += '  </url>\n';
        });
        
        xml += '</urlset>';
        
        return xml;
    }

    // Analytics and performance tracking
    setupAnalytics() {
        // Core Web Vitals tracking
        if ('web-vital' in window) {
            this.trackWebVitals();
        }

        // Custom SEO events
        this.trackSEOEvents();
    }

    trackWebVitals() {
        const vitals = ['FCP', 'LCP', 'FID', 'CLS', 'TTFB'];
        
        vitals.forEach(vital => {
            new PerformanceObserver((list) => {
                list.getEntries().forEach((entry) => {
                    // Send to analytics
                    this.sendAnalytics('web-vital', {
                        name: vital,
                        value: entry.value,
                        id: entry.id
                    });
                });
            }).observe({type: vital.toLowerCase(), buffered: true});
        });
    }

    trackSEOEvents() {
        // Track section views
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.sendAnalytics('section-view', {
                        section: entry.target.id,
                        timestamp: Date.now()
                    });
                }
            });
        }, { threshold: 0.5 });

        document.querySelectorAll('section[id]').forEach(section => {
            observer.observe(section);
        });
    }

    sendAnalytics(event, data) {
        // Placeholder for analytics service
        console.log(`SEO Analytics: ${event}`, data);
        
        // Store for future implementation
        const analytics = JSON.parse(localStorage.getItem('sop-analytics') || '[]');
        analytics.push({
            event,
            data,
            timestamp: Date.now(),
            url: window.location.href
        });
        
        localStorage.setItem('sop-analytics', JSON.stringify(analytics.slice(-100)));
    }

    // Download sitemap for deployment
    downloadSitemap() {
        const sitemap = localStorage.getItem('sop-sitemap');
        if (sitemap) {
            const blob = new Blob([sitemap], { type: 'application/xml' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'sitemap.xml';
            a.click();
            URL.revokeObjectURL(url);
        }
    }

    // Generate robots.txt
    generateRobotsTxt() {
        const robotsTxt = `User-agent: *
Allow: /

Sitemap: https://erikcostas1-source.github.io/sonsofpeaky-site/sitemap.xml

# Sons of Peaky - Irmandade de Motociclistas
# https://erikcostas1-source.github.io/sonsofpeaky-site/

# Disallow nothing - we want to be indexed
# Crawl-delay: 1

# Social Media Crawlers
User-agent: facebookexternalhit
Allow: /

User-agent: Twitterbot
Allow: /

User-agent: LinkedInBot
Allow: /

User-agent: WhatsApp
Allow: /`;

        return robotsTxt;
    }
}

// Auto-initialize SEO when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.SOPSEOManager = new SOPSEOManager();
    });
} else {
    window.SOPSEOManager = new SOPSEOManager();
}

export { SOPSEOManager };