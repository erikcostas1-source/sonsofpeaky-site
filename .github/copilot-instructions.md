# Sons of Peaky - AI Coding Instructions

This is a **Portuguese motorcycle club website** for "Sons of Peaky" - a static site with AI-powered content generators deployed on GitHub Pages.

## Architecture Overview

**Core Structure:**
- Static HTML (`index.html`) with embedded sections for History, Brotherhood, Mission, Events, Tools
- JavaScript modules: `app.js` (main interactions), `gerador_role_novo.js` (AI trip generator), `destinos.js` (destinations database)
- Mobile-first responsive design with Tailwind CSS + custom styles (`styles.css`)
- Dual deployment: local HTTP server for development, GitHub Pages for production

**Key Components:**
- **AI Trip Generator**: Uses Google Gemini API to create personalized motorcycle trip suggestions based on user preferences
- **Event Management**: JavaScript-powered agenda and role division tools
- **Portuguese Content**: All UI text, prompts, and documentation in Brazilian Portuguese
- **Custom Design System**: Dark theme with gold/amber accents (`--gold: #c9a14a`, `--accent: #fb923c`)

## Critical Development Patterns

### AI Integration Architecture
```javascript
// API keys exposed in config.js and gerador_role_novo.js
window.SOP_CONFIG = { textUrl: "...googleapis.com/...?key=API_KEY" };
const GOOGLE_API_KEY = 'API_KEY'; // Direct in JS files
```
**Important**: API keys are **intentionally public** for this static site. Future security improvements noted in TODO comments.

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
```powershell
# Serve locally (already configured)
python -m http.server 8000
# OR navigate to project and open index.html directly
```

### Deployment
```powershell
# Use the custom publish script
.\publish.ps1 -GitRemote "https://github.com/user/repo.git" -Branch main
```
- GitHub Actions automatically deploys to `gh-pages` branch
- Workflow in `.github/workflows/gh-pages.yml` handles static site deployment

## Project-Specific Conventions

### File Organization
- `index.html`: Single-page application with all sections embedded
- `novo_gerador.html`: Standalone component for trip generator (modular approach started but not fully implemented)
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
- **AI functionality**: `gerador_role_novo.js` (prompt engineering, API calls)
- **Content updates**: `index.html` (embedded sections), `destinos.js` (location database)
- **Deployment**: `publish.ps1` (Git automation), `.github/workflows/gh-pages.yml` (CI/CD)

**Performance Considerations**: Images in `assets/img/` are not optimized - future WebP conversion and lazy loading recommended for production.