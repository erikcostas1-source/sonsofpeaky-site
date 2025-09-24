# API Backend - Gerador de Rolês
# Estrutura completa de endpoints REST

Esta pasta contém a estrutura completa da API backend do Gerador de Rolês.

## Estrutura de Arquivos

```
api/
├── server.js              # Servidor Express principal
├── config/
│   ├── database.js        # Configuração do banco de dados
│   ├── stripe.js          # Configuração do Stripe
│   ├── paypal.js          # Configuração do PayPal
│   └── email.js           # Configuração de email
├── controllers/
│   ├── auth.js            # Controladores de autenticação
│   ├── users.js           # Controladores de usuários
│   ├── roteiros.js        # Controladores de roteiros
│   ├── payments.js        # Controladores de pagamentos
│   └── admin.js           # Controladores administrativos
├── middleware/
│   ├── auth.js            # Middleware de autenticação
│   ├── validation.js      # Middleware de validação
│   ├── rateLimiting.js    # Middleware de rate limiting
│   └── errorHandler.js    # Middleware de tratamento de erros
├── models/
│   ├── User.js            # Modelo de usuário
│   ├── Roteiro.js         # Modelo de roteiro
│   ├── Subscription.js    # Modelo de assinatura
│   └── Analytics.js       # Modelo de analytics
├── routes/
│   ├── auth.js            # Rotas de autenticação
│   ├── users.js           # Rotas de usuários
│   ├── roteiros.js        # Rotas de roteiros
│   ├── payments.js        # Rotas de pagamentos
│   ├── webhooks.js        # Rotas de webhooks
│   └── admin.js           # Rotas administrativas
├── services/
│   ├── email.js           # Serviço de email
│   ├── storage.js         # Serviço de armazenamento
│   ├── analytics.js       # Serviço de analytics
│   └── ai.js              # Serviço de IA (Gemini)
├── utils/
│   ├── logger.js          # Sistema de logs
│   ├── validation.js      # Utilitários de validação
│   └── crypto.js          # Utilitários de criptografia
└── docs/
    ├── api.md             # Documentação da API
    └── endpoints.md       # Lista de endpoints
```

## Tecnologias Utilizadas

- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **MongoDB** - Banco de dados NoSQL
- **Mongoose** - ODM para MongoDB
- **JWT** - Autenticação
- **Stripe** - Processamento de pagamentos
- **PayPal** - Processamento de pagamentos alternativo
- **Nodemailer** - Envio de emails
- **Winston** - Sistema de logs
- **Joi** - Validação de dados
- **Helmet** - Segurança
- **CORS** - Cross-Origin Resource Sharing

## Instalação

```bash
cd api
npm install
cp .env.example .env
# Configure as variáveis de ambiente
npm run dev
```

## Variáveis de Ambiente

```env
# Servidor
PORT=3000
NODE_ENV=development

# Banco de dados
MONGODB_URI=mongodb://localhost:27017/gerador-roles

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# PayPal
PAYPAL_CLIENT_ID=your-paypal-client-id
PAYPAL_CLIENT_SECRET=your-paypal-secret

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-password

# Google AI
GOOGLE_AI_API_KEY=your-gemini-api-key

# AWS S3 (opcional)
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_BUCKET_NAME=your-bucket-name
```

## Principais Endpoints

### Autenticação
- `POST /api/auth/register` - Registrar usuário
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `POST /api/auth/forgot-password` - Recuperar senha
- `POST /api/auth/reset-password` - Redefinir senha
- `POST /api/auth/verify-email` - Verificar email

### Usuários
- `GET /api/users/profile` - Obter perfil
- `PUT /api/users/profile` - Atualizar perfil
- `DELETE /api/users/account` - Excluir conta
- `GET /api/users/stats` - Estatísticas do usuário

### Roteiros
- `POST /api/roteiros/generate` - Gerar roteiro
- `GET /api/roteiros` - Listar roteiros do usuário
- `GET /api/roteiros/:id` - Obter roteiro específico
- `PUT /api/roteiros/:id` - Atualizar roteiro
- `DELETE /api/roteiros/:id` - Excluir roteiro
- `POST /api/roteiros/:id/favorite` - Favoritar roteiro

### Pagamentos
- `POST /api/payments/create-subscription` - Criar assinatura
- `POST /api/payments/cancel-subscription` - Cancelar assinatura
- `GET /api/payments/billing-portal` - Portal de cobrança
- `POST /api/webhooks/stripe` - Webhook Stripe
- `POST /api/webhooks/paypal` - Webhook PayPal

### Admin
- `GET /api/admin/users` - Listar usuários
- `GET /api/admin/metrics` - Métricas do sistema
- `GET /api/admin/analytics` - Analytics detalhados
- `POST /api/admin/users/:id/suspend` - Suspender usuário

## Recursos de Segurança

- Rate limiting por IP e usuário
- Validação de dados de entrada
- Sanitização de dados
- Headers de segurança (Helmet)
- Criptografia de senhas (bcrypt)
- Tokens JWT seguros
- Proteção contra ataques CSRF
- Logs de auditoria

## Rate Limiting

- **Geral**: 100 requests por 15 minutos
- **Login**: 5 tentativas por 15 minutos
- **Geração de roteiros**: 10 por hora (FREE), ilimitado para planos pagos
- **Reset de senha**: 3 tentativas por hora

## Monitoramento

- Logs estruturados com Winston
- Métricas de performance
- Alertas de erro
- Dashboards de saúde da API

## Deploy

A API está preparada para deploy em:
- **Heroku** - `npm run deploy:heroku`
- **AWS** - `npm run deploy:aws`
- **Docker** - `docker build -t gerador-roles-api .`

## Webhooks

### Stripe
- Subscription created/updated/deleted
- Payment succeeded/failed
- Invoice payment succeeded/failed

### PayPal
- Subscription activated/suspended/cancelled
- Payment completed/failed

## Documentação

A documentação completa da API está disponível em `/docs` quando o servidor está rodando.

## Testes

```bash
npm test              # Executar todos os testes
npm run test:unit     # Testes unitários
npm run test:integration # Testes de integração
npm run test:coverage    # Cobertura de testes
```

## Scripts Disponíveis

```bash
npm run dev           # Desenvolvimento com nodemon
npm run start         # Produção
npm run test          # Executar testes
npm run build         # Build para produção
npm run lint          # Linting com ESLint
npm run format        # Formatação com Prettier
```