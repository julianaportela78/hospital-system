const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const OUTPUT = path.join(__dirname, "Aula_Modulo_Farmacia_Estoque_Medicamentos.pdf");

const doc = new PDFDocument({
  size: "A4",
  margins: { top: 50, bottom: 50, left: 55, right: 55 },
  info: { Title: "Módulo Farmácia — Estoque de Medicamentos", Author: "Hospital Pro" }
});

doc.pipe(fs.createWriteStream(OUTPUT));

// ── HELPERS ──────────────────────────────────────────────────────────────
const W = 505; // content width

function hex(color) { return color; }

function pageHeader(title, subtitle) {
  // Dark top bar
  doc.rect(0, 0, doc.page.width, 90).fill("#0f172a");
  doc.fillColor("#ffffff").fontSize(22).font("Helvetica-Bold").text(title, 55, 28);
  doc.fillColor("#94a3b8").fontSize(11).font("Helvetica").text(subtitle, 55, 55);
  doc.fillColor("#000000");
  doc.y = 110;
}

function sectionTitle(text, color = "#0f172a") {
  doc.moveDown(0.8);
  const y = doc.y;
  doc.rect(55, y, 4, 18).fill(color);
  doc.fillColor(color).fontSize(14).font("Helvetica-Bold").text(text, 66, y + 2);
  doc.fillColor("#000000");
  doc.moveDown(0.5);
}

function subSection(text) {
  doc.moveDown(0.4);
  doc.fillColor("#334155").fontSize(12).font("Helvetica-Bold").text(text);
  doc.moveDown(0.2);
}

function body(text, opts = {}) {
  doc.fillColor(opts.color || "#475569").fontSize(11).font("Helvetica").text(text, { lineGap: 3, ...opts });
}

function codeBox(lines, bgColor = "#f1f5f9") {
  const startY = doc.y;
  const lineH = 16;
  const totalH = lines.length * lineH + 16;

  // Check if fits
  if (startY + totalH > doc.page.height - 70) { doc.addPage(); }

  const boxY = doc.y;
  doc.rect(55, boxY, W, totalH).fill(bgColor).stroke("#e2e8f0");
  doc.fillColor("#0f172a").fontSize(9.5).font("Courier");
  lines.forEach((line, i) => {
    doc.text(line, 65, boxY + 8 + i * lineH, { lineBreak: false });
  });
  doc.moveDown(0.3);
  doc.y = boxY + totalH + 10;
  doc.fillColor("#000000").font("Helvetica");
}

function infoBox(text, color = "#eff6ff", borderColor = "#bfdbfe", textColor = "#1e3a8a") {
  const boxY = doc.y;
  doc.rect(55, boxY, W, 36).fill(color).stroke(borderColor);
  doc.fillColor(textColor).fontSize(10).font("Helvetica").text(text, 65, boxY + 12, { width: W - 20 });
  doc.y = boxY + 46;
  doc.fillColor("#000000");
}

function tableHeader(cols, widths) {
  const y = doc.y;
  doc.rect(55, y, W, 24).fill("#1e293b");
  let x = 60;
  cols.forEach((col, i) => {
    doc.fillColor("#ffffff").fontSize(10).font("Helvetica-Bold").text(col, x, y + 7, { width: widths[i] - 4, lineBreak: false });
    x += widths[i];
  });
  doc.y = y + 24;
  doc.fillColor("#000000");
}

function tableRow(cells, widths, isAlt = false) {
  const y = doc.y;
  const h = 22;
  doc.rect(55, y, W, h).fill(isAlt ? "#f8fafc" : "#ffffff").stroke("#e2e8f0");
  let x = 60;
  cells.forEach((cell, i) => {
    doc.fillColor("#334155").fontSize(9.5).font("Helvetica").text(String(cell), x, y + 6, { width: widths[i] - 4, lineBreak: false });
    x += widths[i];
  });
  doc.y = y + h;
  doc.fillColor("#000000");
}

function checkNew() {
  if (doc.y > doc.page.height - 100) doc.addPage();
}

// ══════════════════════════════════════════════════════════════
//  CAPA
// ══════════════════════════════════════════════════════════════
doc.rect(0, 0, doc.page.width, doc.page.height).fill("#0f172a");

// Green gradient bar
doc.rect(0, 0, 12, doc.page.height).fill("#059669");

// Title block
doc.fillColor("#ffffff").fontSize(38).font("Helvetica-Bold")
   .text("Hospital Pro", 70, 180, { lineBreak: false });
doc.fillColor("#a7f3d0").fontSize(20).font("Helvetica")
   .text("Sistema Hospitalar de Gestão", 70, 225);

