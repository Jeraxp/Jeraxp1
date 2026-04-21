const MAX_PONTOS = 12;
const STORAGE_KEY = "terra_antediluviana_personagens";

const arquetipos = {
  Guerreiro: ["Estratégia", "Liderança", "Luta", "Fé"],
  Profeta: ["Previsão", "Profecia", "Sabedoria", "Fé"],
  "Nômade": ["Sobrevivência", "Luta", "Furtividade", "Sabedoria"],
  Sacerdote: ["Carisma", "Sabedoria", "Influência", "Fé"],
  Feiticeiro: ["Sabedoria", "Previsão", "Alquimia", "Conjuração"],
  Comerciante: ["Negócios", "Sabedoria", "Influência", "Carisma"]
};

const formulasDons = {
  "Estratégia": "Mente + Corpo",
  "Liderança": "Mente + Status",
  "Luta": "Corpo x2",
  "Carisma": "Mente + Alma",
  "Previsão": "Alma + Mente",
  "Profecia": "Alma x2",
  "Influência": "Mente + Status",
  "Sabedoria": "Mente x2",
  "Sobrevivência": "Corpo",
  "Furtividade": "Corpo + Mente",
  "Alquimia": "Alma + Mente",
  "Conjuração": "Alma x2",
  "Negócios": "Mente + Status",
  "Fé": "Alma + Corpo"
};

const atributosInfo = {
  Corpo: ["Doente", "Fraco", "Normal", "Saudável", "Forte"],
  Mente: ["Débil", "Burro", "Normal", "Perspicaz", "Inteligente"],
  Alma: ["Desalmado", "Mundano", "Normal", "Sensitivo", "Iluminado"],
  Status: ["Mendigo/Escravo", "Pobre/Servo", "Normal/Livre", "Abonado", "Rico"]
};

const nomeEl = document.getElementById("nome");
const arquetipoEl = document.getElementById("arquetipo");
const domOrigemEl = document.getElementById("domOrigem");
const historiaEl = document.getElementById("historia");
const atributosEl = document.getElementById("atributos");
const donsEl = document.getElementById("dons");
const gastosEl = document.getElementById("gastos");
const restantesEl = document.getElementById("restantes");
const saudeEl = document.getElementById("saude");
const domOrigemResumoEl = document.getElementById("domOrigemResumo");
const statusEl = document.getElementById("status");
const listaSalvosEl = document.getElementById("listaSalvos");
const progressBarEl = document.getElementById("progressBar");

function setupArquetipos() {
  Object.keys(arquetipos).forEach((nome) => {
    const opt = document.createElement("option");
    opt.value = nome;
    opt.textContent = nome;
    arquetipoEl.appendChild(opt);
  });
  atualizarDomOrigem();
}

function atualizarDomOrigem() {
  const arquetipo = arquetipoEl.value;
  const donsDoArquetipo = arquetipos[arquetipo] || [];
  const domAtual = domOrigemEl.value;

  domOrigemEl.innerHTML = "";
  donsDoArquetipo.forEach((dom) => {
    const opt = document.createElement("option");
    opt.value = dom;
    opt.textContent = `${dom} (${formulasDons[dom]})`;
    domOrigemEl.appendChild(opt);
  });

  if (donsDoArquetipo.includes(domAtual)) {
    domOrigemEl.value = domAtual;
  } else if (donsDoArquetipo.length) {
    domOrigemEl.value = donsDoArquetipo[0];
  }

  const domOrigem = domOrigemEl.value;
  [...donsEl.querySelectorAll("input[type='checkbox']")].forEach((cb) => {
    const isOrigem = cb.value === domOrigem;
    cb.disabled = isOrigem;
    if (isOrigem) cb.checked = false;
  });
}

function setupAtributos() {
  Object.keys(atributosInfo).forEach((atributo) => {
    const wrapper = document.createElement("div");
    wrapper.className = "atributo";

    const label = document.createElement("label");
    label.textContent = atributo;

    const input = document.createElement("input");
    input.type = "number";
    input.min = "0";
    input.max = "4";
    input.step = "1";
    input.value = "0";
    input.id = `attr-${atributo}`;
    input.addEventListener("input", () => {
      if (input.value === "") input.value = "0";
      input.value = String(Math.max(0, Math.min(4, Number(input.value))));
      updateResumo();
    });

    const subtitulo = document.createElement("small");
    subtitulo.id = `desc-${atributo}`;
    subtitulo.textContent = atributosInfo[atributo][0];

    wrapper.appendChild(label);
    wrapper.appendChild(input);
    wrapper.appendChild(subtitulo);
    atributosEl.appendChild(wrapper);
  });
}

