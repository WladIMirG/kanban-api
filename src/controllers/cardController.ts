import { Request, Response } from "express";
import { z } from "zod";
import { getDatabase, saveDatabase } from "../db/database";

const createCardSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  author_id: z.number().int().positive("author_id must be a positive integer"),
  column_id: z.number().int().positive("column_id must be a positive integer"),
});

const moveCardSchema = z.object({
  target_column_id: z
    .number()
    .int()
    .positive("target_column_id must be a positive integer"),
});

export function createCard(req: Request, res: Response): void {
  const parsed = createCardSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ errors: parsed.error.flatten().fieldErrors });
    return;
  }

  const { title, description, author_id, column_id } = parsed.data;
  const db = getDatabase();

  // Verify author exists
  const userResult = db.exec(
    `SELECT id FROM users WHERE id = ${author_id}`
  );
  if (userResult.length === 0 || userResult[0]!.values.length === 0) {
    res.status(404).json({ error: "Author (user) not found" });
    return;
  }

  // Verify column exists
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

export function moveCard(req: Request, res: Response): void {
  const cardId = Number(req.params["id"]);

  if (!Number.isInteger(cardId) || cardId <= 0) {
    res.status(400).json({ error: "Invalid card id" });
    return;
  }

  const parsed = moveCardSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ errors: parsed.error.flatten().fieldErrors });
    return;
  }

  const { target_column_id } = parsed.data;
  const db = getDatabase();

  // 1. Card exists?
  const cardResult = db.exec(
    `SELECT id, title, description, author_id, column_id FROM cards WHERE id = ${cardId}`
  );
  if (cardResult.length === 0 || cardResult[0]!.values.length === 0) {
    res.status(404).json({ error: "Card not found" });
    return;
  }

  const card = cardResult[0]!.values[0]!;
  const currentColumnId = card[4] as number;

  // 2. Is it already in the target column?
  if (currentColumnId === target_column_id) {
    res.json({
      id: card[0],
      title: card[1],
      description: card[2],
      author_id: card[3],
      column_id: card[4],
      message: "Card is already in the target column",
    });
    return;
  }

  // 3. Target column exist?
  const targetColumnResult = db.exec(
    `SELECT id, board_id FROM columns WHERE id = ${target_column_id}`
  );
  if (targetColumnResult.length === 0 || targetColumnResult[0]!.values.length === 0) {
    res.status(404).json({ error: "Target column not found" });
    return;
  }

  // 4. Same board? (to prevent cross-board moves)
  const sourceColumnResult = db.exec(
    `SELECT board_id FROM columns WHERE id = ${currentColumnId}`
  );
  const sourceBoardId = sourceColumnResult[0]!.values[0]![0] as number;
  const targetBoardId = targetColumnResult[0]!.values[0]![1] as number;

  if (sourceBoardId !== targetBoardId) {
    res.status(422).json({
      error: "Cannot move card to a column that belongs to a different board",
    });
    return;
  }

  // 5. All checks passed, perform the move
  db.run(
    `UPDATE cards SET column_id = ${target_column_id} WHERE id = ${cardId}`
  );

  saveDatabase(db);

  res.json({
    id: card[0],
    title: card[1],
    description: card[2],
    author_id: card[3],
    column_id: target_column_id,
  });
}