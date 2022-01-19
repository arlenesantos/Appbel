//importações:
const express = require("express");
const app = express();
const exphbs = require("express-handlebars");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const key = uuidv4().slice(30);

var session = require('express-session');

//consultas base de dados PostgreSQL
const { registrarMensagem, consultarMensagens, editarStatus, eliminarMensagem, verificarAdmin, consultarArtigos, criarArtigo, consultarArtigo, editarArtigo, excluirArtigo } = require("./consultas");

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
            }
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

app.get("/blog", async (req, res) => {
    try {
        const artigos = await consultarArtigos();
        res.render('blog', { artigos: artigos });

    } catch (error) {
        res.status(500).send({ error: error, code: 500 });
    }
});

app.get("/blog-artigo", async (req, res) => {
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
        const { motivo, nome, telefone, email, mensagem } = req.body;        
        await registrarMensagem(motivo, nome, telefone, email, mensagem);        
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
        res.render("parceiros");

    } catch (error) {
        res.status(500).send({ error: error, code: 500 });
    }
});

// sistema de login
app.get("/login", async (req, res) => {
    try {
        res.render('login', { layout: 'adm' });

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
            error: "Email ou senha incorretos",
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
            res.render('login', { layout: 'adm' });
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
            res.render('login', { layout: 'adm' });
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
                    const { email, status } = req.body;
                    const contato = await editarStatus(email, status);
                    res.status(200).type("json").send(contato);
                }
            })
        } else {
            //se não houver token:            
            res.render('login', { layout: 'adm' });
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
                    const { email } = req.body;
                    const contatos = await eliminarMensagem(email);
                    res.status(200).type("json").send(contatos);
                    res.render("admin-contatos", { contatos });
                }
            })
        } else {
            //se não houver token:            
            res.render('login', { layout: 'adm' });
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
            res.render('login', { layout: 'adm' });
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
            res.render('login', { layout: 'adm' });
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
            res.render('login', { layout: 'adm' });
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
            res.render('login', { layout: 'adm' });
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
            res.render('login', { layout: 'adm' });
        }
    } catch (error) {
        res.status(500).send({
            error: `Erro no servidor: ${error}`,
            code: 500
        })
    }
});
