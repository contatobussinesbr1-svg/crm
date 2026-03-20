// ===== STORAGE =====
const STORAGE_KEY = "crm_usuarios";

// ===== PADRÃO =====
function getUsuarios() {
  let data = localStorage.getItem(STORAGE_KEY);

  if (!data) {
    const padrao = [{ user: "admin", pass: "123" }];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(padrao));
    return padrao;
  }

  return JSON.parse(data);
}

function salvarUsuarios(lista) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(lista));
}

// ===== ELEMENTOS =====
const loginForm = document.getElementById("login-form");
const loginSection = document.getElementById("login");
const appSection = document.getElementById("app");
const userForm = document.getElementById("user-form");
const listaUsers = document.getElementById("listaUsers");

// ===== LOGIN =====
loginForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const user = document.getElementById("user").value.trim();
  const pass = document.getElementById("pass").value.trim();

  const usuarios = getUsuarios();

  const existe = usuarios.find(u => u.user === user && u.pass === pass);

  if (!existe) {
    alert("Login inválido");
    return;
  }

  loginSection.classList.add("hidden");
  appSection.classList.remove("hidden");
});

// ===== CRIAR USUÁRIO =====
userForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const user = document.getElementById("novoUser").value.trim();
  const pass = document.getElementById("novaPassUser").value.trim();

  if (!user || !pass) return;

  const usuarios = getUsuarios();

  const existe = usuarios.find(u => u.user === user);

  if (existe) {
    alert("Usuário já existe");
    return;
  }

  usuarios.push({ user, pass });
  salvarUsuarios(usuarios);

  alert("Usuário criado!");
  userForm.reset();
  carregarUsuarios();
});

// ===== LISTAR =====
function carregarUsuarios() {
  const usuarios = getUsuarios();

  listaUsers.innerHTML = "";

  usuarios.forEach(u => {
    const li = document.createElement("li");
    li.innerHTML = `<strong>${u.user}</strong>`;
    listaUsers.appendChild(li);
  });
}

// ===== INIT =====
carregarUsuarios();
