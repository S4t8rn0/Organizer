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

## 🛡️ Segurança

O sistema inclui proteções robustas:

- ✅ **Anti-Bruteforce** - Bloqueio após 5 tentativas de login falhas
- ✅ **Rate Limiting** - Proteção contra DDoS e abusos
- ✅ **Row Level Security (RLS)** - Isolamento de dados por usuário
- ✅ **JWT Authentication** - Tokens seguros via Supabase Auth
- ✅ **Helmet** - Headers de segurança HTTP
- ✅ **CORS** - Controle de origens permitidas

## 🚀 Tecnologias

### Frontend
- React 19 + TypeScript
- Vite
- TailwindCSS
- Lucide React (ícones)
- Date-fns

### Backend
- Node.js + Express
- TypeScript
- Supabase (Auth + Database)
- Express Rate Limit
- Helmet

## 📦 Instalação

### Pré-requisitos
- Node.js 18+
- Conta no [Supabase](https://supabase.com)

### 1. Clone o repositório
```bash
git clone https://github.com/S4t8rn0/Organizer.git
cd Organizer
```

### 2. Configure o Backend
```bash
cd backend
npm install
```

Crie um arquivo `.env` na pasta `backend`:
```env
PORT=3001
SUPABASE_URL=sua_url_supabase
SUPABASE_ANON_KEY=sua_anon_key
FRONTEND_URL=http://localhost:3000
```

### 3. Configure o Banco de Dados

Execute o script `backend/database/schema.sql` no SQL Editor do Supabase.

### 4. Configure o Frontend
```bash
cd ../frontend
npm install
```

### 5. Inicie o projeto

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Acesse: http://localhost:3000

## 📁 Estrutura do Projeto

```
organizer/
├── backend/
│   ├── database/
│   │   ├── schema.sql          # Schema do banco de dados
│   │   └── fix_rls_policies.sql
│   ├── src/
│   │   ├── config/             # Configuração do Supabase
│   │   ├── controllers/        # Controllers das rotas
│   │   ├── middlewares/        # Auth, Rate Limit, Validação
│   │   ├── routes/             # Definição das rotas
│   │   ├── types/              # Tipos TypeScript
│   │   └── app.ts              # Entry point
│   └── package.json
│
├── frontend/
│   ├── components/             # Componentes reutilizáveis
│   ├── contexts/               # Context API (Auth)
│   ├── features/               # Páginas/Features
│   ├── services/               # API client
│   ├── App.tsx                 # App principal
│   └── index.html              # Entry point
│
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
| Global | 1000 req/15min |
| Auth | 50 req/15min |
| Login | 10 req/15min |
| Register | 5 req/hora |

## 📝 Licença

Este projeto está sob a licença MIT.

---

Desenvolvido com ❤️
