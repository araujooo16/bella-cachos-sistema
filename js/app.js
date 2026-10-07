/* =========================================
   BELLA CACHOS — SISTEMA (protótipo)
   APP.JS — menu lateral, acesso por perfil e recursos comuns

   IMPORTANTE: neste protótipo o controle de acesso é só visual.
   Na versão real, as permissões serão garantidas no banco de dados.
   ========================================= */

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const brl = (n) => Number(n).toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
const dataBR = (iso) => (iso ? iso.split("-").reverse().join("/") : "");
const dataExtensa = (iso) => new Date(iso + "T12:00:00").toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" });

const nomeCli = (id) => Dados.buscar("clientes", id)?.nome || "—";
const nomeServ = (id) => Dados.buscar("servicos", id)?.nome || "—";
const nomeProf = (id) => Dados.buscar("profissionais", id)?.nome || "—";
const precoServ = (id) => Dados.buscar("servicos", id)?.preco || 0;
const soma = (arr) => arr.reduce((t, n) => t + n, 0);
const ordenar = (arr) => arr.slice().sort((a, b) => (a.data + a.hora).localeCompare(b.data + b.hora));

const App = { render: null };


/* ---------- Menu por perfil (também define quem acessa cada página) ---------- */

const MENU = {
    admin: [
        { t: "Menu" },
        { h: "dashboard.html", l: "Dashboard" },
        { h: "agenda.html", l: "Agenda" },
        { h: "minha-agenda.html", l: "Minha agenda" },
        { h: "clientes.html", l: "Clientes" },
        { t: "Catálogo" },
        { h: "servicos.html", l: "Serviços" },
        { h: "produtos.html", l: "Produtos" },
        { h: "cursos.html", l: "Cursos" },
        { t: "Gestão" },
        { h: "financeiro.html", l: "Financeiro" },
        { h: "relatorios.html", l: "Relatórios" },
        { h: "configuracoes.html", l: "Configurações" }
    ],
    recepcao: [
        { t: "Menu" },
        { h: "recepcao.html", l: "Operação" },
        { h: "agenda.html", l: "Agenda" },
        { h: "clientes.html", l: "Clientes" }
    ],
    profissional: [
        { t: "Menu" },
        { h: "minha-agenda.html", l: "Minha agenda" }
    ],
    cliente: [
        { t: "Menu" },
        { h: "cliente.html", l: "Meu espaço" }
    ]
};


/* ---------- Sessão ---------- */

function sessao() {
    const chave = sessionStorage.getItem("bellaPerfil");
    return PERFIS[chave] ? Object.assign({ chave }, PERFIS[chave]) : null;
}

function entrar(chave) {
    sessionStorage.setItem("bellaPerfil", chave);
    location.href = PERFIS[chave].home;
}

function sair() {
    sessionStorage.removeItem("bellaPerfil");
    location.href = "index.html";
}


/* ---------- Montagem da página ---------- */

function montarShell(p, arquivo) {
    const itens = MENU[p.tipo].map((i) =>
        i.t ? `<div class="nav-title">${i.t}</div>`
            : `<a href="${i.h}"${i.h === arquivo || (arquivo === "cliente-detalhe.html" && i.h === "clientes.html") ? ' class="active" aria-current="page"' : ""}>${i.l}</a>`
    ).join("");

    const conteudo = $("#conteudo");
    const app = document.createElement("div");
    app.className = "app";
    app.innerHTML = `
        <aside class="sidebar" id="sidebar">
            <a class="brand" href="${p.home}"><img src="img/logo-bella-cachos.png" alt="Bella Cachos — Cor e Corte"></a>
            <div class="profile"><strong>${esc(p.nome)}</strong><span>${esc(p.papel)}</span></div>
            <nav class="nav" aria-label="Menu do sistema">${itens}
                <div class="logout"><a href="#" data-sair>Sair</a></div>
            </nav>
        </aside>
        <div class="overlay" data-fechar-menu></div>
        <div class="main">
            <header class="topbar">
                <button class="mobile-menu" type="button" aria-label="Abrir menu" aria-controls="sidebar" aria-expanded="false">☰</button>
                <strong>${esc(document.body.dataset.titulo || "")}</strong>
                <span class="topbar-right">
                    <span class="tag-proto">Protótipo · dados fictícios</span>
                    <span class="muted hide-sm">${esc(p.nome)} · ${esc(p.papel)}</span>
                </span>
            </header>
        </div>`;

    conteudo.parentNode.insertBefore(app, conteudo);
    $(".main", app).appendChild(conteudo);
}

function alternarMenu(abrir) {
    document.body.classList.toggle("menu-aberto", abrir);
    $(".mobile-menu")?.setAttribute("aria-expanded", String(abrir));
}


/* ---------- Avisos e janelas ---------- */

function avisar(texto) {
    const t = document.createElement("div");
    t.className = "toast";
    t.setAttribute("role", "status");
    t.textContent = texto;
    document.body.appendChild(t);
    requestAnimationFrame(() => t.classList.add("visivel"));
    setTimeout(() => { t.classList.remove("visivel"); setTimeout(() => t.remove(), 300); }, 2600);
}

