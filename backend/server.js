const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();

app.use(express.json());
app.use(cors());

app.use(express.static(path.join(__dirname, "../frontend")));

const DB_FILE = path.join(__dirname, "db.json");

function readDB() {
  if (!fs.existsSync(DB_FILE)) {
    return {
      usuarios: [],
      pacientes: [],
      triagens: [],
      consultas: [],
      estoqueMedicamentos: [],
      dispensacoes: [],
      tv_chamada: null,
      tv_historico: []
    };
  }
  const db = JSON.parse(fs.readFileSync(DB_FILE));
  if (!db.tv_chamada) db.tv_chamada = null;
  if (!db.tv_historico) db.tv_historico = [];
  if (!db.estoqueMedicamentos) db.estoqueMedicamentos = [];
  if (!db.dispensacoes) db.dispensacoes = [];
  return db;
}

function writeDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// LOGIN
app.post("/login", (req, res) => {
  const db = readDB();

  const user = db.usuarios.find(u =>
    u.usuario === req.body.usuario &&
    u.senha === req.body.senha
  );

  if (!user) {
    return res.status(401).json({ erro: "Login inválido" });
  }

  res.json(user);
});

// ============ GERENCIAMENTO DE USUÁRIOS (ADMIN) ============
app.get("/usuarios", (req, res) => {
  const db = readDB();
  res.json(db.usuarios || []);
});

app.post("/usuarios", (req, res) => {
  const db = readDB();
  const { usuario, senha, tipo, nome } = req.body;

  if (!usuario || !senha || !tipo) {
    return res.status(400).json({ erro: "Usuário, senha e setor são obrigatórios." });
  }

  const jaExiste = (db.usuarios || []).some(u => u.usuario && u.usuario.toLowerCase() === usuario.trim().toLowerCase());
  if (jaExiste) {
    return res.status(400).json({ erro: "Já existe um usuário com este login." });
  }

  const novoUsuario = {
    id: Date.now(),
    usuario: usuario.trim(),
    senha: senha,
    tipo: tipo,
    nome: nome && nome.trim() ? nome.trim() : usuario.trim(),
    createdAt: new Date()
  };

  if (!db.usuarios) db.usuarios = [];
  db.usuarios.push(novoUsuario);
  writeDB(db);

  res.status(201).json(novoUsuario);
});

app.delete("/usuarios/:login", (req, res) => {
  const db = readDB();
  const login = req.params.login;

  if (login.toLowerCase() === "admin") {
    return res.status(400).json({ erro: "O usuário admin principal não pode ser removido." });
  }

  const index = (db.usuarios || []).findIndex(u => u.usuario && u.usuario.toLowerCase() === login.toLowerCase());
  if (index === -1) {
    return res.status(404).json({ erro: "Usuário não encontrado." });
  }

  const removido = db.usuarios.splice(index, 1);
  writeDB(db);

  res.json({ mensagem: "Usuário removido com sucesso.", usuario: removido[0] });
});

// ATENDIMENTO - cadastrar paciente
app.post("/atendimento", (req, res) => {
  const db = readDB();

  const paciente = {
    id: Date.now(),
    nome: req.body.nome,
    cpf: req.body.cpf,
    tipo: req.body.tipo,
    status: "triagem",
    createdAt: new Date()
  };

  db.pacientes.push(paciente);
  writeDB(db);

  res.json(paciente);
});

// LISTAR PACIENTES (triagem busca quem foi cadastrado no atendimento)
app.get("/pacientes", (req, res) => {
  const db = readDB();
  res.json(db.pacientes);
});

// TRIAGEM
app.post("/triagem", (req, res) => {
  const db = readDB();

  let risco = req.body.risco;

  if (req.body.temperatura >= 39) {
    risco = "vermelho";
  } else if (req.body.temperatura >= 38) {
    risco = "amarelo";
  } else if (!risco) {
    risco = "verde";
  }

  const triagem = {
    id: Date.now(),
    nome: req.body.nome,
    sintoma: req.body.sintoma,
    temperatura: req.body.temperatura,
    alergia: req.body.alergia,
    observacao: req.body.observacao,
    risco,
    status: "aguardando_medico",
    createdAt: new Date()
  };

  db.triagens.push(triagem);
  writeDB(db);

  res.json(triagem);
});

// LISTAR TRIAGENS
app.get("/triagens", (req, res) => {
  const db = readDB();
  res.json(db.triagens);
});

// ============ MÍDIA INDOOR - TV ============

// Função criada para enviar a chamada do paciente para a tela da TV.
// Serve para triagem chamar o paciente no guichê e para o médico chamar no consultório.
app.post("/tv/chamar", (req, res) => {
  const db = readDB();

  const chamada = {
    id: Date.now().toString(),
    localTipo: req.body.localTipo,
    localNumero: req.body.localNumero,
    paciente: req.body.paciente,
    hora: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
  };

  db.tv_chamada = chamada;
  db.tv_historico.unshift(chamada);
  if (db.tv_historico.length > 5) db.tv_historico.pop();

  writeDB(db);
  res.json(chamada);
});

// Função criada para consultar a chamada atual e o histórico que será exibido na TV.
// Essa rota é usada para atualizar a tela automaticamente a cada poucos segundos.
app.get("/tv/chamada", (req, res) => {
  const db = readDB();
  res.json({
    chamada: db.tv_chamada,
    historico: db.tv_historico
  });
});

