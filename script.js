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
  "Financeiro",
  "Lideranca",
  "Administracao",
  "FTD",
  "Retencao",
  "FTD Pro",
  "Retencao Pro",
  "Recursos Humanos"
];

const state = {
  usuarios: readStorage(STORAGE_KEYS.usuarios, defaultUsers),
  candidatos: readStorage(STORAGE_KEYS.candidatos, []),
  treinamento: readStorage(STORAGE_KEYS.treinamento, []),
  funcionarios: readStorage(STORAGE_KEYS.funcionarios, []),
  departamentos: readStorage(STORAGE_KEYS.departamentos, defaultDepartments),
  salarios: readStorage(STORAGE_KEYS.salarios, []),
  documentos: readStorage(STORAGE_KEYS.documentos, []),
  selectedDepartment: ""
};

const loginSection = document.getElementById("login");
const appSection = document.getElementById("app");
const loginForm = document.getElementById("login-form");
const candidateForm = document.getElementById("candidate-form");
const departmentForm = document.getElementById("department-form");
const salaryForm = document.getElementById("salary-form");
const userForm = document.getElementById("user-form");
const passwordForm = document.getElementById("password-form");
const docInput = document.getElementById("docInput");
const navButtons = document.querySelectorAll(".nav-button");
const sections = document.querySelectorAll(".section");
const dashboardCards = document.querySelectorAll(".dashboard-card");
const logoutButton = document.getElementById("logout-button");
const calcButton = document.getElementById("calc-button");

persistUsers();

function readStorage(key, fallback) {
  const rawValue = localStorage.getItem(key);

  if (!rawValue) {
    return Array.isArray(fallback) ? [...fallback] : fallback;
  }

  try {
    return JSON.parse(rawValue);
  } catch (error) {
    console.error(`Erro ao ler ${key}:`, error);
    return Array.isArray(fallback) ? [...fallback] : fallback;
  }
}

function persistUsers() {
  localStorage.setItem(STORAGE_KEYS.usuarios, JSON.stringify(state.usuarios));
}

function saveState() {
  localStorage.setItem(STORAGE_KEYS.candidatos, JSON.stringify(state.candidatos));
  localStorage.setItem(STORAGE_KEYS.treinamento, JSON.stringify(state.treinamento));
  localStorage.setItem(STORAGE_KEYS.funcionarios, JSON.stringify(state.funcionarios));
  localStorage.setItem(STORAGE_KEYS.departamentos, JSON.stringify(state.departamentos));
  localStorage.setItem(STORAGE_KEYS.salarios, JSON.stringify(state.salarios));
  localStorage.setItem(STORAGE_KEYS.documentos, JSON.stringify(state.documentos));
}

function showSection(sectionId) {
  sections.forEach((section) => {
    section.classList.toggle("hidden", section.id !== sectionId);
  });

  navButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.section === sectionId);
  });
}

function createActionButton(label, className, onClick) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = className;
  button.textContent = label;
  button.addEventListener("click", (event) => {
    event.stopPropagation();
    onClick();
  });
  return button;
}

function renderList(containerId, items, emptyText, createItem) {
  const container = document.getElementById(containerId);
  container.innerHTML = "";

  if (!items.length) {
    const empty = document.createElement("li");
    empty.className = "empty-message";
    empty.textContent = emptyText;
    container.appendChild(empty);
    return;
  }

  items.forEach((item, index) => {
    container.appendChild(createItem(item, index));
  });
}

function formatDate(date) {
  if (!date) {
    return "-";
  }

  return new Intl.DateTimeFormat("pt-BR").format(new Date(`${date}T00:00:00`));
}

function formatCurrency(value) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(Number(value) || 0);
}

function formatNow() {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(new Date());
}

function getDepartmentCandidates(name) {
  return state.candidatos.filter((item) => item.cargo === name);
}

function renderDepartmentDetail() {
  const container = document.getElementById("detalheDept");

  if (!state.selectedDepartment) {
    container.innerHTML = `
      <h3>Detalhes do departamento</h3>
      <p>Selecione um departamento para ver as pessoas relacionadas.</p>
    `;
    return;
  }

  const candidatePeople = state.candidatos
    .filter((item) => item.cargo === state.selectedDepartment)
    .map((item) => ({ nome: item.nome, origem: "Candidato" }));
  const employeePeople = state.funcionarios
    .filter((item) => item.cargo === state.selectedDepartment)
    .map((item) => ({ nome: item.nome, origem: "Funcionario" }));
  const people = [...candidatePeople, ...employeePeople];
  let html = `<h3>${state.selectedDepartment}</h3>`;

  if (!people.length) {
    html += "<p>Ninguem neste departamento.</p>";
  } else {
    people.forEach((person) => {
      html += `<p>${person.nome} - ${person.origem}</p>`;
    });
  }

  container.innerHTML = html;
}

