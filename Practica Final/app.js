const config = require("./config");
const path = require("path");
const mysql = require("mysql");
const express = require("express");
const session = require("express-session")
const mysqlSession = require("express-mysql-session");
const bodyParser = require("body-parser");
const { check, validationResult } = require('express-validator');
const moment = require("moment")

const multer = require("multer")

const DAOAvisos = require("./DAOAvisos.js");
const DAOUsers = require("./DAOUsers.js");
const { response } = require("express");
const { createUnzip } = require("zlib");


let areasDisponibles = []

const areasIncidenciasAA = ["Adm. Digital: Registro electrónico", "Adm. Digital: Sede Electrónica",
    "Comunicaciones: Correo electrónico", "Comunicaciones: Google Meet",
    "Comunicaciones: Cuenta de alumno", "Web: Portal de eventos"]

const areasIncidenciasPDI = ["Adm. Digital: Certificado digital de persona física",
    "Adm. Digital: Certificado electrónico de empleado público",
    "Adm. Digital: Registro electrónico", "Adm. Digital: Sede Electrónica",
    "Adm. Digital: Portafiarmas", "Comunicaciones: Correo electrónico",
    "Comunicaciones: Google Meet", "Comunicaciones: Cuenta personal",
    "Comunicaciones: Cuenta genérica", "Conectividad: Cuentas Red SARA",
    "Conectividad: Conexion por cable despachos", "Conectividad: Cortafuegos corporativo",
    "Conectividad: VPN de acceso remoto", "Conectividad: WIFI eduroam",
    "Conectividad: Wifi para visitantes (UCM-Visitantes)", "Docencia: Aula virtual",
    "Docencia: Backboard Collaborate", "Docencia: Listados de clase",
    "Docencia: Moodle", "Docencia: Plataforma de cursos online privados",
    "Web: Analitica web", "Web: Emision de certificados SSL",
    "Web: Hosting, alojamiento de paginas web", "Web: Portal de eventos", "Web: Redirecciones web"]

const areasIncidenciasPAS = ["Adm. Digital: Certificado digital de persona física",
    "Adm. Digital: Certificado electrónico de empleado público",
    "Adm. Digital: Registro electrónico", "Adm. Digital: Sede Electrónica",
    "Adm. Digital: Portafiarmas", "Comunicaciones: Correo electrónico",
    "Comunicaciones: Google Meet", "Comunicaciones: Cuenta personal",
    "Comunicaciones: Cuenta genérica", "Conectividad: Cuentas Red SARA",
    "Conectividad: Conexion por cable despachos", "Conectividad: Cortafuegos corporativo",
    "Conectividad: DNS", "Conectividad: VPN de acceso remoto",
    "Conectividad: WIFI eduroam", "Conectividad: Wifi para visitantes (UCM-Visitantes)",
    "Docencia: Backboard Collaborate", "Docencia: Listados de clase",
    "Docencia: Moodle", "Web: Analitica web", "Web: Emision de certificados SSL",
    "Web: Hosting, alojamiento de paginas web", "Web: Portal de eventos", "Web: Redirecciones web"]

const areasIncidenciasA = ["Adm. Digital: Certificado digital de persona física", "Adm. Digital: Registro electrónico",
    "Adm. Digital: Sede Electrónica", "Comunicaciones: Correo electrónico",
    "Comunicaciones: Google Meet", "Comunicaciones: Cuenta de alumno",
    "Conectividad: Cortafuegos corporativo", "Conectividad: VPN de acceso remoto",
    "Conectividad: WIFI eduroam", "Docencia: Aula virtual", "Docencia: Moodle",
    "Docencia: Plataforma de cursos online privados", "Web: Portal de eventos"]

//Creamos las sesiones
const MySqlStore = mysqlSession(session)
const sessionStore = new MySqlStore(config.mysqlConfig)

// Crear un servidor Express.js
const app = express();

// Crear un pool de conexiones a la base de datos de MySQL
const pool = mysql.createPool(config.mysqlConfig);
const daoUsers = new DAOUsers(pool)
const daoAvisos = new DAOAvisos(pool)


//Direccion ficheros estaticos:
const ficherosEstaticos = path.join(__dirname, "public")



//Montamos motor de las ejs y ademas añadimos el path views
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

//Middleware static
app.use(express.static(ficherosEstaticos)) 
app.use(bodyParser.urlencoded({ extended: false }))

//Middleware Sesiones
const middlewareSessions = session({
    saveUninitialized: false,
    name: "session-id",
    secret: "foobar34",
    resave: false,
    store: sessionStore
})

app.use(middlewareSessions)

function flashMiddleware(request, response, next) {
    response.setFlash = function (msg) {
        request.session.flashMsg = msg
    }
    response.locals.getAndClearFlash = function () {
        let msg = request.session.flashMsg
        delete request.session.flashMsg
        return msg
    }

    next()
}




