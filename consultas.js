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






//admin/parceiros:

const consultarParceiros = async () => {
    try {
        const resultado = await pool.query(`SELECT id, nome, email, telefone, endereco, website FROM parceiros;`);
        return resultado.rows;

    } catch (error) {
        throw error;
    }
};

const consultarParceiro = async (id) => {
    const consulta = {
        text: `SELECT id, nome, email, telefone, endereco, website FROM parceiros WHERE id = $1;`,
        values: [id]
    }

    try {
        const resultado = await pool.query(consulta);
        return resultado.rows[0];

    } catch (error) {
        throw error;
    }
};

const cadastrarParceiro = async (nome, email, telefone, endereco, website) => {
    const consulta = {
        text: `INSERT INTO parceiros (nome, email, telefone, endereco, website) VALUES ($1, $2, $3, $4, $5) RETURNING *;`,
        values: [nome, email, telefone, endereco, website]
    }
    try {
        const resultado = await pool.query(consulta);
        return resultado.rows[0];

    } catch (error) {
        throw error;
    }
}

const editarParceiro = async (id, nome, email, telefone, endereco, website) => {
    const consulta = {
        text: `UPDATE parceiros SET nome = $2, email = $3, telefone = $4, endereco = $5, website = $6  WHERE id = $1 RETURNING *;`,
        values: [id, nome, email, telefone, endereco, website]
    }
    try {
        const resultado = await pool.query(consulta);
        return resultado.rows[0];

    } catch (error) {
        throw error;
    }
};

const excluirParceiro = async (id) => {
    const consulta = {
        text: "DELETE FROM parceiros WHERE id = $1 RETURNING *;",
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
    
  


}