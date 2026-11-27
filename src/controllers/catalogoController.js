 
 

var catalogoModel = require("../models/catalogoModel");
var validacao = require("./validacao");

 
async function listarGeracoes(req, res) {
    try {
        return res.status(200).json(await catalogoModel.listarGeracoes());
    } catch (erro) {
        return validacao.responderErro(res, erro, "Não foi possível listar as gerações.");
    }
}

 
async function listarTipos(req, res) {
    try {
        return res.status(200).json(await catalogoModel.listarTipos());
    } catch (erro) {
        return validacao.responderErro(res, erro, "Não foi possível listar os tipos.");
    }
}

module.exports = {
    listarGeracoes,
    listarTipos
};
