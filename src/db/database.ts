import initSqlJs, { Database } from "sql.js";
import fs from "fs";
import path from "path";

const DB_PATH = path.resolve("kanban.db");

let db: Database;

export async function initDatabase(): Promise<Database> {
  const SQL = await initSqlJs();

  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }

  saveDatabase(db);
  return db;
}

export function getDatabase(): Database {
  if (!db) throw new Error("Database not initialized. Call initDatabase() first.");
  return db;
}

export function saveDatabase(database: Database): void {
  const data = database.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
}