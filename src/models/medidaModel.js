// Módulo responsável por executar os comandos no banco de dados.
var database = require("../database/config");

// Busca as últimas medidas de um aquário para montar o gráfico.
function buscarUltimasMedidas(idAquario, limite_linhas) {

    // Seleciona temperatura e horário formatado, do mais recente para o mais antigo.
    var instrucaoSql = `SELECT 
                        temperatura,
                        momento,
                        DATE_FORMAT(momento,'%H:%i:%s') as momento_grafico
                    FROM medida
                    WHERE fk_aquario = ${idAquario}
                    ORDER BY id DESC LIMIT ${limite_linhas}`;

    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

// Busca apenas a medição mais recente de um aquário.
function buscarMedidasEmTempoReal(idAquario) {

    // O LIMIT 1 garante que venha somente a última temperatura registrada.
    var instrucaoSql = `SELECT 
                        temperatura,
                        DATE_FORMAT(momento,'%H:%i:%s') as momento_grafico, 
                        fk_aquario 
                        FROM medida WHERE fk_aquario = ${idAquario} 
                    ORDER BY id DESC LIMIT 1`;

    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

// Exporta as consultas usadas pelo controller de medidas.
module.exports = {
    buscarUltimasMedidas,
    buscarMedidasEmTempoReal
}
