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

    // ALTERAÇÃO: consulta 5 - tipos distintos dos Pokémon do usuário e catálogo completo de cores. PORQUE: evita duplicatas de tipo se o mesmo Pokémon for usado em múltiplos jogos/times.
    var sqlTipos = `
        SELECT DISTINCT pt.fkPokemon AS idPokemon, pt.slot AS slot, t.nome AS tipo, t.cor AS cor
        FROM pokemonTipo pt
        JOIN tipo t ON t.idTipo = pt.fkTipo
        JOIN timePokemon tp ON tp.fkPokemon = pt.fkPokemon
        JOIN usuarioJogo uj ON uj.idUsuarioJogo = tp.fkUsuarioJogo
        WHERE uj.fkUsuario = ?
        UNION
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

        // ALTERAÇÃO: monta anos[] e horasAno[] a partir do resultado agrupado. PORQUE: o formato do gráfico de barras espera vetores paralelos.
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

        // ALTERAÇÃO: agrupa tipos por Pokémon e cataloga cores por nome de tipo antes de montar os times. PORQUE: garante que cada instância do Pokémon receba seus tipos sem risco de sobrescrita.
        var tiposPorPokemon = {};
        var coresTipos = {};
        for (i = 0; i < tiposBanco.length; i++) {
            var idPokemon = tiposBanco[i].idPokemon;
            if (idPokemon !== null && idPokemon !== undefined) {
                if (!tiposPorPokemon[idPokemon]) {
                    tiposPorPokemon[idPokemon] = [];
                }
                if (tiposPorPokemon[idPokemon].indexOf(tiposBanco[i].tipo) === -1) {
                    tiposPorPokemon[idPokemon].push(tiposBanco[i].tipo);
                }
            }
            if (tiposBanco[i].tipo) {
                coresTipos[tiposBanco[i].tipo] = tiposBanco[i].cor;
            }
        }

        // ALTERAÇÃO: monta cada Pokémon do time com status[6] na ordem PS, ataque, defesa, atqEsp, defEsp, velocidade e seus tipos. PORQUE: alimenta o cálculo de BST, radar e predominância por jogo.
        for (i = 0; i < timesBanco.length; i++) {
            var linhaPokemon = timesBanco[i];
            var pokemon = {
                nome: linhaPokemon.nome,
                tipos: tiposPorPokemon[linhaPokemon.idPokemon] ? tiposPorPokemon[linhaPokemon.idPokemon].slice() : [],
                geracao: linhaPokemon.geracao,
                status: [
                    Number(linhaPokemon.ps) || 0,
                    Number(linhaPokemon.ataque) || 0,
                    Number(linhaPokemon.defesa) || 0,
                    Number(linhaPokemon.atqEsp) || 0,
                    Number(linhaPokemon.defEsp) || 0,
                    Number(linhaPokemon.velocidade) || 0
                ]
            };
            if (jogosPorId[linhaPokemon.fkUsuarioJogo]) {
                jogosPorId[linhaPokemon.fkUsuarioJogo].time.push(pokemon);
            }
        }

        // ALTERAÇÃO: devolve o objeto completo com os dados consolidados do usuário. PORQUE: o front-end consome anosJornada, anos, horasAno, jogos e coresTipos diretamente.
        return {
            anosJornada: perfil.length > 0 && perfil[0].anosJornada !== null ? Number(perfil[0].anosJornada) : 0,
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
