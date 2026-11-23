// Arquivo: public/dashboard/times.js
// Controla a montagem dos times por jogo e por posição (1 a 6).
// PORQUE: a dashboard usa essas posições para calcular status, tipos e gerações.

document.addEventListener("DOMContentLoaded", function () {
    if (!idUsuarioLogado()) {
        return;
    }
    carregarPaginaTimes();
});

// Carrega jogos do usuário, Pokémon disponíveis e as posições já ocupadas.
async function carregarPaginaTimes() {
    try {
        await Promise.all([carregarJogos(), carregarPokemons(), carregarTimes()]);
    } catch (erro) {
        mostrarMensagem("mensagem_times", "Não foi possível carregar os times: " + erro.message, "erro");
    }
}

// Somente jogos já vinculados à jornada podem receber um time.
async function carregarJogos() {
    var jogos = await api("/jogos/usuario/" + encodeURIComponent(idUsuarioLogado()));
    preencherSelect("time_jogo", jogos, "idUsuarioJogo", "nome", "Escolha um jogo...");
}

// Gera as seis posições do time.
function carregarPosicoes() {
    var posicoes = [];
    for (var i = 1; i <= 6; i++) {
        posicoes.push({ posicao: i, rotulo: "Posição " + i });
    }
    preencherSelect("time_posicao", posicoes, "posicao", "rotulo", "Escolha a posição...");
}

// Carrega o catálogo de Pokémon para o select.
async function carregarPokemons() {
    var pokemons = await api("/pokemons");
    preencherSelect("time_pokemon", pokemons, "idPokemon", "nome", "Escolha um Pokémon...");
}

// Lista as posições ocupadas dos times do usuário.
async function carregarTimes() {
    var times = await api("/times/" + encodeURIComponent(idUsuarioLogado()));
    var corpo = document.getElementById("corpo_times");
    corpo.innerHTML = "";
    if (times.length === 0) {
        corpo.innerHTML = '<tr><td colspan="4" class="vazio">Nenhuma posição ocupada. Monte seu primeiro time acima.</td></tr>';
        return;
    }

    for (var i = 0; i < times.length; i++) {
        var linha = document.createElement("tr");
        var celulaJogo = document.createElement("td");
        celulaJogo.textContent = times[i].jogo;
        var celulaPosicao = document.createElement("td");
        celulaPosicao.textContent = times[i].posicao;
        var celulaPokemon = document.createElement("td");
        celulaPokemon.textContent = times[i].pokemon;
        var celulaAcoes = document.createElement("td");
        celulaAcoes.className = "acoes";

        // Capturamos os ids desta linha para o botão de excluir.
        (function (idUsuarioJogo, posicao, nomePokemon) {
            var botao = document.createElement("button");
            botao.type = "button";
            botao.textContent = "Remover";
            botao.className = "excluir";
            botao.addEventListener("click", function () {
                removerTime(idUsuarioJogo, posicao, nomePokemon);
            });
            celulaAcoes.appendChild(botao);
        })(times[i].fkUsuarioJogo, times[i].posicao, times[i].pokemon);

        linha.appendChild(celulaJogo);
        linha.appendChild(celulaPosicao);
        linha.appendChild(celulaPokemon);
        linha.appendChild(celulaAcoes);
        corpo.appendChild(linha);
    }
}

// Insere ou substitui a posição escolhida.
async function salvarTime() {
    try {
        await api("/times/" + encodeURIComponent(idUsuarioLogado()), {
            method: "POST",
            body: JSON.stringify({
                idUsuarioJogo: valor("time_jogo"),
                posicao: valor("time_posicao"),
                idPokemon: valor("time_pokemon")
            })
        });
        mostrarMensagem("mensagem_times", "Pokémon salvo no time.", "sucesso");
        await carregarTimes();
    } catch (erro) {
        mostrarMensagem("mensagem_times", erro.message, "erro");
    }
}

// Libera uma posição do time.
async function removerTime(idUsuarioJogo, posicao, nomePokemon) {
    if (!confirm("Remover " + nomePokemon + " da posição " + posicao + "?")) {
        return;
    }
    try {
        await api("/times/" + encodeURIComponent(idUsuarioLogado()) + "/" + idUsuarioJogo + "/" + posicao, {
            method: "DELETE"
        });
        mostrarMensagem("mensagem_times", "Posição liberada.", "sucesso");
        await carregarTimes();
    } catch (erro) {
        mostrarMensagem("mensagem_times", erro.message, "erro");
    }
}

// As posições são fixas, então bastam chamar uma vez após o DOM existir.
carregarPosicoes();
