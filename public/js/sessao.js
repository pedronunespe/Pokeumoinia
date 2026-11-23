// sessão
// Verifica se existe usuário logado e mostra o nome na sidebar.
function validarSessao() {
    // Recupera os dados salvos no navegador durante o login.
    var email = sessionStorage.EMAIL_USUARIO;
    var nome = sessionStorage.NOME_USUARIO;
    // ALTERAÇÃO: o id também passou a ser obrigatório. PORQUE: todas as rotas de cadastro da dashboard precisam dele.
    var id = sessionStorage.ID_USUARIO;

    var b_usuario = document.getElementById("b_usuario");

    // Se estiver logado, exibe o nome; senão, volta para o login.
    if (email != null && nome != null && id != null) {
        if (b_usuario) {
            // textContent evita interpretar o nome como HTML.
            b_usuario.textContent = nome;
        }
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
    // ALTERAÇÃO: verificação de existência. PORQUE: as páginas novas da dashboard podem não ter esse elemento.
    if (divAguardar) {
        divAguardar.style.display = "flex";
    }
}

// Esconde o carregamento e mostra uma mensagem de erro, se houver.
function finalizarAguardar(texto) {
    var divAguardar = document.getElementById("div_aguardar");
    if (divAguardar) {
        divAguardar.style.display = "none";
    }

    var divErrosLogin = document.getElementById("div_erros_login");
    if (texto && divErrosLogin) {
        divErrosLogin.style.display = "flex";
        divErrosLogin.textContent = texto;
    }
}