doc.moveDown(1.5);

doc.rect(70, 280, 460, 3).fill("#059669");

doc.fillColor("#ecfdf5").fontSize(28).font("Helvetica-Bold")
   .text("Módulo Farmácia &", 70, 300);
doc.fillColor("#34d399").fontSize(28).font("Helvetica-Bold")
   .text("Controle de Estoque", 70, 335);
doc.fillColor("#ffffff").fontSize(14).font("Helvetica")
   .text("Guia completo passo a passo — para alunos", 70, 375);

// Subtitle block
doc.rect(70, 420, 460, 80).fill("rgba(5,150,105,0.15)").stroke("#059669");
doc.fillColor("#a7f3d0").fontSize(12).font("Helvetica")
   .text("Conteúdo abordado:", 85, 435);
doc.fillColor("#ffffff").fontSize(11).font("Helvetica")
   .text("• Estoque de medicamentos com controle de quantidade", 85, 452)
   .text("• Dispensação com baixa automática no estoque", 85, 467)
   .text("• Gestão de entrada de medicamentos (exclusivo admin)", 85, 482);

doc.fillColor("#64748b").fontSize(10).font("Helvetica")
   .text("Hospital Pro — Material Didático de Programação Web", 70, 650)
   .text("Atualizado em: " + new Date().toLocaleDateString("pt-BR"), 70, 665);

// ══════════════════════════════════════════════════════════════
//  PÁGINA 1 — VISÃO GERAL DO SISTEMA
// ══════════════════════════════════════════════════════════════
doc.addPage();
pageHeader("📋 Visão Geral do Sistema", "O que foi criado e como as partes se conectam");

body("Este módulo adiciona ao Hospital Pro um sistema completo de controle de medicamentos, com três camadas integradas:");
doc.moveDown(0.6);

const widths1 = [140, 120, 245];
tableHeader(["Arquivo", "Quem Acessa", "O que faz"], widths1);
tableRow(["backend/server.js", "Sistema", "Novas rotas de estoque e dispensação"], widths1, false);
tableRow(["backend/db.json", "Sistema", "Dados do estoque e histórico de dispensações"], widths1, true);
tableRow(["frontend/medicacoes.html", "Farmácia (tipo: medicacoes)", "Tela principal da farmácia — dispensar e ver estoque"], widths1, false);
tableRow(["frontend/medico.html", "Médico", "Select de medicação agora mostra quantidade em estoque"], widths1, true);
tableRow(["frontend/admin.html", "Admin", "Nova seção para dar entrada e gerenciar estoque"], widths1, false);

doc.moveDown(1);
sectionTitle("Fluxo do Sistema", "#059669");
body("1. O ADMINISTRADOR acessa admin.html → dá entrada nos medicamentos (define nome, qtd, unidade e categoria)");
doc.moveDown(0.3);
body("2. O MÉDICO acessa medico.html → ao prescrever, o select mostra apenas os medicamentos com estoque disponível, com indicação da quantidade restante");
doc.moveDown(0.3);
body("3. A FARMÁCIA acessa medicacoes.html → visualiza o estoque completo, seleciona um medicamento e paciente, confirma a dispensação (baixa automática no estoque)");
doc.moveDown(0.3);
body("4. O sistema registra todas as dispensações com data, hora, paciente e responsável");

doc.moveDown(0.8);
infoBox("🔑 Regra de acesso: Somente o usuário do tipo 'admin' pode dar entrada no estoque (admin.html). O usuário do tipo 'medicacoes' (farmácia) faz dispensações.");

// ══════════════════════════════════════════════════════════════
//  PÁGINA 2 — db.json
// ══════════════════════════════════════════════════════════════
doc.addPage();
pageHeader("📄 ARQUIVO 1: backend/db.json", "Novos campos adicionados ao banco de dados");

sectionTitle("O que mudou no db.json", "#7c3aed");
body("Foram adicionados dois novos campos de array ao banco de dados JSON:");

doc.moveDown(0.5);
subSection("1. estoqueMedicamentos — Inventário de medicamentos");
body("Cada item do array representa um medicamento no estoque com os campos:");
doc.moveDown(0.3);
codeBox([
  '"estoqueMedicamentos": [',
  '  {',
  '    "id": 1,                         → identificador único',
  '    "nome": "Dipirona 500mg",         → nome do medicamento',
  '    "quantidade": 50,                 → quantidade disponível em estoque',
  '    "unidade": "comprimidos",         → tipo de unidade (comprimidos, frascos...)',
  '    "categoria": "Analgésico/Antipirético"  → categoria farmacológica',
  '  },',
  '  { "id": 2, "nome": "Paracetamol 750mg", "quantidade": 80, ... },',
  '  ... (10 medicamentos pré-cadastrados no total)',
  ']',
]);

