import { Database } from "sql.js";

export function runSeed(database: Database): void {
  const existing = database.exec(`SELECT COUNT(*) as count FROM users`);
  const count = existing[0]!.values[0]![0] as number;

  if (count > 0) return; // já tem dados, não faz nada

  // Usuários
  database.run(`INSERT INTO users (name, email, phone) VALUES
    ('Ana Costa', 'ana.costa@email.com', '11991110001'),
    ('Pedro Lima', 'pedro.lima@email.com', '11991110002'),
    ('Mariana Souza', 'mariana.souza@email.com', '11991110003'),
    ('Carlos Mendes', 'carlos.mendes@email.com', '11991110004'),
    ('Fernanda Rocha', 'fernanda.rocha@email.com', '11991110005'),
    ('Lucas Oliveira', 'lucas.oliveira@email.com', '11991110006'),
    ('Beatriz Santos', 'beatriz.santos@email.com', '11991110007'),
    ('Rafael Alves', 'rafael.alves@email.com', '11991110008'),
    ('Juliana Nunes', 'juliana.nunes@email.com', '11991110009'),
    ('Thiago Ferreira', 'thiago.ferreira@email.com', '11991110010')
  `);

  // Quadro
  database.run(`INSERT INTO boards (name) VALUES ('Desenvolvimento do Produto')`);

  // Colunas
  database.run(`INSERT INTO columns (name, position, board_id) VALUES
    ('Backlog', 0, 1),
    ('To Do', 1, 1),
    ('In Progress', 2, 1),
    ('Review', 3, 1),
    ('Done', 4, 1)
  `);

  // Cards
  database.run(`INSERT INTO cards (title, description, author_id, column_id) VALUES
    ('Configurar CI/CD', 'Configurar pipeline de integração contínua', 1, 1),
    ('Definir arquitetura', 'Decidir stack e estrutura do projeto', 2, 1),
    ('Criar tela de login', 'Layout e validações do formulário', 3, 2),
    ('Modelar banco de dados', 'Criar diagrama entidade-relacionamento', 4, 2),
    ('Implementar autenticação JWT', 'Geração e validação de tokens', 5, 3),
    ('Desenvolver API de usuários', 'CRUD completo de usuários', 6, 3),
    ('Code review da API', 'Revisar endpoints e validações', 7, 4),
    ('Testes de integração', 'Cobrir os principais fluxos com testes', 8, 4),
    ('Setup inicial do projeto', 'Repositório, dependências e configurações', 9, 5),
    ('Documentar endpoints', 'Escrever README com exemplos de uso', 10, 5)
  `);
}