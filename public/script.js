// ==========================
// ELEMENTOS PRINCIPAIS
// ==========================
const saldoElemento = document.getElementById("saldo");
const listaTransacoes = document.getElementById("listaTransacoes");
const descricao = document.getElementById("descricao");
const valor = document.getElementById("valor");
const tipo = document.getElementById("tipo");
const btnAdd = document.getElementById("btnAdd");
const filtro = document.getElementById("filtro");
const dataInicio = document.getElementById("dataInicio");
const dataFim = document.getElementById("dataFim");
const btnFiltrarData = document.getElementById("btnFiltrarData");

// ==========================
// VARIÁVEIS GLOBAIS
// ==========================
let transacoes = JSON.parse(localStorage.getItem("transacoes")) || [];
let saldo = 0;

// ==========================
// SALVAR E CARREGAR
// ==========================
function salvarTransacoes() {
  localStorage.setItem("transacoes", JSON.stringify(transacoes));
}

// ==========================
// ATUALIZAR SALDO
// ==========================
function atualizarSaldo() {
  saldo = transacoes.reduce((acc, t) => acc + (t.tipo === "entrada" ? t.valor : -t.valor), 0);
  saldoElemento.textContent = `R$ ${saldo.toFixed(2)}`;
  saldoElemento.style.color = saldo >= 0 ? "#2ecc71" : "#e74c3c";

  const entradas = transacoes.filter(t => t.tipo === "entrada").reduce((acc, t) => acc + t.valor, 0);
  const saidas = transacoes.filter(t => t.tipo === "saida").reduce((acc, t) => acc + t.valor, 0);

  document.querySelector(".entrada").textContent = `Entradas: R$ ${entradas.toFixed(2)}`;
  document.querySelector(".saida").textContent = `Saídas: R$ ${saidas.toFixed(2)}`;

  atualizarGrafico("resumo");
}

// ==========================
// ADICIONAR TRANSAÇÃO
// ==========================
btnAdd.addEventListener("click", () => {
  const desc = descricao.value.trim();
  const val = parseFloat(valor.value);
  const tipoTrans = tipo.value;

  if (!desc || isNaN(val) || !tipoTrans) {
    alert("Preencha todos os campos corretamente!");
    return;
  }

  const novaTransacao = {
    id: Date.now(),
    descricao: desc,
    valor: val,
    tipo: tipoTrans,
    data: new Date().toISOString().split("T")[0],
  };

  transacoes.push(novaTransacao);
  salvarTransacoes();
  descricao.value = "";
  valor.value = "";
  tipo.value = "";
  renderizarTransacoes();
  atualizarSaldo();
});

// ==========================
// EXCLUIR TRANSAÇÃO
// ==========================
function excluirTransacao(id) {
  if (!confirm("Deseja realmente excluir esta transação?")) return;
  transacoes = transacoes.filter(t => t.id !== id);
  salvarTransacoes();
  renderizarTransacoes();
  atualizarSaldo();
}

// ==========================
// RENDERIZAR LISTA
// ==========================
function renderizarTransacoes(lista = transacoes) {
  listaTransacoes.innerHTML = "";

  lista.forEach(t => {
    const li = document.createElement("li");
    const icone = t.tipo === "entrada"
      ? '<i class="fa-solid fa-arrow-up" style="color:#2ecc71;"></i>'
      : '<i class="fa-solid fa-arrow-down" style="color:#e74c3c;"></i>';

    li.innerHTML = `
      <div>
        ${icone} ${t.descricao} - R$ ${t.valor.toFixed(2)} <small>(${t.data})</small>
      </div>
      <button class="btn-excluir" title="Excluir" onclick="excluirTransacao(${t.id})">
        <i class="fa-solid fa-trash"></i>
      </button>
    `;

    listaTransacoes.appendChild(li);
  });
}

// ==========================
// FILTROS
// ==========================
filtro.addEventListener("change", () => {
  const tipoFiltro = filtro.value;
  if (tipoFiltro === "todas") renderizarTransacoes();
  else renderizarTransacoes(transacoes.filter(t => t.tipo === tipoFiltro));
});