subSection("2. dispensacoes — Histórico de dispensações");
body("Cada dispensação registrada fica neste array:");
codeBox([
  '"dispensacoes": [',
  '  {',
  '    "id": 1730000000001,              → id único (timestamp)',
  '    "medicamentoId": 2,               → referência ao medicamento dispensado',
  '    "medicamentoNome": "Paracetamol", → nome para exibição rápida',
  '    "unidade": "comprimidos",',
  '    "paciente": "Ana Maria Silva",    → nome do paciente',
  '    "quantidadeDispensada": 2,        → quantas unidades foram retiradas',
  '    "responsavel": "Farmácia",        → quem realizou a dispensação',
  '    "dataHora": "28/10/2026, 09:30"  → data e hora do registro',
  '  }',
  ']',
]);

doc.moveDown(0.5);
infoBox("💡 Importante: O arquivo db.json é atualizado automaticamente pelo server.js. Nunca o edite manualmente enquanto o servidor estiver rodando.");

// ══════════════════════════════════════════════════════════════
//  PÁGINA 3 — server.js PARTE 1
// ══════════════════════════════════════════════════════════════
doc.addPage();
pageHeader("⚙️ ARQUIVO 2: backend/server.js (Parte 1)", "Funções de leitura atualizadas + Rotas de Estoque");

sectionTitle("Atualização da função readDB()", "#dc2626");
body("A função readDB() foi atualizada para inicializar os novos campos caso não existam no arquivo:");
codeBox([
  "function readDB() {",
  "  const db = JSON.parse(fs.readFileSync(DB_FILE));",
  "  if (!db.tv_chamada)          db.tv_chamada = null;",
  "  if (!db.tv_historico)        db.tv_historico = [];",
  "  if (!db.estoqueMedicamentos) db.estoqueMedicamentos = [];  // NOVO",
  "  if (!db.dispensacoes)        db.dispensacoes = [];          // NOVO",
  "  return db;",
  "}",
]);

sectionTitle("GET /estoque — Listar estoque", "#059669");
body("Retorna todos os medicamentos cadastrados no estoque:");
codeBox([
  "app.get('/estoque', (req, res) => {",
  "  const db = readDB();",
  "  res.json(db.estoqueMedicamentos || []);",
  "});",
]);

sectionTitle("POST /estoque — Dar entrada (Admin)", "#059669");
body("Adiciona um novo medicamento ou aumenta a quantidade de um existente:");
codeBox([
  "app.post('/estoque', (req, res) => {",
  "  const db = readDB();",
  "  const { nome, quantidade, unidade, categoria } = req.body;",
  "",
  "  // Verifica se já existe pelo nome",
  "  const existente = db.estoqueMedicamentos.find(",
  "    m => m.nome.toLowerCase() === nome.trim().toLowerCase()",
  "  );",
  "",
  "  if (existente) {",
  "    existente.quantidade += parseInt(quantidade); // SOMA ao estoque",
  "    writeDB(db);",
  "    return res.json({ mensagem: 'Estoque atualizado!', medicamento: existente });",
  "  }",
  "",
  "  // Novo medicamento",
  "  const novoMed = { id: Date.now(), nome, quantidade, unidade, categoria };",
  "  db.estoqueMedicamentos.push(novoMed);",
  "  writeDB(db);",
  "  res.status(201).json({ mensagem: 'Medicamento cadastrado!', medicamento: novoMed });",
  "});",
]);

sectionTitle("PATCH /estoque/:id — Repor estoque", "#059669");
body("Adiciona ou remove quantidade de um medicamento específico pelo seu ID:");
codeBox([
  "app.patch('/estoque/:id', (req, res) => {",
  "  const db = readDB();",
  "  const id = parseInt(req.params.id);        // id vem pela URL",
  "  const { quantidade } = req.body;",
  "",
  "  const med = db.estoqueMedicamentos.find(m => m.id === id);",
  "  if (!med) return res.status(404).json({ erro: 'Não encontrado.' });",
  "",
  "  med.quantidade += parseInt(quantidade);     // soma positivo ou negativo",
  "  if (med.quantidade < 0) med.quantidade = 0; // não deixa ficar negativo",
  "",
  "  writeDB(db);",
  "  res.json({ mensagem: 'Estoque atualizado!', medicamento: med });",
  "});",
]);

// ══════════════════════════════════════════════════════════════
//  PÁGINA 4 — server.js PARTE 2
// ══════════════════════════════════════════════════════════════
doc.addPage();
pageHeader("⚙️ ARQUIVO 2: backend/server.js (Parte 2)", "Rotas de Dispensação e Lista para o Médico");

