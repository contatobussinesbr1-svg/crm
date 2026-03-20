import { collection, addDoc, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ===== FIREBASE FUNÇÕES =====
async function salvarDados(colecao, dados) {
  await addDoc(collection(window.db, colecao), dados);
}

async function listarDados(colecao) {
  const querySnapshot = await getDocs(collection(window.db, colecao));
  let lista = [];
  querySnapshot.forEach((d) => {
    lista.push({ id: d.id, ...d.data() });
  });
  return lista;
}

async function excluirDado(colecao, id) {
  await deleteDoc(doc(window.db, colecao, id));
}

// ===== ESTADO =====
const state = {
  candidatos: [],
  funcionarios: [],
  departamentos: [],
  salarios: [],
  documentos: []
};

// ===== ELEMENTOS =====
const candidateForm = document.getElementById("candidate-form");
const funcLista = document.getElementById("funcLista");
const listaCandidatos = document.getElementById("listaCandidatos");

// ===== CANDIDATOS (AGORA ONLINE) =====
async function carregarCandidatos() {
  state.candidatos = await listarDados("candidatos");
  renderCandidatos();
}

async function adicionarCandidato(data) {
  await salvarDados("candidatos", data);
  carregarCandidatos();
}

async function removerCandidato(id) {
  await excluirDado("candidatos", id);
  carregarCandidatos();
}

// ===== FUNCIONÁRIOS =====
async function carregarFuncionarios() {
  state.funcionarios = await listarDados("funcionarios");
  renderFuncionarios();
}

// ===== RENDER =====
function renderCandidatos() {
  listaCandidatos.innerHTML = "";

  state.candidatos.forEach(item => {
    const li = document.createElement("li");
    li.innerHTML = `
      <strong>${item.nome}</strong>
      <p>${item.cargo} - ${item.cidade}</p>
      <button onclick="excluirCand('${item.id}')">Excluir</button>
    `;
    listaCandidatos.appendChild(li);
  });
}

function renderFuncionarios() {
  funcLista.innerHTML = "";

  state.funcionarios.forEach(item => {
    const li = document.createElement("li");
    li.innerHTML = `
      <strong>${item.nome}</strong>
      <p>${item.cargo}</p>
    `;
    funcLista.appendChild(li);
  });
}

// ===== EVENTOS =====
candidateForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const candidato = {
    nome: document.getElementById("nomeCandidato").value,
    cidade: document.getElementById("cidade").value,
    cargo: document.getElementById("cargo").value,
    nascimento: document.getElementById("nascimento").value
  };

  await adicionarCandidato(candidato);
  candidateForm.reset();
});

// ===== GLOBAL (BOTÃO HTML) =====
window.excluirCand = function(id) {
  removerCandidato(id);
};

// ===== INIT =====
async function init() {
  await carregarCandidatos();
  await carregarFuncionarios();
}

init();