btnFiltrarData.addEventListener("click", () => {
  const inicio = new Date(dataInicio.value);
  const fim = new Date(dataFim.value);
  if (!dataInicio.value || !dataFim.value) {
    alert("Selecione as duas datas!");
    return;
  }

  const filtradas = transacoes.filter(t => {
    const dataT = new Date(t.data);
    return dataT >= inicio && dataT <= fim;
  });
  renderizarTransacoes(filtradas);
});

// ==========================
// GRÁFICO
// ==========================
const ctx = document.getElementById("graficoFinanceiro").getContext("2d");
let grafico = new Chart(ctx, {
  type: "doughnut",
  data: {
    labels: ["Entradas", "Saídas"],
    datasets: [{ data: [0, 0], backgroundColor: ["#2ecc71", "#e74c3c"] }],
  },
  options: { responsive: true, plugins: { legend: { position: "bottom" } } },
});

function atualizarGrafico(tipo = "resumo") {
  if (!grafico) return;
  if (tipo === "resumo") {
    const entradas = transacoes.filter(t => t.tipo === "entrada").reduce((acc, t) => acc + t.valor, 0);
    const saidas = transacoes.filter(t => t.tipo === "saida").reduce((acc, t) => acc + t.valor, 0);
    grafico.data.labels = ["Entradas", "Saídas"];
    grafico.data.datasets[0].data = [entradas, saidas];
    grafico.config.type = "doughnut";
  } else {
    const meses = {};
    transacoes.forEach(t => {
      const mes = new Date(t.data).toLocaleString("pt-BR", { month: "short" });
      meses[mes] = (meses[mes] || 0) + (t.tipo === "entrada" ? t.valor : -t.valor);
    });
    grafico.data.labels = Object.keys(meses);
    grafico.data.datasets[0].data = Object.values(meses);
    grafico.config.type = "bar";
  }
  grafico.update();
}

document.querySelectorAll(".btn-grafico").forEach(btn => {
  btn.addEventListener("click", e => {
    const tipo = e.target.getAttribute("data-tipo");
    atualizarGrafico(tipo);
  });
});

// ==========================
// BOTÃO FLUTUANTE
// ==========================
const btnFlutuante = document.getElementById("btnAddFlutuante");
if (window.innerWidth <= 768) {
  btnFlutuante.addEventListener("click", () => {
    document.querySelector(".form-section").scrollIntoView({ behavior: "smooth" });
    descricao.focus();
  });
} else {
  btnFlutuante.style.display = "none";
}

// ==========================
// MODO ESCURO
// ==========================
document.addEventListener("DOMContentLoaded", () => {
  const btnTema = document.getElementById("modoTema");
  const icone = btnTema.querySelector("i");

  const temaSalvo = localStorage.getItem("tema");
  if (temaSalvo === "dark") {
    document.body.classList.add("dark");
    icone.classList.replace("fa-moon", "fa-sun");
  }

  btnTema.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    const isDark = document.body.classList.contains("dark");
    icone.classList.toggle("fa-sun", isDark);
    icone.classList.toggle("fa-moon", !isDark);
    localStorage.setItem("tema", isDark ? "dark" : "light");
  });
});

// ==========================
// FILTROS MOBILE (ocultável)
// ==========================
const toggleFiltrosBtn = document.getElementById('toggleFiltrosBtn');
const filtrosSection = document.getElementById('filtrosSection');

if (toggleFiltrosBtn) {
  toggleFiltrosBtn.addEventListener('click', () => {
    filtrosSection.classList.toggle('show');

    const icone = toggleFiltrosBtn.querySelector('i');
    const texto = filtrosSection.classList.contains('show')
      ? ' Ocultar Filtros'
      : ' Mostrar Filtros';

    icone.className = filtrosSection.classList.contains('show')
      ? 'fa-solid fa-xmark'
      : 'fa-solid fa-magnifying-glass';

    toggleFiltrosBtn.innerHTML = `<i class="${icone.className}"></i>${texto}`;
  });
}

// ==========================
// INICIALIZAÇÃO
// ==========================
renderizarTransacoes();
atualizarSaldo();
