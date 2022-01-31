

class Contato {
    constructor(id, data, motivo, nome, telefone, email, mensagem, status, pool){
        let _id = id;
        let _data = data;
        let _motivo = motivo;
        let _nome = nome;
        let _telefone = telefone;
        let _email = email;        
        let _mensagem = mensagem;
        let _status = status;
        let _pool = pool;

        this.getId = () => _id;
        this.getData = () => _data;
        this.getMotivo = () => _motivo;
        this.getNome = () => _nome;
        this.getTelefone = () => _telefone;
        this.getEmail = () => _email;
        this.getMensagem = () => _mensagem;
        this.getStatus = () => _status;
        this.getPool = () => _pool;
        
        this.setStatus = (novo_status) => _status = novo_status;
        
        this.registrar = async () => {
            let consulta = {
                text: "INSERT INTO contatos (motivo_contato, nome, telefone, email, mensagem, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;",
                values: [_motivo, _nome, _telefone, _email, _mensagem, false],
            };
            try {
                let resultado = await _pool.query(consulta);
                return resultado.rows[0];

            } catch (error) {
                console.log(error);
            }
        };

        this.atualizar = async () =>{
            const consulta = {
                text: `UPDATE contatos SET data = $2, motivo_contato = $3, nome = $4, telefone = $5, email = $6, mensagem = $7, status = $8 WHERE id = $1 RETURNING *;`,
                values: [_id, _data, _motivo, _nome, _telefone, _email, _mensagem, _status],
            };
            try {
                const resultado = await pool.query(consulta);
                return resultado.rows[0];
        
            } catch (error) {
                return error;
            }
        };

        this.excluir = async () => {
            const consulta = {
                text: "DELETE FROM contatos WHERE id = $1 RETURNING *;",
                values: [_id],
            };
            try {
                const resultado = await pool.query(consulta);
                return resultado.rows[0];
            } catch (error) {
                throw error;
            }
        }  
    }

    get id(){
        return this.getId();
    }
    get data(){
        return this.getData();
    }
    get motivo(){
        return this.getMotivo();
    }
    get nome(){
        return this.getNome();
    }
    get telefone(){
        return this.getTelefone();
    }
    get email(){
        return this.getEmail();
    }
    get mensagem(){
        return this.getMensagem();
    }
    get status(){
        return this.getStatus();
    }
    get pool(){
        return this.getPool();
    }

    static async consultar(id, pool){
        let consulta = {
            text: `SELECT id, data, motivo_contato, nome, telefone, email, mensagem, status FROM contatos WHERE id = $1;`,
            values: [id]
        }    
        try {
            let resultado = await pool.query(consulta);
            let contato =  resultado.rows[0];
            return new Contato(contato.id, contato.data, contato.motivo_contato, contato.nome, contato.telefone, contato.email, contato.mensagem, contato.status, pool);
    
        } catch (error) {
            throw error;
        }
    }

    async registrar(){
        return this.registrar();   
    }
    
    static async mostrar(pool){
        try {
            let resultado = await pool.query(`SELECT id, TO_CHAR(data, 'dd/mm/yyyy') as data, motivo_contato, nome, telefone, email, mensagem, status FROM contatos`);
            return resultado.rows;
        } catch (error) {
            return error;
        }        
    }

    async atualizar(){
        return this.atualizar();
    }

    async excluir(){
        return this.excluir();
    }
        
}


module.exports = { Contato };
