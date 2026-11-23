// Arquivo: public/js/api.js
// Utilitários compartilhados por todas as páginas da área logada.
// PORQUE: evita repetir fetch, tratamento de erro e preenchimento de selects em cada página.

// Faz uma chamada à API e devolve o corpo já interpretado (JSON ou texto).
async function api(url, opcoes) {
    opcoes = opcoes || {};
    opcoes.headers = Object.assign({ "Content-Type": "application/json" }, opcoes.headers || {});

    var resposta = await fetch(url, opcoes);
    var texto = await resposta.text();
    var dados = texto;

    // A API pode devolver JSON (sucesso) ou texto simples (mensagem de erro).
    try {
        dados = texto ? JSON.parse(texto) : null;
    } catch (erro) {
        dados = texto;
    }

    if (!resposta.ok) {
        var mensagem = typeof dados === "string" && dados ? dados : "Não foi possível concluir a operação (" + resposta.status + ").";
        throw new Error(mensagem);
    }
    return dados;
}

// Lê o id salvo no login. Sem ele, nenhuma rota de cadastro do usuário funciona.
function idUsuarioLogado() {
    return sessionStorage.ID_USUARIO;
}

// Protege contra HTML injetado em nomes vindos do banco ou da sessão.
function escaparHtml(valor) {
    return String(valor === undefined || valor === null ? "" : valor)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

// Mostra/esconde o aviso de sucesso ou erro de uma página.
function mostrarMensagem(id, texto, tipo) {
    var elemento = document.getElementById(id);
    if (!elemento) {
        return;
    }
    elemento.textContent = texto || "";
    elemento.className = texto ? "aviso " + (tipo || "sucesso") : "aviso";
    elemento.style.display = texto ? "block" : "none";
}

// Preenche um <select> com os dados vindos da API.
function preencherSelect(idSelect, itens, campoValor, campoTxt, textoOpcaoVazia) {
    var select = document.getElementById(idSelect);
    if (!select) {
        return;
    }

    select.innerHTML = "";
    if (textoOpcaoVazia) {
        var vazia = document.createElement("option");
        vazia.value = "";
        vazia.textContent = textoOpcaoVazia;
        select.appendChild(vazia);
    }

    for (var i = 0; i < itens.length; i++) {
        var opcao = document.createElement("option");
        opcao.value = itens[i][campoValor];
        opcao.textContent = itens[i][campoTxt];
        select.appendChild(opcao);
    }
}

// Atalho para ler o valor de um campo pelo id.
function valor(id) {
    var campo = document.getElementById(id);
    return campo ? campo.value : "";
}