function setupDons() {
  donsEl.innerHTML = "";
  Object.entries(formulasDons).forEach(([dom, formula]) => {
    const item = document.createElement("div");
    item.className = "don-item";

    const label = document.createElement("label");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.value = dom;
    checkbox.addEventListener("change", updateResumo);

    const txt = document.createElement("span");
    const strong = document.createElement("strong");
    strong.textContent = dom;
    const small = document.createElement("small");
    small.textContent = ` (${formula})`;
    const badge = document.createElement("em");
    badge.id = `custo-${dom}`;

    txt.appendChild(strong);
    txt.appendChild(small);
    txt.appendChild(badge);

    label.appendChild(checkbox);
    label.appendChild(txt);

    item.appendChild(label);
    donsEl.appendChild(item);
  });
}

function valorAtributo(nome) {
  return Number(document.getElementById(`attr-${nome}`).value || 0);
}

function donsSelecionados() {
  return [...donsEl.querySelectorAll("input[type='checkbox']:checked")].map((c) => c.value);
}

function custoDom(dom, arquetipo) {
  return arquetipos[arquetipo]?.includes(dom) ? 2 : 3;
}

function calcularGastos() {
  const custoAtributos = Object.keys(atributosInfo).reduce((acc, attr) => acc + valorAtributo(attr), 0);
  const custoDons = donsSelecionados().reduce((acc, dom) => acc + custoDom(dom, arquetipoEl.value), 0);
  return custoAtributos + custoDons;
}

function atualizarCustosDons() {
  const arquetipo = arquetipoEl.value;
  Object.keys(formulasDons).forEach((dom) => {
    const custo = custoDom(dom, arquetipo);
    const badge = document.getElementById(`custo-${dom}`);
    if (badge) badge.textContent = ` • Custo: ${custo} PC`;
  });
}

function updateResumo() {
  Object.keys(atributosInfo).forEach((attr) => {
    const valor = valorAtributo(attr);
    const desc = document.getElementById(`desc-${attr}`);
    if (desc) desc.textContent = atributosInfo[attr][valor] || "";
  });

  atualizarCustosDons();

  const gastos = calcularGastos();
  const restantes = MAX_PONTOS - gastos;
  const saude = (valorAtributo("Corpo") + valorAtributo("Mente")) * 5;
  const domOrigem = domOrigemEl.value || "-";

  gastosEl.textContent = String(gastos);
  restantesEl.textContent = String(restantes);
  saudeEl.textContent = String(saude);
  domOrigemResumoEl.textContent = domOrigem;
  const progresso = Math.max(0, Math.min(100, (gastos / MAX_PONTOS) * 100));
  progressBarEl.style.width = `${progresso}%`;
  progressBarEl.setAttribute("aria-valuenow", String(gastos));

  statusEl.className = "status";
  if (restantes < 0) {
    statusEl.classList.add("error");
    statusEl.textContent = "Pontuação excedida. Ajuste atributos/dons para ficar em 12 PC.";
  } else if (restantes > 0) {
    statusEl.classList.add("warn");
    statusEl.textContent = "Distribua todos os pontos: faltam PC para completar os 12 obrigatórios.";
  } else {
    statusEl.classList.add("ok");
    statusEl.textContent = "Ficha válida: 12/12 pontos distribuídos.";
  }
}

function personagemAtual() {
  const atributos = {};
  Object.keys(atributosInfo).forEach((a) => atributos[a] = valorAtributo(a));

  const domOrigem = domOrigemEl.value;
  const donsExtras = donsSelecionados().filter((dom) => dom !== domOrigem);
  const dons = [domOrigem, ...donsExtras];
  const gastos = calcularGastos();

  return {
    nome: nomeEl.value.trim() || "Sem nome",
    arquetipo: arquetipoEl.value,
    domOrigem,
    historia: historiaEl.value.trim(),
    atributos,
    dons,
    saude: (atributos.Corpo + atributos.Mente) * 5,
    balanca: 0,
    pontosGastos: gastos,
    pontosRestantes: MAX_PONTOS - gastos,
    atualizadoEm: new Date().toISOString()
  };
}

