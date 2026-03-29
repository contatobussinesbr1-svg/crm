/* =========================
   SUPABASE
========================= */
const { createClient } = supabase;

const supabaseClient = createClient(
  "https://vlywfccnhbrrolsuaqad.supabase.co",
  "sb_publishable_LzGdlhfjS1OCoW2LPbyRLg_RVHtLju3"
);

/* =========================
   STORAGE
========================= */
const STORAGE_KEYS = {
  usuarios: "crm_usuarios",
  candidatos: "crm_candidatos",
  treinamento: "crm_treinamento",
  funcionarios: "crm_funcionarios",
  departamentos: "crm_departamentos",
  salarios: "crm_salarios",
  documentos: "crm_documentos"
};

const defaultUsers = [{ user: "admin", pass: "123" }];
const defaultDepartments = [
  "Financeiro","Lideranca","Administracao","FTD","Retencao","FTD Pro","Retencao Pro","Recursos Humanos"
];

const state = {
  usuarios: JSON.parse(localStorage.getItem(STORAGE_KEYS.usuarios)) || defaultUsers,
  candidatos: JSON.parse(localStorage.getItem(STORAGE_KEYS.candidatos)) || [],
  treinamento: JSON.parse(localStorage.getItem(STORAGE_KEYS.treinamento)) || [],
  funcionarios: JSON.parse(localStorage.getItem(STORAGE_KEYS.funcionarios)) || [],
  departamentos: JSON.parse(localStorage.getItem(STORAGE_KEYS.departamentos)) || defaultDepartments,
  salarios: JSON.parse(localStorage.getItem(STORAGE_KEYS.salarios)) || [],
  documentos: JSON.parse(localStorage.getItem(STORAGE_KEYS.documentos)) || []
};

/* =========================
   SAVE
========================= */
function saveAll() {
  Object.keys(STORAGE_KEYS).forEach(key => {
    localStorage.setItem(STORAGE_KEYS[key], JSON.stringify(state[key]));
  });
}

/* =========================
   LOGIN
========================= */
loginForm.addEventListener("submit", e => {
  e.preventDefault();

  const u = user.value;
  const p = pass.value;

  const ok = state.usuarios.find(x => x.user === u && x.pass === p);

  if (!ok) return alert("Login inválido");

  login.classList.add("hidden");
  app.classList.remove("hidden");
  localStorage.setItem("crm_logado", "true");
  renderAll();
});

/* =========================
   NAV
========================= */
navButtons.forEach(btn => {
  btn.onclick = () => {
    sections.forEach(s => s.classList.add("hidden"));
    document.getElementById(btn.dataset.section).classList.remove("hidden");
  };
});

/* =========================
   CANDIDATOS
========================= */
candidateForm.onsubmit = e => {
  e.preventDefault();

  state.candidatos.unshift({
    nome: nomeCandidato.value,
    cidade: cidade.value,
    cargo: cargo.value
  });

  saveAll();
  renderAll();
  candidateForm.reset();
};

function aprovar(i) {
  state.treinamento.push(state.candidatos[i]);
  state.candidatos.splice(i,1);
  saveAll(); renderAll();
}

/* =========================
   TREINAMENTO
========================= */
function contratar(i) {
  state.funcionarios.push(state.treinamento[i]);
  state.treinamento.splice(i,1);
  saveAll(); renderAll();
}

/* =========================
   DOCUMENTOS (SUPABASE REAL)
========================= */

docInput.addEventListener("change", async e => {
  const file = e.target.files[0];
  if (!file) return;

  const nome = Date.now() + "_" + file.name;

  await supabaseClient.storage.from("docs").upload(nome, file);

  state.documentos.unshift({
    nome: file.name,
    file: nome,
    data: new Date().toLocaleString()
  });

  saveAll();
  renderAll();
});

/* =========================
   RENDER
========================= */
function renderAll() {
  renderCandidatos();
  renderTreino();
  renderFunc();
  renderDocs();
}

/* =========================
   LISTAS
========================= */
function renderCandidatos() {
  listaCandidatos.innerHTML = "";
  state.candidatos.forEach((c,i)=>{
    listaCandidatos.innerHTML += `
    <li>
      ${c.nome} - ${c.cargo}
      <button onclick="aprovar(${i})">Aprovar</button>
    </li>`;
  });
}

function renderTreino() {
  treinamentoLista.innerHTML = "";
  state.treinamento.forEach((c,i)=>{
    treinamentoLista.innerHTML += `
    <li>
      ${c.nome}
      <button onclick="contratar(${i})">Contratar</button>
    </li>`;
  });
}

function renderFunc() {
  funcLista.innerHTML = "";
  state.funcionarios.forEach(f=>{
    funcLista.innerHTML += `<li>${f.nome}</li>`;
  });
}

/* =========================
   DOCUMENTOS UI
========================= */
function renderDocs() {
  listaDocs.innerHTML = "";

  state.documentos.forEach((doc,i)=>{

    const url = `https://vlywfccnhbrrolsuaqad.supabase.co/storage/v1/object/public/docs/${doc.file}`;

    listaDocs.innerHTML += `
    <li>
      ${doc.nome}

      <button onclick="window.open('${url}')">Abrir</button>

      <button onclick="window.open('https://view.officeapps.live.com/op/view.aspx?src=${url}')">
        Word
      </button>

      <button onclick="imprimirDoc('${url}')">Imprimir</button>

      <button onclick="excluirDoc(${i})">Excluir</button>
    </li>`;
  });
}

function imprimirDoc(url){
  let w = window.open(url);
  w.onload = () => w.print();
}

async function excluirDoc(i){
  const file = state.documentos[i].file;

  await supabaseClient.storage.from("docs").remove([file]);

  state.documentos.splice(i,1);
  saveAll();
  renderAll();
}

/* =========================
   AUTO LOGIN
========================= */
if(localStorage.getItem("crm_logado")){
  login.classList.add("hidden");
  app.classList.remove("hidden");
  renderAll();
}