sectionTitle("DELETE /estoque/:id — Remover medicamento (Admin)", "#dc2626");
codeBox([
  "app.delete('/estoque/:id', (req, res) => {",
  "  const db = readDB();",
  "  const id = parseInt(req.params.id);",
  "",
  "  const index = db.estoqueMedicamentos.findIndex(m => m.id === id);",
  "  if (index === -1) return res.status(404).json({ erro: 'Não encontrado.' });",
  "",
  "  const removido = db.estoqueMedicamentos.splice(index, 1);",
  "  writeDB(db);",
  "  res.json({ mensagem: 'Removido com sucesso.', medicamento: removido[0] });",
  "});",
]);

sectionTitle("POST /dispensar — Dispensar medicamento (Farmácia)", "#059669");
body("Rota principal da farmácia: faz a baixa no estoque e registra a dispensação:");
codeBox([
  "app.post('/dispensar', (req, res) => {",
  "  const db = readDB();",
  "  const { medicamentoId, paciente, quantidadeDispensada, responsavel } = req.body;",
  "",
  "  // Busca o medicamento pelo ID",
  "  const med = db.estoqueMedicamentos.find(m => m.id === parseInt(medicamentoId));",
  "  if (!med) return res.status(404).json({ erro: 'Medicamento não encontrado.' });",
  "",
  "  const qtd = parseInt(quantidadeDispensada) || 1;",
  "",
  "  // Verifica se tem estoque suficiente",
  "  if (med.quantidade < qtd) {",
  "    return res.status(400).json({",
  "      erro: `Estoque insuficiente. Disponível: ${med.quantidade} ${med.unidade}.`",
  "    });",
  "  }",
  "",
  "  med.quantidade -= qtd; // BAIXA no estoque",
  "",
  "  // Cria o registro de dispensação",
  "  const dispensacao = {",
  "    id: Date.now(),",
  "    medicamentoId: med.id, medicamentoNome: med.nome, unidade: med.unidade,",
  "    paciente: paciente || 'Não informado',",
  "    quantidadeDispensada: qtd,",
  "    responsavel: responsavel || 'Farmácia',",
  "    dataHora: new Date().toLocaleString('pt-BR')",
  "  };",
  "",
  "  db.dispensacoes.unshift(dispensacao); // insere no início da lista",
  "  writeDB(db);",
  "  res.json({ mensagem: 'Dispensado!', dispensacao, estoqueAtual: med.quantidade });",
  "});",
]);

sectionTitle("GET /lista-medicacoes — Lista para o Médico", "#2563eb");
body("Esta rota foi atualizada: agora retorna objetos com nome e quantidade (não mais apenas strings):");
codeBox([
  "app.get('/lista-medicacoes', (req, res) => {",
  "  const db = readDB();",
  "  // Filtra apenas os que têm quantidade > 0",
  "  const disponíveis = (db.estoqueMedicamentos || [])",
  "    .filter(m => m.quantidade > 0)",
  "    .map(m => ({",
  "      id: m.id,",
  "      nome: m.nome,",
  "      quantidade: m.quantidade,",
  "      unidade: m.unidade",
  "    }));",
  "  res.json(disponíveis);",
  "});",
]);

doc.moveDown(0.5);
const widths2 = [130, 100, 90, 185];
tableHeader(["Rota", "Método", "Quem usa", "Função"], widths2);
tableRow(["/estoque", "GET", "Farmácia, Admin", "Listar todos os medicamentos"], widths2, false);
tableRow(["/estoque", "POST", "Admin", "Adicionar / dar entrada"], widths2, true);
tableRow(["/estoque/:id", "PATCH", "Admin", "Repor quantidade"], widths2, false);
tableRow(["/estoque/:id", "DELETE", "Admin", "Remover medicamento"], widths2, true);
tableRow(["/dispensar", "POST", "Farmácia", "Dispensar com baixa no estoque"], widths2, false);
tableRow(["/dispensacoes", "GET", "Farmácia", "Ver histórico de dispensações"], widths2, true);
tableRow(["/lista-medicacoes", "GET", "Médico", "Medicações disponíveis c/ qtd"], widths2, false);

// ══════════════════════════════════════════════════════════════
//  PÁGINA 5 — medicacoes.html
// ══════════════════════════════════════════════════════════════
doc.addPage();
pageHeader("💊 ARQUIVO 3: frontend/medicacoes.html", "Tela completa da Farmácia — acesso tipo 'medicacoes'");

sectionTitle("Estrutura da tela", "#059669");
body("A tela medicacoes.html é dividida em quatro áreas principais:");

