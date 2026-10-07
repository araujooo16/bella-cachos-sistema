/* =========================================
   BELLA CACHOS — SISTEMA (protótipo)
   PAGINAS.JS — o que cada tela mostra e faz

   Cada tela é uma função em PAGINAS, escolhida pelo
   data-pagina do <body>. Os dados vêm sempre de dados.js.
   ========================================= */

const PAGINAS = {};

const kpi = (rotulo, valor, rodape) =>
    `<div class="card"><div class="kpi-label">${rotulo}</div><div class="kpi-value">${valor}</div><div class="kpi-foot">${rodape}</div></div>`;

const barras = (pares) => {
    if (!pares.length) return `<div class="vazio">Sem dados ainda.</div>`;
    const max = Math.max(...pares.map((p) => p[1]), 1);
    return pares.map(([nome, v]) =>
        `<div class="hbar"><span>${esc(nome)}</span><div class="hbar-trilho"><i style="width:${(v / max) * 100}%"></i></div><strong>${v}</strong></div>`
    ).join("");
};

const contar = (lista, chave) => {
    const c = {};
    lista.forEach((x) => { const k = chave(x); c[k] = (c[k] || 0) + 1; });
    return Object.entries(c).sort((a, b) => b[1] - a[1]);
};

const listaAg = (lista, tipo, opcoes) => lista.length
    ? `<div class="list">${lista.map((a) => itemAg(a, tipo, opcoes)).join("")}</div>`
    : `<div class="vazio">Nenhum atendimento por aqui.</div>`;


/* ---------- Login ---------- */

PAGINAS.login = function () {
    $("#form-login").addEventListener("submit", (e) => {
        e.preventDefault();
        const email = $("#email").value.trim().toLowerCase();
        const chave = Object.keys(PERFIS).find((k) => PERFIS[k].email === email);
        if (!chave) { $("#erro-login").textContent = "E-mail não encontrado no protótipo. Use um dos perfis abaixo."; return; }
        entrar(chave);
    });
    $$("[data-perfil]").forEach((b) => b.addEventListener("click", () => entrar(b.dataset.perfil)));
};


/* ---------- Dashboard (administradora) ---------- */

