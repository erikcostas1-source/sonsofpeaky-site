# 💼 Gerador de Rolês - Plataforma IA

**Plataforma comercial de geração inteligente de roteiros motociclísticos**

## 🎯 Sobre o Projeto

Sistema completo de negócios focado em turismo motociclístico com IA:

- Geração automática de roteiros personalizados
- Sistema de autenticação e planos
- Dashboard administrativo completo
- Analytics e métricas detalhadas
- Pagamentos e assinaturas
- Configurações avançadas

## ⚡ Funcionalidades Principais

- ✅ **Gerador IA**: Roteiros personalizados com Google Gemini
- ✅ **Sistema de Usuários**: Registro, login, perfis
- ✅ **Planos Premium**: Free, Premium, Pro, Enterprise
- ✅ **Dashboard Admin**: Gestão completa do sistema
- ✅ **Analytics**: Métricas de uso e performance
- ✅ **Pagamentos**: Integração Stripe/PayPal
- ✅ **PWA**: Aplicativo instalável
- ✅ **API**: Endpoints para integração

## 💳 Planos Disponíveis

| Plano | Gerações/mês | Preço | Recursos |
|-------|-------------|-------|----------|
| **Free** | 5 | Gratuito | Básico |
| **Premium** | 50 | R$ 19,90 | Avançado + PDF |
| **Pro** | 200 | R$ 49,90 | API + Analytics |
| **Enterprise** | Ilimitado | R$ 199,90 | Custom + Dedicado |

## 🚀 Como Executar

### Desenvolvimento Local

```bash
cd gerador-roles
python -m http.server 8000
```

### Com Netlify Dev (Recomendado)

```bash
netlify dev
```

### Produção

- **Netlify**: Deploy automático com serverless functions
- **GitHub Pages**: Deploy estático com API direta

## 📁 Estrutura do Projeto

```
gerador-roles/
├── index.html          # Dashboard principal
├── analytics.html      # Métricas e relatórios
├── settings.html       # Configurações do usuário
├── payment.html        # Planos e pagamentos
├── admin.html          # Painel administrativo
├── auth.js             # Sistema de autenticação
├── gerador.js          # IA de geração de roteiros
├── destinos.js         # Base de dados de destinos
├── config.js           # Configurações da API
└── styles.css          # Tema clean/corporativo
```

## 🔧 Configuração

### API Keys Necessárias

1. **Google Gemini** (Obrigatório)

   ```javascript
   // Em config.js
   GOOGLE_API_KEY = 'sua-chave-aqui'
   ```

2. **Stripe/PayPal** (Opcional)

   ```javascript
   // Para pagamentos
   STRIPE_PUBLIC_KEY = 'pk_...'
   ```

3. **MongoDB** (Opcional)

   ```javascript
   // Para backend premium
   MONGODB_URI = 'mongodb://...'
   ```

## 🌐 Deploy

### Netlify (Recomendado)

```bash
# 1. Configure environment variables
GOOGLE_GEMINI_API_KEY=sua-chave

# 2. Deploy automático via Git
git push origin main
```

### GitHub Pages

```bash
# Use o script de deploy
./publish.ps1 -GitRemote "repo-url" -Branch main
```

## 🔒 Segurança

- **Netlify**: API keys protegidas via serverless functions
- **GitHub Pages**: API keys públicas (aceitável para este projeto)
- **Desenvolvimento**: Chaves separadas em `dev-config.js`

## 🛠️ Tecnologias

- **Frontend**: HTML5, CSS3, JavaScript ES6+
- **IA**: Google Gemini 1.5 Flash
- **Auth**: JWT + LocalStorage
- **Payments**: Stripe/PayPal APIs
- **Charts**: Chart.js
- **Deploy**: Netlify Functions / GitHub Actions

## 📊 Analytics

- Métricas de uso em tempo real
- Relatórios de conversão
- Análise de roteiros gerados
- Performance da IA
- Dados de usuários

## 🎯 Roadmap

- [ ] Backend completo (Node.js + MongoDB)
- [ ] App mobile (React Native)
- [ ] Integração com mapas
- [ ] Sistema de reviews
- [ ] Marketplace de roteiros
- [ ] API pública

---

**💼 Gerador de Rolês - Transformando aventuras em negócios**