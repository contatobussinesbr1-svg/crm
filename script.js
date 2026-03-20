import { collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ===== FIREBASE =====
async function salvarUsuario(user, pass) {
  await addDoc(collection(window.db, "usuarios"), { user, pass });
}

async function listarUsuarios() {
  const snapshot = await getDocs(collection(window.db, "usuarios"));
  let lista = [];
  snapshot.forEach(doc => {
    lista.push(doc.data());
  });
  return lista;
}

// ===== ELEMENTOS =====
const loginForm = document.getElementById("login-form");
const loginSection = document.getElementById("login");
const appSection = document.getElementById("app");
const userForm = document.getElementById("user-form");
const listaUsers = document.getElementById("listaUsers");

// ===== ESTADO =====
let usuarios = [];

// ===== LOGIN =====
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const user = document.getElementById("user").value;
  const pass = document.getElementById("pass").value;

  usuarios = await listarUsuarios();

  const encontrado = usuarios.find(u => u.user === user && u.pass === pass);

  if (!encontrado) {
    alert("Login inválido");
    return;
  }

  loginSection.classList.add("hidden");
  appSection.classList.remove("hidden");
});

// ===== CRIAR USUÁRIO =====
userForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const user = document.getElementById("novoUser").value;
  const pass = document.getElementById("novaPassUser").value;

  if (!user || !pass) return;

  await salvarUsuario(user, pass);

  alert("Usuário criado com sucesso");
  userForm.reset();
  carregarUsuarios();
});

// ===== LISTAR USUÁRIOS =====
async function carregarUsuarios() {
  usuarios = await listarUsuarios();

  listaUsers.innerHTML = "";

  usuarios.forEach(u => {
    const li = document.createElement("li");
    li.innerHTML = `<strong>${u.user}</strong>`;
    listaUsers.appendChild(li);
  });
}

// ===== PRIMEIRO ACESSO (CRIA ADMIN AUTOMÁTICO) =====
async function criarAdminPadrao() {
  const lista = await listarUsuarios();

  if (lista.length === 0) {
    await salvarUsuario("admin", "123");
  }
}

// ===== INIT =====
async function init() {
  await criarAdminPadrao();
  await carregarUsuarios();
}

init();