PAGINAS.dashboard = function (p) {
    App.render = () => {
        const d = Dados.ler(), hoje = hojeISO();
        const concl = d.agendamentos.filter((a) => a.status === "Concluído");
        const mes = concl.filter((a) => a.data >= somarDias(hoje, -29));
        const deHoje = ordenar(d.agendamentos.filter((a) => a.data === hoje));
        const pend = d.agendamentos.filter((a) => a.status === "Pendente").length;

        $("#ola").textContent = `Olá, ${p.nome}! 👋`;
        $("#kpis").innerHTML =
            kpi("Faturamento", brl(soma(mes.map((a) => precoServ(a.servicoId)))), "últimos 30 dias") +
            kpi("Atendimentos", mes.length, "concluídos em 30 dias") +
            kpi("Clientes", d.clientes.length, "cadastrados") +
            kpi("Agendamentos", deHoje.length, "hoje");

        const dias = [...Array(7)].map((_, i) => somarDias(hoje, i - 6));
        const vals = dias.map((x) => soma(concl.filter((a) => a.data === x).map((a) => precoServ(a.servicoId))));
        const max = Math.max(...vals, 1);
        $("#grafico").innerHTML = `<div class="chart">${dias.map((x, i) =>
            `<div class="bar" style="height:${Math.max((vals[i] / max) * 100, 2)}%" title="${dataBR(x)}: ${brl(vals[i])}">` +
            `<span>${new Date(x + "T12:00:00").toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", "")}</span></div>`
        ).join("")}</div><div class="chart-legenda"></div>`;

        $("#top-servicos").innerHTML = barras(contar(mes, (a) => nomeServ(a.servicoId)));

        $("#pendentes").innerHTML = pend
            ? `<div class="destaque"><div class="eyebrow">Atenção</div><h2>${pend} aguardando confirmação</h2>
               <p>Agendamentos criados pela recepção que ainda precisam ser confirmados com a cliente.</p>
               <p style="margin-top:14px"><a class="btn btn-soft" href="agenda.html">Abrir agenda</a></p></div>`
            : "";

        $("#hoje").innerHTML = deHoje.length
            ? `<div class="table-wrap"><table><tr><th>Horário</th><th>Cliente</th><th>Serviço</th><th>Profissional</th><th>Status</th></tr>${deHoje.map((a) =>
                `<tr><td>${a.hora}</td><td>${esc(nomeCli(a.clienteId))}</td><td>${esc(nomeServ(a.servicoId))}</td><td>${esc(nomeProf(a.profId))}</td><td>${badge(a.status)}</td></tr>`).join("")}</table></div>`
            : `<div class="vazio">Nenhum atendimento hoje.</div>`;
    };
    App.render();
};


/* ---------- Agenda (administradora e recepção) ---------- */

PAGINAS.agenda = function (p) {
    let dia = hojeISO(), modo = "dia", prof = "todos";
    $("#f-prof").innerHTML = `<option value="todos">Todos os profissionais</option>` + opcoesSelect(Dados.ler().profissionais);

    $("#controles").addEventListener("click", (e) => {
        const m = e.target.closest("[data-modo]");
        if (m) { modo = m.dataset.modo; App.render(); }
        const n = e.target.closest("[data-nav]");
        if (n) { dia = n.dataset.nav === "0" ? hojeISO() : somarDias(dia, Number(n.dataset.nav) * (modo === "semana" ? 7 : 1)); App.render(); }
    });
    $("#f-prof").addEventListener("change", (e) => { prof = e.target.value; App.render(); });
    $("#f-dia").addEventListener("change", (e) => { if (e.target.value) { dia = e.target.value; App.render(); } });

    App.irParaData = (iso) => { dia = iso; modo = "dia"; };

    App.render = () => {
        $$("[data-modo]").forEach((b) => b.classList.toggle("ativo", b.dataset.modo === modo));
        $("#f-dia").value = dia;
        const d = Dados.ler();
        const dias = modo === "dia" ? [dia] : [...Array(7)].map((_, i) => somarDias(dia, i));
        $("#periodo").textContent = modo === "dia" ? dataExtensa(dia) : `${dataBR(dias[0])} a ${dataBR(dias[6])}`;
        const lista = ordenar(d.agendamentos.filter((a) => dias.includes(a.data) && (prof === "todos" || a.profId === prof)));
        $("#lista").innerHTML = dias.map((x) => {
            const doDia = lista.filter((a) => a.data === x);
            return (modo === "semana" ? `<div class="lista-titulo">${dataExtensa(x)}</div>` : "") +
                (doDia.length ? `<div class="list">${doDia.map((a) => itemAg(a, p.tipo)).join("")}</div>`
                              : `<div class="vazio">Sem atendimentos.</div>`);
        }).join("");
    };

    App.render();
    if (new URLSearchParams(location.search).get("novo")) novoAgendamento();
};


/* ---------- Operação (recepção) ---------- */

PAGINAS.recepcao = function (p) {
    App.render = () => {
        const d = Dados.ler(), hoje = hojeISO();
        const deHoje = ordenar(d.agendamentos.filter((a) => a.data === hoje));
        const c = (s) => deHoje.filter((a) => a.status === s).length;

        $("#kpis").innerHTML =
            kpi("Confirmados", c("Confirmado"), "hoje") +
            kpi("Aguardando", c("Pendente"), "confirmação hoje") +
            kpi("Concluídos", c("Concluído"), "hoje") +
            kpi("Cancelados", c("Cancelado"), "hoje");

        const pend = ordenar(d.agendamentos.filter((a) => a.status === "Pendente"));
        $("#aguardando").innerHTML = pend.length
            ? listaAg(pend, p.tipo, { data: true })
            : `<div class="vazio">Nenhum agendamento aguardando confirmação.</div>`;
        $("#hoje").innerHTML = listaAg(deHoje, p.tipo);
    };
    App.render();
};


/* ---------- Clientes ---------- */

PAGINAS.clientes = function () {
    App.render = () => {
        const d = Dados.ler();
        const q = ($("#busca").value || "").trim().toLowerCase();
        const lista = d.clientes.filter((c) => !q || c.nome.toLowerCase().includes(q) || c.whatsapp.includes(q));
        const feitos = (id) => d.agendamentos.filter((a) => a.clienteId === id && a.status === "Concluído");

        $("#tabela").innerHTML = lista.length
            ? `<div class="table-wrap"><table><tr><th>Nome</th><th>WhatsApp</th><th>Último atendimento</th><th>Atendimentos</th><th></th></tr>${lista.map((c) => {
                const f = feitos(c.id).map((a) => a.data).sort();
                return `<tr><td>${esc(c.nome)}</td><td>${esc(c.whatsapp)}</td><td>${f.length ? dataBR(f[f.length - 1]) : "—"}</td><td>${f.length}</td>` +
                       `<td><a class="btn btn-soft" href="cliente-detalhe.html?id=${c.id}">Ver perfil</a></td></tr>`;
            }).join("")}</table></div>`
            : `<div class="vazio">Nenhum cliente encontrado.</div>`;
    };
    $("#busca").addEventListener("input", () => App.render());
    App.render();
};

PAGINAS["cliente-detalhe"] = function (p) {
    const id = new URLSearchParams(location.search).get("id");
    App.render = () => {
        const c = Dados.buscar("clientes", id);
        if (!c) { $("#detalhe").innerHTML = `<div class="card vazio">Cliente não encontrado.</div>`; return; }

        const ags = ordenar(Dados.ler().agendamentos.filter((a) => a.clienteId === id));
        const prox = ags.find((a) => a.data >= hojeISO() && ["Pendente", "Confirmado"].includes(a.status));
        const hist = ags.filter((a) => a.status === "Concluído").reverse();

        $("#detalhe").innerHTML = `
            <div class="header-row"><div><div class="eyebrow">Cliente</div><h1>${esc(c.nome)}</h1>
                <p class="muted">Cliente desde ${dataBR(c.desde)} · ${esc(c.whatsapp)}</p></div>
                <button type="button" class="btn btn-primary" data-novo-ag data-cliente="${c.id}">+ Novo agendamento</button></div>
            <div class="grid two">
                <div class="card"><h2>Dados da cliente</h2><div class="list">
                    <div class="list-item"><span>Nome</span><strong>${esc(c.nome)}</strong></div>
                    <div class="list-item"><span>WhatsApp</span><strong>${esc(c.whatsapp)}</strong></div>
                    <div class="list-item"><span>E-mail</span><strong>${esc(c.email || "—")}</strong></div>
                    <div class="list-item"><span>Nascimento</span><strong>${c.nascimento ? dataBR(c.nascimento) : "—"}</strong></div>
                    ${c.obs ? `<div class="list-item"><span>Observações</span><strong>${esc(c.obs)}</strong></div>` : ""}
                </div></div>
                <div class="card"><h2>Próximo atendimento</h2>${prox
                    ? `<p><strong>${dataBR(prox.data)} · ${prox.hora}</strong></p><p class="muted">${esc(nomeServ(prox.servicoId))} · ${esc(nomeProf(prox.profId))}</p>${badge(prox.status)}`
                    : `<p class="muted">Nenhum horário marcado.</p>`}</div>
            </div>
            <div class="card mt"><h2>Histórico de atendimentos</h2>${hist.length
                ? `<div class="table-wrap"><table><tr><th>Data</th><th>Serviço</th><th>Profissional</th><th>Valor</th></tr>${hist.map((a) =>
                    `<tr><td>${dataBR(a.data)}</td><td>${esc(nomeServ(a.servicoId))}</td><td>${esc(nomeProf(a.profId))}</td><td>${brl(precoServ(a.servicoId))}</td></tr>`).join("")}</table></div>`
                : `<div class="vazio">Ainda sem atendimentos concluídos.</div>`}</div>`;
    };
    App.render();
};


/* ---------- Minha agenda (profissionais, inclusive a administradora) ---------- */

PAGINAS["minha-agenda"] = function (p) {
    let aba = "hoje";
    $("#abas").addEventListener("click", (e) => {
        const b = e.target.closest("[data-aba]");
        if (b) { aba = b.dataset.aba; App.render(); }
    });

    App.render = () => {
        const d = Dados.ler(), hoje = hojeISO();
        const meus = ordenar(d.agendamentos.filter((a) => a.profId === p.prof));
        const deHoje = meus.filter((a) => a.data === hoje);
        const hist = meus.filter((a) => a.status === "Concluído");
        const prox = deHoje.find((a) => ["Confirmado", "Em atendimento"].includes(a.status));

        $("#ola").textContent = `Olá, ${p.nome}! 👋`;
        $("#kpis").innerHTML =
            kpi("Hoje", deHoje.length, "atendimentos") +
            kpi("Concluídos", deHoje.filter((a) => a.status === "Concluído").length, "hoje") +
            kpi("Próximo", prox ? prox.hora : "—", prox ? esc(nomeCli(prox.clienteId)) : "nenhum hoje") +
            kpi("Histórico", hist.length, "atendimentos concluídos");

        $$("[data-aba]").forEach((b) => b.classList.toggle("ativo", b.dataset.aba === aba));
        const lista = aba === "hoje" ? deHoje
            : aba === "proximos" ? meus.filter((a) => a.data > hoje && !["Cancelado", "Não compareceu"].includes(a.status))
            : hist.slice().reverse();
        $("#lista").innerHTML = listaAg(lista, p.tipo, { data: aba !== "hoje" });
    };
    App.render();
};


/* ---------- Meu espaço (cliente) ---------- */

PAGINAS.cliente = function (p) {
    App.render = () => {
        const d = Dados.ler(), hoje = hojeISO();
        const c = Dados.buscar("clientes", p.cliente);
        const meus = ordenar(d.agendamentos.filter((a) => a.clienteId === p.cliente));
        const prox = meus.find((a) => a.data >= hoje && ["Pendente", "Confirmado"].includes(a.status));
        const hist = meus.filter((a) => a.status === "Concluído").reverse().slice(0, 8);
        const primeiro = c.nome.split(" ")[0];

        $("#ola").textContent = `Olá, ${primeiro}! 💚`;
        $("#whats").href = `https://wa.me/${CONFIG.whatsapp}?text=` +
            encodeURIComponent(`Olá! Sou ${c.nome} e gostaria de agendar um horário.`);

        $("#proximo").innerHTML = prox
            ? `<div class="destaque"><div class="eyebrow">Próximo atendimento</div>
               <h2>${dataExtensa(prox.data)} · ${prox.hora}</h2>
               <p>${esc(nomeServ(prox.servicoId))} com ${esc(nomeProf(prox.profId))}</p>
               <p style="margin-top:12px"><strong>${prox.status === "Confirmado"
                    ? `${esc(primeiro)}, o seu agendamento está confirmado.`
                    : "Recebemos o seu pedido. Assim que a recepção confirmar, o status muda aqui."}</strong></p></div>`
            : `<div class="card"><h2>Nenhum horário marcado</h2><p class="muted">Fale com a gente pelo WhatsApp para agendar o próximo.</p></div>`;

        $("#historico").innerHTML = hist.length
            ? `<div class="table-wrap"><table><tr><th>Data</th><th>Serviço</th><th>Profissional</th><th>Status</th></tr>${hist.map((a) =>
                `<tr><td>${dataBR(a.data)}</td><td>${esc(nomeServ(a.servicoId))}</td><td>${esc(nomeProf(a.profId))}</td><td>${badge(a.status)}</td></tr>`).join("")}</table></div>`
            : `<div class="vazio">Seus atendimentos aparecerão aqui.</div>`;

        $("#perfil").innerHTML = `<p style="margin:0"><strong>${esc(c.nome)}</strong><br><span class="muted">${esc(c.whatsapp)}${c.email ? " · " + esc(c.email) : ""}</span></p>`;
    };
    App.render();
};


