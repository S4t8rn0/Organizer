---
description: Tornar o site Organizer responsivo para dispositivos móveis
---

# Plano de Responsividade — Organizer

## Visão Geral do Estado Atual

O site usa Tailwind CSS (via CDN) com layout fixo de sidebar + conteúdo principal. Já existem **alguns** breakpoints (`md:`, `sm:`) usados pontualmente, mas a experiência mobile está longe do ideal. Os principais problemas identificados são:

1. **Sidebar fixa lateral** ocupa espaço precioso em telas pequenas
2. **Planner** com grid de 7 colunas + `min-w-[2800px]` → impossível no mobile
3. **Kanban** com 4 colunas fixas lado a lado
4. **Notes** com layout side-by-side fixo (`w-80` + editor)
5. **Finance** com formulário horizontal que não se adapta
6. **Hover effects** (Planner zoom/blur) que não existem no touch
7. **Botões de ação** visíveis apenas no hover (inacessíveis no mobile)

---

## Etapa 1 — Sidebar Responsiva (Mobile Bottom Navigation)

**Arquivo:** `components/Sidebar.tsx` + `App.tsx`

### O que fazer:
- Em telas `< md` (mobile), transformar a sidebar em uma **bottom navigation bar** fixa
- Esconder o logo e os labels — mostrar apenas os **ícones** na barra inferior
- Mover os botões de tema e logout para um **menu de perfil** ou mantê-los como ícones menores
- No `App.tsx`, trocar o `ml-16 md:ml-44` por `mb-16 md:mb-0 md:ml-44` no mobile

### Classes a alterar:
```
Sidebar:
- Mobile: `fixed bottom-0 left-0 right-0 h-16 w-full flex-row` (horizontal)
- Desktop: mantém `fixed left-0 top-0 h-full w-16 md:w-44 flex-col` (vertical)

App.tsx main:
- Mobile: `ml-0 pb-20` (espaço para bottom nav)
- Desktop: `md:ml-44`
```

### Detalhes:
- Nav items em **flex-row** com `justify-around` no mobile
- Esconder botão de tema e sair no mobile → acessíveis por toque longo ou menu extra
- Indicador da aba ativa visível (cor/dot abaixo do ícone)

---

## Etapa 2 — Dashboard Responsivo

**Arquivo:** `features/Dashboard.tsx`

### O que fazer:
- O grid `grid-cols-1 md:grid-cols-3` **já funciona razoavelmente**, mas:
  - Reduzir padding dos cards de `p-8` para `p-4 md:p-8`
  - Título `text-3xl` → `text-2xl md:text-3xl`
  - A coluna lateral (Agenda + Kanban) deve empilhar **abaixo** do conteúdo principal no mobile
  - Notas recentes: grid `grid-cols-1 sm:grid-cols-2` **já está ok**

### Classes a alterar:
```
- Cards: p-4 md:p-8
- Espaçamento geral: space-y-6 md:space-y-8
- Título: text-2xl md:text-3xl
```

---

## Etapa 3 — Planner Responsivo (Maior Desafio)

**Arquivo:** `features/Planner.tsx`

### O que fazer:
- **Remover** o `min-w-[2800px]` que força scroll horizontal
- **Mobile:** trocar o grid de 7 colunas para **visualização diária** (um dia por vez) com swipe/botões
  - Mostrar o dia selecionado em tela cheia
  - Adicionar botões "← Anterior | Próximo →" para navegar entre dias
  - Exibir uma **mini barra de dias** no topo para ver a semana e selecionar o dia
- **Desktop:** manter o grid de 7 colunas (comportamento atual)
- **Desabilitar o efeito hover zoom/blur** no mobile (interfere com touch)
- Botões de editar/excluir: trocar `opacity-0 group-hover:opacity-100` por **visíveis sempre no mobile**

