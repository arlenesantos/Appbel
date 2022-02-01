class Parceiro{
    constructor(id, nome, email, telefone, endereco, website, pool){
        let _id = id;
        let _nome = nome;
        let _email = email;
        let _telefone = telefone;
        let _endereco = endereco;
        let _website = website;
        let _pool = pool;

        this.getId = () => _id;
        this.getNome = () => _nome;
        this.getEmail = () => _email;
        this.getTelefone = () => _telefone;
        this.getEndereco = () => _endereco;
        this.getWebsite = () => _website;
        this.getPool = () => _pool;

        this.setNome = (novo_nome) => _nome = novo_nome;
        this.setEmail = (novo_email) => _email = novo_email;
        this.setTelefone = (novo_telefone) => _telefone = novo_telefone;
        this.setEndereco = (novo_endereco) => _endereco = novo_endereco;
        this.setWebsite = (novo_website) => _website = novo_website;

        this.cadastrar = async () => {
            let consulta = {
                text: `INSERT INTO parceiros (nome, email, telefone, endereco, website) VALUES ($1, $2, $3, $4, $5) RETURNING *;`,
                values: [_nome, _email, _telefone, _endereco, _website]
            }
            try {
                let resultado = await _pool.query(consulta);
                return resultado.rows[0];
        
            } catch (error) {
                throw error;
            }
        }

        this.atualizar = async () => {
            let consulta = {
                text: `UPDATE parceiros SET nome = $2, email = $3, telefone = $4, endereco = $5, website = $6  WHERE id = $1 RETURNING *;`,
                values: [_id, _nome, _email, _telefone, _endereco, _website]
            }
            try {
                let resultado = await _pool.query(consulta);
                return resultado.rows[0];
        
            } catch (error) {
                throw error;
            }
        }

        this.excluir = async () => {
            let consulta = {
                text: "DELETE FROM parceiros WHERE id = $1 RETURNING *;",
                values: [_id],
            };
            try {
                let resultado = await _pool.query(consulta);
                return resultado.rows[0];
            } catch (error) {
                throw error;
            }
        }
    }

    get id(){
        return this.getId();
    }
    get nome() {
        return this.getNome();
    }
    get email() {
        return this.getEmail();
    }
    get telefone() {
        return this.getTelefone();
    }
    get endereco() {
        return this.getEndereco();
    }
    get website() {
        return this.getWebsite();
    }
    get pool() {
        return this.getPool();
    }
   
    static async mostrar(pool){
        try {
            let resultado = await pool.query(`SELECT id, nome, email, telefone, endereco, website FROM parceiros;`);
            return resultado.rows;
    
        } catch (error) {
            throw error;
        }
    }

    static async consultar(id, pool){
        let consulta = {
            text: `SELECT id, nome, email, telefone, endereco, website FROM parceiros WHERE id = $1;`,
            values: [id]
        }
    
        try {
            let resultado = await pool.query(consulta);
            let parceiro = resultado.rows[0];
            return new Parceiro(parceiro.id, parceiro.nome, parceiro.email, parceiro.telefone, parceiro.endereco, parceiro.website, pool) 
    
        } catch (error) {
            throw error;
        }
    }

    async cadastrar(){
        return this.cadastrar();
    }

    async atualizar(){
        return this.atualizar();
    }

    async excluir(){
        return this.excluir();
    }
}

module.exports = { Parceiro }

