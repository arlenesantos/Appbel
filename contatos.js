

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

    async registrar(){
        return this.registrar();   
    }    

        
        
}

//export default Contato;
module.exports = { Contato };
//export default { Contato }