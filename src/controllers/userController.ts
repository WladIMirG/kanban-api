import { Request, Response } from "express";
import { z } from "zod";
import { SqlValue } from "sql.js";
import { getDatabase, saveDatabase } from "../db/database";

const createUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().min(1, "Phone is required"),
});

export function createUser(req: Request, res: Response): void {
  const parsed = createUserSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ errors: parsed.error.flatten().fieldErrors });
    return;
  }

  const { name, email, phone } = parsed.data;
  const db = getDatabase();
  
  // Check if email already exists
  const existing = db.exec(
    `SELECT id FROM users WHERE email = '${email.replace(/'/g, "''")}'`
  );
  if (existing.length > 0 && existing[0]!.values.length > 0) {
    res.status(409).json({ error: "Email already in use" });
    return;
  }

  db.run(
    `INSERT INTO users (name, email, phone) VALUES (?, ?, ?)`,
    [name, email, phone]
  );

  const result = db.exec(
    `SELECT id, name, email, phone FROM users WHERE email = '${email.replace(/'/g, "''")}'`
  );
  const row = result[0]!.values[0]!;

  saveDatabase(db);

  res.status(201).json({
    id: row[0],
    name: row[1],
    email: row[2],
    phone: row[3],
  });
}

export function listUsers(_req: Request, res: Response): void {
  const db = getDatabase();
  const result = db.exec(`SELECT id, name, email, phone FROM users`);

  if (result.length === 0) {
    res.json([]);
    return;
  }

  const users = result[0]!.values.map((row: SqlValue[]) => ({
    id: row[0],
    name: row[1],
    email: row[2],
    phone: row[3],
  }));

  res.json(users);
}