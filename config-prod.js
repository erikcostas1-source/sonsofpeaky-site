/**
 * Configuração de Produção - Gerador de Rolês
 * Este arquivo deve ser usado em produção sem chaves de API expostas
 */

// Configuração da API para produção (sem chaves expostas)
function getAPIConfig() {
    console.log('🔍 getAPIConfig chamado - hostname:', window.location.hostname);
    
    // Força modo desenvolvimento se configurado
    const forceDevelopment = window.FORCE_DEVELOPMENT_MODE === true;
    
    // Detecta plataforma de hospedagem
    const isGitHubPages = window.location.hostname.includes('github.io');
    const isNetlify = window.location.hostname.includes('netlify.app') || window.location.hostname.includes('netlify.com');
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    
    // Determina se é desenvolvimento
    const isDevelopment = forceDevelopment || isLocalhost;
    
    if (isDevelopment) {
        // Para desenvolvimento local, usa chave configurada em dev-config.js
        const devKey = window.DEV_API_KEY;
        if (!devKey) {
            console.error('❌ Chave de desenvolvimento não configurada');
            throw new Error('Configuração de desenvolvimento necessária');
        }
        console.log('🏠 Modo desenvolvimento detectado - usando API direta');
        
        return {
            apiUrl: `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${devKey}`,
            useServerless: false
        };
    } else if (isNetlify) {
        // Em Netlify, usa função serverless
        console.log('🌐 Netlify detectado - usando função serverless');
        return {
            apiUrl: '/.netlify/functions/generate-role',
            useServerless: true
        };
    } else if (isGitHubPages) {
        // Em GitHub Pages, retorna erro para forçar fallback
        console.log('📖 GitHub Pages detectado - API não disponível, usando fallback');
        throw new Error('API não disponível no GitHub Pages - usando fallback local');
    } else {
        // Fallback padrão - sem API
        console.log('🔧 Ambiente desconhecido - sem API disponível');
        throw new Error('API não configurada - usando fallback local');
    }
}

window.PRODUCTION_MODE = true;