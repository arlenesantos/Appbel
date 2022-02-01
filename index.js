//importações:
const express = require("express");
const app = express();
const exphbs = require("express-handlebars");
const Handlebars = require('handlebars');
//permite acessar metodos e propriedades de objetos:
const {allowInsecurePrototypeAccess} = require('@handlebars/allow-prototype-access');
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
var key = uuidv4().slice(30);

var session = require('express-session');

//PostgreSQL - formatação de datas - configuração na base de dados de pg:
const pg = require("pg");
pg.types.setTypeParser(1082, (stringValue) => stringValue);

const pool = new pg.Pool({
    user: "postgres",
    password: "senhapostgre",
    host: "localhost",
    port: 5432,
    database: "appbel",
});

// consultas:
const { Contato } = require("./contatos");
const { Artigo } = require("./artigos");
const { Login } = require("./login");

//excluir:
const { registrarMensagem, consultarMensagens, editarStatus, eliminarMensagem, verificarAdmin, consultarArtigos, criarArtigo, consultarArtigo, filtrarArtigos, listarDataArquivos,  editarArtigo, excluirArtigo, consultarParceiros, consultarParceiro, cadastrarParceiro, editarParceiro, excluirParceiro } = require("./consultas");

//integrações:
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.engine(
    "hbs",
    exphbs({
        handlebars: allowInsecurePrototypeAccess(Handlebars),
        defaultLayout: "main",
        layoutsDir: `${__dirname}/views/main`,
        //partialsDir: `${__dirname}/views`,
        extname: "hbs",
        helpers: {
            inc: function (value) {
                return parseInt(value) + 1;
            },
            dec: function (value) {
                return parseInt(value) - 1;
            },
            getMes: function (num) {
                switch (num) {
                    case 1: return 'Janeiro';
                    case 2: return 'Fevereiro';
                    case 3: return 'Março';
                    case 4: return 'Abril';
                    case 5: return 'Maio';
                    case 6: return 'Junho';
                    case 7: return 'Julho';
                    case 8: return 'Agosto';
                    case 9: return 'Setembro';
                    case 10: return 'Outubro';
                    case 11: return 'Novembro';
                    case 12: return 'Dezembro';
                }

            },
        }
    })
);
app.set("view engine", "hbs");

app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: {}
}))

//pasta publica e estilo css
app.use(express.static(__dirname + "/assets"));
app.use('/css', express.static(__dirname + "/node_modules/bootstrap/dist/css"));
app.use('/js', express.static(__dirname + "/node_modules/bootstrap/dist/js"));
app.use('/ckeditor', express.static(__dirname + "/node_modules/@ckeditor/ckeditor5-build-classic/build"));


app.listen(3000, () => console.log("server on"));

//public pages
app.get("/", async (req, res) => {
    try {
        res.render("produtos");

    } catch (error) {
        res.status(500).send({ error: error, code: 500 });
    }
});


//filtrar e listar artigos por data:
app.get("/blog", async (req, res) => {
    try {  
        let listaData = await Artigo.listarData(pool);
        
        if(req.url.includes('/blog?mes')){   
            let { mes, ano } = req.query;                  
            let artigosFiltrados = await Artigo.filtrarMes( mes, ano, pool);
            res.render('blog', { artigos: artigosFiltrados , listaData: listaData});

        } else {
            let artigos = await Artigo.mostrar(pool);
            res.render('blog', { artigos: artigos, listaData: listaData });
        }        

    } catch (error) {
        res.status(500).send({ error: error, code: 500 });
    }
});


app.get("/blog/artigo", async (req, res) => {
    try {
        let { id } = req.query;
        if (id) {
            let artigo = await Artigo.consultar(id, true, pool);
            res.render('blog-artigo', { artigo: artigo });
        }
    } catch (error) {
        res.status(500).send({ error: error, code: 500 });
    }
});

app.get("/contato", async (req, res) => {
    try {
        res.render("contato");

    } catch (error) {
        res.status(500).send({ error: error, code: 500 });
    }
});

app.post("/contato", async (req, res) => {
    try {
        let { motivo, nome, telefone, email, mensagem } = req.body; 
        let contato = new Contato(null, null, motivo, nome, telefone, email, mensagem, false, pool);      
        await contato.registrar();        
        res.status(200);
        res.redirect("/contato");
    } catch (error) {
        res.status(500).send({
            error: `Erro no servidor: ${error}`,
            code: 500
        })
    }
});

app.get("/parceiros", async (req, res) => {
    try {
        let parceiros = await consultarParceiros();        
        res.render('parceiros', { parceiros: parceiros });        

    } catch (error) {
        res.status(500).send({ error: error, code: 500 });
    }
});

// sistema de login
app.get("/login", async (req, res) => {
    try {
        res.render('login', { layout: false });
       

    } catch (error) {
        res.status(500).send({
            error: `Erro no servidor: ${error}`,
            code: 500
        })
    }
});

