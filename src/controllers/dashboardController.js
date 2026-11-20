// ALTERAÇÃO: novo controller de dashboard. PORQUE: separa a validação da requisição da montagem dos dados.
var dashboardModel = require("../models/dashboardModel");

// ALTERAÇÃO: nova ação dados() para GET /dashboard/dados/:idUsuario. PORQUE: expõe os indicadores do painel via API.
function dados(req, res) {
    var idUsuario = req.params.idUsuario;

    // ALTERAÇÃO: valida o id da URL antes de consultar. PORQUE: evita consultas com id vazio ou inválido.
    if (idUsuario === undefined || idUsuario === "") {
        return res.status(400).send("Informe um id de usuário válido.");
    }

    dashboardModel.buscarDados(idUsuario)
        .then(function (resultado) {
            // ALTERAÇÃO: resposta JSON com o objeto montado no model. PORQUE: o front-end consome anos, jogos, times e cores.
            return res.status(200).json(resultado);
        })
        .catch(function (erro) {
            console.error("Houve um erro ao buscar o dashboard:", erro.sqlMessage || erro.message || erro);
            return res.status(500).send("Não foi possível buscar os dados do dashboard.");
        });
}

// ALTERAÇÃO: dados() exportado. PORQUE: o roteador de dashboard precisa associá-lo à rota.
module.exports = {
    dados
};
