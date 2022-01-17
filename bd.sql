CREATE DATABASE appbel;
\c appbel

CREATE TABLE contatos (
    data DATE,
    motivo_contato VARCHAR(50) NOT NULL,
    nome VARCHAR(50) NOT NULL,
    telefone VARCHAR(15),
    email VARCHAR(50) PRIMARY KEY,
    mensagem VARCHAR(200),
    status BOOLEAN NOT NULL
);


CREATE TABLE admin (
    nome VARCHAR(50) NOT NULL,    
    email VARCHAR(50) PRIMARY KEY,
    senha VARCHAR(50) NOT NULL    
);

-- INSERT INTO admin (nome, email, senha) VALUES ('Lucimara', 'lu@teste.com', 'lu123');

CREATE TABLE artigos (
    id SERIAL PRIMARY KEY,
    data DATE,
    titulo VARCHAR(50) NOT NULL,
    conteudo TEXT NOT NULL    
);

--  INSERT INTO artigos (data, titulo, conteudo) VALUES (current_date, 'titulo teste', 'conteudo teste');