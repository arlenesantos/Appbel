// Alternativa para formatação de datas - configuração na base de dados de pg:
//não usar - const { Pool } = require("pg"); - e em troca usar:
//1082 - código para date type - consultar pasta: node_modules/pg-types/lib/textParsers.js

const pg = require("pg");
pg.types.setTypeParser(1082, (stringValue) => stringValue);

const pool = new pg.Pool({
    user: "postgres",
    password: "senhapostgre",
    host: "localhost",
    port: 5432,
    database: "appbel",
});


const registrarMensagem = async (motivo, nome, telefone, email, mensagem) => {
    const consulta = {
        text: "INSERT INTO contatos (data, motivo_contato, nome, telefone, email, mensagem, status) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *;",
        values: [data, motivo, nome, telefone, email, mensagem, false],
    };
    try {
        const resultado = await pool.query(consulta);
        return resultado.rows[0];

    } catch (error) {
        return error;
    }
};

const consultarMensagens = async () => {
    try {
        //             
        const resultado = await pool.query(`SELECT TO_CHAR(data, 'dd/mm/yyyy') as data, motivo_contato, nome, telefone, email, mensagem, status FROM contatos`);
        return resultado.rows;
    } catch (error) {
        return error;
    }
};

const editarStatus = async (email, status) => {
    const consulta = {
        text: "UPDATE contatos SET status = $2 WHERE email = $1 RETURNING *;",
        values: [email, status],
    };
    try {
        const resultado = await pool.query(consulta);
        return resultado.rows[0];

    } catch (error) {
        return error;
    }
};


const eliminarMensagem = async (email) => {
    const consulta = {
        text: "DELETE FROM contatos WHERE email = $1 RETURNING *;",
        values: [email],
    };
    try {
        const resultado = await pool.query(consulta);
        return resultado.rows[0];
    } catch (error) {
        throw error;
    }
};

const verificarAdmin = async (email, senha) => {
    const consulta = {
        text: `SELECT email FROM admin WHERE email = $1 AND senha = $2;`,
        values: [email, senha],
    };
    try {
        const resultado = await pool.query(consulta);
        return resultado.rows[0];
    } catch (error) {
        console.log(error);
        return false;
    }
};

//admin-blog:

const consultarArtigos = async () => {
    try {
        const resultado = await pool.query(`SELECT id, TO_CHAR(data, 'dd/mm/yyyy') as data, titulo, imagem, conteudo FROM artigos;`);
        return resultado.rows;

    } catch (error) {
        throw error;
    }
};

const criarArtigo = async (data, titulo, imagem, conteudo) => {
    const consulta = {
        text: `INSERT INTO artigos (data, titulo, imagem, conteudo) VALUES ($1, $2, $3, $4) RETURNING *;`,
        values: [data, titulo, imagem, conteudo]
    }
    try {
        const resultado = await pool.query(consulta);
        return resultado.rows[0];

    } catch (error) {
        throw error;
    }
}

const consultarArtigo = async (id, dataPtBR = false) => {
    const query = dataPtBR 
        ? `SELECT id, TO_CHAR(data, 'dd/mm/yyyy') as data, titulo, imagem, conteudo FROM artigos WHERE id = $1;` 
        : `SELECT id, data, titulo, imagem, conteudo FROM artigos WHERE id = $1;`;
        
    try {
        const consulta = {
            text: query,
            values: [id]
        }
        const resultado = await pool.query(consulta);
        return resultado.rows[0];

    } catch (error) {
        throw error;
    }
};

const editarArtigo = async (id, data, titulo, imagem, conteudo) => {
    const consulta = {
        text: `UPDATE artigos SET data = $2, titulo = $3, imagem = $4, conteudo = $5 WHERE id = $1 RETURNING *;`,
        values: [id, data, titulo, imagem, conteudo]
    }
    try {
        const resultado = await pool.query(consulta);
        return resultado.rows[0];

    } catch (error) {
        throw error;
    }
};

const excluirArtigo = async (id) => {
    const consulta = {
        text: "DELETE FROM artigos WHERE id = $1 RETURNING *;",
        values: [id],
    };
    try {
        const resultado = await pool.query(consulta);
        return resultado.rows[0];
    } catch (error) {
        throw error;
    }
};


module.exports = {
    registrarMensagem,
    consultarMensagens,
    editarStatus,
    eliminarMensagem,
    verificarAdmin,
    consultarArtigos,
    criarArtigo,
    consultarArtigo,
    editarArtigo,
    excluirArtigo,

}