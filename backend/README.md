# Organizer Backend

API REST para o aplicativo Organizer, construída com Node.js, Express e Supabase.

## 🚀 Setup Rápido

### 1. Criar Projeto no Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Crie uma conta (gratuito)
3. Clique em "New Project"
4. Escolha um nome e senha para o banco
5. Aguarde a criação (~2 minutos)

### 2. Executar Script SQL

1. No Supabase, vá em **SQL Editor**
2. Copie todo o conteúdo de `database/schema.sql`
3. Cole e clique em **Run**

### 3. Pegar Credenciais

1. Vá em **Project Settings** > **API**
2. Copie:
   - **Project URL** → `SUPABASE_URL`
   - **anon public** key → `SUPABASE_ANON_KEY`

### 4. Configurar Ambiente

```bash
# Na pasta backend
cp .env.example .env

# Edite o .env com suas credenciais
```

### 5. Instalar e Rodar

```bash
npm install
npm run dev
```

O servidor estará disponível em `http://localhost:3001`

---

## 📡 Endpoints da API

| Rota | Descrição |
|------|-----------|
| `POST /api/auth/register` | Criar conta |
| `POST /api/auth/login` | Login |
| `GET /api/tasks` | Listar tarefas |
| `GET /api/notes` | Listar notas |
| `GET /api/events` | Listar eventos |
| `GET /api/kanban` | Listar kanban |
| `GET /api/mindmap` | Listar mindmap |
| `GET /api/finance/*` | Finanças |

Todas as rotas (exceto auth) requerem header:
```
Authorization: Bearer <token>
```

---

## 🛠️ Scripts

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Inicia em modo desenvolvimento |
| `npm run build` | Compila para produção |
| `npm start` | Inicia versão compilada |