// ============ ESTOQUE DE MEDICAMENTOS ============

// Listar todos os medicamentos do estoque
app.get("/estoque", (req, res) => {
  const db = readDB();
  res.json(db.estoqueMedicamentos || []);
});

// Dar entrada no estoque (somente admin pode usar)
app.post("/estoque", (req, res) => {
  const db = readDB();
  const { nome, quantidade, unidade, categoria } = req.body;

  if (!nome || !quantidade || quantidade <= 0) {
    return res.status(400).json({ erro: "Nome e quantidade são obrigatórios." });
  }

  // Verifica se medicamento já existe (por nome)
  const existente = (db.estoqueMedicamentos || []).find(
    m => m.nome.toLowerCase() === nome.trim().toLowerCase()
  );

  if (existente) {
    // Soma a quantidade ao estoque existente
    existente.quantidade += parseInt(quantidade);
    writeDB(db);
    return res.json({ mensagem: "Estoque atualizado com sucesso!", medicamento: existente });
  }

  // Novo medicamento
  const novoMed = {
    id: Date.now(),
    nome: nome.trim(),
    quantidade: parseInt(quantidade),
    unidade: unidade || "unidades",
    categoria: categoria || "Geral"
  };

  if (!db.estoqueMedicamentos) db.estoqueMedicamentos = [];
  db.estoqueMedicamentos.push(novoMed);
  writeDB(db);

  res.status(201).json({ mensagem: "Medicamento cadastrado com sucesso!", medicamento: novoMed });
});

// Atualizar quantidade do estoque (entrada manual por ID)
app.patch("/estoque/:id", (req, res) => {
  const db = readDB();
  const id = parseInt(req.params.id);
  const { quantidade } = req.body;

  const med = (db.estoqueMedicamentos || []).find(m => m.id === id);
  if (!med) {
    return res.status(404).json({ erro: "Medicamento não encontrado." });
  }

  med.quantidade += parseInt(quantidade);
  if (med.quantidade < 0) med.quantidade = 0;

  writeDB(db);
  res.json({ mensagem: "Estoque atualizado!", medicamento: med });
});

// Remover medicamento do estoque (admin)
app.delete("/estoque/:id", (req, res) => {
  const db = readDB();
  const id = parseInt(req.params.id);

  const index = (db.estoqueMedicamentos || []).findIndex(m => m.id === id);
  if (index === -1) {
    return res.status(404).json({ erro: "Medicamento não encontrado." });
  }

  const removido = db.estoqueMedicamentos.splice(index, 1);
  writeDB(db);
  res.json({ mensagem: "Medicamento removido do estoque.", medicamento: removido[0] });
});

// ============ DISPENSAÇÃO DE MEDICAMENTOS ============

// Listar dispensações
app.get("/dispensacoes", (req, res) => {
  const db = readDB();
  res.json(db.dispensacoes || []);
});

// Dispensar medicamento (baixa no estoque)
app.post("/dispensar", (req, res) => {
  const db = readDB();
  const { medicamentoId, paciente, quantidadeDispensada, responsavel } = req.body;

  const med = (db.estoqueMedicamentos || []).find(m => m.id === parseInt(medicamentoId));
  if (!med) {
    return res.status(404).json({ erro: "Medicamento não encontrado no estoque." });
  }

  const qtd = parseInt(quantidadeDispensada) || 1;

  if (med.quantidade < qtd) {
    return res.status(400).json({ erro: `Estoque insuficiente. Disponível: ${med.quantidade} ${med.unidade}.` });
  }

  // Baixa no estoque
  med.quantidade -= qtd;

  const dispensacao = {
    id: Date.now(),
    medicamentoId: med.id,
    medicamentoNome: med.nome,
    unidade: med.unidade,
    paciente: paciente || "Não informado",
    quantidadeDispensada: qtd,
    responsavel: responsavel || "Farmácia",
    dataHora: new Date().toLocaleString("pt-BR")
  };

  if (!db.dispensacoes) db.dispensacoes = [];
  db.dispensacoes.unshift(dispensacao);

  writeDB(db);
  res.json({ mensagem: "Medicamento dispensado com sucesso!", dispensacao, estoqueAtual: med.quantidade });
});

// LISTA DE MEDICAÇÕES (para o médico — retorna apenas os com estoque > 0)
app.get("/lista-medicacoes", (req, res) => {
  const db = readDB();
  const disponíveis = (db.estoqueMedicamentos || [])
    .filter(m => m.quantidade > 0)
    .map(m => ({ id: m.id, nome: m.nome, quantidade: m.quantidade, unidade: m.unidade }));
  res.json(disponíveis);
});

// CONSULTA
app.post("/consulta", (req, res) => {
  const db = readDB();

  const consulta = {
    id: Date.now(),
    paciente: req.body.paciente,
    diagnostico: req.body.diagnostico,
    medicacao: req.body.medicacao,
    obs: req.body.obs,
    createdAt: new Date()
  };

  db.consultas.push(consulta);
  writeDB(db);

  res.json(consulta);
});

// MEDICAÇÕES (histórico de consultas com medicação)
app.get("/medicacoes", (req, res) => {
  const db = readDB();
  res.json(db.consultas);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🏥 Hospital Pro rodando em: http://localhost:${PORT}`);
});