 
 

var express = require("express");
var router = express.Router();

var pokemonController = require("../controllers/pokemonController");

 
router.get("/", function (req, res) {
    pokemonController.listar(req, res);
});
router.post("/", function (req, res) {
    pokemonController.criar(req, res);
});

router.get("/:idPokemon", function (req, res) {
    pokemonController.buscar(req, res);
});
router.put("/:idPokemon", function (req, res) {
    pokemonController.atualizar(req, res);
});
router.delete("/:idPokemon", function (req, res) {
    pokemonController.excluir(req, res);
});

module.exports = router;
