import { collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ===== ESPERA FIREBASE CARREGAR =====
async function esperarDB() {
  while (!window.db) {
    await new Promise(r => setTimeout(r, 100));
  }
}

// ===== USUÁRIOS =====
async function listarUsuarios() {
  const snapshot = await getDocs(collection(window.db, "usuarios"));
  let lista = [];
  snapshot.forEach(doc => {
    lista.push(doc.data());
  });
  return lista;
}

async function salvarUsuario(user, pass) {
  await addDoc(collection(window.db, "usuarios"), { user, pass });
}

// ===== ELEMENTOS =====
const loginForm = document.getElementById("login-form");
const loginSection = document.getElementById("login");
const appSection = document.getElementById("app");
const userForm = document.getElementById("user-form");
const listaUsers = document.getElementById("listaUsers");

// ===== LOGIN =====
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  await esperarDB();

  const user = document.getElementById("user").value.trim();
  const pass = document.getElementById("pass").value.trim();

  const usuarios = await listarUsuarios();

  const existe = usuarios.find(u => u.user === user && u.pass === pass);

  if (!existe) {
    alert("Login inválido");
    return;
  }

  loginSection.classList.add("hidden");
  appSection.classList.remove("hidden");
});

// ===== CRIAR USUÁRIO =====
userForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  await esperarDB();

  const user = document.getElementById("novoUser").value.trim();
  const pass = document.getElementById("novaPassUser").value.trim();

  if (!user || !pass) return;

  await salvarUsuario(user, pass);

  alert("Usuário criado!");
  userForm.reset();
  carregarUsuarios();
});

// ===== LISTAR USUÁRIOS =====
async function carregarUsuarios() {
  await esperarDB();

  const usuarios = await listarUsuarios();

  listaUsers.innerHTML = "";

  usuarios.forEach(u => {
    const li = document.createElement("li");
    li.innerHTML = `<strong>${u.user}</strong>`;
    listaUsers.appendChild(li);
  });
}

// ===== CRIAR ADMIN AUTOMÁTICO =====
async function criarAdmin() {
  await esperarDB();

  const usuarios = await listarUsuarios();

  if (usuarios.length === 0) {
    await salvarUsuario("admin", "123");
    console.log("Admin criado: admin / 123");
  }
}

// ===== INIT =====
async function init() {
  await criarAdmin();
  await carregarUsuarios();
}

init();
