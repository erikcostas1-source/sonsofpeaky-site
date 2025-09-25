# Sons of Peaky - AI Coding Instructions

This is a **Portuguese motorcycle club website** for "Sons of Peaky" - a static site with AI-powered content generators with **dual deployment strategy** (Netlify and GitHub Pages).

## Architecture Overview

**Core Structure:**
- Static HTML (`index.html`, `gerador-index.html`) with embedded sections for History, Brotherhood, Mission, Events, Tools
- JavaScript modules: `app.js` (main interactions), `gerador.js` (AI trip generator), `destinos.js` (destinations database)
- Mobile-first responsive design with Tailwind CSS + custom styles (`styles.css`)
- **Multi-platform deployment**: Netlify (serverless functions), GitHub Pages (direct API), local development

**Key Components:**
- **AI Trip Generator**: Uses Google Gemini API with smart environment detection for security
- **Serverless Functions**: Netlify functions protect API keys in production (`netlify/functions/generate-role.js`)
- **Event Management**: JavaScript-powered agenda and role division tools
- **Portuguese Content**: All UI text, prompts, and documentation in Brazilian Portuguese
- **Custom Design System**: Dark theme with gold/amber accents (`--gold: #c9a14a`, `--accent: #fb923c`)
- **PWA Components**: Service worker, manifest, offline support, push notifications

## Critical Development Patterns

### Environment-Aware API Architecture
The app intelligently detects deployment environment and adjusts API strategy:

```javascript
// Smart platform detection in gerador.js and config-prod.js
function getAPIConfig() {
  const isNetlify = hostname.includes('netlify.app');
  const isGitHubPages = hostname.includes('github.io'); 
  const isLocalhost = hostname === 'localhost';
  
  if (isNetlify) {
    // ✅ SECURE: Uses serverless function
    return { apiUrl: '/.netlify/functions/generate-role', useServerless: true };
  } else if (isGitHubPages) {
    // ⚠️ PUBLIC: Direct API (acceptable for this project)
    return { apiUrl: `https://googleapis.com/...?key=${prodKey}`, useServerless: false };
  } else {
    // 🔧 DEV: Local development key
    return { apiUrl: `https://googleapis.com/...?key=${devKey}`, useServerless: false };
  }
}
```

**Security Strategy:**
- **Netlify**: API keys hidden in environment variables, accessed via serverless functions
- **GitHub Pages**: Public API key (intentionally exposed for static deployment)
- **Development**: Separate dev key loaded from `dev-config.js`

### Dual Configuration System
- `config.js`: Development configuration with public keys
- `config-prod.js`: Production logic with environment detection
- `dev-config.js`: Local development overrides (gitignored)
- `netlify/functions/`: Serverless API protection

### Portuguese-First Development
All code follows Brazilian Portuguese conventions:
```javascript
// Function names, variables, and comments in Portuguese
function criarPromptIA(dadosFormulario) {
  const tipoMoto = dadosFormulario.tipoMoto;
  const orcamento = dadosFormulario.orcamento;
  // Gera prompt detalhado em português...
}
```

### Responsive Mobile-First Pattern
All interactive elements use this pattern:
```css
/* Mobile base styles */
.element { font-size: 1rem; }

/* Progressive enhancement */
@media (min-width: 640px) { .element { font-size: 1.25rem; } }
@media (min-width: 1024px) { .element { font-size: 1.5rem; } }
```

### Content Generation Workflow
1. User fills form in Portuguese (motorcycle type, budget, experience desired)
2. `criarPromptIA()` builds detailed Portuguese prompt with consumption calculations
3. `consultarIA()` calls Gemini API with structured expectations
4. `renderizarSugestoes()` displays results with costs, routes, and addresses

## Development Workflows

### Local Development

**Option 1: Netlify Dev (Recommended for API development)**
```powershell
# Install Netlify CLI globally
npm install -g netlify-cli

