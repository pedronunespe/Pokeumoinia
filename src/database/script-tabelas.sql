CREATE DATABASE IF NOT EXISTS pokeumonia;
USE pokeumonia;

 
CREATE TABLE usuario (
    idUsuario INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(40) NOT NULL,
    sobrenome VARCHAR(40) NOT NULL,
    email VARCHAR(90) NOT NULL UNIQUE,
    senha VARCHAR(45) NOT NULL,
    dataCadastro DATETIME DEFAULT CURRENT_TIMESTAMP
);

 
CREATE TABLE geracao (
    idGeracao INT PRIMARY KEY AUTO_INCREMENT,
    numero TINYINT NOT NULL UNIQUE,
    regiao VARCHAR(30) NOT NULL
);

CREATE TABLE tipo (
    idTipo INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(20) NOT NULL UNIQUE,
    cor CHAR(7) NOT NULL               
);

CREATE TABLE jogo (
    idJogo INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(60) NOT NULL UNIQUE,
    plataforma VARCHAR(30) NOT NULL,
    anoLancamento YEAR
);

CREATE TABLE pokemon (
    idPokemon INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(40) NOT NULL UNIQUE,
    fkGeracao INT NOT NULL,
    ps INT NOT NULL,
    ataque INT NOT NULL,
    defesa INT NOT NULL,
    atqEsp INT NOT NULL,
    defEsp INT NOT NULL,
    velocidade INT NOT NULL,
    FOREIGN KEY (fkGeracao) REFERENCES geracao (idGeracao)
);

 
CREATE TABLE pokemonTipo (
    fkPokemon INT,
    fkTipo INT,
    slot TINYINT NOT NULL,             
    PRIMARY KEY (fkPokemon, fkTipo),
    FOREIGN KEY (fkPokemon) REFERENCES pokemon (idPokemon),
    FOREIGN KEY (fkTipo) REFERENCES tipo (idTipo)
);

 
CREATE TABLE perfilTreinador (
    fkUsuario INT PRIMARY KEY,
    apelido VARCHAR(30) NOT NULL,
    anoInicio YEAR NOT NULL,           
    fkPokemonFavorito INT,
    FOREIGN KEY (fkUsuario) REFERENCES usuario (idUsuario),
    FOREIGN KEY (fkPokemonFavorito) REFERENCES pokemon (idPokemon)
);

 
 
CREATE TABLE usuarioJogo (
    idUsuarioJogo INT PRIMARY KEY AUTO_INCREMENT,
    fkUsuario INT NOT NULL,
    fkJogo INT NOT NULL,
    nota DECIMAL(3,1),
    UNIQUE (fkUsuario, fkJogo),
    CHECK (nota BETWEEN 0 AND 10),
    FOREIGN KEY (fkUsuario) REFERENCES usuario (idUsuario),
    FOREIGN KEY (fkJogo) REFERENCES jogo (idJogo)
);

 
CREATE TABLE registroHoras (
    idRegistro INT PRIMARY KEY AUTO_INCREMENT,
    fkUsuarioJogo INT NOT NULL,
    ano INT NOT NULL,
    horas DECIMAL(6,1) NOT NULL,
    UNIQUE (fkUsuarioJogo, ano),
    CHECK (horas >= 0),
    FOREIGN KEY (fkUsuarioJogo) REFERENCES usuarioJogo (idUsuarioJogo)
);

 
CREATE TABLE timePokemon (
    fkUsuarioJogo INT,
    posicao TINYINT,
    fkPokemon INT NOT NULL,
    PRIMARY KEY (fkUsuarioJogo, posicao),
    CHECK (posicao BETWEEN 1 AND 6),
    FOREIGN KEY (fkUsuarioJogo) REFERENCES usuarioJogo (idUsuarioJogo),
    FOREIGN KEY (fkPokemon) REFERENCES pokemon (idPokemon)
);