// Importa o Express e cria o roteador da página inicial.
var express = require("express");
var router = express.Router();
// ALTERAÇÃO: importação do módulo path adicionada. PORQUE: necessário para montar o caminho absoluto do arquivo estático.

// ALTERAÇÃO: rota da página inicial passou a servir o index.html estático. PORQUE: o projeto não usa template engine e o HTML fica em public/.
router.get("/", function (req, res) {
    // ALTERAÇÃO: res.render("index") trocado por res.sendFile(path.join(__dirname, "../../public/index.html")). PORQUE: evita o erro "No default engine was specified" e entrega o arquivo correto.
    res.sendFile(path.join(__dirname, "../../public/index.html"));
});

// Exporta o roteador para ser registrado no app.js.
module.exports = router;
