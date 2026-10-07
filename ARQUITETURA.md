# Arquitetura do protótipo

## Perfis e permissões
- **Izabella (administradora):** tudo. Também atende, então tem agenda própria ("Minha agenda").
- **Recepção:** agenda, clientes e confirmações; sem financeiro, relatórios e configurações.
- **Mirian (profissional):** apenas a própria agenda, atendimentos e histórico.
- **Cliente:** apenas o próprio agendamento, histórico e perfil.

O perfil de acesso é separado de "atende clientes" (campo `prof`), para que uma pessoa
possa ser administradora e profissional ao mesmo tempo.

## Fluxo de um agendamento
WhatsApp → recepção cadastra a cliente e cria o agendamento (**Pendente**) → recepção confirma
(**Confirmado**) e envia a mensagem → profissional **Inicia** e **Conclui** → histórico e indicadores.
Também: **Cancelado** e **Não compareceu**.

## Como o código está organizado
- `dados.js` guarda os dados e as funções de leitura/gravação (`Dados.ler`, `adicionar`, `atualizar`, `remover`).
  É o único arquivo que será substituído quando houver banco de dados.
- `app.js` monta o menu por perfil, protege as páginas e reúne o que é comum a todas as telas.
- `paginas.js` tem uma função por tela.

## Próximos passos (depois de validar com a Izabella)
1. Banco de dados e login real (e-mail e senha de verdade).
2. Permissões garantidas no banco, não só nos botões.
3. Regras reais de financeiro (comissão, formas de pagamento), estoque e inscrições em cursos.
4. Envio da confirmação direto pelo WhatsApp.
5. Integração com o site público (item "Entrar" no menu).
6. Cuidados com a LGPD: guardar só os dados necessários dos clientes.