### Implementação sugerida:
```tsx
// Novo estado no mobile
const [selectedDayIndex, setSelectedDayIndex] = useState(0);
const isMobile = useMediaQuery('(max-width: 768px)'); // ou verificar com useState + resize listener

// No mobile: renderizar apenas weekDays[selectedDayIndex]
// No desktop: renderizar todos os weekDays no grid
```

### Classes a alterar:
```
Grid:
- Mobile: grid-cols-1 (mostra 1 dia)
- Desktop: md:grid-cols-7

Hover zoom: desabilitar no mobile (verificar com CSS ou JS)
Ação buttons: opacity-100 md:opacity-0 md:group-hover:opacity-100
```

---

## Etapa 4 — Tasks Responsivo

**Arquivo:** `features/Tasks.tsx`

### O que fazer:
- Formulário de input: `flex-col` no mobile, `md:flex-row` no desktop (**já tem isso**)
- **Filtros:** os botões de filtro podem ficar com scroll horizontal se não couberem
- **Lista de tarefas:** 
  - Botões de ações (editar/excluir) estão em `opacity-0 group-hover:opacity-100` → **visíveis sempre no mobile**
  - Reduzir padding de `p-5` para `p-3 md:p-5`
- **Weekday picker:** ajustar tamanho dos botões para telas pequenas

### Classes a alterar:
```
Botões de ação: opacity-100 md:opacity-0 md:group-hover:opacity-100
Cards de task: p-3 md:p-5
Filtros container: overflow-x-auto flex-nowrap (caso não caibam)
```

---

## Etapa 5 — Kanban Responsivo

**Arquivo:** `features/Kanban.tsx`

### O que fazer:
- **Mobile:** trocar grid de 4 colunas para **scroll horizontal** ou **abas/tabs**
  - Opção A: **Tabs** — mostrar uma coluna por vez com tabs no topo (A Fazer | Em Andamento | etc.)
  - Opção B: **Scroll horizontal** — `overflow-x-auto` com snap scroll
- **Drag and Drop:** não funciona bem no touch → garantir que os botões ← → sejam **sempre visíveis** no mobile
- Botão de deletar: `opacity-100` no mobile

### Implementação sugerida (Opção A — Tabs):
```tsx
const [activeColumn, setActiveColumn] = useState<KanbanStatus>('todo');
// Mobile: renderizar apenas a coluna ativa
// Desktop: renderizar todas as 4 colunas
```

### Classes a alterar:
```
Grid: 
- Mobile: mostrar 1 coluna (via lógica de tabs)
- Desktop: md:grid-cols-4

Ação buttons: opacity-100 md:opacity-0 md:group-hover:opacity-100
Move buttons: sempre visíveis no mobile
```

---

## Etapa 6 — Notes Responsivo

**Arquivo:** `features/Notes.tsx`

### O que fazer:
- **Mobile:** o layout side-by-side (lista `w-80` + editor) **não cabe**
  - Transformar em **tela dividida**: lista de notas em tela cheia → ao selecionar, mostra o editor em tela cheia com botão "← Voltar"
  - Se nenhuma nota está selecionada → mostrar a lista
  - Se uma nota está selecionada → mostrar o editor com botão de voltar
- **Desktop:** manter o layout side-by-side atual

### Implementação sugerida:
```tsx
// Mobile behavior
// Se selectedNoteId && isMobile → mostrar editor full screen
// Caso contrário → mostrar lista
```

### Classes a alterar:
```
Container: flex-col md:flex-row
Lista lateral: 
  - Mobile: w-full (quando visível)
  - Desktop: w-80

Editor:
  - Mobile: fixed inset-0 ou full-width (quando ativo)
  - Desktop: flex-1

Botão "Voltar": visível apenas no mobile
```

---

## Etapa 7 — Finance Responsivo

**Arquivo:** `features/Finance.tsx`

### O que fazer:
- **Summary Cards:** `grid-cols-1 md:grid-cols-3` **já está ok**
  - Reduzir padding de `p-6` para `p-4 md:p-6`
  - Tamanho do saldo: `text-2xl md:text-3xl`
