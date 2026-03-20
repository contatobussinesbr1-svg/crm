const SUPABASE_URL = "COLE_SUA_URL_AQUI";
const SUPABASE_KEY = "COLE_SUA_CHAVE_AQUI";

const db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// LOGIN
document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const user = document.getElementById("user").value;
  const pass = document.getElementById("pass").value;

  const { data, error } = await db
    .from("usuarios")
    .select("*")
    .eq("user", user)
    .eq("pass", pass);

  if (data.length > 0) {
    document.getElementById("login").classList.add("hidden");
    document.getElementById("app").classList.remove("hidden");
    carregarDados();
  } else {
    alert("Login inválido");
  }
});

// CARREGAR DADOS
async function carregarDados() {
  carregarCandidatos();
  carregarFuncionarios();
}

// CANDIDATOS
document.getElementById("candidate-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const nome = document.getElementById("nomeCandidato").value;
  const cidade = document.getElementById("cidade").value;
  const cargo = document.getElementById("cargo").value;

  await db.from("candidatos").insert([{ nome, cidade, cargo }]);

  carregarCandidatos();
});

async function carregarCandidatos() {
  const { data } = await db.from("candidatos").select("*");

  const lista = document.getElementById("listaCandidatos");
  lista.innerHTML = "";

  data.forEach((c) => {
    lista.innerHTML += `<li>${c.nome} - ${c.cargo}</li>`;
  });
}

// FUNCIONÁRIOS
async function carregarFuncionarios() {
  const { data } = await db.from("funcionarios").select("*");

  const lista = document.getElementById("funcLista");
  lista.innerHTML = "";

  data.forEach((f) => {
    lista.innerHTML += `<li>${f.nome} - ${f.cargo}</li>`;
  });
}
