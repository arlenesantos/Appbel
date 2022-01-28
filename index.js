//importações:
const express = require("express");
const app = express();
const exphbs = require("express-handlebars");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const key = uuidv4().slice(30);

var session = require('express-session');

//PostgreSQL
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

//excluir:
const { registrarMensagem, consultarMensagens, editarStatus, eliminarMensagem, verificarAdmin, consultarArtigos, criarArtigo, consultarArtigo, filtrarArtigos, listarDataArquivos,  editarArtigo, excluirArtigo, consultarParceiros, consultarParceiro, cadastrarParceiro, editarParceiro, excluirParceiro } = require("./consultas");

//integrações:
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.set("view engine", "hbs");
app.engine(
    "hbs",
    exphbs({
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
        const listaData = await listarDataArquivos();

        if(req.url.includes('/blog?mes')){   
            const { mes, ano } = req.query;                  
            const artigosFiltrados = await filtrarArtigos( mes, ano);
            res.render('blog', { artigos: artigosFiltrados , listaData: listaData});

        } else {
            const artigos = await consultarArtigos();
            res.render('blog', { artigos: artigos, listaData: listaData });
        }        

    } catch (error) {
        res.status(500).send({ error: error, code: 500 });
    }
});


app.get("/blog/artigo", async (req, res) => {
    try {
        const { id } = req.query;
        if (id) {
            const artigo = await consultarArtigo(id, true);
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
        const parceiros = await consultarParceiros();        
        res.render('parceiros', { parceiros: parceiros });        

    } catch (error) {
        res.status(500).send({ error: error, code: 500 });
    }
});

// sistema de login
app.get("/login", async (req, res) => {
    try {
        //res.render('login', { layout: 'adm' });
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
    let admin = await verificarAdmin(email, senha);
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
            //res.render('login', { layout: 'adm' });
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
            const contatos = await consultarMensagens();
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
                    const { id, status } = req.body;
                    const contato = await editarStatus(id, status);
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
                    const { id } = req.body;
                    const contatos = await eliminarMensagem(id);
                    res.status(200).type("json").send(contatos);
                    res.render("admin-contatos", { contatos });
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
            const artigos = await consultarArtigos();
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
            const { id } = req.query;
            if (id) {
                const artigo = await consultarArtigo(id);
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
                    const { data, titulo, imagem, conteudo } = req.body;
                    const artigoNovo = await criarArtigo(data, titulo, imagem, conteudo);
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
                    const { id, data, titulo, imagem, conteudo } = req.body;
                    const artigoEditado = await editarArtigo(id, data, titulo, imagem, conteudo);
                    //envia codigo 200 para entrar no then da promessa - (artigos.hbs) e então roda alert e location.href
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
                    const { id } = req.body;
                    const artigoExcluido = await excluirArtigo(id);
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
            const parceiros = await consultarParceiros();
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
            const { id } = req.query;
            if (id) {
                const parceiro = await consultarParceiro(id);
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
                    const { nome, email, telefone, endereco, website } = req.body;
                    const novoParceiro = await cadastrarParceiro(nome, email, telefone, endereco, website);
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
                    const { id, nome, email, telefone, endereco, website} = req.body;
                    const parceiroEditado = await editarParceiro(id, nome, email, telefone, endereco, website);                    
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
                    const { id } = req.body;
                    const parceiroExcluido = await excluirParceiro(id);
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