/* modal(titulo, html, { salvar, aoSalvar })
   Com aoSalvar vira formulário: devolva um texto para mostrar um erro, ou nada para fechar. */
function modal(titulo, corpo, opcoes = {}) {
    const d = document.createElement("dialog");
    d.className = "modal-box";
    const conteudo = opcoes.aoSalvar
        ? `<form class="form-grid">${corpo}<p class="erro" role="alert"></p>
               <div class="field full"><button class="btn btn-primary" type="submit">${opcoes.salvar || "Salvar"}</button></div></form>`
        : corpo;
    d.innerHTML = `<div class="modal-head"><h2>${esc(titulo)}</h2><button type="button" class="close" aria-label="Fechar">×</button></div>${conteudo}`;
    document.body.appendChild(d);

    $(".close", d).addEventListener("click", () => d.close());
    d.addEventListener("click", (e) => { if (e.target === d) d.close(); });
    d.addEventListener("close", () => d.remove());

    const form = $("form", d);
    if (form) {
        form.addEventListener("submit", (e) => {
            e.preventDefault();
            if (!form.reportValidity()) return;
            const resultado = opcoes.aoSalvar(new FormData(form));
            if (typeof resultado === "string") { $(".erro", d).textContent = resultado; return; }
            d.close();
        });
    }

    d.showModal();
    return d;
}

const opcoesSelect = (lista, selecionado) =>
    lista.map((x) => `<option value="${x.id}"${x.id === selecionado ? " selected" : ""}>${esc(x.nome)}</option>`).join("");


/* ---------- Agendamentos ---------- */

function novoAgendamento({ clienteId, data, profId } = {}) {
    const d = Dados.ler();
    modal("Novo agendamento", `
        <div class="field"><label for="f-cli">Cliente</label>
            <select id="f-cli" name="clienteId" required>${opcoesSelect(d.clientes, clienteId)}</select></div>
        <div class="field"><label for="f-srv">Serviço</label>
            <select id="f-srv" name="servicoId" required>${opcoesSelect(d.servicos)}</select></div>
        <div class="field"><label for="f-prf">Profissional</label>
            <select id="f-prf" name="profId" required>${opcoesSelect(d.profissionais, profId)}</select></div>
        <div class="field"><label for="f-dat">Data</label>
            <input id="f-dat" type="date" name="data" value="${data || hojeISO()}" required></div>
        <div class="field"><label for="f-hor">Horário</label>
            <input id="f-hor" type="time" name="hora" value="09:00" required></div>
        <div class="field full"><label for="f-obs">Observação</label>
            <textarea id="f-obs" name="obs" rows="3"></textarea></div>`,
        {
            salvar: "Salvar agendamento",
            aoSalvar(fd) {
                const novo = Object.fromEntries(fd);
                const ocupado = d.agendamentos.some((a) => a.profId === novo.profId && a.data === novo.data &&
                    a.hora === novo.hora && !["Cancelado", "Não compareceu"].includes(a.status));
                if (ocupado) return "Esse horário já está ocupado para essa profissional. Escolha outro.";
                Dados.adicionar("agendamentos", Object.assign(novo, { status: "Pendente" }));
                avisar("Agendamento criado como Pendente");
                App.irParaData?.(novo.data);
                App.render?.();
            }
        });
}

function novoCliente() {
    modal("Novo cliente", `
        <div class="field"><label for="n-nome">Nome completo</label><input id="n-nome" name="nome" required></div>
        <div class="field"><label for="n-whats">WhatsApp</label><input id="n-whats" name="whatsapp" placeholder="(31) 99999-9999" required></div>
        <div class="field"><label for="n-mail">E-mail</label><input id="n-mail" name="email" type="email"></div>
        <div class="field"><label for="n-nasc">Data de nascimento</label><input id="n-nasc" name="nascimento" type="date"></div>
        <div class="field full"><label for="n-obs">Observações</label><textarea id="n-obs" name="obs" rows="3"></textarea></div>`,
        {
            salvar: "Cadastrar cliente",
            aoSalvar(fd) {
                Dados.adicionar("clientes", Object.assign(Object.fromEntries(fd), { desde: hojeISO() }));
                avisar("Cliente cadastrado");
                App.render?.();
            }
        });
}

function msgConfirmacao(a) {
    const primeiro = nomeCli(a.clienteId).split(" ")[0];
    return `Olá, ${primeiro}! Seu agendamento está confirmado 💚\n\n` +
        `📅 ${dataExtensa(a.data)}\n🕘 ${a.hora}\n✂️ ${nomeServ(a.servicoId)} com ${nomeProf(a.profId)}\n\n` +
        `Bella Cachos · ${CONFIG.endereco}\nSe precisar remarcar, é só responder esta mensagem.`;
}