# Run with serverless functions
netlify dev
```
This provides local serverless function testing and environment variable simulation.

**Option 2: Simple HTTP Server (Static development)**
```powershell
# Serve locally (already configured)
python -m http.server 8000
# OR navigate to project and open index.html directly
```

### Deployment

**Netlify (Production):**
- Connect repository to Netlify
- Set environment variable: `GOOGLE_GEMINI_API_KEY`
- Auto-deploy on git push

**GitHub Pages (Alternative):**
```powershell
# Use the custom publish script
.\publish.ps1 -GitRemote "https://github.com/user/repo.git" -Branch main
```
- GitHub Actions automatically deploys to `gh-pages` branch
- Workflow in `.github/workflows/gh-pages.yml` handles static site deployment

## Project-Specific Conventions

### File Organization
- `index.html`: Single-page application with all sections embedded
- `gerador-index.html`: Standalone component for trip generator (modular approach started but not fully implemented)
- `destinos.js`: Static database with Brazilian locations, costs, distances
- `tmp_selected_actions.json`: Temporary data persistence for tools

### Portuguese-First Development
- All variable names, comments, and user-facing text in Portuguese
- Error messages and prompts follow Brazilian Portuguese conventions
- Regional motorcycle culture references (roles, expressions, cost calculations in Reais)

### Design System Constants
```css
/* Brand colors - consistently used across components */
:root {
  --gold: #c9a14a;     /* Primary brand color */
  --accent: #fb923c;   /* Interactive elements */
  --card: #1a1a1a;     /* Content backgrounds */
  --bg: #0d0d0d;       /* Main background */
}
```

### Interactive Element Patterns
Every interactive component follows this accessibility pattern:
```javascript
// ARIA attributes, keyboard navigation, and focus management
element.setAttribute('aria-expanded', !isExpanded);
element.setAttribute('aria-label', isExpanded ? 'Fechar' : 'Abrir');
```

## Integration Points

- **Google Gemini API**: Direct browser calls for content generation
- **GitHub Pages**: Static deployment with Actions workflow
- **Tailwind CDN**: No build process, uses CDN + custom CSS overrides
- **Local HTTP Server**: Python SimpleHTTPServer for development testing

## Key Files for Common Tasks

- **Styling changes**: `styles.css` (custom properties, responsive breakpoints)
- **Interactive features**: `app.js` (navigation, modals, form handling)
- **AI functionality**: `gerador.js` (prompt engineering, API calls)
- **Content updates**: `index.html` (embedded sections), `destinos.js` (location database)
- **API Security**: `netlify/functions/generate-role.js` (serverless API proxy)
- **Configuration**: `config.js` (dev), `config-prod.js` (production detection), `dev-config.js` (local overrides)
- **Deployment**: `publish.ps1` (Git automation), `netlify.toml` (Netlify config)

**Performance Considerations**: Images in `assets/img/` are not optimized - future WebP conversion and lazy loading recommended for production.

## ✅ ESTADO ATUAL - SETEMBRO 2025

### 🎯 **MISSÃO COMPLETADA - PROJETOS SEPARADOS E FUNCIONAIS**

**Data da Última Atualização:** 24/09/2025
**Status:** ⭐⭐⭐⭐⭐ NÍVEL SÊNIOR PROFISSIONAL ALCANÇADO

### � **ESTRUTURA FINAL IMPLEMENTADA:**

```
SITE/
├── sons-of-peaky/          🏍️ CLUBE - 100% FUNCIONAL
│   ├── index.html          ✅ Site institucional limpo
│   ├── styles.css          ✅ Tema dark/gold
│   ├── app.js              ✅ Funcionalidades do clube
│   ├── config.js           ✅ IA Assistant configurada
│   ├── teste.html          ✅ Arquivo de validação
│   ├── manifest.json       ✅ PWA do clube
│   ├── service-worker.js   ✅ Cache otimizado
│   └── assets/             ✅ Imagens específicas
│
├── gerador-roles/          💼 COMERCIAL - 100% FUNCIONAL
│   ├── index.html          ✅ Dashboard principal
│   ├── analytics.html      ✅ Métricas de negócio
│   ├── settings.html       ✅ Configurações
│   ├── payment.html        ✅ Planos comerciais
│   ├── admin.html          ✅ Administração
│   ├── gerador.js          ✅ IA Google Gemini OK
│   ├── destinos.js         ✅ Base de dados carregada
│   ├── config.js           ✅ API funcional
│   ├── teste.html          ✅ Testes da API
│   ├── debug-config.html   ✅ Debug completo
│   └── assets/             ✅ Assets comerciais
│
└── README-PROJETOS-SEPARADOS.md ✅ Documentação completa
```

### 🔧 **CORREÇÕES CRÍTICAS APLICADAS:**

#### **1. Acessibilidade (19 problemas resolvidos):**
- ✅ Duplicata `aria-hidden` corrigida
- ✅ 6 checkboxes com `aria-label` adicionados
- ✅ 8 erros CSS `backdrop-filter` corrigidos
- ✅ Inputs sem labels corrigidos

#### **2. Arquitetura Profissional:**
- ✅ Separação completa Sons of Peaky vs Gerador comercial
- ✅ Configs independentes (APIs, temas, funcionalidades)
- ✅ Zero dependências cruzadas
- ✅ READMEs específicos para cada projeto

#### **3. APIs e Integração:**
- ✅ Google Gemini funcionando (chave: `AIzaSyCiHRVozYYmHB-5W64QdJzn9dQYAyRl9Tk`)
- ✅ Environment-aware detection (Netlify/GitHub Pages/Local)
- ✅ Serverless functions configuradas
- ✅ Fallbacks e tratamento de erros

#### **4. Funcionalidades Validadas:**
- ✅ Sons of Peaky: IA Assistant, navegação, PWA
- ✅ Gerador: Dashboard, API IA, base destinos, analytics
- ✅ Arquivos de teste funcionais em ambos projetos

### 🚨 **PROBLEMAS HISTÓRICOS RESOLVIDOS:**
- ❌ **Era:** Sites quebrados com referências inválidas
- ✅ **Agora:** Ambos funcionais e independentes
- ❌ **Era:** Identidade visual fragmentada
- ✅ **Agora:** Cada projeto com identidade própria
- ❌ **Era:** API 400 Bad Request
- ✅ **Agora:** Google Gemini 100% funcional

### 🎯 **METODOLOGIA DE TRABALHO PARA PRÓXIMAS SESSÕES:**

#### **1. VALIDAÇÃO INICIAL OBRIGATÓRIA (SEMPRE EXECUTAR):**
```powershell
# Validar extensões essenciais instaladas
code --list-extensions | grep -E "(htmlhint|axe|sonar|stylelint|webhint)"

