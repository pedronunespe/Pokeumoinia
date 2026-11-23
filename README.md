
<h1 align="center">Pokeumoinia</h1>
<p align="center"><em>Minha história com Pokémon.</em></p>
<p align="center">
 <img width="3840" height="2160" alt="giraforest4k" src="https://github.com/user-attachments/assets/f29f08e8-7c5e-4da3-9bdc-ad764a91c9bf" width="100%"/>
</p>
Sobre o projeto
Pokeumonia é um projeto acadêmico individual: um site que conta a minha trajetória com a franquia Pokémon, do primeiro contato até os dias atuais. Além da linha do tempo da jornada, o site tem cadastro e login com validação de e-mail e senha e um painel de métricas e indicadores.
Contexto
Tudo começou em 2013, com o anime Black & White. Em 2015, X & Y e o mod Pixelmon, no Minecraft, transformaram curiosidade em paixão. Entre 2016 e 2018, vieram o Pokémon Planet e o Pokémon Brick Bronze, no Roblox, com um ano de espera e dois de aventura ao lado dos amigos. Em 2024, a chegada ao Nintendo Switch com Legends: Arceus e o Cobblemon mantiveram essa história viva até hoje.

## Dashboard dinâmica

A área logada passou a ter uma sidebar com cinco páginas: **Visão geral**, **Jogos**, **Pokémon**, **Times** e **Configurações**. Os gráficos e KPIs da visão geral são carregados de `GET /dashboard/dados/:idUsuario`, e não mais de dados fixos no HTML.

Rotas adicionadas:

- `/catalogos` — listar/cadastrar gerações e tipos;
- `/jogos` — catálogo de jogos, jogos da jornada, notas e horas por ano;
- `/pokemons` — CRUD do catálogo de Pokémon (status, geração e até dois tipos);
- `/times` — montar as seis posições do time de cada jogo;
- `/perfil` — apelido, ano de início e Pokémon favorito.

Para popular os catálogos mínimos em um banco novo, execute `src/database/script-semeada.sql` depois de `src/database/script-tabelas.sql`. O script usa `INSERT IGNORE`, então pode ser repetido sem duplicar registros.

Fora do escopo deste projeto acadêmico: autorização real no servidor (a identidade ainda vem do `sessionStorage`), hash de senha, sincronização automática com a PokeAPI e upload de imagens. Esses pontos exigiriam sessão/cookies, bibliotecas extras e armazenamento de arquivos.

<sub>Feito para fins educacionais. Pokémon é marca da Nintendo, Game Freak e The Pokémon Company.</sub>