function mostrarMensagem(a) {
    const d = modal("Mensagem de confirmação", `
        <p class="muted" style="margin-top:0">Mensagem pronta para enviar à cliente. Na versão final, o botão abrirá o WhatsApp dela já com este texto.</p>
        <textarea class="mensagem-previa" readonly aria-label="Mensagem de confirmação">${esc(msgConfirmacao(a))}</textarea>
        <p style="margin-bottom:0"><button type="button" class="btn btn-primary" data-copiar>Copiar mensagem</button></p>`);
    $("[data-copiar]", d).addEventListener("click", async () => {
        const area = $(".mensagem-previa", d);
        try { await navigator.clipboard.writeText(area.value); } catch (e) { area.select(); document.execCommand("copy"); }
        avisar("Mensagem copiada");
    });
}

const badge = (s) => {
    const cls = { "Pendente": "pending", "Em atendimento": "doing", "Concluído": "done", "Cancelado": "cancel", "Não compareceu": "cancel" }[s] || "";
    return `<span class="status ${cls}">${esc(s)}</span>`;
};

function acoesPara(a, tipo) {
    const gestor = tipo === "admin" || tipo === "recepcao";
    const atende = tipo === "admin" || tipo === "profissional";
    const A = [];
    if (a.status === "Pendente" && gestor) A.push(["confirmar", "Confirmar", "btn-primary"], ["cancelar", "Cancelar", "btn-soft"]);
    if (a.status === "Confirmado") {
        if (gestor) A.push(["mensagem", "Mensagem", "btn-soft"]);
        if (atende) A.push(["iniciar", "Iniciar", "btn-primary"]);
        if (gestor) A.push(["faltou", "Faltou", "btn-soft"], ["cancelar", "Cancelar", "btn-soft"]);
    }
    if (a.status === "Em atendimento" && atende) A.push(["concluir", "Concluir", "btn-primary"]);
    return A;
}

/* Uma linha de agendamento, com os botões que o perfil pode usar */
function itemAg(a, tipo, { data = false, semCliente = false } = {}) {
    const quando = data ? `${dataBR(a.data)} · ${a.hora}` : a.hora;
    const titulo = semCliente ? `${quando} · ${esc(nomeServ(a.servicoId))}` : `${quando} · ${esc(nomeCli(a.clienteId))}`;
    const sub = semCliente ? `com ${esc(nomeProf(a.profId))}` : `${esc(nomeServ(a.servicoId))} · ${esc(nomeProf(a.profId))}`;
    const botoes = acoesPara(a, tipo).map(([acao, rot, cls]) =>
        `<button type="button" class="btn ${cls}" data-acao="${acao}" data-id="${a.id}">${rot}</button>`).join("");
    return `<div class="list-item"><span><strong>${titulo}</strong><br><small class="muted">${sub}</small></span>` +
           `<span class="acoes">${badge(a.status)}${botoes}</span></div>`;
}

const novoStatus = { confirmar: "Confirmado", iniciar: "Em atendimento", concluir: "Concluído", cancelar: "Cancelado", faltou: "Não compareceu" };


/* ---------- Eventos globais ---------- */

document.addEventListener("click", (e) => {
    const alvo = (s) => e.target.closest(s);

    if (alvo("[data-sair]")) { e.preventDefault(); sair(); return; }
    if (alvo(".mobile-menu")) { alternarMenu(!document.body.classList.contains("menu-aberto")); return; }
    if (alvo("[data-fechar-menu]")) { alternarMenu(false); return; }
    if (alvo(".nav a")) { alternarMenu(false); return; }

    const novoAg = alvo("[data-novo-ag]");
    if (novoAg) { novoAgendamento({ clienteId: novoAg.dataset.cliente }); return; }
    if (alvo("[data-novo-cliente]")) { novoCliente(); return; }

    const b = alvo("[data-acao]");
    if (!b) return;
    const a = Dados.buscar("agendamentos", b.dataset.id);
    if (!a) return;

    if (b.dataset.acao === "mensagem") { mostrarMensagem(a); return; }
    if (b.dataset.acao === "cancelar" && !confirm("Cancelar este agendamento?")) return;

    Dados.atualizar("agendamentos", a.id, { status: novoStatus[b.dataset.acao] });
    App.render?.();
    if (b.dataset.acao === "confirmar") { avisar("Agendamento confirmado"); mostrarMensagem(a); }
    else avisar("Status atualizado: " + novoStatus[b.dataset.acao]);
});

document.addEventListener("keydown", (e) => { if (e.key === "Escape") alternarMenu(false); });


/* ---------- Início ---------- */

document.addEventListener("DOMContentLoaded", () => {
    const pagina = document.body.dataset.pagina;

    if (pagina === "login") { PAGINAS.login(); document.body.classList.remove("carregando"); return; }

    const p = sessao();
    if (!p) { location.replace("index.html"); return; }

    const arquivo = location.pathname.split("/").pop() || "index.html";
    const permitidas = MENU[p.tipo].filter((i) => i.h).map((i) => i.h);
    if (p.tipo === "admin" || p.tipo === "recepcao") permitidas.push("cliente-detalhe.html");
    if (!permitidas.includes(arquivo)) { location.replace(p.home); return; }

    montarShell(p, arquivo);
    PAGINAS[pagina]?.(p);
    document.body.classList.remove("carregando");
});
