// Importa o Express e cria o roteador da página inicial.
var express = require("express");
var router = express.Router();

// Rota da página inicial: renderiza o template index.
router.get("/", function (req, res) {
    res.render("index");
});

// Exporta o roteador para ser registrado no app.js.
module.exports = router;
