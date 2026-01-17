# FinMail AI Classifier

Aplicação web para **classificação inteligente de emails corporativos**, utilizando **Large Language Models (LLMs)** para análise de conteúdo, prioridade, sentimento e sugestão de resposta.

O sistema foi desenvolvido com foco em **produtividade operacional**, **auditoria** e **escala**, permitindo tanto o processamento individual quanto em lote de emails no formato `.txt`.

## Demo Online (Deploy)

A aplicação está disponível online (**Plataforma de deploy**: Render):

- **Front-end**: https://finmail-frontend.onrender.com  
- **Back-end (API)**: https://finmail-backend.onrender.com  

👉 Para testar a aplicação **não é necessário rodar o projeto localmente**, basta acessar o link do front-end.

---

## Arquitetura

O projeto consiste em:
- **Front-end**: React + TypeScript + Vite + Tailwind CSS (via CDN) + Comunicação via HTTP com a API
- **Back-end**: Python + FastAPI + Integração com **Groq AI** (LLMs)

## Pré-requisitos (para execução local)

- Node.js (para o front-end)
- Python 3.8+ (para o back-end)
- Conta gratuita no **Groq Console**

## Configuração e Execução local

1. Clone o projeto e acesse a pasta raiz
   ```bash
   git clone https://github.com/Bruno-Jordao/finmail-ai-classifier.git
   cd finmail-ai-classifier
   ```

### Back-end (Python)

1. Navegue até a pasta do back-end:
   ```bash
   cd backend
   ```

2. Instale as dependências:
   ```bash
   pip install -r requirements.txt
   ```

3. Configure a variável de ambiente:
   ```bash
   # Crie um arquivo .env na pasta backend
   echo "GROQ_API_KEY=sua_chave_groq_aqui" > .env
   ```
   Obtenha sua chave em: https://console.groq.com/keys

4. Execute o servidor:
   ```bash
   uvicorn main:app --reload --port 8000
   ```

O back-end estará disponível em `http://localhost:8000`

### Front-end (React)

1. Instale as dependências:
   ```bash
   npm install
   ```

2. (Opcional) Configure a URL da API do back-end:
   ```bash
   # Crie um arquivo .env.local na raiz do projeto
   echo "VITE_API_URL=http://localhost:8000" > .env.local
   ```
   Por padrão, o front-end usa `http://localhost:8000`

3. Execute o front-end:
   ```bash
   npm run dev
   ```

O front-end estará disponível em `http://localhost:3000`

## A interface permite classificar emails de **duas formas**:

---

### Classificação Individual (Texto Manual)

1. Selecione a aba **Entrada Individual**
2. Cole o conteúdo do email no campo de texto
3. Clique em **Classificar Email**

O sistema irá retornar:
- Categoria (Produtivo ou Improdutivo)
- Resumo do email
- Motivo da classificação
- Prioridade
- Sentimento
- Resposta sugerida

---

### Processamento em Lote (Arquivo `.txt`)

1. Selecione a aba **Processamento em Lote**
2. Faça upload de um arquivo `.txt` (na pasta emails-teste já tem um arquivo pronto para testes chamado `emails.txt`)
3. O sistema irá processar **um email por linha**

#### 📌 Formato esperado do arquivo `.txt`

- Cada **linha representa um email completo**
- Não é necessário cabeçalho


## API Endpoints

- `GET /` - Informações da API
- `GET /health` - Health check
- `GET /api/models` - Lista modelos disponíveis do Groq
- `POST /api/classify` - Classifica um email

