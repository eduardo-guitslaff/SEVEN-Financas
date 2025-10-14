// =========================
// PERFIL: saudação, avatar, último acesso, editar, logout
// =========================
(function () {
  // IDs usados: perfilHeader (inserido se não existir), toggleModal via JS
  const header = document.querySelector("header");
  if (!header) return;

  // cria o container .perfil-header no header (se já tiver, usa o existente)
  let perfilHeader = document.getElementById("perfilHeader");
  if (!perfilHeader) {
    perfilHeader = document.createElement("div");
    perfilHeader.id = "perfilHeader";
    perfilHeader.className = "perfil-header";
    // inserimos antes do botão de tema para garantir posição correta
    const btnTema = document.getElementById("modoTema");
    header.insertBefore(perfilHeader, btnTema);
  }

  // cria elementos internos
  function createAvatar(initial) {
    const a = document.createElement("div");
    a.className = "avatar";
    a.textContent = initial || "?";
    return a;
  }

  function createNameSpan(name) {
    const s = document.createElement("span");
    s.className = "nome-usuario";
    s.textContent = name || "Visiante";
    return s;
  }

  // load saved data
  const LS_NAME_KEY = "nomeUsuario";
  const LS_LAST_KEY = "ultimoAcesso";

  function getSavedName() {
    return localStorage.getItem(LS_NAME_KEY) || "";
  }
  function getLastAccess() {
    return localStorage.getItem(LS_LAST_KEY) || "";
  }

  // format date (pt-BR) friendly
  function formatDateIsoToPt(iso) {
    if (!iso) return "—";
    try {
      const d = new Date(iso);
      return d.toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      return iso;
    }
  }

  // set/update last access to now (ISO)
  function setLastAccessNow() {
    const now = new Date().toISOString();
    localStorage.setItem(LS_LAST_KEY, now);
  }

  // Render header profile
  function renderPerfilHeader() {
    perfilHeader.innerHTML = ""; // limpa
    const name = getSavedName();
    const initial = name ? name.trim()[0].toUpperCase() : "G"; // G de Guitslaff quando vazio
    const avatar = createAvatar(initial);
    const nomeSpan = createNameSpan(name ? `Olá, ${name}` : "Olá, visitante");

    perfilHeader.appendChild(avatar);
    perfilHeader.appendChild(nomeSpan);

    // clique abre modal
    perfilHeader.onclick = (e) => {
      e.stopPropagation();
      openPerfilModal();
    };
  }

  // Modal markup (create once)
  let modalOverlay = null;
  function buildModalIfNeeded() {
    if (modalOverlay) return;
    modalOverlay = document.createElement("div");
    modalOverlay.className = "perfil-modal-overlay";
    modalOverlay.innerHTML = `
      <div class="perfil-modal" role="dialog" aria-modal="true">
        <button class="fechar" title="Fechar">&times;</button>
        <div class="top">
          <div class="avatar" id="modalAvatar">G</div>
          <div>
            <h3 id="modalNome">Guitslaff</h3>
            <p id="modalUltimo">Último acesso: —</p>
          </div>
        </div>
        <div class="acoes">
          <button class="editar">Editar nome</button>
          <button class="sair">Sair</button>
        </div>
      </div>
    `;
    document.body.appendChild(modalOverlay);

    // listeners
    modalOverlay.querySelector(".fechar").addEventListener("click", closePerfilModal);
    modalOverlay.addEventListener("click", (ev) => {
      if (ev.target === modalOverlay) closePerfilModal();
    });
    modalOverlay.querySelector(".editar").addEventListener("click", onEditarNome);
    modalOverlay.querySelector(".sair").addEventListener("click", onSair);
  }

  function openPerfilModal() {
    buildModalIfNeeded();
    // atualizar campos
    const name = getSavedName();
    const last = getLastAccess();
    const initial = name ? name.trim()[0].toUpperCase() : "G";
    modalOverlay.querySelector("#modalAvatar").textContent = initial;
    modalOverlay.querySelector("#modalNome").textContent = name || "Visitante";
    modalOverlay.querySelector("#modalUltimo").textContent = `Último acesso: ${formatDateIsoToPt(last)}`;
    modalOverlay.classList.add("show");
    // prevent body scroll if desired:
    document.body.style.overflow = "hidden";
  }

  function closePerfilModal() {
    if (!modalOverlay) return;
    modalOverlay.classList.remove("show");
    document.body.style.overflow = "";
  }

  // edit name handler
  function onEditarNome() {
    closePerfilModal();
    const atual = getSavedName() || "";
    const novo = prompt("Digite seu nome:", atual);
    if (novo === null) return; // cancel
    const trimmed = novo.trim();
    if (!trimmed) {
      alert("Nome inválido.");
      return;
    }
    localStorage.setItem(LS_NAME_KEY, trimmed);
    setLastAccessNow();
    renderPerfilHeader();
  }

  // logout (limpa nome e ultimo acesso)
  function onSair() {
    const ok = confirm("Deseja sair (limpar nome salvo)?");
    if (!ok) return;
    localStorage.removeItem(LS_NAME_KEY);
    localStorage.removeItem(LS_LAST_KEY);
    renderPerfilHeader();
    closePerfilModal();
  }

  // init: set last access if not present, then update
  if (!getLastAccess()) setLastAccessNow();
  else setLastAccessNow(); // atualiza sempre ao abrir a página

  // render inicial
  renderPerfilHeader();

  // fecha modal ao pressionar ESC
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closePerfilModal();
  });

  // se o usuário clicar fora do header e o modal estiver aberto, fechar
  document.addEventListener("click", (ev) => {
    if (!modalOverlay) return;
    if (modalOverlay.classList.contains("show")) {
      const isClickInsideModal = modalOverlay.querySelector(".perfil-modal").contains(ev.target);
      const isClickOnHeader = perfilHeader.contains(ev.target);
      if (!isClickInsideModal && !isClickOnHeader) closePerfilModal();
    }
  });

  // observe changes in localStorage from other tabs (optional)
  window.addEventListener("storage", (ev) => {
    if (ev.key === LS_NAME_KEY || ev.key === LS_LAST_KEY) {
      renderPerfilHeader();
    }
  });
})();
