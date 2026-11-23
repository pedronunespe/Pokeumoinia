// Arquivo: src/models/pokemonModel.js
// Consultas de escrita e leitura do catálogo de Pokémon e dos seus tipos.
// PORQUE: a dashboard precisa de Pokémon cadastrados para montar os times e calcular os gráficos.

var database = require("../database/config");

// Monta a consulta base. Se receber um id, filtra um único Pokémon.
function montarConsulta(idPokemon) {
    var instrucaoSql = `
        SELECT p.idPokemon, p.nome,
               g.idGeracao, g.numero AS geracao,
               p.ps, p.ataque, p.defesa, p.atqEsp, p.defEsp, p.velocidade,
               COALESCE(GROUP_CONCAT(t.idTipo ORDER BY pt.slot SEPARATOR ','), '') AS tipoIds,
               COALESCE(GROUP_CONCAT(t.nome ORDER BY pt.slot SEPARATOR ','), '') AS tipos,
               COALESCE(GROUP_CONCAT(t.cor ORDER BY pt.slot SEPARATOR ','), '') AS cores
        FROM pokemon p
        JOIN geracao g ON g.idGeracao = p.fkGeracao
        LEFT JOIN pokemonTipo pt ON pt.fkPokemon = p.idPokemon
        LEFT JOIN tipo t ON t.idTipo = pt.fkTipo
    `;

    if (idPokemon !== undefined) {
        // O "?" mantém o id como parâmetro seguro, nunca concatenado na SQL.
        instrucaoSql += " WHERE p.idPokemon = ?";
    }

    instrucaoSql += `
        GROUP BY p.idPokemon, p.nome, g.idGeracao, g.numero,
                 p.ps, p.ataque, p.defesa, p.atqEsp, p.defEsp, p.velocidade
        ORDER BY p.nome;
    `;
    return instrucaoSql;
}

// Transforma as colunas GROUP_CONCAT (texto separado por vírgula) em arrays para o front-end.
function formatarLinhas(linhas) {
    var i = 0;
    for (i = 0; i < linhas.length; i++) {
        var linha = linhas[i];
        linha.tipoIds = linha.tipoIds ? linha.tipoIds.split(",").map(Number) : [];
        linha.tipos = linha.tipos ? linha.tipos.split(",") : [];
        linha.cores = linha.cores ? linha.cores.split(",") : [];
        linha.status = [
            linha.ps,
            linha.ataque,
            linha.defesa,
            linha.atqEsp,
            linha.defEsp,
            linha.velocidade
        ];
    }
    return linhas;
}

// Lista todos os Pokémon do catálogo.
function listar() {
    return database.executar(montarConsulta(), []).then(formatarLinhas);
}

// Busca um Pokémon específico (usado pelo formulário de edição).
function buscar(idPokemon) {
    return database.executar(montarConsulta(idPokemon), [idPokemon]).then(formatarLinhas);
}

// Apaga os tipos antigos e grava os novos, na ordem de slot (1 = principal, 2 = secundário).
function vincularTipos(idPokemon, tipoIds) {
    var sqlRemover = `DELETE FROM pokemonTipo WHERE fkPokemon = ?;`;
    var sqlInserir = `INSERT INTO pokemonTipo (fkPokemon, fkTipo, slot) VALUES (?, ?, ?);`;

    return database.executar(sqlRemover, [idPokemon]).then(function () {
        // Encadeamos os INSERTs para não disparar várias conexões ao mesmo tempo.
        var cadeia = Promise.resolve();
        var i = 0;
        for (i = 0; i < tipoIds.length; i++) {
            (function (idTipo, slot) {
                cadeia = cadeia.then(function () {
                    return database.executar(sqlInserir, [idPokemon, idTipo, slot]);
                });
            })(tipoIds[i], i + 1);
        }
        return cadeia;
    });
}

// Insere o Pokémon e, em seguida, os seus tipos.
function criar(dados) {
    var instrucaoSql = `
        INSERT INTO pokemon
            (nome, fkGeracao, ps, ataque, defesa, atqEsp, defEsp, velocidade)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?);
    `;
    var parametros = [
        dados.nome,
        dados.idGeracao,
        dados.ps,
        dados.ataque,
        dados.defesa,
        dados.atqEsp,
        dados.defEsp,
        dados.velocidade
    ];

    return database.executar(instrucaoSql, parametros).then(function (resultado) {
        var idPokemon = resultado.insertId;

        // Como não usamos transação, se vincular os tipos falhar removemos o Pokémon criado.
        return vincularTipos(idPokemon, dados.tipoIds).then(function () {
            return { idPokemon: idPokemon };
        }).catch(function (erro) {
            return database.executar(`DELETE FROM pokemon WHERE idPokemon = ?;`, [idPokemon])
                .then(function () { throw erro; }, function () { throw erro; });
        });
    });
}

// Atualiza os status/a geração e troca os tipos do Pokémon.
function atualizar(idPokemon, dados) {
    var instrucaoSql = `
        UPDATE pokemon
        SET nome = ?, fkGeracao = ?, ps = ?, ataque = ?, defesa = ?,
            atqEsp = ?, defEsp = ?, velocidade = ?
        WHERE idPokemon = ?;
    `;
    var parametros = [
        dados.nome,
        dados.idGeracao,
        dados.ps,
        dados.ataque,
        dados.defesa,
        dados.atqEsp,
        dados.defEsp,
        dados.velocidade,
        idPokemon
    ];

    return database.executar(instrucaoSql, parametros).then(function () {
        return vincularTipos(idPokemon, dados.tipoIds);
    }).then(function () {
        return { idPokemon: idPokemon };
    });
}

// Exclui um Pokémon liberando antes as tabelas que apontam para ele.
function excluir(idPokemon) {
    // O schema não usa ON DELETE CASCADE, então a ordem dos DELETEs importa.
    var passos = [
        { sql: `DELETE FROM timePokemon WHERE fkPokemon = ?;`, params: [idPokemon] },
        { sql: `DELETE FROM pokemonTipo WHERE fkPokemon = ?;`, params: [idPokemon] },
        { sql: `UPDATE perfilTreinador SET fkPokemonFavorito = NULL WHERE fkPokemonFavorito = ?;`, params: [idPokemon] },
        { sql: `DELETE FROM pokemon WHERE idPokemon = ?;`, params: [idPokemon] }
    ];

    var cadeia = Promise.resolve();
    passos.forEach(function (passo) {
        cadeia = cadeia.then(function () {
            return database.executar(passo.sql, passo.params);
        });
    });
    return cadeia;
}

module.exports = {
    listar,
    buscar,
    criar,
    atualizar,
    excluir
};