doc.moveDown(0.4);
const widths3 = [160, 345];
tableHeader(["Área", "Descrição"], widths3);
tableRow(["Barra de Estatísticas", "Mostra total de medicamentos, unidades em estoque, itens com estoque baixo e zerados"], widths3, false);
tableRow(["Tabela de Estoque", "Lista todos os medicamentos com nome, categoria, quantidade e botão Dispensar"], widths3, true);
tableRow(["Painel de Dispensação", "Formulário lateral para selecionar medicamento, paciente, quantidade e confirmar"], widths3, false);
tableRow(["Prescrições Médicas", "Lista as prescrições salvas pelo médico para referência da farmácia"], widths3, true);
tableRow(["Histórico de Dispensações", "Registro de tudo que foi dispensado com data, hora e responsável"], widths3, false);

sectionTitle("Função: carregarEstoque()", "#059669");
codeBox([
  "function carregarEstoque() {",
  "  fetch('/estoque')               // chama GET /estoque no server.js",
  "    .then(r => r.json())",
  "    .then(data => {",
  "      estoqueGlobal = data;       // salva globalmente para filtros",
  "      atualizarStats(data);       // atualiza os 4 cards de estatística",
  "      renderizarFiltros(data);    // monta os chips de categoria",
  "      renderizarTabela(data);     // preenche a tabela de medicamentos",
  "      preencherSelectDispensacao(data); // atualiza o <select>",
  "      verificarAlertaEstoque(data);     // mostra alerta se estoque baixo",
  "    });",
  "}",
]);

sectionTitle("Função: dispensar() + confirmarDispensacao()", "#059669");
body("O processo de dispensação é em duas etapas para evitar erros:");
codeBox([
  "function dispensar() {",
  "  // 1. Valida os campos do formulário",
  "  // 2. Verifica se há estoque suficiente (no frontend)",
  "  // 3. Abre o MODAL de confirmação com resumo",
  "  dadosPendentes = { medicamentoId, paciente, quantidadeDispensada, responsavel };",
  "  document.getElementById('modalConfirmar').classList.add('open');",
  "}",
  "",
  "function confirmarDispensacao() {",
  "  // Chamada após o usuário clicar 'Confirmar' no modal",
  "  fetch('/dispensar', {",
  "    method: 'POST',",
  "    body: JSON.stringify(dadosPendentes)",
  "  })",
  "  .then(r => r.json())",
  "  .then(data => {",
  "    showToast('Dispensado! Estoque restante: ' + data.estoqueAtual);",
  "    carregarEstoque();      // atualiza a tabela",
  "    carregarHistorico();    // atualiza o histórico",
  "  });",
  "}",
]);

sectionTitle("Indicadores visuais de estoque", "#d97706");
body("A tabela usa cores para indicar a situação do estoque:");
doc.moveDown(0.3);
const widths4 = [100, 100, 305];
tableHeader(["Ícone", "Situação", "Critério"], widths4);
tableRow(["🟢 Verde", "OK", "Quantidade acima de 10 unidades"], widths4, false);
tableRow(["🟡 Amarelo", "Estoque Baixo", "Entre 6 e 10 unidades — atenção"], widths4, true);
tableRow(["🔴 Vermelho", "Crítico", "5 ou menos unidades — reposição urgente"], widths4, false);
tableRow(["🚫 Cinza", "Esgotado", "0 unidades — não aparece para o médico"], widths4, true);

// ══════════════════════════════════════════════════════════════
//  PÁGINA 6 — medico.html (atualizado)
// ══════════════════════════════════════════════════════════════
doc.addPage();
pageHeader("🩺 ARQUIVO 4: frontend/medico.html", "Atualização do seletor de medicação com estoque real");

sectionTitle("O que mudou no medico.html", "#7c3aed");
body("A função carregarMedicacoes() foi atualizada. Antes, a rota /lista-medicacoes retornava apenas strings com nomes. Agora retorna objetos com quantidade e unidade, permitindo exibir o estoque no select:");

codeBox([
  "// ANTES — versão antiga (só mostrava o nome):",
  "data.forEach(med => {",
  "  const option = document.createElement('option');",
  "  option.value = med;          // med era uma string",
  "  option.textContent = med;",
  "  select.appendChild(option);",
  "});",
], "#fef3c7");

