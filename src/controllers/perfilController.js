// Arquivo: src/controllers/perfilController.js
// Regras da página de configurações do treinador.
// PORQUE: apelido, ano de início e Pokémon favorito aparecem na dashboard.

var perfilModel = require("../models/perfilModel");
var validacao = require("./validacao");

// GET /perfil/:idUsuario
async function buscar(req, res) {
    try {
        var idUsuario = validacao.inteiro(req.params.idUsuario, "id do usuário", 1);
        var resultados = await perfilModel.buscar(idUsuario);
        if (resultados.length === 0) {
            return res.status(404).send("Perfil não encontrado.");
        }
        return res.status(200).json(resultados[0]);
    } catch (erro) {
        return validacao.responderErro(res, erro, "Não foi possível buscar o perfil.");
    }
}

// PUT /perfil/:idUsuario
async function atualizar(req, res) {
    try {
        var idUsuario = validacao.inteiro(req.params.idUsuario, "id do usuário", 1);
        var perfil = await perfilModel.buscar(idUsuario);
        if (perfil.length === 0) {
            return res.status(404).send("Perfil não encontrado.");
        }

        var apelido = validacao.texto(req.body.apelido, "apelido", 30);
        var anoInicio = validacao.ano(req.body.anoInicio);
        var favorito = validacao.inteiroOpcional(req.body.fkPokemonFavorito, "Pokémon favorito", 1);

        var resultado = await perfilModel.atualizar(idUsuario, apelido, anoInicio, favorito);
        return res.status(200).json(resultado);
    } catch (erro) {
        return validacao.responderErro(res, erro, "Não foi possível salvar o perfil.");
    }
}

module.exports = {
    buscar,
    atualizar
};