- **Formulário de transação:** já tem `flex-col sm:flex-row`, **ok**
- **Grid de transações + contas fixas:** `grid-cols-1 lg:grid-cols-3` **já está ok**
- **Investimentos:**
  - Header com inputs: empilhar verticalmente no mobile
  - Grid dos cards já tem `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`

### Classes a alterar:
```
Cards summary: p-4 md:p-6
Saldo: text-2xl md:text-3xl
Investimentos header: flex-col md:flex-row gap-4
```

---

## Etapa 8 — Login Responsivo

**Arquivo:** `features/Login.tsx`

### Status: ✅ Já está responsivo
- Centralizado com `max-w-md` + `p-4` → funciona bem no mobile
- Nenhuma alteração necessária

---

## Etapa 9 — Utilitários CSS Globais

**Arquivo:** `index.html` (tag `<style>`)

### O que fazer:
- Adicionar a meta tag de viewport **já existe** ✅
- Adicionar utilitários para:
  - **Safe area** (para iPhones com notch): `padding-bottom: env(safe-area-inset-bottom)`
  - **Touch-action** para evitar pull-to-refresh: `overscroll-behavior: none`
  - **Scrollbar** — esconder no mobile se necessário
  - **Animação fade-in**: garantir que funcione sem lag no mobile

### CSS a adicionar:
```css
/* Safe area para bottom nav */
.pb-safe {
  padding-bottom: env(safe-area-inset-bottom, 0px);
}

/* Evitar scroll bounce no iOS */
html, body {
  overscroll-behavior: none;
}

/* Esconder scrollbar no mobile */
@media (max-width: 768px) {
  .custom-scrollbar::-webkit-scrollbar {
    display: none;
  }
  .custom-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
}
```

---

## Etapa 10 — Ajustes de Touch UX

### O que fazer (em todos os componentes):
1. **Botões hover-only** → trocar para `opacity-100 md:opacity-0 md:group-hover:opacity-100`
2. **Tap targets** → garantir mínimo de `44x44px` em elementos tocáveis
3. **Modais** → já estão ok (usam `p-4` no overlay, `max-w-sm`, etc.)
4. **Inputs** → adicionar `font-size: 16px` mínimo para evitar zoom automático no iOS

---

## Resumo da Ordem de Execução

| # | Componente | Complexidade | Prioridade |
|---|-----------|-------------|-----------|
| 1 | Sidebar → Bottom Nav | 🔴 Alta | Crítico — afeta tudo |
| 2 | App.tsx (layout principal) | 🟡 Média | Crítico — depende do item 1 |
| 3 | Planner (day view mobile) | 🔴 Alta | Alta — é o mais quebrado |
| 4 | Notes (split view) | 🟡 Média | Alta — inutilizável no mobile |
| 5 | Kanban (tabs mobile) | 🟡 Média | Alta — 4 colunas não cabem |
| 6 | Dashboard | 🟢 Baixa | Média — já parcialmente ok |
| 7 | Tasks | 🟢 Baixa | Média — já parcialmente ok |
| 8 | Finance | 🟢 Baixa | Média — já parcialmente ok |
| 9 | CSS Global | 🟢 Baixa | Alta — base para tudo |
| 10 | Touch UX (todos) | 🟡 Média | Alta — aplica em paralelo |

---

## Observações Importantes

- **Não quebrar o desktop:** todas as mudanças devem usar breakpoints (`md:`, `lg:`) para preservar o layout atual em telas grandes
- **Testar em viewport 375px** (iPhone SE) como referência mínima
- **Usar `useEffect` + `window.matchMedia`** ou um hook `useMediaQuery` para lógica condicional de renderização (Planner, Notes, Kanban)
- **Modais já estão ok** — todos usam `fixed inset-0 p-4 max-w-sm`, o que funciona no mobile
