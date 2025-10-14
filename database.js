import sqlite3 from "sqlite3";
import { open } from "sqlite";

export async function abrirConexao() {
  return open({
    filename: "./banco.db",
    driver: sqlite3.Database,
  });
}

export async function inicializarBanco() {
  const db = await abrirConexao();

  await db.exec(`
    CREATE TABLE IF NOT EXISTS transacoes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      descricao TEXT,
      valor REAL,
      tipo TEXT,
      data TEXT
    )
  `);

  await db.close();
}
