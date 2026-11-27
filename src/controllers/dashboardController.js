 
var dashboardModel = require("../models/dashboardModel");

 
function dados(req, res) {
    var idUsuario = req.params.idUsuario;

     
    if (idUsuario === undefined || idUsuario === "" || isNaN(idUsuario)) {
        return res.status(400).send("Informe um id de usuário válido.");
    }

    dashboardModel.buscarDados(idUsuario)
        .then(function (resultado) {
             
            return res.status(200).json(resultado);
        })
        .catch(function (erro) {
            console.error("Houve um erro ao buscar o dashboard:", erro.sqlMessage || erro.message || erro);
            return res.status(500).send("Não foi possível buscar os dados do dashboard.");
        });
}

 
module.exports = {
    dados
};
