// ALTERAÇÃO: novo roteador de dashboard. PORQUE: o app.js precisa registrar as rotas do painel.
var express = require("express");
var router = express.Router();

// ALTERAÇÃO: controller de dashboard importado. PORQUE: a rota delega a regra de negócio ao controller.
var dashboardController = require("../controllers/dashboardController");

// ALTERAÇÃO: rota GET /dashboard/dados/:idUsuario registrada. PORQUE: o painel busca os dados do usuário logado.
router.get("/dados/:idUsuario", function (req, res) {
    dashboardController.dados(req, res);
});

// ALTERAÇÃO: roteador exportado. PORQUE: o app.js registrará este arquivo em /dashboard.
module.exports = router;
