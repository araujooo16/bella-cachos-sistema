/* =========================================
   BELLA CACHOS — SISTEMA (protótipo)
   DADOS.JS

   Todos os dados aqui são FICTÍCIOS e ficam guardados só no navegador
   (localStorage). Nada é enviado para nenhum servidor.

   Quando o banco de dados existir, é ESTE arquivo que será trocado:
   as telas continuam chamando Dados.ler(), Dados.adicionar() etc.
   ========================================= */

const CONFIG = {
    whatsapp: "5531973494170",        // WhatsApp do salão (só números, com 55 + DDD)
    endereco: "Rua Bálsamo, 34 – Menezes",
    chave: "bellaSistemaDemo_v2"
};

const STATUS = ["Pendente", "Confirmado", "Em atendimento", "Concluído", "Cancelado", "Não compareceu"];

/* Perfis de acesso. "prof" liga o perfil a uma profissional que atende;
   assim a Izabella é administradora E tem agenda própria. */
const PERFIS = {
    izabella: { nome: "Izabella", papel: "Administradora", tipo: "admin", prof: "izabella",
                email: "izabella@exemplo.com", home: "dashboard.html" },
    recepcao: { nome: "Recepção", papel: "Atendimento", tipo: "recepcao",
                email: "recepcao@exemplo.com", home: "recepcao.html" },
    mirian:   { nome: "Mirian", papel: "Profissional", tipo: "profissional", prof: "mirian",
                email: "mirian@exemplo.com", home: "minha-agenda.html" },
    ana:      { nome: "Ana Silva", papel: "Cliente", tipo: "cliente", cliente: "c1",
                email: "ana@exemplo.com", home: "cliente.html" }
};


/* ---------- Datas ---------- */

function isoData(d) {
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}

function somarDias(iso, n) {
    const d = new Date(iso + "T12:00:00");
    d.setDate(d.getDate() + n);
    return isoData(d);
}

function hojeISO() { return isoData(new Date()); }


/* ---------- Dados iniciais de demonstração ---------- */

