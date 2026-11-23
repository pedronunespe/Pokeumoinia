// Arquivo: public/dashboard/configuracoes.js
// Controla o perfil do treinador e o cadastro de gerações/tipos da dashboard.
// PORQUE: são configurações de base para os formulários de Pokémon e para os anos de jornada.

document.addEventListener("DOMContentLoaded", function () {
    if (!idUsuarioLogado()) {
        return;
    }
    carregarPaginaConfiguracoes();
});

// Busca perfil, Pokémon (para o favorito), gerações e tipos.
async function carregarPaginaConfiguracoes() {
    try {
        await Promise.all([carregarPerfil(), carregarPokemons(), carregarGeracoes(), carregarTipos()]);
    } catch (erro) {
        mostrarMensagem("mensagem_config", "Não foi possível carregar as configurações: " + erro.message, "erro");
    }
}

// Preenche o formulário do perfil 1:1 do usuário.
async function carregarPerfil() {
    var perfil = await api("/perfil/" + encodeURIComponent(idUsuarioLogado()));
    document.getElementById("cfg_apelido").value = perfil.apelido;
    document.getElementById("cfg_ano").value = perfil.anoInicio;
    document.getElementById("cfg_favorito").value = perfil.fkPokemonFavorito || "";
}

// Preenche o select de Pokémon favorito.
async function carregarPokemons() {
    var pokemons = await api("/pokemons");
    preencherSelect("cfg_favorito", pokemons, "idPokemon", "nome", "Nenhum");
}

// Lista as gerações cadastradas.
async function carregarGeracoes() {
    var geracoes = await api("/catalogos/geracoes");
    var corpo = document.getElementById("corpo_geracoes");
    corpo.innerHTML = "";
    for (var i = 0; i < geracoes.length; i++) {
        var linha = document.createElement("tr");
        var celulaNumero = document.createElement("td");
        celulaNumero.textContent = geracoes[i].numero;
        var celulaRegiao = document.createElement("td");
        celulaRegiao.textContent = geracoes[i].regiao;
        linha.appendChild(celulaNumero);
        linha.appendChild(celulaRegiao);
        corpo.appendChild(linha);
    }
}

// Lista os tipos com uma amostra da cor usada nos gráficos.
async function carregarTipos() {
    var tipos = await api("/catalogos/tipos");
    var corpo = document.getElementById("corpo_tipos");
    corpo.innerHTML = "";
    for (var i = 0; i < tipos.length; i++) {
        var linha = document.createElement("tr");
        var celulaCor = document.createElement("td");
        var amostra = document.createElement("span");
        amostra.className = "cor-amostra";
        amostra.style.backgroundColor = tipos[i].cor;
        celulaCor.appendChild(amostra);
        var celulaNome = document.createElement("td");
        celulaNome.textContent = tipos[i].nome;
        linha.appendChild(celulaCor);
        linha.appendChild(celulaNome);
        corpo.appendChild(linha);
    }
}

// Salva apelido, ano de início e favorito.
async function salvarPerfil() {
    try {
        await api("/perfil/" + encodeURIComponent(idUsuarioLogado()), {
            method: "PUT",
            body: JSON.stringify({
                apelido: valor("cfg_apelido"),
                anoInicio: valor("cfg_ano"),
                fkPokemonFavorito: valor("cfg_favorito")
            })
        });
        mostrarMensagem("mensagem_config", "Perfil salvo.", "sucesso");
    } catch (erro) {
        mostrarMensagem("mensagem_config", erro.message, "erro");
    }
}

// Cadastra uma geração e atualiza a tabela da seção.
async function cadastrarGeracao() {
    try {
        await api("/catalogos/geracoes", {
            method: "POST",
            body: JSON.stringify({
                numero: valor("cfg_gen_numero"),
                regiao: valor("cfg_gen_regiao")
            })
        });
        mostrarMensagem("mensagem_config", "Geração cadastrada.", "sucesso");
        document.getElementById("cfg_gen_numero").value = "";
        document.getElementById("cfg_gen_regiao").value = "";
        await carregarGeracoes();
    } catch (erro) {
        mostrarMensagem("mensagem_config", erro.message, "erro");
    }
}

// Cadastra um tipo e atualiza a tabela da seção.
async function cadastrarTipo() {
    try {
        await api("/catalogos/tipos", {
            method: "POST",
            body: JSON.stringify({
                nome: valor("cfg_tipo_nome"),
                cor: valor("cfg_tipo_cor")
            })
        });
        mostrarMensagem("mensagem_config", "Tipo cadastrado.", "sucesso");
        document.getElementById("cfg_tipo_nome").value = "";
        await carregarTipos();
    } catch (erro) {
        mostrarMensagem("mensagem_config", erro.message, "erro");
    }
}