/* ---------- Catálogo: serviços, produtos e cursos (mesma lógica) ---------- */

function catalogo(cfg) {
    App.render = () => {
        const itens = Dados.ler()[cfg.tab];
        $("#kpis").innerHTML = cfg.kpis(itens);
        $("#tabela").innerHTML = itens.length
            ? `<div class="table-wrap"><table><tr>${cfg.colunas.map((c) => `<th>${c[0]}</th>`).join("")}<th></th></tr>${itens.map((i) =>
                `<tr>${cfg.colunas.map((c) => `<td>${c[1](i)}</td>`).join("")}` +
                `<td><button type="button" class="btn btn-danger" data-remover="${i.id}" aria-label="Remover ${esc(i.nome)}">Remover</button></td></tr>`).join("")}</table></div>`
            : `<div class="vazio">Nada cadastrado ainda.</div>`;
    };

    $("#tabela").addEventListener("click", (e) => {
        const b = e.target.closest("[data-remover]");
        if (!b) return;
        if (cfg.emUso?.(b.dataset.remover)) { avisar("Este item já tem atendimentos e não pode ser removido."); return; }
        if (!confirm("Remover este item?")) return;
        Dados.remover(cfg.tab, b.dataset.remover);
        App.render();
        avisar("Item removido");
    });

    $("[data-novo]").addEventListener("click", () => modal(cfg.novo,
        cfg.campos.map((f) => `<div class="field${f.full ? " full" : ""}"><label for="x-${f.n}">${f.l}</label>` +
            `<input id="x-${f.n}" name="${f.n}" type="${f.t || "text"}"${f.t === "number" ? ' min="0" step="any"' : ""} required></div>`).join(""),
        {
            salvar: "Salvar",
            aoSalvar(fd) {
                const o = Object.fromEntries(fd);
                cfg.campos.forEach((f) => { if (f.t === "number") o[f.n] = Number(o[f.n]); });
                Dados.adicionar(cfg.tab, o);
                avisar("Cadastrado com sucesso");
                App.render();
            }
        }));

    App.render();
}

