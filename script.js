const supabase = window.supabase.createClient(
  "https://vlywfccnhbrrolsuaqad.supabase.co",
  "sb_publishable_LzGdlhfjS1OCoW2LPbyRLg_RVHtLju3"
);

/* NAV */
document.querySelectorAll(".sidebar button").forEach(btn=>{
  btn.onclick=()=>{
    document.querySelectorAll(".page").forEach(p=>p.classList.add("hidden"));
    document.getElementById(btn.dataset.page).classList.remove("hidden");
  };
});

/* DATA */
let cand=[], treino=[], func=[], sal=[], setores=[];

/* RECRUTAMENTO */
function addCand(){
  cand.push({
    nome:nome.value,
    cargo:cargo.value,
    cidade:cidade.value
  });
  render();
}

/* APROVAR */
function aprovar(i){
  treino.push(cand[i]);
  cand.splice(i,1);
  render();
}

/* CONTRATAR */
function contratar(i){
  func.push(treino[i]);
  treino.splice(i,1);
  render();
}

/* FUNCIONARIO FICHA */
function abrirFicha(i){
  let f = func[i];

  ficha.innerHTML = `
    <h2>${f.nome}</h2>
    <p>Cargo: ${f.cargo}</p>
    <p>Cidade: ${f.cidade}</p>
  `;

  ficha.classList.remove("hidden");
}

/* DOCUMENTOS */
file.onchange = async ()=>{
  let f = file.files[0];
  let nome = Date.now()+"_"+f.name;

  await supabase.storage.from("docs").upload(nome,f);
  listarDocs();
};

async function listarDocs(){
  listaDocs.innerHTML="";

  let {data} = await supabase.storage.from("docs").list();

  data.forEach(d=>{
    let url=`https://vlywfccnhbrrolsuaqad.supabase.co/storage/v1/object/public/docs/${d.name}`;

    listaDocs.innerHTML+=`
      <li>
        ${d.name}
        <button onclick="window.open('${url}')">Abrir</button>
        <button onclick="window.open('https://view.officeapps.live.com/op/view.aspx?src=${url}')">Word</button>
        <button onclick="imprimir('${url}')">Print</button>
      </li>
    `;
  });

  d4.innerText=data.length;
}

function imprimir(url){
  let w=window.open(url);
  w.onload=()=>w.print();
}

/* FINANCEIRO */
function addSal(){
  sal.push({nome:nomeSal.value, sal:sal.value});
  render();
}

/* SETORES */
function addSetor(){
  setores.push(novoSetor.value);
  render();
}

/* RENDER */
function render(){

  listaCand.innerHTML="";
  cand.forEach((c,i)=>{
    listaCand.innerHTML+=`
      <li>${c.nome}
      <button onclick="aprovar(${i})">Aprovar</button>
      </li>`;
  });

  listaTreino.innerHTML="";
  treino.forEach((c,i)=>{
    listaTreino.innerHTML+=`
      <li>${c.nome}
      <button onclick="contratar(${i})">Contratar</button>
      </li>`;
  });

  listaFunc.innerHTML="";
  func.forEach((f,i)=>{
    listaFunc.innerHTML+=`
      <li onclick="abrirFicha(${i})">${f.nome}</li>`;
  });

  listaSal.innerHTML="";
  sal.forEach(s=>{
    listaSal.innerHTML+=`<li>${s.nome} - ${s.sal}</li>`;
  });

  listaSetor.innerHTML="";
  setores.forEach(s=>{
    listaSetor.innerHTML+=`<li>${s}</li>`;
  });

  d1.innerText=cand.length;
  d2.innerText=func.length;
  d3.innerText=treino.length;
}

listarDocs();
render();