const multerFactory = multer({ storage: multer.memoryStorage() });

app.use(flashMiddleware)

//Creamos los middle para meter las sesiones
function middleLogueado(req, res, next) {
    if (req.session.usuario) {
        next()
    }
    else res.redirect("/login")
}

function middleNoLogueado(req, res, next) {
    if (!req.session.usuario) {
        next()
    }
    else res.redirect("/avisos")
}

//Creamos un middleware que nos selecciona cuales son las posibles nuevas incidencias
//que tiene disponible el usuario segun su perfil

function middleIncidencias(request, response, next) {

    if (request.session.usuario.perfil === "Alumno") areasDisponibles = areasIncidenciasA
    else if (request.session.usuario.perfil === "Antiguo Alumno") areasDisponibles = areasIncidenciasAA
    else if (request.session.usuario.perfil === "PAS") areasDisponibles = areasIncidenciasPAS
    else if (request.session.usuario.perfil === "PDI") areasDisponibles = areasIncidenciasPDI

    next()
}

function middleTecnico(request, response, next) {
    if (request.session.usuario.tecnico === 1)
        next()
    else
        response.redirect("/avisos")
}

function middleGetAllTecnicos(request, response, next) {
    daoUsers.getAllTecnicos(function (err, result) {
        if (err) {
            response.status(500)
        }
        else {
            response.allTecnicos = result
            next()
        }
    })
}

function middleGetCategorias(request, response, next) {
    daoAvisos.listarAvisosUsuarioCategorias(request.session.usuario.idUser, function (err, res) {
        if (err) {
            response.status(500)
        }
        else {
            response.categorias = [0, 0, 0]
            res.forEach(e => response.categorias[e.tipo - 1] = e.contador)
            next()
        }
    })
}

app.get("/", function (request, response) {
    response.redirect("/login")
})

app.get("/gestionUsuarios", middleLogueado, middleTecnico, middleGetAllTecnicos, function (request, response) {
    daoUsers.getAllUsers(function (err, result) {
        if (err) {
            response.status(500)
        }
        else {
            result.forEach((r) => {r.fecha = (new moment(r.fecha)).format("YYYY/MM/DD")})
            response.status(200)
            response.render("avisos", {
                usuario: request.session.usuario,
                vista: 3,
                fecha: (new moment(request.session.usuario.fecha)).format("YYYY/MM/DD HH:mm:ss"),
                areas: areasDisponibles,
                avisos: [],
                usuarios: result,
                tecnicos: response.allTecnicos
            })
        }
    })
})

app.get("/avisosEntrantes", middleLogueado, middleTecnico, middleGetAllTecnicos, function (request, response) {
    daoAvisos.listarAvisos(function (err, result) {
        if (err) {
            response.status(500)
        }
        else {
            response.status(200)
            response.render("avisos", {
                usuario: request.session.usuario,
                vista: 0,
                fecha: (new moment(request.session.usuario.fecha)).format("YYYY/MM/DD HH:mm:ss"),
                areas: areasDisponibles,
                avisos: result,
                usuarios: [],
                tecnicos: response.allTecnicos
            })
        }
    })
})

//Pagina de avisos
app.get("/avisos", middleLogueado, middleIncidencias, middleGetAllTecnicos, middleGetCategorias, function (request, response) {

    function func_callback(err, result) {
        if (err) {
            response.status(500)
        }
        else {
            response.status(200)
            response.render("avisos", {
                usuario: request.session.usuario,
                vista: 1,
                fecha: (new moment(request.session.usuario.fecha)).format("YYYY/MM/DD HH:mm:ss"),
                areas: areasDisponibles,
                usuarios: [],
                tecnicos: response.allTecnicos,
                categorias: response.categorias,
                avisos: result
            })
        }
    }


    if (!request.session.usuario.tecnico)
        daoAvisos.listarAvisosUsuario(request.session.usuario.idUser, true, func_callback)
    else
        daoAvisos.listarAvisosTecnico(request.session.usuario.idUser, true, func_callback)

})


//Pagina de avisos
app.get("/historicoAvisos", middleLogueado, middleIncidencias, middleGetAllTecnicos, middleGetCategorias, function (request, response) {

    let func_callback = function (err, result) {
        if (err) {
            response.status(500)
        }
        else {
            response.status(200)
            response.render("avisos", {
                usuario: request.session.usuario,
                vista: 2,
                fecha: (new moment(request.session.usuario.fecha)).format("YYYY/MM/DD HH:mm:ss"),
                areas: areasDisponibles,
                avisos: result,
                usuarios: [],
                tecnicos: response.allTecnicos,
                categorias: response.categorias
            })
        }
    }

    if (!request.session.usuario.tecnico) {
        daoAvisos.listarAvisosUsuario(request.session.usuario.idUser, false, func_callback)
    }
    else {
        daoAvisos.listarAvisosTecnico(request.session.usuario.idUser, false, func_callback)
    }
})