codeBox([
  "// DEPOIS — versão nova (mostra qtd disponível):",
  "data.forEach(med => {",
  "  const option = document.createElement('option');",
  "  const nome = med.nome || med;              // compatível com string ou objeto",
  "  const qtd  = med.quantidade;",
  "",
  "  option.value = nome;",
  "",
  "  // Adiciona badge visual conforme quantidade",
  "  let badge = '';",
  "  if (qtd === 0)       { badge = ' 🚫 Esgotado'; option.disabled = true; }",
  "  else if (qtd <= 5)   badge = ` 🔴 (${qtd} restantes)`;",
  "  else if (qtd <= 10)  badge = ` 🟡 (${qtd} restantes)`;",
  "  else                 badge = ` 🟢 (${qtd} em estoque)`;",
  "",
  "  option.textContent = nome + badge;",
  "  select.appendChild(option);",
  "});",
], "#f0fdf4");

doc.moveDown(0.5);
infoBox("✅ Resultado: O médico vê no select de medicação, por exemplo: 'Paracetamol 750mg 🟢 (80 em estoque)'. Medicamentos esgotados aparecem desabilitados.");

sectionTitle("Compatibilidade retroativa", "#2563eb");
body("O código usa `const nome = med.nome || med` para funcionar tanto com a nova versão (objeto) quanto com a versão antiga (string pura). Isso evita erros caso o servidor não esteja atualizado.");

// ══════════════════════════════════════════════════════════════
//  PÁGINA 7 — admin.html (atualizado)
// ══════════════════════════════════════════════════════════════
doc.addPage();
pageHeader("🛡️ ARQUIVO 5: frontend/admin.html", "Nova seção de Gestão de Estoque para o Administrador");

sectionTitle("O que foi adicionado ao admin.html", "#dc2626");
body("Uma nova <section> foi inserida logo abaixo do grid de usuários. Ela contém:");
doc.moveDown(0.3);
body("• Formulário de entrada: Nome, Quantidade, Unidade, Categoria → botão 'Dar Entrada'");
body("• Tabela do estoque atual: mostra todos os medicamentos com status colorido");
body("• Botão 'Repor' em cada linha: permite adicionar mais unidades ao estoque");
body("• Botão 'Excluir': remove completamente o medicamento do sistema");

sectionTitle("Função: darEntradaEstoque()", "#dc2626");
codeBox([
  "function darEntradaEstoque() {",
  "  const nome      = document.getElementById('emNome').value.trim();",
  "  const qtd       = parseInt(document.getElementById('emQtd').value);",
  "  const unidade   = document.getElementById('emUnidade').value;",
  "  const categoria = document.getElementById('emCategoria').value;",
  "",
  "  fetch('/estoque', {",
  "    method: 'POST',",
  "    headers: { 'Content-Type': 'application/json' },",
  "    body: JSON.stringify({ nome, quantidade: qtd, unidade, categoria })",
  "  })",
  "  .then(r => r.json())",
  "  .then(data => {",
  "    showToast(data.mensagem, 'success');  // mostra notificação de sucesso",
  "    carregarEstoqueAdmin();               // recarrega a tabela",
  "  });",
  "}",
]);

sectionTitle("Função: reporEstoque(id, nome)", "#dc2626");
codeBox([
  "function reporEstoque(id, nome) {",
  "  // Pede a quantidade via prompt nativo do browser",
  "  const qtd = parseInt(prompt(`Quantas unidades adicionar a '${nome}'?`));",
  "  if (!qtd || qtd <= 0) return;",
  "",
  "  fetch(`/estoque/${id}`, {",
  "    method: 'PATCH',",
  "    body: JSON.stringify({ quantidade: qtd })",
  "  })",
  "  .then(r => r.json())",
  "  .then(data => {",
  "    showToast(`+${qtd} adicionado. Novo total: ${data.medicamento.quantidade}`);",
  "    carregarEstoqueAdmin();",
  "  });",
  "}",
]);

sectionTitle("Inicialização da página Admin", "#dc2626");
body("O DOMContentLoaded foi atualizado para também carregar o estoque ao abrir a página:");
codeBox([
  "document.addEventListener('DOMContentLoaded', () => {",
  "  carregarUsuarios();      // já existia",
  "  carregarEstoqueAdmin();  // NOVO — carrega a tabela de estoque",
  "});",
]);

// ══════════════════════════════════════════════════════════════
//  PÁGINA 8 — Exercícios e Desafios
// ══════════════════════════════════════════════════════════════
doc.addPage();
pageHeader("📝 Exercícios & Desafios para os Alunos", "Atividades práticas baseadas no módulo criado");

