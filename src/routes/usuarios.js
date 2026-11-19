// Importa o Express e cria o roteador de usuários.
var express = require("express");
var router = express.Router();

// Controller com as regras de negócio dos usuários.
var usuarioController = require("../controllers/usuarioController");

//Recebendo os dados do html e direcionando para a função cadastrar de usuarioController.js
// POST /usuarios/cadastrar -> cadastra um novo usuário.
router.post("/cadastrar", function (req, res) {
    usuarioController.cadastrar(req, res);
})

// POST /usuarios/autenticar -> valida e-mail e senha no login.
router.post("/autenticar", function (req, res) {
    usuarioController.autenticar(req, res);
});

// Exporta o roteador para ser registrado no app.js.
module.exports = router;