//verificar login e criar token:
//post pq é processamento de formulario, metodo post para não mostrar dados na url
app.post("/login", async (req, res) => {
    let { email, senha } = req.body;
    let admin = await Login.verificar(email, senha, pool);
    if (admin) {
        if (admin.email) {
            const token = jwt.sign(
                {
                    exp: Math.floor(Date.now() / 1000) + 28800,
                    data: admin,
                },
                key
            );
            req.session.logged_in = true;
            req.session.token = token;
            req.session.save();
            res.send({ 'token': token });
        } else {
            res.status(404).send({
                code: 404,
            });
        }
    } else {
        res.status(404).send({
            msg: "Email ou senha incorretos. Tente novamente.",
            code: 404,
        });
    }
});

//logout
app.delete("/login", async (req, res) => {
    req.session.logged_in = false;
    req.session.token = null;
    req.session.save();
    res.send({ 'success': true });
});

//private pages
app.get("/admin", async (req, res) => {
    try {
        if (req.session.logged_in) {
            res.render('admin-contatos', { layout: 'adm', logged: req.session.logged_in });
        } else {
            res.status(200);            
            res.render('login', { layout: false });
        }
    } catch (error) {
        res.status(500).send({
            error: `Erro no servidor: ${error}`,
            code: 500
        })
    }
});

app.get("/admin/contatos", async (req, res) => {
    try {
        //validar session:
        if (req.session.logged_in) { 
            let contatos = await Contato.mostrar(pool);
            res.render('admin-contatos', { layout: 'adm', logged: req.session.logged_in, contatos: contatos });
        } else {
            res.status(200);
            res.render('login', { layout: false });
        }
    } catch (error) {
        res.status(500).send({
            error: `Erro no servidor: ${error}`,
            code: 500
        })
    }
});

app.put("/api/admin/contatos", async (req, res) => {
    // autenticar com jwt:
    try {
        const token = req.header('token');
        if (token) {
            jwt.verify(token, key, async (error) => {
                if (error) {
                    res.status(401).send({
                        error: `Erro no servidor: ${error}`,
                        code: 401
                    })
                } else {
                    let { id, status } = req.body;
                    let contato = await Contato.consultar(id, pool);                    
                    contato.setStatus(status);                                  
                    await contato.atualizar();                    
                    res.status(200).type("json").send(contato);
                }
            })
        } else {
            //se não houver token:            
            res.render('login', { layout:false });
        }
    } catch (error) {
        res.status(500).send({
            error: `Erro no servidor: ${error}`,
            code: 500
        });
    }
});

app.delete("/api/admin/contatos", async (req, res) => {
    // autenticar com jwt:
    try {
        const token = req.header('token');
        if (token) {
            jwt.verify(token, key, async (error) => {
                if (error) {
                    res.status(401).send({
                        error: `Erro no servidor: ${error}`,
                        code: 401
                    })
                } else {
                    let { id } = req.body;
                    let contato = await Contato.consultar(id, pool);
                    await contato.excluir();
                    res.status(200).type("json").send(contato);                    
                }
            })
        } else {
            //se não houver token:            
            res.render('login', { layout: false });
        }
    } catch (error) {
        res.status(500).send({
            error: `Erro no servidor: ${error}`,
            code: 500
        });
    }
});

//blog-admin:
app.get("/admin/blog", async (req, res) => {
    try {
        if (req.session.logged_in) {
            let artigos = await Artigo.mostrar(pool);
            res.render('admin-blog', { layout: 'adm', logged: req.session.logged_in, artigos: artigos });
        } else {
            res.status(200);
            res.render('login', { layout: false });
        }
    } catch (error) {
        res.status(500).send({
            error: `Erro no servidor: ${error}`,
            code: 500
        });
    }
});

app.get("/admin/artigo", async (req, res) => {
    try {
        if (req.session.logged_in) {
            let { id } = req.query;
            if (id) {
                let artigo = await Artigo.consultar(id, false, pool)
                res.render('admin-artigos', { layout: 'adm', logged: req.session.logged_in, artigo: artigo });
            } else {
                res.render('admin-artigos', { layout: 'adm', logged: req.session.logged_in });
            }
        } else {
            res.status(200);
            res.render('login', { layout: false });
        }
    } catch (error) {
        res.status(500).send({
            error: `Erro no servidor: ${error}`,
            code: 500
        });
    }
});

app.post("/api/admin/artigo", async (req, res) => {
    try {
        const token = req.header('token');
        if (token) {
            jwt.verify(token, key, async (error) => {
                if (error) {
                    res.status(401).send({
                        error: `Erro no servidor: ${error}`,
                        code: 401
                    })
                } else {
                    let { data, titulo, imagem, conteudo } = req.body;
                    let artigoNovo = new Artigo(null, data, titulo, imagem, conteudo, pool);
                    await artigoNovo.registrar();
                    res.status(200).type("json").send({ 'artigo': artigoNovo, 'token': token });
                }
            })
        } else {
            //se não houver token:            
            res.render('login', { layout: false });
        }
    } catch (error) {
        res.status(500).send({
            error: `Erro no servidor: ${error}`,
            code: 500
        });
    }
});

