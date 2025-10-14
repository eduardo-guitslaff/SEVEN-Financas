import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { abrirConexao, inicializarBanco } from "./database.js";

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));

// 🔹 Inicializa o banco ao iniciar o servidor
inicializarBanco();

// 🔹 Rota: listar transações (com filtro opcional por data)
app.get("/transacoes", async (req, res) => {
  const { inicio, fim } = req.query;
  const db = await abrirConexao();

  let query = "SELECT * FROM transacoes";
  const params = [];

  // Se o usuário informar data inicial e final, aplica o filtro
  if (inicio && fim) {
    query += " WHERE data BETWEEN ? AND ?";
    params.push(inicio, fim);
  }

  query += " ORDER BY id DESC";

  const transacoes = await db.all(query, params);
  await db.close();

  res.json(transacoes);
});

// 🔹 Rota: adicionar transação (com data atual automática)
app.post("/transacoes", async (req, res) => {
  const { descricao, valor, tipo } = req.body;

  if (!descricao || !valor || !tipo) {
    return res.status(400).json({ erro: "Preencha todos os campos!" });
  }

  const dataAtual = new Date().toISOString().split("T")[0]; // formato AAAA-MM-DD

  const db = await abrirConexao();
  await db.run(
    "INSERT INTO transacoes (descricao, valor, tipo, data) VALUES (?, ?, ?, ?)",
    [descricao, valor, tipo, dataAtual]
  );
  await db.close();

  res.json({ message: "Transação adicionada com sucesso!" });
});

// 🔹 Inicia o servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});