function gerarSeed() {
    const hoje = hojeISO();

    const clientes = [
        { id: "c1", nome: "Ana Silva", whatsapp: "(31) 99999-1111", email: "ana@exemplo.com", nascimento: "", obs: "" },
        { id: "c2", nome: "Júlia Souza", whatsapp: "(31) 99999-2222", email: "", nascimento: "", obs: "" },
        { id: "c3", nome: "Carla Santos", whatsapp: "(31) 99999-3333", email: "", nascimento: "", obs: "" },
        { id: "c4", nome: "Beatriz Lima", whatsapp: "(31) 99999-4444", email: "", nascimento: "", obs: "" },
        { id: "c5", nome: "Fernanda Alves", whatsapp: "(31) 99999-5555", email: "", nascimento: "", obs: "" },
        { id: "c6", nome: "Mariana Costa", whatsapp: "(31) 99999-6666", email: "", nascimento: "", obs: "" }
    ].map((c, i) => Object.assign(c, { desde: somarDias(hoje, -(200 - i * 25)) }));

    const servicos = [
        { id: "s1", nome: "Corte", duracao: 60, preco: 120 },
        { id: "s2", nome: "Coloração", duracao: 180, preco: 280 },
        { id: "s3", nome: "Definição", duracao: 90, preco: 150 },
        { id: "s4", nome: "Tratamento", duracao: 90, preco: 160 }
    ];

    const profissionais = [
        { id: "izabella", nome: "Izabella" },
        { id: "mirian", nome: "Mirian" }
    ];

    const agendamentos = [];
    let n = 1;
    const add = (o) => agendamentos.push(Object.assign({ id: "a" + (n++), obs: "" }, o));

    /* Histórico dos últimos 30 dias (sempre os mesmos números, sem sorteio) */
    const horas = ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00"];
    for (let i = 0; i < 40; i++) {
        let d = somarDias(hoje, -(2 + (i * 7) % 29));
        const dow = new Date(d + "T12:00:00").getDay();
        if (dow === 0 || dow === 1) d = somarDias(d, -2);   // salão fecha domingo e segunda
        add({
            clienteId: clientes[(i * 5) % 6].id,
            servicoId: servicos[(i * 3 + (i >> 2)) % 4].id,
            profId: i % 3 === 0 ? "mirian" : "izabella",
            data: d, hora: horas[(i * 3) % 7], status: "Concluído"
        });
    }

    /* Hoje */
    add({ clienteId: "c6", servicoId: "s4", profId: "mirian",   data: hoje, hora: "08:00", status: "Concluído" });
    add({ clienteId: "c1", servicoId: "s1", profId: "izabella", data: hoje, hora: "09:00", status: "Confirmado" });
    add({ clienteId: "c6", servicoId: "s3", profId: "mirian",   data: hoje, hora: "10:00", status: "Cancelado" });
    add({ clienteId: "c2", servicoId: "s2", profId: "mirian",   data: hoje, hora: "11:00", status: "Confirmado" });
    add({ clienteId: "c3", servicoId: "s3", profId: "izabella", data: hoje, hora: "14:00", status: "Pendente" });
    add({ clienteId: "c4", servicoId: "s4", profId: "mirian",   data: hoje, hora: "15:30", status: "Pendente" });
    add({ clienteId: "c5", servicoId: "s1", profId: "izabella", data: hoje, hora: "16:30", status: "Confirmado" });

    /* Próximos dias */
    add({ clienteId: "c1", servicoId: "s1", profId: "izabella", data: somarDias(hoje, 5), hora: "14:00", status: "Confirmado" });
    add({ clienteId: "c2", servicoId: "s3", profId: "izabella", data: somarDias(hoje, 2), hora: "10:00", status: "Pendente" });
    add({ clienteId: "c3", servicoId: "s2", profId: "mirian",   data: somarDias(hoje, 3), hora: "13:00", status: "Confirmado" });

    const produtos = [
        { id: "p1", nome: "Shampoo", categoria: "Limpeza", preco: 48, estoque: 12 },
        { id: "p2", nome: "Condicionador", categoria: "Limpeza", preco: 52, estoque: 11 },
        { id: "p3", nome: "Máscara de tratamento", categoria: "Tratamento", preco: 89, estoque: 2 },
        { id: "p4", nome: "Leave-in", categoria: "Finalização", preco: 62, estoque: 7 },
        { id: "p5", nome: "Ativador de cachos", categoria: "Finalização", preco: 55, estoque: 3 },
        { id: "p6", nome: "Finalizador", categoria: "Finalização", preco: 58, estoque: 9 }
    ];

    const cursos = [
        { id: "k1", nome: "Trabalhar com curvaturas", publico: "Profissionais", data: somarDias(hoje, 35), vagas: 12, inscritos: 8 },
        { id: "k2", nome: "Cuidar dos seus cachos", publico: "Aberto ao público", data: somarDias(hoje, 50), vagas: 20, inscritos: 11 }
    ];

    const despesas = [
        { id: "d1", data: somarDias(hoje, -3),  descricao: "Compra de produtos", valor: 450 },
        { id: "d2", data: somarDias(hoje, -9),  descricao: "Material de trabalho", valor: 320 },
        { id: "d3", data: somarDias(hoje, -14), descricao: "Contas do salão", valor: 780 },
        { id: "d4", data: somarDias(hoje, -20), descricao: "Compra de produtos", valor: 520 }
    ];

    return { geradoEm: hoje, clientes, servicos, profissionais, agendamentos, produtos, cursos, despesas };
}


/* ---------- Armazenamento ---------- */

const Dados = {
    _c: null,

    /* Os dados de demonstração são renovados a cada novo dia, para que
       "hoje" nunca fique vazio. (Isso só vale para o protótipo.) */
    ler() {
        if (this._c) return this._c;
        try {
            const t = localStorage.getItem(CONFIG.chave);
            if (t) {
                const salvo = JSON.parse(t);
                if (salvo.geradoEm === hojeISO()) { this._c = salvo; return salvo; }
            }
        } catch (e) { /* segue com dados novos */ }
        this._c = gerarSeed();
        this.salvar();
        return this._c;
    },

    salvar() {
        try { localStorage.setItem(CONFIG.chave, JSON.stringify(this._c)); } catch (e) { /* sem armazenamento */ }
    },

    novoId(prefixo) { return prefixo + Date.now().toString(36) + Math.random().toString(36).slice(2, 5); },

    adicionar(tabela, obj) {
        const d = this.ler();
        obj.id = obj.id || this.novoId(tabela[0]);
        d[tabela].push(obj);
        this.salvar();
        return obj;
    },

    atualizar(tabela, id, patch) {
        const o = this.buscar(tabela, id);
        if (o) { Object.assign(o, patch); this.salvar(); }
        return o;
    },

    remover(tabela, id) {
        const d = this.ler();
        d[tabela] = d[tabela].filter((x) => x.id !== id);
        this.salvar();
    },

    buscar(tabela, id) { return this.ler()[tabela].find((x) => x.id === id); },

    restaurar() { this._c = gerarSeed(); this.salvar(); }
};