function getSalvos() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
}

function setSalvos(lista) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(lista));
}

function salvarPersonagem() {
  const personagem = personagemAtual();
  if (!personagem.domOrigem) {
    alert("Selecione um Dom de Origem antes de salvar.");
    return;
  }
  if (personagem.pontosRestantes > 0) {
    alert("Você precisa gastar exatamente 12 pontos antes de salvar.");
    return;
  }
  if (personagem.pontosRestantes < 0) {
    alert("Não é possível salvar: você excedeu os 12 pontos.");
    return;
  }

  const salvos = getSalvos();
  const id = crypto.randomUUID();
  salvos.unshift({ id, ...personagem });
  setSalvos(salvos);
  renderSalvos();
  alert("Personagem salvo com sucesso!");
}

function preencherFormulario(personagem) {
  nomeEl.value = personagem.nome;
  arquetipoEl.value = personagem.arquetipo;
  atualizarDomOrigem();
  domOrigemEl.value = personagem.domOrigem || arquetipos[personagem.arquetipo]?.[0] || "";
  historiaEl.value = personagem.historia || "";

  Object.keys(atributosInfo).forEach((attr) => {
    document.getElementById(`attr-${attr}`).value = String(personagem.atributos[attr] ?? 0);
  });

  [...donsEl.querySelectorAll("input[type='checkbox']")].forEach((cb) => {
    cb.checked = personagem.dons.includes(cb.value) && cb.value !== domOrigemEl.value;
  });

  updateResumo();
}

function removerSalvo(id) {
  const novaLista = getSalvos().filter((p) => p.id !== id);
  setSalvos(novaLista);
  renderSalvos();
}

function renderSalvos() {
  const salvos = getSalvos();
  listaSalvosEl.innerHTML = "";

  if (!salvos.length) {
    const li = document.createElement("li");
    li.textContent = "Nenhum personagem salvo ainda.";
    listaSalvosEl.appendChild(li);
    return;
  }

  salvos.forEach((p) => {
    const li = document.createElement("li");

    const info = document.createElement("div");
    const nomeStrong = document.createElement("strong");
    nomeStrong.textContent = p.nome;
    const txt = document.createTextNode(` — ${p.arquetipo} `);
    const meta = document.createElement("small");
    meta.textContent = `(Saúde: ${p.saude}, Gastos: ${p.pontosGastos}/12, Origem: ${p.domOrigem || "-"})`;
    info.appendChild(nomeStrong);
    info.appendChild(txt);
    info.appendChild(meta);

    const actions = document.createElement("div");
    actions.className = "inline-actions";

    const carregar = document.createElement("button");
    carregar.className = "secondary";
    carregar.textContent = "Carregar";
    carregar.onclick = () => preencherFormulario(p);

    const apagar = document.createElement("button");
    apagar.className = "secondary";
    apagar.textContent = "Excluir";
    apagar.onclick = () => removerSalvo(p.id);

    actions.appendChild(carregar);
    actions.appendChild(apagar);

    li.appendChild(info);
    li.appendChild(actions);
    listaSalvosEl.appendChild(li);
  });
}

function exportarJSON() {
  const personagem = personagemAtual();
  const blob = new Blob([JSON.stringify(personagem, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `${(personagem.nome || "personagem").replace(/\s+/g, "_").toLowerCase()}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();

  URL.revokeObjectURL(url);
}

function limparFormulario() {
  nomeEl.value = "";
  historiaEl.value = "";
  arquetipoEl.selectedIndex = 0;
  atualizarDomOrigem();

  Object.keys(atributosInfo).forEach((attr) => {
    document.getElementById(`attr-${attr}`).value = "0";
  });
  [...donsEl.querySelectorAll("input[type='checkbox']")].forEach((cb) => cb.checked = false);

  updateResumo();
}

setupArquetipos();
setupAtributos();
setupDons();
atualizarDomOrigem();
renderSalvos();
updateResumo();

arquetipoEl.addEventListener("change", () => {
  atualizarDomOrigem();
  updateResumo();
});
domOrigemEl.addEventListener("change", updateResumo);
document.getElementById("salvar").addEventListener("click", salvarPersonagem);
document.getElementById("exportar").addEventListener("click", exportarJSON);
document.getElementById("limpar").addEventListener("click", limparFormulario);