PAGINAS.servicos = () => catalogo({
    tab: "servicos", novo: "Novo serviço",
    campos: [{ n: "nome", l: "Nome do serviço", full: true }, { n: "duracao", l: "Duração (minutos)", t: "number" }, { n: "preco", l: "Preço (R$)", t: "number" }],
    colunas: [["Serviço", (i) => esc(i.nome)], ["Duração", (i) => i.duracao + " min"], ["Preço", (i) => brl(i.preco)]],
    emUso: (id) => Dados.ler().agendamentos.some((a) => a.servicoId === id),
    kpis: (itens) => {
        const top = contar(Dados.ler().agendamentos.filter((a) => a.status === "Concluído"), (a) => nomeServ(a.servicoId))[0];
        return kpi("Serviços", itens.length, "cadastrados") + kpi("Mais realizado", top ? esc(top[0]) : "—", "nos atendimentos concluídos") +
               kpi("Preço médio", itens.length ? brl(soma(itens.map((i) => i.preco)) / itens.length) : "—", "valores ilustrativos");
    }
});

PAGINAS.produtos = () => catalogo({
    tab: "produtos", novo: "Novo produto",
    campos: [{ n: "nome", l: "Nome do produto" }, { n: "categoria", l: "Categoria" }, { n: "preco", l: "Preço (R$)", t: "number" }, { n: "estoque", l: "Estoque (unidades)", t: "number" }],
    colunas: [["Produto", (i) => esc(i.nome)], ["Categoria", (i) => esc(i.categoria)], ["Preço", (i) => brl(i.preco)],
              ["Estoque", (i) => i.estoque <= 3 ? `${i.estoque} ${badge("Pendente").replace("Pendente", "baixo")}` : i.estoque]],
    kpis: (itens) => kpi("Produtos", itens.length, "cadastrados") +
        kpi("Estoque baixo", itens.filter((i) => i.estoque <= 3).length, "até 3 unidades") +
        kpi("Unidades", soma(itens.map((i) => i.estoque)), "em estoque")
});

