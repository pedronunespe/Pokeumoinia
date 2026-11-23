// Arquivo: public/dashboard/jogos.js
// Controla a página de jogos: catálogo, vínculo com a jornada, notas e horas por ano.
// PORQUE: cada alteração aqui alimenta diretamente os gráficos da dashboard.

document.addEventListener("DOMContentLoaded", function () {
    if (!idUsuarioLogado()) {
        return;
    }
    carregarPaginaJogos();
});

// Carrega as três listas usadas na página.
async function carregarPaginaJogos() {
    try {
        await Promise.all([carregarCatalogo(), carregarMeusJogos(), carregarHoras()]);
    } catch (erro) {
        mostrarMensagem("mensagem_jogos", "Não foi possível carregar os jogos: " + erro.message, "erro");
    }
}

// Preenche o select de jogos disponíveis para adicionar à jornada.
async function carregarCatalogo() {
    var jogos = await api("/jogos/catalogo");
    preencherSelect("jogo_catalogo", jogos, "idJogo", "nome", "Escolha um jogo...");
}

// Preenche a tabela de jogos do usuário e o select usado no formulário de horas.
async function carregarMeusJogos() {
    var jogos = await api("/jogos/usuario/" + encodeURIComponent(idUsuarioLogado()));
    preencherSelect("hora_jogo", jogos, "idUsuarioJogo", "nome", "Escolha um jogo...");

    var corpo = document.getElementById("corpo_jogos");
    corpo.innerHTML = "";
    if (jogos.length === 0) {
        corpo.innerHTML = '<tr><td colspan="4" class="vazio">Nenhum jogo vinculado. Cadastre um acima para começar.</td></tr>';
        return;
    }

    for (var i = 0; i < jogos.length; i++) {
        var jogo = jogos[i];
        var linha = document.createElement("tr");

        var celulaNome = document.createElement("td");
        celulaNome.textContent = jogo.nome;
        var plataforma = document.createElement("small");
        plataforma.textContent = " " + (jogo.plataforma || "sem plataforma");
        celulaNome.appendChild(plataforma);

        var celulaNota = document.createElement("td");
        celulaNota.textContent = jogo.nota === null ? "-" : Number(jogo.nota).toFixed(1);

        var celulaHoras = document.createElement("td");
        celulaHoras.textContent = Number(jogo.horas) + " h";

        var celulaAcoes = document.createElement("td");
        celulaAcoes.className = "acoes";
        // IIFE guarda os valores desta linha; sem isso os botões usariam sempre o último jogo.
        (function (idUsuarioJogo, nota) {
            celulaAcoes.appendChild(criarBotao("Nota", function () {
                editarNota(idUsuarioJogo, nota);
            }));
            celulaAcoes.appendChild(criarBotao("Remover", function () {
                removerJogoUsuario(idUsuarioJogo);
            }, "excluir"));
        })(jogo.idUsuarioJogo, jogo.nota);

        linha.appendChild(celulaNome);
        linha.appendChild(celulaNota);
        linha.appendChild(celulaHoras);
        linha.appendChild(celulaAcoes);
        corpo.appendChild(linha);
    }
}

// Preenche a tabela de horas por ano.
async function carregarHoras() {
    var registros = await api("/jogos/horas/" + encodeURIComponent(idUsuarioLogado()));
    var corpo = document.getElementById("corpo_horas");
    corpo.innerHTML = "";
    if (registros.length === 0) {
        corpo.innerHTML = '<tr><td colspan="4" class="vazio">Nenhuma hora registrada.</td></tr>';
        return;
    }

    for (var i = 0; i < registros.length; i++) {
        var registro = registros[i];
        var linha = document.createElement("tr");

        var celulaJogo = document.createElement("td");
        celulaJogo.textContent = registro.jogo;
        var celulaAno = document.createElement("td");
        celulaAno.textContent = registro.ano;
        var celulaHoras = document.createElement("td");
        celulaHoras.textContent = Number(registro.horas) + " h";

        var celulaAcoes = document.createElement("td");
        celulaAcoes.className = "acoes";
        // Mesma proteção do loop de jogos: capturamos os valores primitivos da linha.
        (function (idRegistro, ano, horas) {
            celulaAcoes.appendChild(criarBotao("Editar", function () {
                editarHora(idRegistro, ano, horas);
            }));
            celulaAcoes.appendChild(criarBotao("Excluir", function () {
                removerHora(idRegistro);
            }, "excluir"));
        })(registro.idRegistro, registro.ano, registro.horas);

        linha.appendChild(celulaJogo);
        linha.appendChild(celulaAno);
        linha.appendChild(celulaHoras);
        linha.appendChild(celulaAcoes);
        corpo.appendChild(linha);
    }
}

// Cria um botão de ação da tabela com a classe e o clique informados.
function criarBotao(rotulo, acao, classeExtra) {
    var botao = document.createElement("button");
    botao.type = "button";
    botao.textContent = rotulo;
    if (classeExtra) {
        botao.className = classeExtra;
    }
    botao.addEventListener("click", acao);
    return botao;
}

