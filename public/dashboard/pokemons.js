 
 
 

document.addEventListener("DOMContentLoaded", function () {
    carregarPaginaPokemons();
});

 
async function carregarPaginaPokemons() {
    try {
        await Promise.all([carregarGeraoes(), carregarTipos(), carregarPokemons()]);
    } catch (erro) {
        mostrarMensagem("mensagem_pokemons", "Não foi possível carregar o catálogo: " + erro.message, "erro");
    }
}

 
async function carregarGeraoes() {
    var geracoes = await api("/catalogos/geracoes");
    var formatadas = [];
    for (var i = 0; i < geracoes.length; i++) {
        formatadas.push({
            idGeracao: geracoes[i].idGeracao,
            rotulo: geracoes[i].numero + " - " + geracoes[i].regiao
        });
    }
    preencherSelect("pk_geracao", formatadas, "idGeracao", "rotulo", "Escolha a geração...");
}

 
async function carregarTipos() {
    var tipos = await api("/catalogos/tipos");
    preencherSelect("pk_tipo1", tipos, "idTipo", "nome", "Escolha o tipo principal...");
    preencherSelect("pk_tipo2", tipos, "idTipo", "nome", "Nenhum (opcional)");
}

 
async function carregarPokemons() {
    var pokemons = await api("/pokemons");
    var corpo = document.getElementById("corpo_pokemons");
    corpo.innerHTML = "";
    if (pokemons.length === 0) {
        corpo.innerHTML = '<tr><td colspan="5" class="vazio">Nenhum Pokémon cadastrado. Use o formulário acima.</td></tr>';
        return;
    }

    for (var i = 0; i < pokemons.length; i++) {
        var pokemon = pokemons[i];
        var bst = 0;
        for (var j = 0; j < pokemon.status.length; j++) {
            bst += Number(pokemon.status[j]);
        }

        var linha = document.createElement("tr");
        var celulaNome = document.createElement("td");
        celulaNome.textContent = pokemon.nome;

        var celulaTipos = document.createElement("td");
        celulaTipos.textContent = pokemon.tipos.length ? pokemon.tipos.join(" / ") : "-";

        var celulaGeracao = document.createElement("td");
        celulaGeracao.textContent = pokemon.geracao;

        var celulaBst = document.createElement("td");
        celulaBst.textContent = bst;

        var celulaAcoes = document.createElement("td");
        celulaAcoes.className = "acoes";
        var botaoEditar = null;
        var botaoExcluir = null;
         
        (function (pokemonDaLinha) {
            botaoEditar = document.createElement("button");
            botaoEditar.type = "button";
            botaoEditar.textContent = "Editar";
            botaoEditar.addEventListener("click", function () {
                preencherFormularioPokemon(pokemonDaLinha);
            });
            botaoExcluir = document.createElement("button");
            botaoExcluir.type = "button";
            botaoExcluir.textContent = "Excluir";
            botaoExcluir.className = "excluir";
            botaoExcluir.addEventListener("click", function () {
                excluirPokemon(pokemonDaLinha.idPokemon, pokemonDaLinha.nome);
            });
        })(pokemon);
        celulaAcoes.appendChild(botaoEditar);
        celulaAcoes.appendChild(botaoExcluir);

        linha.appendChild(celulaNome);
        linha.appendChild(celulaTipos);
        linha.appendChild(celulaGeracao);
        linha.appendChild(celulaBst);
        linha.appendChild(celulaAcoes);
        corpo.appendChild(linha);
    }
}

 
async function salvarPokemon() {
    var id = valor("pk_id");
    var tipoIds = [];
    if (valor("pk_tipo1")) {
        tipoIds.push(valor("pk_tipo1"));
    }
    if (valor("pk_tipo2")) {
        tipoIds.push(valor("pk_tipo2"));
    }

    var dados = {
        nome: valor("pk_nome"),
        idGeracao: valor("pk_geracao"),
        tipoIds: tipoIds,
        ps: valor("pk_ps"),
        ataque: valor("pk_ataque"),
        defesa: valor("pk_defesa"),
        atqEsp: valor("pk_atqesp"),
        defEsp: valor("pk_defesp"),
        velocidade: valor("pk_velocidade")
    };

    try {
        await api(id ? "/pokemons/" + id : "/pokemons", {
            method: id ? "PUT" : "POST",
            body: JSON.stringify(dados)
        });
        mostrarMensagem("mensagem_pokemons", id ? "Pokémon atualizado." : "Pokémon cadastrado.", "sucesso");
        limparFormularioPokemon();
        await carregarPokemons();
    } catch (erro) {
        mostrarMensagem("mensagem_pokemons", erro.message, "erro");
    }
}

 
function preencherFormularioPokemon(pokemon) {
    document.getElementById("pk_id").value = pokemon.idPokemon;
    document.getElementById("pk_nome").value = pokemon.nome;
    document.getElementById("pk_geracao").value = pokemon.idGeracao;
    document.getElementById("pk_tipo1").value = pokemon.tipoIds[0] || "";
    document.getElementById("pk_tipo2").value = pokemon.tipoIds[1] || "";
    document.getElementById("pk_ps").value = pokemon.ps;
    document.getElementById("pk_ataque").value = pokemon.ataque;
    document.getElementById("pk_defesa").value = pokemon.defesa;
    document.getElementById("pk_atqesp").value = pokemon.atqEsp;
    document.getElementById("pk_defesp").value = pokemon.defEsp;
    document.getElementById("pk_velocidade").value = pokemon.velocidade;
    document.getElementById("titulo_formulario").textContent = "Editando " + pokemon.nome;
    document.getElementById("botao_salvar_pokemon").textContent = "Atualizar Pokémon";
    document.getElementById("pk_nome").focus();
}

 
function limparFormularioPokemon() {
    var campos = ["pk_id", "pk_nome", "pk_tipo1", "pk_tipo2", "pk_ps", "pk_ataque",
        "pk_defesa", "pk_atqesp", "pk_defesp", "pk_velocidade"];
    for (var i = 0; i < campos.length; i++) {
        document.getElementById(campos[i]).value = "";
    }
    document.getElementById("pk_geracao").selectedIndex = 0;
    document.getElementById("titulo_formulario").textContent = "Cadastrar Pokémon";
    document.getElementById("botao_salvar_pokemon").textContent = "Cadastrar Pokémon";
}

 
async function excluirPokemon(idPokemon, nome) {
    if (!confirm("Excluir " + nome + " do catálogo? Ele também será removido dos times.")) {
        return;
    }
    try {
        await api("/pokemons/" + idPokemon, { method: "DELETE" });
        mostrarMensagem("mensagem_pokemons", nome + " excluído do catálogo.", "sucesso");
        await carregarPokemons();
    } catch (erro) {
        mostrarMensagem("mensagem_pokemons", erro.message, "erro");
    }
}
