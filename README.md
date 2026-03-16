# Kanban API — Match< IT> Technical Challenge

API REST representando um quadro Kanban simplificado, construída com **Node.js + TypeScript + Express + SQLite (sql.js)**.

---

## Como executar

### Pré-requisitos
- Node.js >= 18
- npm

### Instalação
```bash
git clone git@github.com:WladIMirG/kanban-api.git
cd kanban-api
npm install
npm run dev
```

O servidor inicia em `http://localhost:3000`. O banco de dados é criado automaticamente na primeira execução.

---

## Endpoints

| Método | Rota | Descrição |
|--------|------|-----------|
| `POST` | `/api/users` | Criar usuário |
| `GET` | `/api/users` | Listar usuários |
| `POST` | `/api/boards` | Criar quadro |
| `GET` | `/api/boards` | Listar quadros |
| `GET` | `/api/boards/:id` | Ver quadro completo |
| `GET` | `/api/boards/:boardId/columns` | Listar colunas de um quadro |
| `POST` | `/api/columns` | Criar coluna |
| `POST` | `/api/cards` | Criar card |
| `PATCH` | `/api/cards/:id/move` | Mover card |

---

## Processo de Pensamento

### Estrutura do projeto
```
src/
├── db/
│   ├── database.ts       # conexão, migrations e persistência
│   └── seed.ts           # dados iniciais
├── controllers/
│   ├── userController.ts
│   ├── boardController.ts
│   ├── columnController.ts
│   └── cardController.ts
├── routes/
│   └── index.ts          # todas as rotas
└── index.ts              # entrada da aplicação
```

Optei pela arquitectura mais simples possível — **routes → controllers** — sem camada de serviços. O domínio é pequeno o suficiente para que uma camada extra fosse apenas burocracia.

### Acesso a dados

Não usei nenhum ORM. Usei **sql.js** apenas como driver de conexão, e todas as queries de leitura, escrita, atualização e deleção foram escritas em SQL puro, conforme solicitado.

### O endpoint de mover card

É a principal regra de negócio, por isso as validações foram tratadas com cuidado e em ordem:

1. O `card_id` é válido?
2. O body passou na validação do Zod?
3. O card existe?
4. O card já está na coluna destino? (retorno idempotente)
5. A coluna destino existe?
6. A coluna destino pertence ao **mesmo quadro**? ← regra principal

Só após todas as verificações o `UPDATE` é executado.

### Trade-offs

- **sql.js vs better-sqlite3** — o `better-sqlite3` é mais rápido mas requer compilação nativa. O `sql.js` funciona com `npm install` em qualquer máquina, facilitando a avaliação.
- **Sem autenticação** — fora do escopo do desafio.
- **Sem testes automatizados** — com mais tempo adicionaria Jest + Supertest.

### O que faria diferente com mais tempo

- Adicionar testes de integração com Jest + Supertest cobrindo todos os fluxos
- Implementar paginação nos endpoints de listagem
- Adicionar endpoints de edição e remoção para todas as entidades
- Migrar para PostgreSQL com pool de conexões para um ambiente de produção

---

## Uso de Inteligência Artificial

Utilizei o **Claude (Anthropic)** como ferramenta de apoio, da mesma forma que usaria documentação, Stack Overflow ou pair programming.

**Para quê usei:**
- Acelerar o scaffolding inicial do projeto
- Apoio na escrita de queries SQL com agregações e joins
- Resolução pontual de erros de tipagem do TypeScript

**O que não deleguei à IA:**
- Decisões de arquitectura — routes → controllers foi uma escolha consciente
- A lógica e a ordem das validações do endpoint de mover card
- A escolha do sql.js em detrimento do better-sqlite3 e o motivo
- A estrutura do seed e os dados de exemplo