sectionTitle("Exercício 1 — Nível Básico (Todos os alunos)", "#059669");
body("Teste o sistema completo seguindo o fluxo:");
doc.moveDown(0.3);
body("1. Abra http://localhost:3000 e faça login com admin / 123");
body("2. Vá até o painel do admin e localize a seção 'Gestão do Estoque de Medicamentos'");
body("3. Adicione um novo medicamento: nome 'Vitamina C 1g', qtd 30, unidade 'comprimidos', categoria 'Geral'");
body("4. Faça logout e login como medico / 123");
body("5. Abra medico.html e verifique se 'Vitamina C 1g' aparece no select com a quantidade");
body("6. Faça logout e login como farmacia / 123");
body("7. Acesse medicacoes.html e dispense 2 comprimidos de 'Vitamina C 1g' para o paciente 'João Silva'");
body("8. Verifique se o estoque diminuiu de 30 para 28");

doc.moveDown(0.6);
sectionTitle("Exercício 2 — Nível Médio", "#d97706");
body("Adicione uma funcionalidade de alerta por e-mail simulado:");
doc.moveDown(0.3);
body("• No server.js, na rota POST /dispensar, após salvar, verifique se a quantidade ficou <= 5");
body("• Se ficou crítico, adicione ao objeto de resposta um campo 'alertaCritico: true'");
body("• No medicacoes.html, ao receber a resposta da dispensação, se alertaCritico for true, exiba um alerta visual especial em vermelho piscante");

doc.moveDown(0.6);
sectionTitle("Exercício 3 — Nível Avançado (Desafio)", "#dc2626");
body("Implemente um relatório de consumo mensal:");
doc.moveDown(0.3);
body("• No db.json, cada dispensação já tem dataHora salvo");
body("• Crie uma rota GET /relatorio no server.js que receba ?mes=10&ano=2026 como parâmetros");
body("• A rota deve filtrar as dispensacoes pelo mês/ano e retornar um resumo por medicamento:");
body("   { nome: 'Paracetamol', totalDispensado: 15, unidade: 'comprimidos' }");
body("• No admin.html, adicione um botão 'Gerar Relatório' que chame essa rota e exiba o resultado em tabela");

doc.moveDown(0.6);
sectionTitle("Entrega", "#2563eb");
infoBox("📤 Envie os arquivos: backend/server.js, backend/db.json, frontend/medicacoes.html, frontend/medico.html e frontend/admin.html para avaliação.");

// ══════════════════════════════════════════════════════════════
//  PÁGINA 9 — Glossário e Dicionário de Termos
// ══════════════════════════════════════════════════════════════
doc.addPage();
pageHeader("📖 Glossário de Termos do Projeto", "Conceitos importantes usados neste módulo");

const termos = [
  ["Estoque (Stock)", "Conjunto de medicamentos disponíveis para uso. Controlado por quantidade numérica."],
  ["Dispensação", "Ato de entregar um medicamento a um paciente, registrando a saída do estoque."],
  ["Baixa no estoque", "Redução da quantidade de um item após ser dispensado. Ex: tinha 50, dispensou 2, ficou 48."],
  ["Entrada no estoque", "Adicionar unidades ao estoque. Feita pelo admin ao receber novos medicamentos."],
  ["GET (HTTP)", "Requisição para BUSCAR dados do servidor. Ex: GET /estoque → retorna a lista."],
  ["POST (HTTP)", "Requisição para CRIAR dados. Ex: POST /estoque → cadastra um novo medicamento."],
  ["PATCH (HTTP)", "Requisição para ATUALIZAR parcialmente. Ex: PATCH /estoque/1 → altera a quantidade."],
  ["DELETE (HTTP)", "Requisição para REMOVER dados. Ex: DELETE /estoque/1 → remove o medicamento."],
  ["JSON", "Formato de dados usado para comunicar frontend e backend. Ex: { nome: 'Dipirona', qtd: 50 }."],
  ["fetch()", "Função JavaScript para fazer requisições HTTP ao servidor sem recarregar a página."],
  ["Modal", "Janela de diálogo que aparece sobre a tela para confirmar uma ação antes de executá-la."],
  ["Toast", "Notificação temporária que aparece no canto da tela por alguns segundos."],
  ["res.json()", "Método do Express para enviar uma resposta JSON ao cliente."],
  ["db.estoqueMedicamentos", "Array no db.json que guarda todos os medicamentos e suas quantidades."],
  ["db.dispensacoes", "Array no db.json que guarda o histórico completo de dispensações realizadas."],
];

const w5 = [170, 335];
tableHeader(["Termo", "Significado"], w5);
termos.forEach((t, i) => tableRow(t, w5, i % 2 === 1));

// ══════════════════════════════════════════════════════════════
//  PÁGINA FINAL — Arquivos para os Alunos
// ══════════════════════════════════════════════════════════════
doc.addPage();
pageHeader("📦 Arquivos para Distribuir aos Alunos", "Checklist completo dos arquivos modificados");

