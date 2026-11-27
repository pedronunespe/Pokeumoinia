 
 
function validarSessao() {
     
    var email = sessionStorage.EMAIL_USUARIO;
    var nome = sessionStorage.NOME_USUARIO;
     
    var id = sessionStorage.ID_USUARIO;

    var b_usuario = document.getElementById("b_usuario");

     
    if (email != null && nome != null && id != null) {
        if (b_usuario) {
             
            b_usuario.textContent = nome;
        }
    } else {
        window.location = "../login.html";
    }
}

 
function limparSessao() {
    sessionStorage.clear();
    window.location = "../login.html";
}

 
 
function aguardar() {
    var divAguardar = document.getElementById("div_aguardar");
     
    if (divAguardar) {
        divAguardar.style.display = "flex";
    }
}

 
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