app.post("/asignarTecnico", middleLogueado, middleTecnico, function (request, response) {
    daoAvisos.asignarTecnico(request.body.idAviso, request.body.idTecnicoAsig, function (err, result) {
        if (err) {
            response.status(500)
        }
        else {
            response.redirect("/avisosEntrantes")
        }
    })
})

app.post("/eliminarUsuario", middleLogueado, middleTecnico, function (request, response) {
    daoUsers.setActivo(request.body.idUser, 0, function (err) {
        if (err) {
            response.status(500)
        }
        else {
            response.redirect("/gestionUsuarios")
        }
    })
})

//Eliminamos un aviso
app.post("/completarAviso", middleLogueado, middleTecnico, function (request, response) {
    let id = request.body.idAviso
    let respuesta = "Este aviso ha sido eliminado por el técnico " + request.session.usuario.nombre + " debido a: " + request.body.respuesta
    daoAvisos.asignarRespuesta(id, respuesta, function (err, result) {
        if (err) {
            response.status(500)
        }
        else {
            daoAvisos.completarAviso(id, function (err, result) {
                if (err) {
                    response.status(500)
                }
                else {
                    response.redirect("/avisos")
                }
            })
        }
    })

})


app.post("/asignarRespuesta", middleLogueado, middleTecnico, function (request, response) {
    daoAvisos.asignarRespuesta(request.body.idAviso, request.body.respuesta,
        function (err, result) {
            if (err)
                response.status(500)
            else
                response.redirect("/avisos")
        })
})

//Nuevo aviso
app.post("/nuevoAviso", middleLogueado, function (request, response) {
    let date = new Date()

    let aviso = {
        texto: request.body.descripcion,
        fecha: date.toISOString(),
        tipo: request.body.tipo,
        idUser: request.session.usuario.idUser,
        area: request.body.area.filter((item) => item !== "Selecciona uno")
    }

    daoAvisos.insertAviso(aviso, function (err, result) {
        if (err) {
            response.status(500)
        }
        else {
            response.status(200)
            response.redirect("/avisos")
        }
    })
})

//Login
app.get("/login", middleNoLogueado, function (request, response) {
    response.status(200)
    response.render("login")
})

app.get("/cerrarSesion", function (request, response) {
    request.session.destroy()
    response.redirect("/login")
})

app.post("/login",

    function (request, response) {

        daoUsers.isUserCorrect(request.body.email, request.body.password, function (err, existe) {
            if (err || !existe) {
                response.setFlash("Usuario o contraseña incorrectos")
                response.redirect("/login")
            }
            else {
                request.session.usuario = {
                    email: request.body.email, nombre: existe.nombre, perfil: existe.perfil,
                    tecnico: existe.tecnico, idUser: existe.idUser, fecha: existe.fecha, activo: existe.activo
                }
                response.redirect("/avisos")
            }
        })

    }
)



//Registro
app.get("/register", middleNoLogueado, function (request, response) {
    response.status(200)
    response.render("register")

})


app.post("/register", multerFactory.single('imagen'),

    check("email", "Direccion de correo no valida").custom((v) => { return v.slice(v.indexOf('@') + 1) == 'ucm.es' }),

    check("password", "Contraseña insegura").isStrongPassword({
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
    }),


    function (request, response) {

        const errors = validationResult(request);

        if (!errors.isEmpty()) {
            if (errors.errors.length == 1) {
                response.setFlash(errors.errors[0].msg);
                response.redirect("/register")
            }
            else {
                response.setFlash("Correo no valido y contraseña insegura");
                response.redirect("/register")
            }
        }
        else if (request.body.password !== request.body.cpassword) {
            response.setFlash("Las contraseñas no coinciden")
            response.redirect("/register")
        }
        else {

            let fecha = moment()
            let user = {
                email: request.body.email,
                password: request.body.password,
                userName: request.body.usuario,
                perfil: request.body.perfil,
                tecnico: (request.body.tecnico == '1') ? 1 : 0,
                numEmpleado: request.body.numero,
                img: (request.file) ? request.file.buffer : null,
                fecha: fecha.toISOString() //fecha.format("YYYY-MM-DD-HH-mm-ss")
            }

            daoUsers.insertUser(user, function (err, result) {
                if (err) {
                    response.setFlash("Error al registrarse")
                    response.redirect("/register")
                }
                else {
                    response.redirect("/login")
                }
            })

        }




    })

app.get("/imagen/:correo", middleLogueado, function (request, response) {
    daoUsers.getUserImageName(request.params.correo, function (err, img) {
        if (err || !img)
            response.sendFile(path.join(__dirname, "public", "img", "noUser.png"))
        else
            response.end(img)
    })

})

// Arrancar el servidor
app.listen(config.port, function (err) {
    if (err) {
        console.log("ERROR al iniciar el servidor");
    }
    else {
        console.log(`Servidor arrancado en el puerto ${config.port}`);
    }
});
