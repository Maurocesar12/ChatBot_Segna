# 🤖 ChatBot Segna (Zap-GPT)

Este projeto implementa um assistente virtual inteligente que integra o WhatsApp à inteligência artificial da OpenAI (ChatGPT) e Gemini, oferecendo interações humanizadas e automáticas para diversos casos de uso, como atendimento ao cliente, suporte técnico ou ações de marketing.

---

## 🚀 Funcionalidades

- Integração com o WhatsApp via [WPPConnect](https://github.com/wppconnect-team/wppconnect);
- Respostas automáticas com base na API da OpenAI (assistants ou completions);
- Compatível com o modelo Gemini (Google Generative AI);
- Suporte a múltiplos usuários e autenticação via chave secreta;
- Banco de dados MongoDB para persistência de dados;
- Modularidade para diferentes estratégias de prompts;
- CLI para configuração interativa;
- Suporte completo a Typescript.

---

## 🛠️ Tecnologias Utilizadas

- **Node.js 18+**
- **Typescript**
- **OpenAI SDK**
- **Google Generative AI SDK**
- **WPPConnect**
- **MongoDB + Mongoose**
- **dotenv**
- **PM2** para orquestração de processos
- **Tsup + TSX** para build e dev
- **Prettier + ESLint** para padronização

---

## ⚙️ Instalação

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/ChatBot_Segna.git
cd ChatBot_Segna

# Instale as dependências
npm install

# Copie e edite as variáveis de ambiente
cp .env.example .env
```
--
##Precisa configurar o .env
--
##▶️ Execução

# Ambiente de desenvolvimento (hot reload)
npm run dev

# Compilar para produção
npm run build

# Iniciar em modo produção com PM2
npm run start

# Parar o serviço
npm run stop

##🧠 Configuração do Assistente
Na primeira execução, você pode configurar os prompts, chaves das APIs e integração com o WhatsApp com o comando:

-> npm run config

src/
├── index.ts            # Ponto de entrada
├── config/             # Configurações e variáveis
├── services/           # Lógicas de negócio (ChatGPT, Gemini, WhatsApp, etc)
├── models/             # Schemas do Mongoose
├── utils/              # Utilitários auxiliares
└── prompts/            # Prompts personalizados

👨‍💻 Autor
Desenvolvido por Mauro César Guimarães Santos Junior
