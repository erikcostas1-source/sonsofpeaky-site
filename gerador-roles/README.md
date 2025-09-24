# Gerador de Rolês - Plataforma de Turismo Motociclístico 🏍️

**Plataforma completa para geração de roteiros de moto com IA**

[![Deploy Status](https://img.shields.io/badge/deploy-ready-brightgreen)](https://github.com/erikcostas1-source/gerador-roles)
[![PWA Ready](https://img.shields.io/badge/PWA-ready-blue)](https://github.com/erikcostas1-source/gerador-roles)
[![Enterprise Ready](https://img.shields.io/badge/enterprise-ready-purple)](https://github.com/erikcostas1-source/gerador-roles)

## 🚀 Características

- **IA Avançada**: Powered by Google Gemini para sugestões inteligentes
- **Destinos Reais**: Endereços completos e informações precisas
- **Cálculos Automáticos**: Combustível, custos e tempos de viagem
- **PWA**: Instalável como app no celular
- **Offline Ready**: Funciona sem internet usando cache
- **Mobile First**: Otimizado para dispositivos móveis

## 🛠️ Tecnologias

- **Frontend**: HTML5, CSS3, JavaScript ES6+
- **Styling**: Tailwind CSS + Custom CSS
- **IA**: Google Gemini API
- **PWA**: Service Worker + Web App Manifest
- **Icons**: Font Awesome
- **Deploy**: GitHub Pages

## 📱 Funcionalidades

### ✨ Geração Inteligente
- Formulário completo com preferências pessoais
- IA analisa experiência desejada
- Sugestões baseadas em orçamento e tipo de moto
- Cálculos precisos de consumo e custos

### 🎯 Personalização Total
- Tipo de moto (125cc até 1000cc+)
- Perfil de pilotagem (conservador a esportivo)
- Nível de aventura (tranquilo a aventureiro)
- Preferências (gastronomia, natureza, história, etc.)

### 📊 Informações Detalhadas
- Destinos com endereços completos
- Custos detalhados por categoria
- Dicas específicas para motociclistas
- Tempos de viagem e permanência

### 🔧 Recursos Avançados
- **Compartilhamento**: Via Web Share API ou clipboard
- **Salvamento**: LocalStorage para roteiros favoritos
- **Histórico**: Últimas gerações salvas automaticamente
- **Exportação**: PDF (em desenvolvimento)

## 🗂️ Estrutura do Projeto

```
gerador-roles/
├── index.html          # Página principal
├── styles.css          # Estilos customizados
├── gerador.js          # JavaScript principal
├── manifest.json       # PWA manifest
├── sw.js              # Service Worker
└── README.md          # Esta documentação
```

## 🚀 Como Usar

### 1. **Acesso Direto**
Visite: [gerador-roles.com](https://gerador-roles.com/)

### 2. **Instalação como App**
1. Abra no celular
2. Clique em "Instalar App" ou "Adicionar à tela inicial"
3. Use como app nativo

### 3. **Desenvolvimento Local**
```bash
# Clone o repositório
git clone https://github.com/gerador-roles/gerador-roles.git

# Navegue para o diretório
cd gerador-roles

# Sirva localmente
python -m http.server 8000
# ou
npx serve .

# Acesse http://localhost:8000
```

## ⚙️ Configuração

### API Key
A API key do Google Gemini está configurada em `gerador.js`:

```javascript
const GOOGLE_API_KEY = 'AIzaSyB6MdY8jd1pxAw-K0LN3F3xF8Z5q5dFmJE';
```

### Personalização
Para customizar destinos ou configurações:

1. **Destinos**: Edite `destinos.js`
2. **Estilos**: Modifique `styles.css`
3. **Comportamento**: Altere `gerador.js`

## 📈 Performance

- **Cache First**: Recursos estáticos em cache
- **API Cache**: Respostas da IA cachadas por 30min
- **Lazy Loading**: Carregamento otimizado
- **Offline Mode**: Funciona sem internet

## 🔒 Privacidade

- **Dados Locais**: Formulário salvo apenas no dispositivo
- **No Tracking**: Sem coleta de dados pessoais
- **API Segura**: Chamadas diretas ao Google Gemini

## 🚧 Roadmap

- [ ] **Mapas Integrados**: Google Maps/OpenStreetMap
- [ ] **Exportação PDF**: Roteiros em PDF
- [ ] **Comunidade**: Compartilhar e avaliar roteiros
- [ ] **Notificações**: Lembretes de viagem
- [ ] **Offline Maps**: Mapas offline para rotas

## 🤝 Contribuição

1. Fork o projeto
2. Crie sua feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está licenciado sob a MIT License. Veja o arquivo LICENSE para mais detalhes.

## 🆘 Suporte

- **Website**: [gerador-roles.com](https://gerador-roles.com/)
- **Issues**: [GitHub Issues](https://github.com/gerador-roles/gerador-roles/issues)  
- **Email**: suporte@gerador-roles.com

---

<div align="center">

**Desenvolvido com ❤️ para a comunidade motociclística**

🏍️ **Gerador de Rolês** - Sua próxima aventura começa aqui!

</div>