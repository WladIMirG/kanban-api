import { Request, Response } from "express";
import { z } from "zod";
import { getDatabase, saveDatabase } from "../db/database";

const createColumnSchema = z.object({
  name: z.string().min(1, "Name is required"),
  board_id: z.number().int().positive("board_id must be a positive integer"),
  position: z.number().int().min(0).optional(),
});

export function createColumn(req: Request, res: Response): void {
  const parsed = createColumnSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ errors: parsed.error.flatten().fieldErrors });
    return;
  }

  const { name, board_id } = parsed.data;
  const db = getDatabase();

  // Verify board exists
  const boardResult = db.exec(
    `SELECT id FROM boards WHERE id = ${board_id}`
  );
  if (boardResult.length === 0 || boardResult[0]!.values.length === 0) {
    res.status(404).json({ error: "Board not found" });
    return;
  }

  // Auto-assign next position if not provided
  const posResult = db.exec(
    `SELECT COALESCE(MAX(position), -1) + 1 as next_pos FROM columns WHERE board_id = ${board_id}`
  );
  const nextPos =
    parsed.data.position !== undefined
      ? parsed.data.position
      : (posResult[0]!.values[0]![0] as number);

  db.run(
    `INSERT INTO columns (name, position, board_id) VALUES (?, ?, ?)`,
    [name, nextPos, board_id]
  );

  const result = db.exec(
    `SELECT id, name, position, board_id FROM columns WHERE id = last_insert_rowid()`
  );
  const row = result[0]!.values[0]!;

  saveDatabase(db);

  res.status(201).json({
    id: row[0],
    name: row[1],
    position: row[2],
    board_id: row[3],
  });
}