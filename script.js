/* =========================
   SUPABASE
========================= */
const supabase = window.supabase.createClient(
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
  salarios: "crm_salarios"
};

const state = {
  usuarios: JSON.parse(localStorage.getItem(STORAGE_KEYS.usuarios)) || [{ user:"admin", pass:"123"}],
  candidatos: JSON.parse(localStorage.getItem(STORAGE_KEYS.candidatos)) || [],
  treinamento: JSON.parse(localStorage.getItem(STORAGE_KEYS.treinamento)) || [],
  funcionarios: JSON.parse(localStorage.getItem(STORAGE_KEYS.funcionarios)) || [],
  departamentos: JSON.parse(localStorage.getItem(STORAGE_KEYS.departamentos)) || ["RH","Financeiro"],
  salarios: JSON.parse(localStorage.getItem(STORAGE_KEYS.salarios)) || []
};

/* =========================
   SALVAR
========================= */
function saveAll(){
  localStorage.setItem(STORAGE_KEYS.candidatos, JSON.stringify(state.candidatos));
  localStorage.setItem(STORAGE_KEYS.treinamento, JSON.stringify(state.treinamento));
  localStorage.setItem(STORAGE_KEYS.funcionarios, JSON.stringify(state.funcionarios));
  localStorage.setItem(STORAGE_KEYS.departamentos, JSON.stringify(state.departamentos));
  localStorage.setItem(STORAGE_KEYS.salarios, JSON.stringify(state.salarios));
}

/* =========================
   LOGIN
========================= */
document.getElementById("login-form").onsubmit = e=>{
  e.preventDefault();

  const u = user.value;
  const p = pass.value;

  const ok = state.usuarios.find(x=>x.user===u && x.pass===p);

  if(!ok){
    alert("Login inválido");
    return;
  }

  document.getElementById("login").style.display="none";
  document.getElementById("app").classList.remove("hidden");
};

/* =========================
   NAV
========================= */
document.querySelectorAll(".nav-button").forEach(btn=>{
  btn.onclick=()=>{
    document.querySelectorAll(".section").forEach(s=>s.classList.add("hidden"));
    document.getElementById(btn.dataset.section).classList.remove("hidden");
  };
});

/* =========================
   RECRUTAMENTO
========================= */
candidateForm.onsubmit = e=>{
  e.preventDefault();

  state.candidatos.unshift({
    nome:nomeCandidato.value,
    cidade:cidade.value,
    cargo:cargo.value
  });

  saveAll();
  renderAll();
  candidateForm.reset();
};

function aprovar(i){
  state.treinamento.unshift(state.candidatos[i]);
  state.candidatos.splice(i,1);
  saveAll();
  renderAll();
}

/* =========================
   TREINAMENTO
========================= */
function contratar(i){
  state.funcionarios.unshift(state.treinamento[i]);
  state.treinamento.splice(i,1);
  saveAll();
  renderAll();
}

/* =========================
   RENDER
========================= */
function renderAll(){

  /* CANDIDATOS */
  listaCandidatos.innerHTML="";
  state.candidatos.forEach((c,i)=>{
    listaCandidatos.innerHTML += `
      <li>
        ${c.nome} - ${c.cargo}
        <button onclick="aprovar(${i})">Aprovar</button>
      </li>`;
  });

  /* TREINAMENTO */
  treinamentoLista.innerHTML="";
  state.treinamento.forEach((c,i)=>{
    treinamentoLista.innerHTML += `
      <li>
        ${c.nome}
        <button onclick="contratar(${i})">Contratar</button>
      </li>`;
  });

  /* FUNCIONARIOS */
  funcLista.innerHTML="";
  state.funcionarios.forEach(f=>{
    funcLista.innerHTML += `<li>${f.nome} - ${f.cargo}</li>`;
  });

  /* DASHBOARD */
  document.getElementById("dashboard-candidatos").innerText = state.candidatos.length;
  document.getElementById("dashboard-funcionarios").innerText = state.funcionarios.length;
  document.getElementById("dashboard-treinamento").innerText = state.treinamento.length;

}

/* =========================
   DOCUMENTOS (REAL)
========================= */

const input = document.getElementById("docInput");
const lista = document.getElementById("listaDocs");

input.addEventListener("change", async ()=>{
  const file = input.files[0];
  if(!file) return;

  const nome = Date.now()+"_"+file.name;

  await supabase.storage.from("docs").upload(nome, file);

  listarDocs();
});

/* LISTAR */
async function listarDocs(){
  lista.innerHTML = "";

  const { data } = await supabase.storage.from("docs").list();

  data.forEach(file=>{
    const url = `https://vlywfccnhbrrolsuaqad.supabase.co/storage/v1/object/public/docs/${file.name}`;

    lista.innerHTML += `
      <li>
        ${file.name}

        <button onclick="abrir('${url}')">Abrir</button>
        <button onclick="word('${url}')">Word</button>
        <button onclick="imprimir('${url}')">Imprimir</button>
        <button onclick="deletar('${file.name}')">Excluir</button>
      </li>
    `;
  });

  document.getElementById("dashboard-documentos").innerText = data.length;
}

/* AÇÕES */
function abrir(url){
  window.open(url, "_blank");
}

function word(url){
  window.open("https://view.officeapps.live.com/op/view.aspx?src="+url, "_blank");
}

function imprimir(url){
  let win = window.open(url);
  win.onload = ()=> win.print();
}

async function deletar(nome){
  await supabase.storage.from("docs").remove([nome]);
  listarDocs();
}

/* INIT */
renderAll();
listarDocs();
