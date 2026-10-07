# Bella Cachos — Sistema (protótipo navegável)

Protótipo visual do sistema interno da Bella Cachos, com a mesma identidade do site público.
Feito só com HTML, CSS e JavaScript puros: não precisa instalar nada.

**Como abrir:** dê dois cliques em `index.html` (ou use a extensão Live Server do VS Code).

## Perfis de demonstração

| Perfil | E-mail | O que vê |
|---|---|---|
| Izabella (administradora) | izabella@exemplo.com | tudo, inclusive financeiro e relatórios; tem agenda própria |
| Recepção | recepcao@exemplo.com | operação, agenda, clientes e confirmações (sem financeiro) |
| Mirian (profissional) | mirian@exemplo.com | só a própria agenda e histórico |
| Ana Silva (cliente) | ana@exemplo.com | o próprio agendamento, histórico e perfil |

Qualquer senha funciona. Também dá para entrar clicando direto no perfil.

## O que já funciona (com dados fictícios)

- Criar agendamento (o sistema avisa se o horário já estiver ocupado) e cadastrar clientes
- Fluxo de status: Pendente → Confirmado → Em atendimento → Concluído (ou Cancelado / Não compareceu)
- Mensagem de confirmação pronta para a cliente (botão de copiar)
- Agenda por dia e por semana, filtro por profissional e busca de clientes
- Cadastro de serviços, produtos e cursos
- Dashboard, financeiro e relatórios calculados a partir dos atendimentos

## Importante

- **Tudo é fictício** e fica só no seu navegador (localStorage). Nada é enviado a servidor.
- **Não há segurança real.** O controle de acesso por perfil é visual; na versão final
  ele será garantido pelo banco de dados.
- Os dados de demonstração se renovam a cada dia. Em Configurações há um botão para restaurá-los.
- Não coloque clientes reais enquanto for só demonstração.

## Estrutura

```
index.html            login
*.html                uma tela por arquivo
css/style.css         visual de todo o sistema
js/dados.js           dados fictícios (será trocado pelo banco de dados)
js/app.js             menu lateral, acesso por perfil, janelas e ações comuns
js/paginas.js         o que cada tela mostra e faz
img/                  logo e favicon
```

O menu lateral NÃO está copiado em cada arquivo: ele é montado por `js/app.js`
a partir da lista `MENU`. Para mudar o menu, edite só ali.
