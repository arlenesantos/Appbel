class Login{
    constructor(nome, email, senha, pool){
        let _nome = nome;
        let _email = email;
        let _senha = senha;
        let _pool = pool;

        this.getNome = () => _nome;
        this.getEmail = () => _email;
        this.getSenha = () => _senha;
        this.getPool = () => _pool;

    }

    get nome(){
        return this.getNome();
    }
    get email(){
        return this.getEmail();
    }
    get senha(){
        return this.getSenha();
    }
    get pool() {
        return this.getPool();
    }

    static async verificar(email, senha, pool){
        let consulta = {
            text: `SELECT email FROM admin WHERE email = $1 AND senha = $2;`,
            values: [email, senha],
        };
        try {
            let resultado = await pool.query(consulta);
            return resultado.rows[0];
        } catch (error) {
            console.log(error);
            return false;
        }

    }
}

module.exports = { Login }