class Artigo {
    constructor(id, data, titulo, imagem, conteudo, pool) {
        let _id = id;
        let _data = data;
        let _titulo = titulo;
        let _imagem = imagem;
        let _conteudo = conteudo;
        let _pool = pool;

        this.getId = () => _id;
        this.getData = () => _data;
        this.getTitulo = () => _titulo;
        this.getImagem = () => _imagem;
        this.getConteudo = () => _conteudo;
        this.getPool = () => _pool;

        this.setData = (nova_data) => _data = nova_data;
        this.setTitulo = (novo_titulo) => _titulo = novo_titulo;
        this.setImagem = (nova_imagem) => _imagem = nova_imagem;
        this.setConteudo = (novo_conteudo) => _conteudo = novo_conteudo;

        this.registrar = async () => {
            let consulta = {
                text: `INSERT INTO artigos (data, titulo, imagem, conteudo) VALUES ($1, $2, $3, $4) RETURNING * ; `,
                values: [_data, _titulo, _imagem, _conteudo]
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
                text: `UPDATE artigos SET data = $2, titulo = $3, imagem = $4, conteudo = $5 WHERE id = $1 RETURNING *;`,
                values: [_id, _data, _titulo, _imagem, _conteudo]
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
                text: "DELETE FROM artigos WHERE id = $1 RETURNING *;",
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

    get id() {
        return this.getId();
    }
    get data() {
        return this.getData();
    }
    get titulo() {
        return this.getTitulo();
    }
    get imagem() {
        return this.getImagem();
    }
    get conteudo() {
        return this.getConteudo();
    }
    get pool() {
        return this.getPool();
    }

    static async mostrar(pool) {
        try {
            let resultado = await pool.query(`SELECT id, TO_CHAR(data, 'dd/mm/yyyy') as data, titulo, imagem, conteudo FROM artigos;`);
            return resultado.rows;

        } catch (error) {
            throw error;
        }
    }

    static async consultar(id, dataPtBR, pool) {
        let query = dataPtBR
            ? `SELECT id, TO_CHAR(data, 'dd/mm/yyyy') as data, titulo, imagem, conteudo FROM artigos WHERE id = $1;`
            : `SELECT id, data, titulo, imagem, conteudo 
            FROM artigos WHERE id = $1;`;

        try {
            let consulta = {
                text: query,
                values: [id]
            }
            let resultado = await pool.query(consulta);
            //verifica se artigo existe na base de dados
            if(resultado.rows.length > 0){
                let artigo = resultado.rows[0];
                return new Artigo(artigo.id, artigo.data, artigo.titulo, artigo.imagem, artigo.conteudo, pool);
            } else {
                //se não existir (pq foi excluído), entra no else do blog-artigo.hbs
                return false;
            }           

        } catch (error) {
            throw error;
        }
    }

    //filtrar artigo por mês para página do blog:
    static async filtrarMes(mes, ano, pool) {
        try {
            let consulta = {
                text: `SELECT id, TO_CHAR(data, 'dd/mm/yyyy') as data, titulo, imagem, conteudo FROM artigos WHERE EXTRACT(MONTH FROM data) = $1 AND EXTRACT(YEAR FROM data) = $2;`,
                values: [mes, ano]
            }
            let resultado = await pool.query(consulta);
            return resultado.rows;

        } catch (error) {
            throw error;
        }
    }

    //listar data para coluna arquivos:
    static async listarData(pool) {
        try {       
            let resultado = await pool.query(`SELECT DISTINCT EXTRACT(MONTH FROM data) AS mes, EXTRACT(YEAR FROM data) AS ano FROM artigos;`);
            return resultado.rows;
            
        } catch (error) {
            throw error;
        }

    }     

    async registrar() {
        return this.registrar();
    }

    async atualizar() {
        return this.atualizar();
    }

    async excluir() {
        return this.excluir();
    }



}

module.exports = { Artigo }
