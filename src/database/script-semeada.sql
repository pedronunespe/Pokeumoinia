-- Arquivo: src/database/script-semeada.sql
-- Dados mínimos de catálogo para os formulários da dashboard funcionarem.
-- PORQUE: sem gerações, tipos e jogos cadastrados, os selects ficam vazios e nenhum cadastro é possível.
-- Execute este script no banco pokeumonia depois de script-tabelas.sql.
-- O INSERT IGNORE permite rodá-lo mais de uma vez sem duplicar registros.

USE pokeumonia;

-- Gerações principais até Paldea.
INSERT IGNORE INTO geracao (numero, regiao) VALUES
    (1, 'Kanto'),
    (2, 'Johto'),
    (3, 'Hoenn'),
    (4, 'Sinnoh'),
    (5, 'Unova'),
    (6, 'Kalos'),
    (7, 'Alola'),
    (8, 'Galar'),
    (9, 'Paldea');

-- Tipos e as cores usadas nos cartões e gráficos da dashboard.
INSERT IGNORE INTO tipo (nome, cor) VALUES
    ('Normal', '#a8a878'),
    ('Fogo', '#f08030'),
    ('Água', '#6890f0'),
    ('Planta', '#78c850'),
    ('Elétrico', '#f8d030'),
    ('Gelo', '#98d8d8'),
    ('Lutador', '#c03028'),
    ('Venenoso', '#a040a0'),
    ('Terra', '#e0c068'),
    ('Voador', '#a890f0'),
    ('Psíquico', '#f85888'),
    ('Inseto', '#a8b820'),
    ('Pedra', '#b8a038'),
    ('Fantasma', '#705898'),
    ('Dragão', '#7038f8'),
    ('Sombrio', '#705848'),
    ('Aço', '#b8b8d0'),
    ('Fada', '#ee99ac');

-- Jogos citados na jornada do projeto, já disponíveis para vincular ao usuário.
INSERT IGNORE INTO jogo (nome, plataforma, anoLancamento) VALUES
    ('Black & White', 'Nintendo DS', 2010),
    ('X & Y', 'Nintendo 3DS', 2013),
    ('Pixelmon', 'Minecraft', 2015),
    ('Pokémon Planet', 'PC', 2016),
    ('Pokémon Brick Bronze', 'Roblox', 2016),
    ('Legends: Arceus', 'Nintendo Switch', 2022),
    ('Cobblemon', 'Minecraft', 2023);