function renderCandidatos() {
  renderList(
    "listaCandidatos",
    state.candidatos,
    "Nenhum candidato cadastrado.",
    (candidato, index) => {
      const item = document.createElement("li");
      item.className = "data-item";

      const info = document.createElement("div");
      info.innerHTML = `
        <strong>${candidato.nome}</strong>
        <p>Departamento: ${candidato.cargo}</p>
        <p>Cidade: ${candidato.cidade}</p>
      `;

      const actions = document.createElement("div");
      actions.className = "item-actions";
      actions.appendChild(createActionButton("Aprovar", "success-button", () => aprovarCandidato(index)));
      actions.appendChild(createActionButton("Excluir", "danger-button", () => removerCandidato(index)));

      item.append(info, actions);
      return item;
    }
  );
}

function renderTreinamento() {
  renderList(
    "treinamentoLista",
    state.treinamento,
    "Nenhum candidato em treinamento.",
    (candidato, index) => {
      const item = document.createElement("li");
      item.className = "data-item";

      const info = document.createElement("div");
      info.innerHTML = `
        <strong>${candidato.nome}</strong>
        <p>Departamento: ${candidato.cargo}</p>
        <p>Cidade: ${candidato.cidade}</p>
      `;

      const actions = document.createElement("div");
      actions.className = "item-actions";
      actions.appendChild(createActionButton("Contratar", "success-button", () => contratarCandidato(index)));
      actions.appendChild(createActionButton("Excluir", "danger-button", () => removerTreinamento(index)));

      item.append(info, actions);
      return item;
    }
  );
}

function renderFuncionarios() {
  renderList(
    "funcLista",
    state.funcionarios,
    "Nenhum funcionario contratado.",
    (funcionario, index) => {
      const item = document.createElement("li");
      item.className = "data-item";

      const info = document.createElement("div");
      info.innerHTML = `
        <strong>${funcionario.nome}</strong>
        <p>Departamento: ${funcionario.cargo}</p>
        <p>Cidade: ${funcionario.cidade}</p>
      `;

      const actions = document.createElement("div");
      actions.className = "item-actions";
      actions.appendChild(createActionButton("Excluir", "danger-button", () => removerFuncionario(index)));

      item.append(info, actions);
      return item;
    }
  );
}

function renderDepartamentos() {
  renderList(
    "deptLista",
    state.departamentos,
    "Nenhum departamento cadastrado.",
    (departamento, index) => {
      const item = document.createElement("li");
      item.className = `data-item clickable${state.selectedDepartment === departamento ? " active" : ""}`;
      item.addEventListener("click", () => {
        state.selectedDepartment = departamento;
        renderDepartamentos();
        renderDepartmentDetail();
      });

      const totalCand = state.candidatos.filter((item) => item.cargo === departamento).length;
      const totalFunc = state.funcionarios.filter((item) => item.cargo === departamento).length;
      const total = totalCand + totalFunc;

      const info = document.createElement("div");
      info.innerHTML = `
        <strong>${departamento}</strong>
        <p>${total} pessoa(s) vinculada(s)</p>
      `;

      const actions = document.createElement("div");
      actions.className = "item-actions";
      actions.appendChild(createActionButton("Excluir", "danger-button", () => removerDepartamento(index)));

      item.append(info, actions);
      return item;
    }
  );

  renderDepartmentDetail();
}

function renderSalarios() {
  renderList(
    "salariosLista",
    state.salarios,
    "Nenhum salario cadastrado.",
    (registro, index) => {
      const item = document.createElement("li");
      item.className = "data-item";

      const info = document.createElement("div");
      info.innerHTML = `
        <strong>${registro.nome}</strong>
        <p>Salario: ${formatCurrency(registro.salario)}</p>
      `;

      const actions = document.createElement("div");
      actions.className = "item-actions";
      actions.appendChild(createActionButton("Excluir", "danger-button", () => removerSalario(index)));

      item.append(info, actions);
      return item;
    }
  );
}

