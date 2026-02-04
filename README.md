# 🗂️ Organizer

Sistema completo de organização pessoal com gerenciamento de tarefas, notas, calendário, kanban e finanças.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-green.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)

## 📋 Funcionalidades

- **Dashboard** - Visão geral de todas as suas atividades
- **Planner/Calendário** - Organize seus eventos e compromissos
- **Tarefas** - Gerencie suas tarefas diárias com categorias e prioridades
- **Notas** - Caderno digital para anotações rápidas
- **Kanban** - Quadro de tarefas estilo kanban (To-Do, In Progress, Review, Done)
- **Finanças** - Controle de transações, contas fixas e investimentos


## 🚀 Tecnologias

### Frontend
- React 19 + TypeScript
- Vite
- TailwindCSS
- Lucide React (ícones)
- Date-fns

### Backend
- Node.js + Express (Vercel Serverless Functions)
- TypeScript
- Supabase (Auth + Database)

## 📦 Instalação Local

### Pré-requisitos
- Node.js 18+
- Conta no [Supabase](https://supabase.com)

### 1. Clone o repositório
```bash
git clone https://github.com/S4t8rn0/Organizer.git
cd Organizer
```

### 2. Instale as dependências
```bash
# Dependências do backend (raiz)
npm install

# Dependências do frontend
cd frontend
npm install
cd ..
```

### 3. Configure as variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto:
```env
SUPABASE_URL=sua_url_supabase
SUPABASE_ANON_KEY=sua_anon_key
FRONTEND_URL=http://localhost:5173
```

### 4. Configure o Banco de Dados

Execute o script `backend/database/schema.sql` no SQL Editor do Supabase.

### 5. Inicie o projeto localmente

**Terminal 1 - Backend (desenvolvimento local):**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Acesse: http://localhost:5173

## 🌐 Deploy no Vercel

Este projeto está configurado para deploy no Vercel com **Serverless Functions**.

### 1. Faça fork/push do repositório para o GitHub

### 2. Conecte ao Vercel
1. Acesse [vercel.com](https://vercel.com) e faça login com GitHub
2. Clique em **"New Project"**
3. Importe o repositório **Organizer**

### 3. Configure as variáveis de ambiente no Vercel
| Key | Value |
|-----|-------|
| `SUPABASE_URL` | Sua URL do Supabase |
| `SUPABASE_ANON_KEY` | Sua Anon Key do Supabase |
| `FRONTEND_URL` | A URL do seu projeto Vercel (ex: `https://organizer.vercel.app`) |

### 4. Deploy!
O Vercel irá automaticamente:
- Buildar o frontend (React/Vite)
- Configurar as Serverless Functions (API)
- Gerar uma URL pública

## 📁 Estrutura do Projeto

```
organizer/
├── api/
│   └── index.ts              # API Serverless (Vercel Functions)
├── backend/                   # Backend original (desenvolvimento local)
│   ├── database/
│   │   ├── schema.sql        # Schema do banco de dados
│   │   └── fix_rls_policies.sql
│   └── src/
├── frontend/
│   ├── components/           # Componentes reutilizáveis
│   ├── contexts/             # Context API (Auth)
│   ├── features/             # Páginas/Features
│   ├── services/             # API client
│   └── App.tsx               # App principal
├── vercel.json               # Configuração Vercel
├── package.json              # Dependências da API
└── README.md
```

## 🔒 API Endpoints

### Autenticação
| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/auth/register` | Criar conta |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/logout` | Logout |
| POST | `/api/auth/refresh` | Renovar token |
| GET | `/api/auth/me` | Dados do usuário |

### Recursos (requerem autenticação)
| Recurso | Rotas |
|---------|-------|
| Tasks | `GET/POST /api/tasks`, `PUT/DELETE /api/tasks/:id` |
| Notes | `GET/POST /api/notes`, `PUT/DELETE /api/notes/:id` |
| Events | `GET/POST /api/events`, `PUT/DELETE /api/events/:id` |
| Kanban | `GET/POST /api/kanban`, `PUT/DELETE /api/kanban/:id` |
| Finance | `/api/finance/transactions`, `/api/finance/bills`, `/api/finance/investments` |

## 🧪 Rate Limits

| Endpoint | Limite |
|----------|--------|
| Login | 5 tentativas antes de bloqueio de 30min |
| Geral | Proteção contra abuso |

## 📝 Licença

Este projeto está sob a licença MIT.

---

Desenvolvido por Gabriella Fernandes.
