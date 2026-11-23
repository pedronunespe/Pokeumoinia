// Model com os comandos SQL das empresas.
var empresaModel = require("../models/empresaModel");

// Busca uma empresa pelo CNPJ enviado na query string.
function buscarPorCnpj(req, res) {
  var cnpj = req.query.cnpj;

  empresaModel.buscarPorCnpj(cnpj).then((resultado) => {
    res.status(200).json(resultado);
  });
}

// Lista todas as empresas cadastradas.
function listar(req, res) {
  empresaModel.listar().then((resultado) => {
    res.status(200).json(resultado);
  });
}

// Busca uma empresa pelo id informado na URL.
function buscarPorId(req, res) {
  var id = req.params.id;

  empresaModel.buscarPorId(id).then((resultado) => {
    res.status(200).json(resultado);
  });
}

// Cadastra a empresa apenas se o CNPJ ainda não estiver em uso.
function cadastrar(req, res) {
  var cnpj = req.body.cnpj;
  var razaoSocial = req.body.razaoSocial;

  empresaModel.buscarPorCnpj(cnpj).then((resultado) => {
    if (resultado.length > 0) {
      res
        .status(401)
        .json({ mensagem: `a empresa com o cnpj ${cnpj} já existe` });
    } else {
      empresaModel.cadastrar(razaoSocial, cnpj).then((resultado) => {
        res.status(201).json(resultado);
      });
    }
  });
}

// Exporta as funções usadas pelo roteador de empresas.
module.exports = {
  buscarPorCnpj,
  buscarPorId,
  cadastrar,
  listar,
};
