# 🏍️ SOP - Projetos Separados

**Repositório com duas aplicações independentes**

## 📁 Estrutura do Repositório

```
SITE/
├── sons-of-peaky/          🏍️ CLUBE DE MOTOS
│   ├── index.html          Site institucional
│   ├── config.js           Config do clube
│   └── README.md           Documentação clube
│
├── gerador-roles/          💼 PLATAFORMA COMERCIAL
│   ├── index.html          Dashboard IA
│   ├── analytics.html      Métricas
│   ├── settings.html       Configurações
│   ├── payment.html        Planos
│   ├── admin.html          Administração
│   ├── config.js           Config comercial
│   └── README.md           Documentação plataforma
│
└── shared/                 🔧 RECURSOS COMPARTILHADOS
    ├── netlify/            Serverless functions
    ├── .github/            CI/CD e instruções
    └── publish.ps1         Script de deploy
```

## 🎯 Projetos

### 🏍️ [Sons of Peaky](./sons-of-peaky/)
**Site institucional do clube de motos**
- História e identidade do clube
- Sistema de irmandade e eventos
- IA Assistant personalizada
- PWA para membros

### 💼 [Gerador de Rolês](./gerador-roles/)
**Plataforma comercial de turismo motociclístico**
- Sistema de geração IA de roteiros
- Dashboard administrativo completo
- Planos de assinatura (Free/Premium/Pro/Enterprise)
- Analytics e métricas de negócio

## 🚀 Como Executar

### Desenvolvimento Local

**Sons of Peaky:**
```bash
cd sons-of-peaky
python -m http.server 8001
# Acesse: http://localhost:8001
```

**Gerador de Rolês:**
```bash
cd gerador-roles  
python -m http.server 8002
# Acesse: http://localhost:8002
```

### Deploy Separado

**Netlify (Recomendado):**
- Clone repositório
- Configure dois sites no Netlify
- Site 1: Build directory = `sons-of-peaky/`
- Site 2: Build directory = `gerador-roles/`

**GitHub Pages:**
```bash
# Use branches separadas
git subtree push --prefix=sons-of-peaky origin gh-pages-clube
git subtree push --prefix=gerador-roles origin gh-pages-comercial
```

## 🔧 Configurações Independentes

- **API Keys**: Cada projeto tem sua própria chave
- **Temas**: Design systems diferentes
- **Funcionalidades**: Sem dependências cruzadas
- **Deploy**: Podem ser hospedados separadamente

## 📊 Comparação

| Aspecto | Sons of Peaky | Gerador de Rolês |
|---------|---------------|------------------|
| **Tipo** | Site institucional | Plataforma SaaS |
| **Público** | Membros do clube | Motociclistas em geral |
| **Monetização** | Sem fins lucrativos | Planos comerciais |
| **Complexidade** | Simples e focado | Sistema completo |
| **IA** | Assistant básico | Gerador avançado |

## 🔗 Conexões

- Sons of Peaky tem link para Gerador (como ferramenta externa)
- Gerador é independente (não referencia o clube)
- Compartilham apenas recursos de infraestrutura

## ✅ Vantagens da Separação

1. **Manutenção**: Cada projeto evolui independentemente
2. **Deploy**: Hospedagem flexível e otimizada
3. **Equipes**: Desenvolvimento paralelo possível
4. **Segurança**: APIs e configs isoladas
5. **Performance**: Carregamento otimizado por uso

---

**📈 Status Atual:** 
- ✅ Estrutura separada implementada
- ✅ Configs independentes criadas  
- ✅ Links corrigidos entre projetos
- ✅ READMEs atualizados
- ✅ Pronto para deploy