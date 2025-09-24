# 🛡️ Configuração Segura da API

## 🚀 Em Produção (Netlify/GitHub Pages)

A aplicação agora usa **funções serverless** para proteger as chaves da API:

### 1. Configure a Variável de Ambiente

No painel do Netlify:
1. Vá para **Site settings > Environment variables**  
2. Adicione:
   - **Key:** `GOOGLE_GEMINI_API_KEY`
   - **Value:** `AIzaSyCiHRVozYYmHB-5W64QdJzn9dQYAyRl9Tk`

### 2. Deploy

O Netlify automaticamente:
- ✅ Detecta as funções em `/netlify/functions/`
- ✅ Configura endpoint seguro em `/.netlify/functions/generate-role`
- ✅ Mantém as chaves da API no servidor (invisíveis ao navegador)

## 🏠 Em Desenvolvimento Local

### Opção 1: Netlify Dev (Recomendado)
```bash
# Instale o Netlify CLI
npm install -g netlify-cli

# Execute localmente com funções serverless
netlify dev
```

### Opção 2: Servidor Simples
Para desenvolvimento rápido, substitua `YOUR_DEV_API_KEY_HERE` em `config.js` pela sua chave.

⚠️ **NUNCA faça commit da chave real no repositório!**

## 🔧 Como Funciona

### Antes (❌ Inseguro)
```javascript
// Chave exposta no navegador
const API_KEY = 'AIzaSyCiHRVozYYmHB-5W64QdJzn9dQYAyRl9Tk';
fetch(`https://googleapis.com/...?key=${API_KEY}`);
```

### Agora (✅ Seguro)
```javascript
// Chave fica no servidor
fetch('/.netlify/functions/generate-role', {
  body: JSON.stringify({ prompt: userPrompt })
});
```

## 📁 Estrutura dos Arquivos

```
├── netlify/
│   └── functions/
│       └── generate-role.js      # Função serverless
├── netlify.toml                  # Config do Netlify
├── .env.example                  # Template de variáveis
├── package.json                  # Dependencies das funções
└── config.js                     # Config sem chaves (seguro)
```

## 🔐 Benefícios de Segurança

- ✅ **Chaves invisíveis:** Não aparecem no código fonte
- ✅ **Controle de CORS:** Apenas domínios autorizados
- ✅ **Rate limiting:** Controle de requisições  
- ✅ **Logs seguros:** Monitoramento sem exposição
- ✅ **Rotação fácil:** Trocar chave sem redeploy do frontend