PAGINAS.cursos = () => catalogo({
    tab: "cursos", novo: "Novo curso",
    campos: [{ n: "nome", l: "Nome do curso", full: true }, { n: "publico", l: "Público" }, { n: "data", l: "Data da turma", t: "date" },
             { n: "vagas", l: "Vagas", t: "number" }, { n: "inscritos", l: "Inscritos", t: "number" }],
    colunas: [["Curso", (i) => esc(i.nome)], ["Público", (i) => esc(i.publico)], ["Turma", (i) => dataBR(i.data)],
              ["Vagas", (i) => i.vagas], ["Inscritos", (i) => `${i.inscritos} de ${i.vagas}`]],
    kpis: (itens) => {
        const datas = itens.map((i) => i.data).sort();
        return kpi("Cursos", itens.length, "cadastrados") + kpi("Inscritos", soma(itens.map((i) => i.inscritos)), "no total") +
               kpi("Próxima turma", datas.length ? dataBR(datas[0]) : "—", "data mais próxima");
    }
});


/* ---------- Financeiro (calculado a partir dos atendimentos de demonstração) ---------- */

PAGINAS.financeiro = function () {
    App.render = () => {
        const d = Dados.ler(), ini = somarDias(hojeISO(), -29);
        const ent = d.agendamentos.filter((a) => a.status === "Concluído" && a.data >= ini);
        const desp = d.despesas.filter((x) => x.data >= ini);
        const entradas = soma(ent.map((a) => precoServ(a.servicoId)));
        const saidas = soma(desp.map((x) => x.valor));

        $("#kpis").innerHTML =
            kpi("Entradas", brl(entradas), "últimos 30 dias") +
            kpi("Saídas", brl(saidas), "últimos 30 dias") +
            kpi("Resultado", brl(entradas - saidas), "entradas menos saídas") +
            kpi("Ticket médio", ent.length ? brl(entradas / ent.length) : "—", "por atendimento");

        const mov = [
            ...ent.map((a) => ({ data: a.data, desc: "Atendimento — " + nomeServ(a.servicoId), cat: "Serviços", valor: precoServ(a.servicoId) })),
            ...desp.map((x) => ({ data: x.data, desc: x.descricao, cat: "Despesa", valor: -x.valor }))
        ].sort((a, b) => b.data.localeCompare(a.data)).slice(0, 10);

        $("#tabela").innerHTML = `<div class="table-wrap"><table><tr><th>Data</th><th>Descrição</th><th>Categoria</th><th style="text-align:right">Valor</th></tr>${mov.map((m) =>
            `<tr><td>${dataBR(m.data)}</td><td>${esc(m.desc)}</td><td>${m.cat}</td><td class="valor${m.valor < 0 ? " saida" : ""}">${brl(m.valor)}</td></tr>`).join("")}</table></div>`;
    };
    App.render();
};