sectionTitle("Arquivos que devem ser entregues", "#059669");
body("Para que os alunos tenham o sistema completo funcionando, devem receber os seguintes arquivos:");

doc.moveDown(0.5);

// Checklist visual
const checkItems = [
  ["✅", "backend/server.js", "Versão completa com todas as novas rotas de estoque e dispensação"],
  ["✅", "backend/db.json", "Banco com estoqueMedicamentos e dispensacoes inicializados"],
  ["✅", "frontend/medicacoes.html", "Tela completa da farmácia (NOVO ARQUIVO)"],
  ["✅", "frontend/medico.html", "Atualizado: select mostra estoque disponível"],
  ["✅", "frontend/admin.html", "Atualizado: nova seção de gestão de estoque"],
];

const w6 = [30, 180, 295];
tableHeader(["", "Arquivo", "Observação"], w6);
checkItems.forEach((item, i) => tableRow(item, w6, i % 2 === 1));

doc.moveDown(1);
sectionTitle("Arquivos que NÃO precisam ser modificados", "#94a3b8");

const naoModif = [
  ["—", "frontend/index.html", "Tela de login — sem alterações"],
  ["—", "frontend/atendimento.html", "Recepção — sem alterações"],
  ["—", "frontend/triagem.html", "Triagem — sem alterações"],
  ["—", "frontend/tv.html", "Painel de TV — sem alterações"],
  ["—", "frontend/css/style.css", "CSS global — sem alterações"],
  ["—", "package.json / node_modules", "Dependências — sem alterações"],
];

tableHeader(["", "Arquivo", "Status"], w6);
naoModif.forEach((item, i) => tableRow(item, w6, i % 2 === 1));

doc.moveDown(1);
sectionTitle("Como entregar em um único arquivo .zip", "#2563eb");
codeBox([
  "# No terminal, dentro da pasta do projeto:",
  "# Selecionar apenas os arquivos modificados:",
  "",
  "Pasta: hospital-system/",
  "  ├── backend/",
  "  │   ├── server.js    ← MODIFICADO",
  "  │   └── db.json      ← MODIFICADO",
  "  └── frontend/",
  "      ├── medicacoes.html  ← NOVO",
  "      ├── medico.html      ← MODIFICADO",
  "      └── admin.html       ← MODIFICADO",
]);

doc.moveDown(0.5);
infoBox("💡 Dica para o professor: compacte a pasta completa hospital-system/ em um .zip. Os alunos devem extrair e executar 'node backend/server.js' no terminal para iniciar o servidor.");

// ══════════════════════════════════════════════════════════════
//  RODAPÉ FINAL
// ══════════════════════════════════════════════════════════════
doc.addPage();
doc.rect(0, 0, doc.page.width, doc.page.height).fill("#0f172a");
doc.rect(0, 0, 12, doc.page.height).fill("#059669");

doc.fillColor("#ffffff").fontSize(26).font("Helvetica-Bold")
   .text("Hospital Pro", 70, 200);
doc.fillColor("#a7f3d0").fontSize(16).font("Helvetica")
   .text("Módulo Farmácia & Controle de Estoque", 70, 234);

doc.rect(70, 270, 460, 2).fill("#059669");

doc.fillColor("#94a3b8").fontSize(12).font("Helvetica")
   .text("Este material foi desenvolvido para fins educacionais.", 70, 285)
   .text("Todos os conceitos aplicados são utilizados em sistemas reais de gestão hospitalar.", 70, 305);

doc.rect(70, 380, 460, 120).fill("rgba(5,150,105,0.1)").stroke("#059669");
doc.fillColor("#a7f3d0").fontSize(13).font("Helvetica-Bold").text("Resumo do que foi aprendido:", 85, 395);
doc.fillColor("#ffffff").fontSize(11).font("Helvetica")
   .text("✅  Criar e gerenciar um banco de dados JSON com múltiplas entidades", 85, 418)
   .text("✅  Implementar rotas REST completas (GET, POST, PATCH, DELETE)", 85, 435)
   .text("✅  Controlar estoque com baixa automática via lógica no servidor", 85, 452)
   .text("✅  Criar interfaces modernas e responsivas com HTML e CSS puro", 85, 469)
   .text("✅  Comunicar frontend e backend com fetch() e JSON", 85, 486);

doc.fillColor("#475569").fontSize(10).font("Helvetica")
   .text("Hospital Pro — Sistema de Gestão Hospitalar | Material Didático", 70, 600)
   .text("Gerado em: " + new Date().toLocaleDateString("pt-BR"), 70, 615);

doc.end();

doc.on("finish", () => {
  console.log("✅ PDF gerado:", OUTPUT);
});
