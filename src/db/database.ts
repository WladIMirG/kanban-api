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

  runMigrations(db);
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

function runMigrations(database: Database): void {
  database.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      phone TEXT NOT NULL
    );
  `);

  database.run(`
    CREATE TABLE IF NOT EXISTS boards (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL
    );
  `);

  database.run(`
    CREATE TABLE IF NOT EXISTS columns (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      position INTEGER NOT NULL,
      board_id INTEGER NOT NULL,
      FOREIGN KEY (board_id) REFERENCES boards(id)
    );
  `);

  database.run(`
    CREATE TABLE IF NOT EXISTS cards (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      author_id INTEGER NOT NULL,
      column_id INTEGER NOT NULL,
      FOREIGN KEY (author_id) REFERENCES users(id),
      FOREIGN KEY (column_id) REFERENCES columns(id)
    );
  `);
}
