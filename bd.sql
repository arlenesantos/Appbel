CREATE DATABASE appbel;
\c appbel

CREATE TABLE contatos (
    id SERIAL PRIMARY KEY,
    data DATE DEFAULT CURRENT_DATE,
    motivo_contato VARCHAR(50) NOT NULL,
    nome VARCHAR(50) NOT NULL,
    telefone VARCHAR(15),
    email VARCHAR(50) NOT NULL,
    mensagem TEXT,
    status BOOLEAN NOT NULL
);

CREATE TABLE admin (
    nome VARCHAR(50) NOT NULL,    
    email VARCHAR(50) PRIMARY KEY,
    senha VARCHAR(50) NOT NULL    
);

-- INSERT INTO admin (nome, email, senha) VALUES ('Administrador', 'admin@teste.com', '123');

CREATE TABLE artigos (
    id SERIAL PRIMARY KEY,
    data DATE,
    titulo VARCHAR(50) NOT NULL,
    imagem TEXT,
    conteudo TEXT NOT NULL    
);

--  INSERT INTO artigos (data, titulo, imagem, conteudo) VALUES (current_date, 'titulo teste', 'https://image.freepik.com/fotos-gratis/close-up-terapeuta-usando-vela-no-ouvido_23-2148882174.jpg', 'conteudo teste');

CREATE TABLE parceiros (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(50) NOT NULL,
    email VARCHAR(50) NOT NULL,
    telefone VARCHAR(15) NOT NULL,
    endereco VARCHAR(50) NOT NULL,
    website  VARCHAR(50)  
);
--  INSERT INTO parceiros (nome, email, telefone, endereco, website) VALUES ('ana maria', 'ana@teste.com', '12345678', 'Rua das Flores, 15', 'www.teste.com');