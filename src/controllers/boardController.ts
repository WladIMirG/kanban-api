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