 
 
 

var pokemonModel = require("../models/pokemonModel");
var validacao = require("./validacao");

 
function validarDados(body) {
    var tipoIdsBrutos = body.tipoIds;

    if (!Array.isArray(tipoIdsBrutos) || tipoIdsBrutos.length < 1 || tipoIdsBrutos.length > 2) {
        throw validacao.falha("Escolha um ou dois tipos para o Pokémon.");
    }

    var tipoIds = [];
    var i = 0;
    for (i = 0; i < tipoIdsBrutos.length; i++) {
        tipoIds.push(validacao.inteiro(tipoIdsBrutos[i], "tipo", 1));
    }
    if (tipoIds.length === 2 && tipoIds[0] === tipoIds[1]) {
        throw validacao.falha("O tipo secundário deve ser diferente do principal.");
    }

     
    return {
        nome: validacao.texto(body.nome, "nome do Pokémon", 40),
        idGeracao: validacao.inteiro(body.idGeracao, "geração", 1),
        tipoIds: tipoIds,
        ps: validacao.inteiro(body.ps, "PS", 1, 255),
        ataque: validacao.inteiro(body.ataque, "ataque", 1, 255),
        defesa: validacao.inteiro(body.defesa, "defesa", 1, 255),
        atqEsp: validacao.inteiro(body.atqEsp, "ataque especial", 1, 255),
        defEsp: validacao.inteiro(body.defEsp, "defesa especial", 1, 255),
        velocidade: validacao.inteiro(body.velocidade, "velocidade", 1, 255)
    };
}

 
async function listar(req, res) {
    try {
        return res.status(200).json(await pokemonModel.listar());
    } catch (erro) {
        return validacao.responderErro(res, erro, "Não foi possível listar os Pokémon.");
    }
}

 
async function buscar(req, res) {
    try {
        var idPokemon = validacao.inteiro(req.params.idPokemon, "id do Pokémon", 1);
        var resultados = await pokemonModel.buscar(idPokemon);
        if (resultados.length === 0) {
            return res.status(404).send("Pokémon não encontrado.");
        }
        return res.status(200).json(resultados[0]);
    } catch (erro) {
        return validacao.responderErro(res, erro, "Não foi possível buscar o Pokémon.");
    }
}

 
async function criar(req, res) {
    try {
        var dados = validarDados(req.body);
        var resultado = await pokemonModel.criar(dados);
        return res.status(201).json(resultado);
    } catch (erro) {
        return validacao.responderErro(res, erro, "Não foi possível cadastrar o Pokémon.");
    }
}

 
async function atualizar(req, res) {
    try {
        var idPokemon = validacao.inteiro(req.params.idPokemon, "id do Pokémon", 1);
        var existentes = await pokemonModel.buscar(idPokemon);
        if (existentes.length === 0) {
            return res.status(404).send("Pokémon não encontrado.");
        }

        var dados = validarDados(req.body);
        var resultado = await pokemonModel.atualizar(idPokemon, dados);
        return res.status(200).json(resultado);
    } catch (erro) {
        return validacao.responderErro(res, erro, "Não foi possível atualizar o Pokémon.");
    }
}

 
async function excluir(req, res) {
    try {
        var idPokemon = validacao.inteiro(req.params.idPokemon, "id do Pokémon", 1);
        var existentes = await pokemonModel.buscar(idPokemon);
        if (existentes.length === 0) {
            return res.status(404).send("Pokémon não encontrado.");
        }

        await pokemonModel.excluir(idPokemon);
        return res.status(200).json({ excluido: true });
    } catch (erro) {
        return validacao.responderErro(res, erro, "Não foi possível excluir o Pokémon.");
    }
}

module.exports = {
    listar,
    buscar,
    criar,
    atualizar,
    excluir
};
