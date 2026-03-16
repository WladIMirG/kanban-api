import { Request, Response } from "express";
import { z } from "zod";
import { getDatabase, saveDatabase } from "../db/database";

const createCardSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  author_id: z.number().int().positive("author_id must be a positive integer"),
  column_id: z.number().int().positive("column_id must be a positive integer"),
});

export function createCard(req: Request, res: Response): void {
  const parsed = createCardSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ errors: parsed.error.flatten().fieldErrors });
    return;
  }

  const { title, description, author_id, column_id } = parsed.data;
  const db = getDatabase();

  const userResult = db.exec(
    `SELECT id FROM users WHERE id = ${author_id}`
  );
  if (userResult.length === 0 || userResult[0]!.values.length === 0) {
    res.status(404).json({ error: "Author (user) not found" });
    return;
  }

  const columnResult = db.exec(
    `SELECT id FROM columns WHERE id = ${column_id}`
  );
  if (columnResult.length === 0 || columnResult[0]!.values.length === 0) {
    res.status(404).json({ error: "Column not found" });
    return;
  }

  db.run(
    `INSERT INTO cards (title, description, author_id, column_id) VALUES (?, ?, ?, ?)`,
    [title, description ?? null, author_id, column_id]
  );

  const result = db.exec(
    `SELECT id, title, description, author_id, column_id FROM cards WHERE id = last_insert_rowid()`
  );
  const row = result[0]!.values[0]!;

  saveDatabase(db);

  res.status(201).json({
    id: row[0],
    title: row[1],
    description: row[2],
    author_id: row[3],
    column_id: row[4],
  });
}