// Cadastra um jogo novo no catálogo global.
async function cadastrarJogoCatalogo() {
    try {
        await api("/jogos/catalogo", {
            method: "POST",
            body: JSON.stringify({
                nome: valor("jogo_nome"),
                plataforma: valor("jogo_plataforma"),
                anoLancamento: valor("jogo_ano")
            })
        });
        mostrarMensagem("mensagem_jogos", "Jogo cadastrado no catálogo.", "sucesso");
        document.getElementById("jogo_nome").value = "";
        document.getElementById("jogo_plataforma").value = "";
        document.getElementById("jogo_ano").value = "";
        await carregarCatalogo();
    } catch (erro) {
        mostrarMensagem("mensagem_jogos", erro.message, "erro");
    }
}

// Vincula ao usuário um jogo que já está no catálogo.
async function adicionarJogoUsuario() {
    try {
        await api("/jogos/usuario/" + encodeURIComponent(idUsuarioLogado()), {
            method: "POST",
            body: JSON.stringify({
                idJogo: valor("jogo_catalogo"),
                nota: valor("nota_jogo")
            })
        });
        mostrarMensagem("mensagem_jogos", "Jogo adicionado à sua jornada.", "sucesso");
        document.getElementById("nota_jogo").value = "";
        await carregarMeusJogos();
    } catch (erro) {
        mostrarMensagem("mensagem_jogos", erro.message, "erro");
    }
}

// Usa prompt para editar a nota (mantém o projeto simples, sem modal próprio).
async function editarNota(idUsuarioJogo, notaAtual) {
    var novaNota = prompt("Nova nota de 0 a 10 (deixe em branco para remover):", notaAtual === null ? "" : notaAtual);
    if (novaNota === null) {
        return;
    }
    try {
        await api("/jogos/usuario/" + encodeURIComponent(idUsuarioLogado()) + "/" + idUsuarioJogo, {
            method: "PUT",
            body: JSON.stringify({ nota: novaNota })
        });
        mostrarMensagem("mensagem_jogos", "Nota atualizada.", "sucesso");
        await carregarMeusJogos();
    } catch (erro) {
        mostrarMensagem("mensagem_jogos", erro.message, "erro");
    }
}

// Remove o vínculo do jogo com o usuário (o model apaga horas e time antes).
async function removerJogoUsuario(idUsuarioJogo) {
    if (!confirm("Remover este jogo? Horas e time vinculados também serão apagados.")) {
        return;
    }
    try {
        await api("/jogos/usuario/" + encodeURIComponent(idUsuarioLogado()) + "/" + idUsuarioJogo, {
            method: "DELETE"
        });
        mostrarMensagem("mensagem_jogos", "Jogo removido da sua jornada.", "sucesso");
        await carregarMeusJogos();
        await carregarHoras();
    } catch (erro) {
        mostrarMensagem("mensagem_jogos", erro.message, "erro");
    }
}

// Insere ou atualiza horas (a API usa UPSERT pela chave jogo + ano).
async function salvarHora() {
    try {
        await api("/jogos/horas/" + encodeURIComponent(idUsuarioLogado()), {
            method: "POST",
            body: JSON.stringify({
                idUsuarioJogo: valor("hora_jogo"),
                ano: valor("ano_hora"),
                horas: valor("horas_hora")
            })
        });
        mostrarMensagem("mensagem_jogos", "Horas salvas.", "sucesso");
        document.getElementById("horas_hora").value = "";
        await carregarHoras();
        await carregarMeusJogos();
    } catch (erro) {
        mostrarMensagem("mensagem_jogos", erro.message, "erro");
    }
}

// Edita ano e horas de um registro específico.
async function editarHora(idRegistro, anoAtual, horasAtual) {
    var novoAno = prompt("Ano:", anoAtual);
    if (novoAno === null) {
        return;
    }
    var novasHoras = prompt("Horas:", horasAtual);
    if (novasHoras === null) {
        return;
    }
    try {
        await api("/jogos/horas/" + encodeURIComponent(idUsuarioLogado()) + "/" + idRegistro, {
            method: "PUT",
            body: JSON.stringify({ ano: novoAno, horas: novasHoras })
        });
        mostrarMensagem("mensagem_jogos", "Registro de horas atualizado.", "sucesso");
        await carregarHoras();
        await carregarMeusJogos();
    } catch (erro) {
        mostrarMensagem("mensagem_jogos", erro.message, "erro");
    }
}

// Exclui um registro de horas.
async function removerHora(idRegistro) {
    if (!confirm("Excluir este registro de horas?")) {
        return;
    }
    try {
        await api("/jogos/horas/" + encodeURIComponent(idUsuarioLogado()) + "/" + idRegistro, {
            method: "DELETE"
        });
        mostrarMensagem("mensagem_jogos", "Registro de horas excluído.", "sucesso");
        await carregarHoras();
        await carregarMeusJogos();
    } catch (erro) {
        mostrarMensagem("mensagem_jogos", erro.message, "erro");
    }
}
