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

## Known Issues & Quick Fixes

### 🚨 Critical Accessibility Issues (6 total)
**File:** `gerador-index.html`

1. **Duplicate aria-hidden attribute (Line 287):**
```html
<!-- ❌ PROBLEMA -->
<i class="fas fa-bars" aria-hidden="true" aria-hidden="true"></i>

<!-- ✅ CORREÇÃO -->
<i class="fas fa-bars" aria-hidden="true"></i>
```

2. **Checkboxes without labels (Lines 603-623):**
```html
<!-- ❌ PROBLEMA -->
<input type="checkbox" id="pref-gastronomia" class="mr-2">

<!-- ✅ CORREÇÃO -->
<input type="checkbox" id="pref-gastronomia" class="mr-2" aria-label="Preferência por gastronomia">
```

### 📋 Professional Analysis Methodology
When conducting technical reviews, follow this 6-point structured approach:

1. **Layout & Responsiveness**: Breakpoints, alignment, overflow, flexbox/grid
2. **Typography & Visual Consistency**: Hierarchy, fonts, colors, contrast (WCAG)
3. **Code Organization & Quality**: Structure, naming, duplicates, semantic HTML
4. **Performance & Optimization**: Images, minification, loading strategies, Core Web Vitals
5. **Accessibility & SEO**: ARIA labels, keyboard nav, screen readers, meta tags
6. **Functionality & Bugs**: Forms, JavaScript interactions, error handling, browser compatibility

### 🛠️ Recommended VS Code Extensions for Analysis
Essential extensions for professional code review:
- **CSS Peek** - Advanced CSS navigation
- **HTMLHint** - HTML validation  
- **W3C Web Validator** - Web standards compliance
- **axe DevTools** - Accessibility testing
- **webhint** - Complete web auditing
- **SonarLint** - Code quality analysis
- **Code Metrics** - Complexity analysis
- **Stylelint** - CSS linting
- **Web Accessibility** - a11y auditing

### 🔧 Useful Development Commands
```powershell
# Check installed extensions
# Ctrl+Shift+X -> @installed

# Analyze problems
# Ctrl+Shift+P -> "Problems"

# HTML validation
# F1 -> "HTMLHint"

# Accessibility testing  
# F1 -> "axe DevTools"

# Backup before changes
git add .
git commit -m "Backup antes de correções - $(Get-Date -Format 'dd/MM/yyyy')"
git branch backup-pre-fixes
```