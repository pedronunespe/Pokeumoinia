// Importa o Express e cria o roteador de aquários.
var express = require("express");
var router = express.Router();

// Controller com as regras de negócio dos aquários.
var aquarioController = require("../controllers/aquarioController");

// GET /aquarios/:empresaId -> busca os aquários de uma empresa.
router.get("/:empresaId", function (req, res) {
  aquarioController.buscarAquariosPorEmpresa(req, res);
});

// POST /aquarios/cadastrar -> cadastra um novo aquário.
router.post("/cadastrar", function (req, res) {
  aquarioController.cadastrar(req, res);
})

// Exporta o roteador para ser registrado no app.js.
module.exports = router;
