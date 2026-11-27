 
 
 

var timeModel = require("../models/timeModel");
var jogoModel = require("../models/jogoModel");
var pokemonModel = require("../models/pokemonModel");
var validacao = require("./validacao");

 
async function listar(req, res) {
    try {
        var idUsuario = validacao.inteiro(req.params.idUsuario, "id do usuário", 1);
        return res.status(200).json(await timeModel.listar(idUsuario));
    } catch (erro) {
        return validacao.responderErro(res, erro, "Não foi possível listar os times.");
    }
}

 
async function salvar(req, res) {
    try {
        var idUsuario = validacao.inteiro(req.params.idUsuario, "id do usuário", 1);
        var idUsuarioJogo = validacao.inteiro(req.body.idUsuarioJogo, "jogo do usuário", 1);
        var posicao = validacao.inteiro(req.body.posicao, "posição do time", 1, 6);
        var idPokemon = validacao.inteiro(req.body.idPokemon, "Pokémon", 1);

         
        var vinculo = await jogoModel.buscarUsuarioJogo(idUsuario, idUsuarioJogo);
        if (vinculo.length === 0) {
            return res.status(404).send("Jogo não encontrado na sua jornada.");
        }
        var pokemon = await pokemonModel.buscar(idPokemon);
        if (pokemon.length === 0) {
            return res.status(404).send("Pokémon não encontrado.");
        }

        var resultado = await timeModel.salvar(idUsuarioJogo, posicao, idPokemon);
        return res.status(201).json(resultado);
    } catch (erro) {
        return validacao.responderErro(res, erro, "Não foi possível salvar o Pokémon no time.");
    }
}

 
async function remover(req, res) {
    try {
        var idUsuario = validacao.inteiro(req.params.idUsuario, "id do usuário", 1);
        var idUsuarioJogo = validacao.inteiro(req.params.idUsuarioJogo, "jogo do usuário", 1);
        var posicao = validacao.inteiro(req.params.posicao, "posição do time", 1, 6);

        var resultado = await timeModel.remover(idUsuario, idUsuarioJogo, posicao);
        return res.status(200).json(resultado);
    } catch (erro) {
        return validacao.responderErro(res, erro, "Não foi possível remover o Pokémon do time.");
    }
}

module.exports = {
    listar,
    salvar,
    remover
};
