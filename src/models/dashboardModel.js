// ALTERAÇÃO: novo model de dashboard. PORQUE: o painel precisa ler os dados do esquema pokeumonia.
var database = require("../database/config");

// ALTERAÇÃO: busca única do painel com 5 consultas parametrizadas em Promise.all. PORQUE: evita N+1 consultas e mantém os valores ligados ao usuário.
function buscarDados(idUsuario) {
    // ALTERAÇÃO: consulta 1 - anos de jornada a partir de perfilTreinador.anoInicio. PORQUE: o perfil é 1:1 com o usuário.
    var sqlPerfil = `
        SELECT YEAR(CURDATE()) - pt.anoInicio AS anosJornada
        FROM perfilTreinador pt
        WHERE pt.fkUsuario = ?;
    `;

    // ALTERAÇÃO: consulta 2 - jogos do usuário com nota e total de horas. PORQUE: alimenta a lista de jogos do dashboard.
    var sqlJogos = `
        SELECT uj.idUsuarioJogo, j.nome, uj.nota, COALESCE(SUM(rh.horas), 0) AS horas
        FROM usuarioJogo uj
        JOIN jogo j ON j.idJogo = uj.fkJogo
        LEFT JOIN registroHoras rh ON rh.fkUsuarioJogo = uj.idUsuarioJogo
        WHERE uj.fkUsuario = ?
        GROUP BY uj.idUsuarioJogo, j.nome, uj.nota
        ORDER BY j.nome;
    `;

    // ALTERAÇÃO: consulta 3 - horas jogadas por ano. PORQUE: alimenta a linha do tempo.
    var sqlHorasAno = `
        SELECT rh.ano, SUM(rh.horas) AS horas
        FROM registroHoras rh
        JOIN usuarioJogo uj ON uj.idUsuarioJogo = rh.fkUsuarioJogo
        WHERE uj.fkUsuario = ?
        GROUP BY rh.ano
        ORDER BY rh.ano;
    `;

    // ALTERAÇÃO: consulta 4 - os 6 Pokémon de cada time com status e geração. PORQUE: alimenta os times de cada jogo.
    var sqlTimes = `
        SELECT tp.fkUsuarioJogo, p.idPokemon, p.nome, g.numero AS geracao,
               p.ps, p.ataque, p.defesa, p.atqEsp, p.defEsp, p.velocidade
        FROM timePokemon tp
        JOIN pokemon p ON p.idPokemon = tp.fkPokemon
        JOIN geracao g ON g.idGeracao = p.fkGeracao
        JOIN usuarioJogo uj ON uj.idUsuarioJogo = tp.fkUsuarioJogo
        WHERE uj.fkUsuario = ?
        ORDER BY tp.fkUsuarioJogo, tp.posicao;
    `;

    // ALTERAÇÃO: consulta 5 - tipos dos Pokémon do usuário e catálogo completo de cores. PORQUE: monta tipos[] e coresTipos sem nova consulta.
    var sqlTipos = `
        SELECT pt.fkPokemon AS idPokemon, pt.slot AS slot, t.nome AS tipo, t.cor AS cor
        FROM pokemonTipo pt
        JOIN tipo t ON t.idTipo = pt.fkTipo
        JOIN timePokemon tp ON tp.fkPokemon = pt.fkPokemon
        JOIN usuarioJogo uj ON uj.idUsuarioJogo = tp.fkUsuarioJogo
        WHERE uj.fkUsuario = ?
        UNION ALL
        SELECT NULL AS idPokemon, 0 AS slot, t.nome AS tipo, t.cor AS cor
        FROM tipo t
        ORDER BY idPokemon, slot;
    `;

    return Promise.all([
        database.executar(sqlPerfil, [idUsuario]),
        database.executar(sqlJogos, [idUsuario]),
        database.executar(sqlHorasAno, [idUsuario]),
        database.executar(sqlTimes, [idUsuario]),
        database.executar(sqlTipos, [idUsuario])
    ]).then(function (resultados) {
        var perfil = resultados[0];
        var jogosBanco = resultados[1];
        var horasBanco = resultados[2];
        var timesBanco = resultados[3];
        var tiposBanco = resultados[4];

        var anos = [];
        var horasAno = [];
        var i = 0;

        // ALTERAÇÃO: monta anos[] e horasAno[] a partir do resultado agrupado. PORQUE: o formato do gráfico espera vetores paralelos.
        for (i = 0; i < horasBanco.length; i++) {
            anos.push(horasBanco[i].ano);
            horasAno.push(Number(horasBanco[i].horas));
        }

        var jogos = [];
        var jogosPorId = {};
        // ALTERAÇÃO: monta jogos com nome, horas, nota e time vazio. PORQUE: os Pokémon serão encaixados pelo idUsuarioJogo.
        for (i = 0; i < jogosBanco.length; i++) {
            var linhaJogo = jogosBanco[i];
            var jogo = {
                nome: linhaJogo.nome,
                horas: Number(linhaJogo.horas),
                nota: Number(linhaJogo.nota),
                time: []
            };
            jogosPorId[linhaJogo.idUsuarioJogo] = jogo;
            jogos.push(jogo);
        }

        var pokemonPorId = {};
        // ALTERAÇÃO: monta cada Pokémon do time com status[6] na ordem PS, ataque, defesa, atqEsp, defEsp, velocidade. PORQUE: é o formato usado no dashboard.
        for (i = 0; i < timesBanco.length; i++) {
            var linhaPokemon = timesBanco[i];
            var pokemon = {
                nome: linhaPokemon.nome,
                tipos: [],
                geracao: linhaPokemon.geracao,
                status: [
                    linhaPokemon.ps,
                    linhaPokemon.ataque,
                    linhaPokemon.defesa,
                    linhaPokemon.atqEsp,
                    linhaPokemon.defEsp,
                    linhaPokemon.velocidade
                ]
            };
            pokemonPorId[linhaPokemon.idPokemon] = pokemon;
            if (jogosPorId[linhaPokemon.fkUsuarioJogo]) {
                jogosPorId[linhaPokemon.fkUsuarioJogo].time.push(pokemon);
            }
        }

        var tiposPorPokemon = {};
        var coresTipos = {};
        // ALTERAÇÃO: agrupa tipos por Pokémon e cores por nome de tipo. PORQUE: tipos[] e coresTipos saem da mesma consulta.
        for (i = 0; i < tiposBanco.length; i++) {
            var idPokemon = tiposBanco[i].idPokemon;
            if (idPokemon !== null) {
                if (!tiposPorPokemon[idPokemon]) {
                    tiposPorPokemon[idPokemon] = [];
                }
                tiposPorPokemon[idPokemon].push(tiposBanco[i].tipo);
            }
            coresTipos[tiposBanco[i].tipo] = tiposBanco[i].cor;
        }

        // ALTERAÇÃO: preenche tipos[] de cada Pokémon usando o slot ordenado do banco. PORQUE: mantém tipo principal antes do secundário.
        for (var idPokemonKey in pokemonPorId) {
            if (Object.prototype.hasOwnProperty.call(pokemonPorId, idPokemonKey)) {
                pokemonPorId[idPokemonKey].tipos = tiposPorPokemon[idPokemonKey] || [];
            }
        }

        // ALTERAÇÃO: devolve o objeto completo esperado pela rota. PORQUE: o controller apenas repassa a resposta.
        return {
            anosJornada: perfil.length > 0 ? Number(perfil[0].anosJornada) : 0,
            anos: anos,
            horasAno: horasAno,
            jogos: jogos,
            coresTipos: coresTipos
        };
    });
}

// ALTERAÇÃO: buscaDados exportado. PORQUE: o controller de dashboard precisa chamá-la.
module.exports = {
    buscarDados
};
