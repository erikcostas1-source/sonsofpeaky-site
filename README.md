# 🏍️ Sons of Peaky - Site Oficial

> **Site estático inteligente** com gerador de rolês de moto alimentado por IA para o grupo Sons of Peaky.

[![Deploy Status](https://img.shields.io/badge/deploy-success-brightgreen)](https://erikcostas1-source.github.io/sonsofpeaky-site/)
[![API Security](https://img.shields.io/badge/API-secured-blue)](https://github.com/erikcostas1-source/sonsofpeaky-site)
[![License](https://img.shields.io/badge/license-MIT-orange)](#)

## 🚀 **Funcionalidades Principais**

### **🤖 Gerador de Rolês IA**
- **3 sugestões personalizadas** (Econômica, Equilibrada, Premium)
- **Sistema de votação colaborativa** para grupos
- **Checklist inteligente** com dicas específicas
- **Google Calendar integrado** com múltiplas entradas
- **Compartilhamento social** (WhatsApp, Instagram, Maps)

### **🛡️ Segurança de API**
- **Funções serverless** protegem chaves da Google Gemini API
- **Detecção automática** de ambiente (dev/prod)
- **Configuração segura** sem exposição de credenciais

### **📱 Experiência Premium**
- **Interface responsiva** mobile-first
- **Sistema de favoritos** com localStorage
- **PWA completa** com offline support
- **Compartilhamento nativo** e links únicos

## 📁 **Estrutura do Projeto**

```
├── 🏠 SITE PRINCIPAL
│   ├── index.html              # Site institucional
│   ├── styles.css              # Design system
│   └── app.js                  # Funcionalidades gerais
│
├── 🤖 GERADOR DE ROLÊS
│   ├── gerador-index.html      # Interface do gerador
│   ├── gerador.js              # Lógica IA + UX
│   └── destinos.js             # Base de dados
│
├── 🛡️ SEGURANÇA
│   ├── netlify/functions/      # API serverless
│   ├── config.js               # Configuração segura
│   └── .env.example            # Template variáveis
│
└── 📚 DOCUMENTAÇÃO
    ├── .github/copilot-instructions.md
    └── README.md               # Este arquivo
```

## 🔧 **Configuração e Deploy**

### **🏠 Desenvolvimento Local**

```powershell
# 1. Clone o repositório
git clone https://github.com/erikcostas1-source/sonsofpeaky-site.git
cd sonsofpeaky-site

# 2. Execute servidor local
python -m http.server 8000

# 3. Acesse no navegador
# http://localhost:8000/gerador-index.html
```

### **🌐 Deploy Automático (Netlify)**

**Configuração de Produção:**
1. **Fork/Clone** este repositório
2. **Conecte ao Netlify** via GitHub
3. **Configure variável de ambiente:**
   - `GOOGLE_GEMINI_API_KEY` = `sua_chave_aqui`
4. **Deploy automático** 🚀

**GitHub Pages (Alternativo):**
```powershell
# Deploy direto via script
.\publish.ps1 -GitRemote "https://github.com/seu-usuario/seu-repo.git"
```

### **🔐 Configuração de API**

#### **Produção (Seguro)**
```javascript
// Netlify Functions protegem a chave
fetch('/.netlify/functions/generate-role', {
  method: 'POST',
  body: JSON.stringify({ prompt: userInput })
});
```

#### **Desenvolvimento Local**
```javascript
// Detecção automática de ambiente
const isDev = window.location.hostname === 'localhost';
// Usa API direta apenas em localhost
```

## 🎯 **Principais Implementações**

### **✅ Sistema de 3 Sugestões**
- **IA Gemini 1.5 Flash** gera variações inteligentes
- **Cards comparativos** com hover effects
- **Seleção interativa** antes do compartilhamento
- **Analytics** de preferências por tipo

### **✅ Votação Colaborativa**
```javascript
// Gera link único para votação em grupo
const collaborativeLink = generateCollaborativeLink(roteiros, formData);
// Amigos votam sem preencher formulário
// Resultado em tempo real com ranking
```

### **✅ Google Calendar Avançado**
- **Evento único**: Rolê completo com checklist
- **Múltiplas entradas**: Cada destino com horário específico
- **Dicas contextuais** incluídas nas descrições
- **Localização precisa** para cada parada

### **✅ Checklist Inteligente**
```javascript
// Categorização automática de dicas
categories = {
  '🛡️ Equipamentos': equipamentos,
  '📞 Reservas': contatos,
  '🛣️ Estrada': condicoes,
  '⏰ Horários': clima,
  '🚨 Emergência': seguranca
};
```

## 🔒 **Segurança Implementada**

### **API Protection**
- ✅ **Chaves ocultas** no servidor
- ✅ **CORS configurado** para domínios autorizados
- ✅ **Rate limiting** automático
- ✅ **Logs seguros** sem exposição

### **Environment Detection**
```javascript
// Automático: prod vs dev
const isProd = !window.location.hostname.includes('localhost');
const apiUrl = isProd 
  ? '/.netlify/functions/generate-role'  // Seguro
  : 'direct-api-url';                    // Desenvolvimento
```

## 📊 **Métricas e Analytics**

- **Eventos rastreados**: Geração, seleção, compartilhamento
- **Tipos preferidos**: Econômico vs Premium
- **Taxa de conversão**: Formulário → Compartilhamento
- **Uso de funcionalidades**: Favoritos, votação, calendar

## 🛠️ **Stack Tecnológica**

| **Categoria** | **Tecnologia** |
|---------------|----------------|
| **Frontend** | HTML5, CSS3, Vanilla JavaScript |
| **Design** | Tailwind CSS, Custom CSS Grid |
| **IA/API** | Google Gemini 1.5 Flash |
| **Backend** | Netlify Functions (Node.js) |
| **Storage** | localStorage, sessionStorage |
| **Deploy** | GitHub Pages, Netlify |

## 🚀 **Roadmap e Melhorias**

### **🔄 Em Desenvolvimento**
- [ ] **Integração WhatsApp Business API**
- [ ] **Sistema de reviews** de roteiros
- [ ] **Mapa interativo** com overlays
- [ ] **Previsão do tempo** por destino

### **💡 Ideias Futuras**
- [ ] **App mobile nativo** (React Native)
- [ ] **Sistema de membros** com perfis
- [ ] **Marketplace** de produtos moto
- [ ] **Blog integrado** com CMS

## 📞 **Suporte e Contribuição**

- **🐛 Bug reports**: [Issues no GitHub](https://github.com/erikcostas1-source/sonsofpeaky-site/issues)
- **💡 Feature requests**: Abra uma issue com `[FEATURE]`
- **🤝 Contribuições**: Fork → PR com testes
- **📧 Contato**: Via issues do GitHub

## 📜 **Licença**

Este projeto está sob licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

---

<div align="center">

**🏍️ Feito com ❤️ pelos Sons of Peaky**

[🌐 Site Ao Vivo](https://erikcostas1-source.github.io/sonsofpeaky-site/) • [📖 Documentação](https://github.com/erikcostas1-source/sonsofpeaky-site) • [🐛 Reportar Bug](https://github.com/erikcostas1-source/sonsofpeaky-site/issues)

</div>