function renderDocumentos() {
  renderList(
    "listaDocs",
    state.documentos,
    "Nenhum documento importado.",
    (documento, index) => {
      const item = document.createElement("li");
      item.className = "data-item";

      const info = document.createElement("div");
      info.innerHTML = `
        <strong>${documento.nome}</strong>
        <p>Importado em: ${documento.data}</p>
      `;

      const actions = document.createElement("div");
      actions.className = "item-actions";
      actions.appendChild(createActionButton("Excluir", "danger-button", () => removerDocumento(index)));

      item.append(info, actions);
      return item;
    }
  );
}

function renderUsers() {
  renderList(
    "listaUsers",
    state.usuarios,
    "Nenhum usuario cadastrado.",
    (usuario, index) => {
      const item = document.createElement("li");
      item.className = "data-item";

      const info = document.createElement("div");
      info.innerHTML = `<strong>${usuario.user}</strong><p>${index === 0 ? "Administrador padrao" : "Usuario interno"}</p>`;

      const actions = document.createElement("div");
      actions.className = "item-actions";

      if (usuario.user !== "admin") {
        actions.appendChild(createActionButton("Excluir", "danger-button", () => removerUsuario(index)));
      }

      item.append(info, actions);
      return item;
    }
  );
}

function updateMetrics() {
  document.getElementById("dashboard-candidatos").textContent = state.candidatos.length;
  document.getElementById("dashboard-funcionarios").textContent = state.funcionarios.length;
  document.getElementById("dashboard-treinamento").textContent = state.treinamento.length;
  document.getElementById("dashboard-documentos").textContent = state.documentos.length;
  document.getElementById("totalCandRelatorio").textContent = state.candidatos.length;
  document.getElementById("totalFuncRelatorio").textContent = state.funcionarios.length;
}

function refreshUI() {
  renderCandidatos();
  renderTreinamento();
  renderFuncionarios();
  renderDepartamentos();
  renderSalarios();
  renderDocumentos();
  renderUsers();
  updateMetrics();
}

function loginApp() {
  loginSection.classList.add("hidden");
  appSection.classList.remove("hidden");
  localStorage.setItem("crm_logado", "true");
  showSection("dashboard");
  refreshUI();
}

function logoutApp() {
  localStorage.removeItem("crm_logado");
  appSection.classList.add("hidden");
  loginSection.classList.remove("hidden");
}

function somarValores() {
  const valor1 = Number(document.getElementById("calc1").value) || 0;
  const valor2 = Number(document.getElementById("calc2").value) || 0;
  document.getElementById("resultadoCalc").textContent = `Resultado: ${valor1 + valor2}`;
}

function aprovarCandidato(index) {
  state.treinamento.unshift(state.candidatos[index]);
  state.candidatos.splice(index, 1);
  saveState();
  refreshUI();
}

function contratarCandidato(index) {
  state.funcionarios.unshift(state.treinamento[index]);
  state.treinamento.splice(index, 1);
  saveState();
  refreshUI();
}

function removerCandidato(index) {
  state.candidatos.splice(index, 1);
  saveState();
  refreshUI();
}

function removerTreinamento(index) {
  state.treinamento.splice(index, 1);
  saveState();
  refreshUI();
}

function removerFuncionario(index) {
  state.funcionarios.splice(index, 1);
  saveState();
  refreshUI();
}

function removerDepartamento(index) {
  const removedDepartment = state.departamentos[index];
  state.departamentos.splice(index, 1);

  if (state.selectedDepartment === removedDepartment) {
    state.selectedDepartment = "";
  }

  saveState();
  refreshUI();
}

function removerSalario(index) {
  state.salarios.splice(index, 1);
  saveState();
  refreshUI();
}

function removerDocumento(index) {
  state.documentos.splice(index, 1);
  saveState();
  refreshUI();
}

function removerUsuario(index) {
  state.usuarios.splice(index, 1);
  persistUsers();
  refreshUI();
}

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const user = document.getElementById("user").value.trim();
  const pass = document.getElementById("pass").value;
  const currentUser = state.usuarios.find((item) => item.user === user && item.pass === pass);

  if (!currentUser) {
    alert("Login invalido.");
    return;
  }

  loginApp();
  loginForm.reset();
});

candidateForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const candidato = {
    nome: document.getElementById("nomeCandidato").value.trim(),
    cidade: document.getElementById("cidade").value.trim(),
    cargo: document.getElementById("cargo").value.trim()
  };

  if (!candidato.nome || !candidato.cidade || !candidato.cargo) {
    return;
  }

  state.candidatos.unshift(candidato);
  saveState();
  refreshUI();
  candidateForm.reset();
});

departmentForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const departamento = document.getElementById("novoDept").value.trim();

  if (!departamento) {
    return;
  }

  const exists = state.departamentos.some(
    (item) => item.toLowerCase() === departamento.toLowerCase()
  );

  if (exists) {
    alert("Esse departamento ja existe.");
    return;
  }

  state.departamentos.unshift(departamento);
  state.selectedDepartment = departamento;
  saveState();
  refreshUI();
  departmentForm.reset();
});

salaryForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const nome = document.getElementById("nomeSalario").value.trim();
  const salario = document.getElementById("salario").value;

  if (!nome || !salario) {
    return;
  }

  state.salarios.unshift({ nome, salario });
  saveState();
  refreshUI();
  salaryForm.reset();
});

userForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const novoUser = document.getElementById("novoUser").value.trim();
  const novaPassUser = document.getElementById("novaPassUser").value.trim();

  if (!novoUser || !novaPassUser) {
    return;
  }

  const userExists = state.usuarios.some((usuario) => usuario.user === novoUser);

  if (userExists) {
    alert("Esse usuario ja existe.");
    return;
  }

  state.usuarios.push({ user: novoUser, pass: novaPassUser });
  persistUsers();
  refreshUI();
  userForm.reset();
});

passwordForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const userTroca = document.getElementById("userTroca").value.trim();
  const novaSenha = document.getElementById("novaSenha").value.trim();
  const userIndex = state.usuarios.findIndex((usuario) => usuario.user === userTroca);

  if (userIndex === -1) {
    alert("Usuario nao encontrado.");
    return;
  }

  if (!novaSenha) {
    return;
  }

  state.usuarios[userIndex].pass = novaSenha;
  persistUsers();
  refreshUI();
  passwordForm.reset();
  alert("Senha alterada.");
});

docInput.addEventListener("change", (event) => {
  const file = event.target.files?.[0];

  if (!file) {
    return;
  }

  state.documentos.unshift({
    nome: file.name,
    data: formatNow()
  });
  saveState();
  refreshUI();
  docInput.value = "";
});

navButtons.forEach((button) => {
  button.addEventListener("click", () => showSection(button.dataset.section));
});

dashboardCards.forEach((card) => {
  card.addEventListener("click", () => showSection(card.dataset.sectionTarget));
});

logoutButton.addEventListener("click", logoutApp);
calcButton.addEventListener("click", somarValores);

if (localStorage.getItem("crm_logado") === "true") {
  loginApp();
} else {
  logoutApp();
}

refreshUI();
/* =========================
   SUPABASE CONFIG
========================= */
const supabase = window.supabase.createClient(
  "https://vlywfccnhbrrolsuaqad.supabase.co",
  "sb_publishable_LzGdlhfjS1OCoW2LPbyRLg_RVHtLju3"
);

/* =========================
   UPLOAD REAL (SUBSTITUI LOCAL)
========================= */

docInput.addEventListener("change", async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;

  const nome = Date.now() + "_" + file.name;

  // upload pro supabase
  await supabase.storage.from("docs").upload(nome, file);

  // salvar no sistema
  state.documentos.unshift({
    nome: file.name,
    file: nome,
    data: formatNow()
  });

  saveState();
  refreshUI();
  docInput.value = "";
});

/* =========================
   RENDER DOCUMENTOS (ATUALIZADO)
========================= */

function renderDocumentos() {
  renderList(
    "listaDocs",
    state.documentos,
    "Nenhum documento importado.",
    (documento, index) => {
      const item = document.createElement("li");
      item.className = "data-item";

      const url = `https://vlywfccnhbrrolsuaqad.supabase.co/storage/v1/object/public/docs/${documento.file}`;

      const info = document.createElement("div");
      info.innerHTML = `
        <strong>${documento.nome}</strong>
        <p>Importado em: ${documento.data}</p>
      `;

      const actions = document.createElement("div");
      actions.className = "item-actions";

      actions.appendChild(createActionButton("Abrir", "success-button", () => {
        window.open(url, "_blank");
      }));

      actions.appendChild(createActionButton("Word", "success-button", () => {
        window.open("https://view.officeapps.live.com/op/view.aspx?src=" + url, "_blank");
      }));

      actions.appendChild(createActionButton("Imprimir", "success-button", () => {
        let win = window.open(url);
        win.onload = () => win.print();
      }));

      actions.appendChild(createActionButton("Excluir", "danger-button", async () => {
        await supabase.storage.from("docs").remove([documento.file]);
        removerDocumento(index);
      }));

      item.append(info, actions);
      return item;
    }
  );
}
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
