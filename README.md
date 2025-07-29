# PriBor - Sistema de Gerenciamento de Estoque de Veículos

Sistema web simples para gerenciamento de estoque de veículos, construído com Node.js + Express + TypeScript no backend, MongoDB como banco de dados, e HTML/CSS/JavaScript puro no frontend.

## Funcionalidades

- ✅ **Listagem de veículos** - Visualização em cards com informações básicas
- ✅ **Cadastro de veículos** - Formulário completo com validações
- ✅ **Visualização detalhada** - Página com todas as informações e imagens
- ✅ **Edição de veículos** - Atualização de dados existentes
- ✅ **Exclusão de veículos** - Remoção com confirmação
- ✅ **Upload de imagens** - Suporte a múltiplas imagens por veículo (URLs)
- ✅ **Interface responsiva** - Funciona em desktop e mobile

## Campos do Veículo

- **Nome/Modelo** (obrigatório)
- **Placa** (obrigatório, único)
- **Chassi** (obrigatório, único)
- **Ano** (obrigatório)
- **Quilometragem** (obrigatório)
- **Preço** (opcional)
- **Imagens** (opcional, múltiplas URLs)

## Como rodar o projeto

### Pré-requisitos
- Node.js instalado
- MongoDB instalado e rodando localmente (ou MongoDB Atlas)

### 1. Instalar dependências

```bash
npm run install:all
```

### 2. Rodar o projeto

```bash
npm run dev
```

O servidor estará rodando em `http://localhost:5000`

## Endpoints da API

- `GET /carros` - Listar todos os veículos
- `POST /carros` - Criar novo veículo
- `GET /carros/:id` - Buscar veículo por ID
- `PUT /carros/:id` - Atualizar veículo
- `DELETE /carros/:id` - Deletar veículo

## Páginas do Frontend

- `/` - Lista de veículos (página inicial)
- `/add.html` - Adicionar novo veículo
- `/view.html?id=:id` - Detalhes do veículo
- `/edit.html?id=:id` - Editar veículo

## Estrutura do Projeto

```
PriBor/
├── backend/                    # API Node.js + Express + MongoDB
│   ├── scr/
│   │   ├── models/            # Modelos do MongoDB
│   │   ├── routes/            # Rotas da API
│   │   └── index.ts           # Servidor principal
│   └── package.json
├── public/                    # Frontend HTML/CSS/JS
│   ├── index.html             # Página inicial
│   ├── add.html              # Adicionar veículo
│   ├── edit.html             # Editar veículo
│   ├── view.html             # Visualizar veículo
│   ├── styles.css            # Estilos CSS
│   └── script.js             # JavaScript
└── package.json
```

## Tecnologias Utilizadas

### Backend
- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **TypeScript** - Linguagem tipada
- **Armazenamento em memória** - Simula banco de dados
- **CORS** - Middleware para requisições cross-origin

### Frontend
- **HTML5** - Estrutura das páginas
- **CSS3** - Estilos e layout responsivo
- **JavaScript ES6+** - Funcionalidades e comunicação com API
- **Fetch API** - Comunicação com backend

## Interface

O sistema possui uma interface limpa e funcional, com foco na usabilidade e eficiência para gerenciamento de estoque. Layout responsivo que funciona bem em desktop e mobile.

## Vantagens da Arquitetura Simplificada

- ✅ **Sem dependências complexas** - Apenas Node.js
- ✅ **Fácil de manter** - Código simples e direto
- ✅ **Rápido para desenvolver** - Sem build steps
- ✅ **Fácil de hospedar** - Apenas um servidor Node.js
- ✅ **Funcional** - Todas as operações CRUD funcionando
- ✅ **Sem banco de dados** - Armazenamento em memória 