// Importa o Express e cria o roteador de medidas.
var express = require("express");
var router = express.Router();

// Controller com as regras de negócio das medidas.
var medidaController = require("../controllers/medidaController");

// GET /medidas/ultimas/:idAquario -> retorna as últimas medidas registradas.
router.get("/ultimas/:idAquario", function (req, res) {
    medidaController.buscarUltimasMedidas(req, res);
});

// GET /medidas/tempo-real/:idAquario -> retorna a medição mais recente.
router.get("/tempo-real/:idAquario", function (req, res) {
    medidaController.buscarMedidasEmTempoReal(req, res);
})

// Exporta o roteador para ser registrado no app.js.
module.exports = router;
