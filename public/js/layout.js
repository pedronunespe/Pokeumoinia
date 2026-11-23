// Arquivo: public/js/layout.js
// Monta a sidebar compartilhada por dashboard, jogos, Pokémon, times e configurações.
// PORQUE: a navegação fica em um só lugar; criar uma nova página exige apenas incluir este script.

// Cada item aponta para um arquivo dentro de public/dashboard/.
var itensSidebar = [
    { arquivo: "dashboard.html", rotulo: "Visão geral", detalhe: "Indicadores" },
    { arquivo: "jogos.html", rotulo: "Jogos", detalhe: "Jornada e horas" },
    { arquivo: "pokemons.html", rotulo: "Pokémon", detalhe: "Catálogo" },
    { arquivo: "times.html", rotulo: "Times", detalhe: "Até 6 por jogo" },
    { arquivo: "configuracoes.html", rotulo: "Configurações", detalhe: "Perfil e catálogos" }
];

// Substitui o conteúdo da <aside id="app_sidebar"> pelo menu e pelos dados da sessão.
function montarSidebar(paginaAtiva) {
    var area = document.getElementById("app_sidebar");
    if (!area) {
        return;
    }

    var html = '<div class="sidebar-marca"><a href="dashboard.html">Pokeumonia</a><small>painel do treinador</small></div>';
    html += '<nav class="sidebar-menu">';

    for (var i = 0; i < itensSidebar.length; i++) {
        var item = itensSidebar[i];
        var classe = item.arquivo === paginaAtiva ? " sidebar-link item-ativo" : " sidebar-link";
        html += '<a class="' + classe + '" href="' + item.arquivo + '">';
        html += '<strong>' + item.rotulo + '</strong><small>' + item.detalhe + '</small>';
        html += '</a>';
    }

    html += '</nav>';
    html += '<div class="sidebar-usuario">Olá, <span id="b_usuario"></span>!</div>';
    html += '<button type="button" class="sidebar-sair" onclick="limparSessao()">Sair da conta</button>';

    area.innerHTML = html;
}
