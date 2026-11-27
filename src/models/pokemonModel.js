 
 
 

var database = require("../database/config");

 
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
         
        instrucaoSql += " WHERE p.idPokemon = ?";
    }

    instrucaoSql += `
        GROUP BY p.idPokemon, p.nome, g.idGeracao, g.numero,
                 p.ps, p.ataque, p.defesa, p.atqEsp, p.defEsp, p.velocidade
        ORDER BY p.nome;
    `;
    return instrucaoSql;
}

 
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

 
function listar() {
    return database.executar(montarConsulta(), []).then(formatarLinhas);
}

 
function buscar(idPokemon) {
    return database.executar(montarConsulta(idPokemon), [idPokemon]).then(formatarLinhas);
}

 
function vincularTipos(idPokemon, tipoIds) {
    var sqlRemover = `DELETE FROM pokemonTipo WHERE fkPokemon = ?;`;
    var sqlInserir = `INSERT INTO pokemonTipo (fkPokemon, fkTipo, slot) VALUES (?, ?, ?);`;

    return database.executar(sqlRemover, [idPokemon]).then(function () {
         
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

         
        return vincularTipos(idPokemon, dados.tipoIds).then(function () {
            return { idPokemon: idPokemon };
        }).catch(function (erro) {
            return database.executar(`DELETE FROM pokemon WHERE idPokemon = ?;`, [idPokemon])
                .then(function () { throw erro; }, function () { throw erro; });
        });
    });
}

 
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

 
function excluir(idPokemon) {
     
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
