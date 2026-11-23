// Arquivo: src/controllers/catalogoController.js
// Regras das rotas que leem e cadastram catálogos usados pelos formulários.
// PORQUE: o controller valida o formulário antes de deixar o model conversar com o banco.

var catalogoModel = require("../models/catalogoModel");
var validacao = require("./validacao");

// GET /catalogos/geracoes
async function listarGeracoes(req, res) {
    try {
        return res.status(200).json(await catalogoModel.listarGeracoes());
    } catch (erro) {
        return validacao.responderErro(res, erro, "Não foi possível listar as gerações.");
    }
}

// POST /catalogos/geracoes
async function criarGeracao(req, res) {
    try {
        var numero = validacao.inteiro(req.body.numero, "número da geração", 1, 99);
        var regiao = validacao.texto(req.body.regiao, "região", 30);
        var resultado = await catalogoModel.criarGeracao(numero, regiao);
        return res.status(201).json(resultado);
    } catch (erro) {
        return validacao.responderErro(res, erro, "Não foi possível cadastrar a geração.");
    }
}

// GET /catalogos/tipos
async function listarTipos(req, res) {
    try {
        return res.status(200).json(await catalogoModel.listarTipos());
    } catch (erro) {
        return validacao.responderErro(res, erro, "Não foi possível listar os tipos.");
    }
}

// POST /catalogos/tipos
async function criarTipo(req, res) {
    try {
        var nome = validacao.texto(req.body.nome, "nome do tipo", 20);
        var cor = validacao.corHex(req.body.cor);
        var resultado = await catalogoModel.criarTipo(nome, cor);
        return res.status(201).json(resultado);
    } catch (erro) {
        return validacao.responderErro(res, erro, "Não foi possível cadastrar o tipo.");
    }
}

module.exports = {
    listarGeracoes,
    criarGeracao,
    listarTipos,
    criarTipo
};
