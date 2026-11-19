// Model com os comandos SQL das medidas.
var medidaModel = require("../models/medidaModel");

// Busca as últimas 7 medidas registradas para um aquário.
function buscarUltimasMedidas(req, res) {

    // Quantidade de registros retornados para o gráfico.
    const limite_linhas = 7;

    var idAquario = req.params.idAquario;

    console.log(`Recuperando as ultimas ${limite_linhas} medidas`);

    // Devolve as medidas ou 204 quando o aquário não tem registros.
    medidaModel.buscarUltimasMedidas(idAquario, limite_linhas).then(function (resultado) {
        if (resultado.length > 0) {
            res.status(200).json(resultado);
        } else {
            res.status(204).send("Nenhum resultado encontrado!")
        }
    }).catch(function (erro) {
        console.log(erro);
        console.log("Houve um erro ao buscar as ultimas medidas.", erro.sqlMessage);
        res.status(500).json(erro.sqlMessage);
    });
}


// Busca a medição mais recente de um aquário (usada nos alertas).
function buscarMedidasEmTempoReal(req, res) {

    var idAquario = req.params.idAquario;

    console.log(`Recuperando medidas em tempo real`);

    medidaModel.buscarMedidasEmTempoReal(idAquario).then(function (resultado) {
        if (resultado.length > 0) {
            res.status(200).json(resultado);
        } else {
            res.status(204).send("Nenhum resultado encontrado!")
        }
    }).catch(function (erro) {
        console.log(erro);
        console.log("Houve um erro ao buscar as ultimas medidas.", erro.sqlMessage);
        res.status(500).json(erro.sqlMessage);
    });
}

// Exporta as funções usadas pelo roteador de medidas.
module.exports = {
    buscarUltimasMedidas,
    buscarMedidasEmTempoReal

}