app.put("/api/admin/artigo", async (req, res) => {
    try {
        const token = req.header('token');
        if (token) {
            jwt.verify(token, key, async (error) => {
                if (error) {
                    res.status(401).send({
                        error: `Erro no servidor: ${error}`,
                        code: 401
                    })
                } else {
                    let { id, data, titulo, imagem, conteudo } = req.body;
                    let artigoEditado = await Artigo.consultar(id, false, pool);
                    artigoEditado.setData(data);
                    artigoEditado.setTitulo(titulo);
                    artigoEditado.setImagem(imagem);
                    artigoEditado.setConteudo(conteudo);                    
                    artigoEditado.atualizar();
                    res.status(200).type("json").send({ 'artigo': artigoEditado, 'token': token });
                }
            })
        } else {
            //se não houver token:            
            res.render('login', { layout: false });
        }
    } catch (error) {
        res.status(500).send({
            error: `Erro no servidor: ${error}`,
            code: 500
        });
    }
});


app.delete("/api/admin/artigo", async (req, res) => {
    try {
        const token = req.header('token');
        if (token) {
            jwt.verify(token, key, async (error) => {
                if (error) {
                    res.status(401).send({
                        error: `Erro no servidor: ${error}`,
                        code: 401
                    })
                } else {
                    let { id } = req.body;
                    let artigoExcluido = await Artigo.consultar(id, false, pool);
                    await artigoExcluido.excluir();
                    res.status(200).type("json").send({ 'artigo': artigoExcluido, 'token': token });
                }
            })
        } else {
            //se não houver token:            
            res.render('login', { layout: false });
        }
    } catch (error) {
        res.status(500).send({
            error: `Erro no servidor: ${error}`,
            code: 500
        })
    }
});

//blog-parceiros:
app.get("/admin/parceiros", async (req, res) => {
    try {
        if (req.session.logged_in) {            
            let parceiros = await consultarParceiros();
            res.render('admin-parceiros', { layout: 'adm', logged: req.session.logged_in, parceiros: parceiros });
        } else {
            res.status(200);
            res.render('login', { layout: false });
        }
    } catch (error) {
        res.status(500).send({
            error: `Erro no servidor: ${error}`,
            code: 500
        });
    }
});

app.get("/admin/parceiro", async (req, res) => {
    try {
        if (req.session.logged_in) {
            let { id } = req.query;
            if (id) {
                let parceiro = await consultarParceiro(id);
                res.render('novoparceiro', { layout: 'adm', logged: req.session.logged_in, parceiro: parceiro });
            } else {
                res.render('novoparceiro', { layout: 'adm', logged: req.session.logged_in });
            }
        } else {
            res.status(200);
            res.render('login', { layout: false });
        }
    } catch (error) {
        res.status(500).send({
            error: `Erro no servidor: ${error}`,
            code: 500
        });
    }
});


app.post("/api/admin/parceiros", async (req, res) => {
    try {
        const token = req.header('token');
        if (token) {
            jwt.verify(token, key, async (error) => {
                if (error) {
                    res.status(401).send({
                        error: `Erro no servidor: ${error}`,
                        code: 401
                    })
                } else {
                    let { nome, email, telefone, endereco, website } = req.body;
                    let novoParceiro = await cadastrarParceiro(nome, email, telefone, endereco, website);
                    res.status(200).type("json").send({ 'parceiro': novoParceiro, 'token': token });
                }
            })
        } else {
            //se não houver token:            
            res.render('login', { layout: false });
        }
    } catch (error) {
        res.status(500).send({
            error: `Erro no servidor: ${error}`,
            code: 500
        });
    }
});

app.put("/api/admin/parceiros", async (req, res) => {
    try {
        const token = req.header('token');
        if (token) {
            jwt.verify(token, key, async (error) => {
                if (error) {
                    res.status(401).send({
                        error: `Erro no servidor: ${error}`,
                        code: 401
                    })
                } else {
                    let { id, nome, email, telefone, endereco, website} = req.body;
                    let parceiroEditado = await editarParceiro(id, nome, email, telefone, endereco, website);                    
                    res.status(200).type("json").send({ 'parceiro': parceiroEditado, 'token': token });
                }
            })
        } else {
            //se não houver token:            
            res.render('login', { layout: false });
        }
    } catch (error) {
        res.status(500).send({
            error: `Erro no servidor: ${error}`,
            code: 500
        });
    }
});


app.delete("/api/admin/parceiros", async (req, res) => {
    try {
        const token = req.header('token');
        if (token) {
            jwt.verify(token, key, async (error) => {
                if (error) {
                    res.status(401).send({
                        error: `Erro no servidor: ${error}`,
                        code: 401
                    })
                } else {
                    let { id } = req.body;
                    let parceiroExcluido = await excluirParceiro(id);
                    res.status(200).type("json").send({ 'parceiro': parceiroExcluido, 'token': token });
                }
            })
        } else {
            //se não houver token:            
            res.render('login', { layout: false });
        }
    } catch (error) {
        res.status(500).send({
            error: `Erro no servidor: ${error}`,
            code: 500
        })
    }
});