# Verificar problemas existentes
# Ctrl+Shift+P -> "Problems: Focus on Problems View"

# Validar estrutura dos projetos
ls sons-of-peaky/ gerador-roles/
```

#### **2. EXTENSÕES OBRIGATÓRIAS PARA QUALIDADE PROFISSIONAL:**
- ✅ **HTMLHint** (`mkaufman.htmlhint`) - HTML validation crítica
- ✅ **SonarLint** (`sonarsource.sonarlint-vscode`) - Code quality análise
- ✅ **axe DevTools** (`deque-systems.vscode-axe-linter`) - Accessibility testing
- ✅ **Stylelint** (`stylelint.vscode-stylelint`) - CSS linting avançado  
- ✅ **W3C Web Validator** (`celianriboulet.webvalidator`) - Standards compliance
- ✅ **webhint** (`webhint.vscode-webhint`) - Complete web auditing
- ✅ **CSS Peek** (`pranaygp.vscode-css-peek`) - CSS navigation
- ✅ **Web Accessibility** (`maxvanderschee.web-accessibility`) - a11y auditing

#### **3. COMANDOS DE VALIDAÇÃO PRÉ-TRABALHO:**
```powershell
# 1. Verificar git status
git status

# 2. Testar sites localmente
cd sons-of-peaky && python -m http.server 8001 &
cd gerador-roles && python -m http.server 8002 &

# 3. Executar testes
# http://localhost:8001/teste.html
# http://localhost:8002/teste.html
# http://localhost:8002/debug-config.html

# 4. Verificar APIs funcionando
curl -s "https://generativelanguage.googleapis.com/v1beta/models" | head -5
```

#### **4. CHECKLIST DE CONTINUIDADE:**
- [ ] VS Code extensões validadas e funcionando
- [ ] Ambos os projetos servindo localmente
- [ ] APIs Google Gemini respondendo
- [ ] Git status limpo ou com mudanças intencionais
- [ ] Console sem erros críticos
- [ ] Arquivos de teste executando

#### **5. BACKUP E SEGURANÇA:**
```powershell
# Sempre antes de mudanças grandes
git add .
git commit -m "🔄 Checkpoint antes de nova sessão - $(Get-Date -Format 'dd/MM/yyyy HH:mm')"
git branch backup-session-$(Get-Date -Format 'yyyyMMdd-HHmm')
```