/* ---------- Relatórios ---------- */

PAGINAS.relatorios = function () {
    App.render = () => {
        const d = Dados.ler();
        const concl = d.agendamentos.filter((a) => a.status === "Concluído");
        $("#r-status").innerHTML = barras(contar(d.agendamentos, (a) => a.status));
        $("#r-servicos").innerHTML = barras(contar(concl, (a) => nomeServ(a.servicoId)));
        $("#r-prof").innerHTML = barras(contar(concl, (a) => nomeProf(a.profId)));
        $("#r-clientes").innerHTML = barras(contar(concl, (a) => nomeCli(a.clienteId)).slice(0, 5));
    };
    App.render();
};


/* ---------- Configurações ---------- */

PAGINAS.configuracoes = function (p) {
    $("#conta").innerHTML =
        `<div class="field"><label for="c-nome">Nome</label><input id="c-nome" value="${esc(p.nome)}" readonly></div>
         <div class="field"><label for="c-perfil">Perfil</label><input id="c-perfil" value="${esc(p.papel)}" readonly></div>
         <div class="field full"><label for="c-mail">E-mail</label><input id="c-mail" value="${esc(p.email)}" readonly></div>`;

    $("#equipe").innerHTML = Object.values(PERFIS).filter((x) => x.tipo !== "cliente").map((x) =>
        `<div class="list-item"><span>${esc(x.nome)}</span><span class="status">${esc(x.papel)}</span></div>`).join("");

    const matriz = [
        ["Financeiro, relatórios e configurações", "Completo", "Sem acesso", "Sem acesso", "Sem acesso"],
        ["Catálogo (serviços, produtos, cursos)", "Completo", "Sem acesso", "Sem acesso", "Sem acesso"],
        ["Agenda", "Completa", "Operacional", "Só a própria", "Só a própria"],
        ["Clientes", "Completo", "Operacional", "Sem acesso", "Só os próprios dados"]
    ];
    $("#permissoes").innerHTML = `<table><tr><th>Área</th><th>Izabella</th><th>Recepção</th><th>Mirian</th><th>Cliente</th></tr>${matriz.map((l) =>
        `<tr>${l.map((c) => `<td>${c}</td>`).join("")}</tr>`).join("")}</table>`;

    $("#restaurar").addEventListener("click", () => {
        if (!confirm("Voltar todos os dados de demonstração ao início? O que você cadastrou será apagado.")) return;
        Dados.restaurar();
        avisar("Dados de demonstração restaurados");
    });
};
