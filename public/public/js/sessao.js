// sessão
// Verifica se existe usuário logado e mostra o nome na página.
function validarSessao() {
    // Recupera os dados salvos no navegador durante o login.
    var email = sessionStorage.EMAIL_USUARIO;
    var nome = sessionStorage.NOME_USUARIO;

    var b_usuario = document.getElementById("b_usuario");

    // Se estiver logado, exibe o nome; senão, volta para o login.
    if (email != null && nome != null) {
        b_usuario.innerHTML = nome;
    } else {
        window.location = "../login.html";
    }
}

// Apaga os dados da sessão e retorna para a tela de login.
function limparSessao() {
    sessionStorage.clear();
    window.location = "../login.html";
}

// carregamento (loading)
// Exibe a animação de carregamento durante uma requisição.
function aguardar() {
    var divAguardar = document.getElementById("div_aguardar");
    divAguardar.style.display = "flex";
}

// Esconde o carregamento e mostra uma mensagem de erro, se houver.
function finalizarAguardar(texto) {
    var divAguardar = document.getElementById("div_aguardar");
    divAguardar.style.display = "none";

    var divErrosLogin = document.getElementById("div_erros_login");
    if (texto) {
        divErrosLogin.style.display = "flex";
        divErrosLogin.innerHTML = texto;
    }
}
