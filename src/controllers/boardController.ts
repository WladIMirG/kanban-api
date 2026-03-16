import { Request, Response } from "express";
import { z } from "zod";
import { SqlValue } from "sql.js";
import { getDatabase, saveDatabase } from "../db/database";

const createBoardSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

export function createBoard(req: Request, res: Response): void {
  const parsed = createBoardSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ errors: parsed.error.flatten().fieldErrors });
    return;
  }

  const { name } = parsed.data;
  const db = getDatabase();

  db.run(`INSERT INTO boards (name) VALUES (?)`, [name]);

  const result = db.exec(
    `SELECT id, name FROM boards WHERE id = last_insert_rowid()`
  );
  const row = result[0]!.values[0]!;

  saveDatabase(db);

  res.status(201).json({ id: row[0], name: row[1] });
}

export function listBoards(_req: Request, res: Response): void {
  const db = getDatabase();
  const result = db.exec(`SELECT id, name FROM boards`);

  if (result.length === 0) {
    res.json([]);
    return;
  }

  const boards = result[0]!.values.map((row: SqlValue[]) => ({
    id: row[0],
    name: row[1],
  }));

  res.json(boards);
}

export function getBoardById(req: Request, res: Response): void {
  const { id } = req.params;
  const db = getDatabase();

  const boardResult = db.exec(
    `SELECT id, name FROM boards WHERE id = ${Number(id)}`
  );
  if (boardResult.length === 0 || boardResult[0]!.values.length === 0) {
    res.status(404).json({ error: "Board not found" });
    return;
  }

  const board = boardResult[0]!.values[0]!;

  const columnsResult = db.exec(`
    SELECT c.id, c.name, c.position,
      json_group_array(
        CASE WHEN ca.id IS NOT NULL THEN
          json_object('id', ca.id, 'title', ca.title, 'description', ca.description, 'author_id', ca.author_id)
        ELSE NULL END
      ) as cards
    FROM columns c
    LEFT JOIN cards ca ON ca.column_id = c.id
    WHERE c.board_id = ${Number(id)}
    GROUP BY c.id
    ORDER BY c.position ASC
  `);

  const columns =
    columnsResult.length === 0
      ? []
      : columnsResult[0]!.values.map((row: SqlValue[]) => {
          const rawCards = JSON.parse(row[3] as string) as (object | null)[];
          const cards = rawCards.filter((c) => c !== null);
          return {
            id: row[0],
            name: row[1],
            position: row[2],
            cards,
          };
        });

  res.json({ id: board[0], name: board[1], columns });
}