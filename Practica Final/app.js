// app.js
const config = require("./config");
const path = require("path");
const mysql = require("mysql");
const express = require("express");
const session = require("express-session")
const mysqlSession = require("express-mysql-session");
const bodyParser = require("body-parser");
const { check, validationResult, checkSchema } = require('express-validator');
const fs = require("fs");
const { cachedDataVersionTag } = require("v8");
const { Console } = require("console");

const multer = require("multer")


const DAOAvisos= require("./DAOAvisos.js");
const DAOUsers = require("./DAOUsers.js");
const { response } = require("express");


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
app.use(express.static(ficherosEstaticos)) //Lo que hace es permitir buscar la url estatica
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
    //if usuario loggueado, next
    if (req.session.email) {
        next()
    }
    else res.redirect("/login")
}

function middleNoLogueado(req, res, next) {
    //if usuario loggueado, next
    if (!req.session.email) {
        next()
    }
    else res.redirect("/avisos")
}

//Creamos un middleware que nos selecciona cuales son las posibles nuevas incidencias
//que tiene disponible el usuario segun su perfil

function middleIncidencias(request, response, next){
    
    if (request.session.perfil === "Alumno") areasDisponibles = areasIncidenciasA
    else if (request.session.perfil === "Antiguo Alumno") areasDisponibles = areasIncidenciasAA
    else if (request.session.perfil === "PAS") areasDisponibles = areasIncidenciasPAS
    else if (request.session.perfil === "PDI") areasDisponibles =  areasIncidenciasPDI

    next()
}

app.get("/", function (request, response) {
    response.redirect("/login")
})

//Pagina de avisos
app.get("/avisos", middleLogueado, middleIncidencias, function (request, response) {
    daoAvisos.listarAvisosUsuario(1, function(err, result){
        if(err){
            response.status(404)
        }
        else{
            response.status(200)
            response.render("avisos", {
                tipo: true,
                email: request.session.email,
                nombre: request.session.nombre,
                areas: areasDisponibles,
                avisos: result
            })//Falta cambiar el ejs
        }
    })
    
})

//Nuevo aviso
app.post("/nuevoAviso", middleLogueado, function(request, response){
    let date = new Date()
    //Aqui hay que poner el id del usuario sacado de la sesion
    let aviso = {
        texto : request.body.descripcion,
        fecha : date.toISOString(),
        tipo : request.body.tipo,
        idUser : 1,
        area : request.body.area.filter((item) => item !== "Selecciona uno")
    }
    console.log(aviso)
    daoAvisos.insertAviso(aviso, function(err, result){
        if(err){
            response.status(500)
        }
        else{
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

    check("email", "Campo email vacio").not().isEmpty(),
    check("password", "Campo contraseña vacio").not().isEmpty(),

    function (request, response) {
        const errors = validationResult(request);
        if (!errors.isEmpty()) {
            response.status(200)
            response.setFlash("Formulario incompleto")
            response.redirect("/login")
        }
        else {
            daoUsers.isUserCorrect(request.body.email, request.body.password, function (err, existe) {
                if (err || !existe) {
                    response.status(200)
                    response.setFlash("Usuario o contraseña incorrectos")
                    response.redirect("/login")
                }
                else {
                    request.session.email = request.body.email
                    request.session.nombre = existe.nombre
                    request.session.perfil = existe.perfil
                    request.session.tecnico = existe.tecnico
                    response.redirect("/avisos")
                }
            })

        }
    }
)



//Registro
app.get("/register", middleNoLogueado, function (request, response) {
    response.status(200)
    response.render("register")

})

app.post("/register", multerFactory.single('imagen'),

    check("password", "Contraseña insegura").not().isStrongPassword({
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
    }),

    function (request, response) {

        const errors = validationResult(request);

        if (!errors.isEmpty()) {
            response.setFlash("Contraseña insegura");
            response.redirect("/register")
        }
        if (request.body.password !== request.body.cpassword) {
            response.setFlash("Las contraseñas no coinciden")
            response.redirect("/register")
        }


        let user = {
            email: request.body.email,
            password: request.body.password,
            userName: request.body.usuario,
            perfil: request.body.perfil,
            tecnico: request.body.tecnico,
            numEmpleado: request.body.numero,
            img: null
        }

        if (request.file) {
            user.img = request.file.buffer
        }

        daoUsers.insertUser(user, function (err) {
            if (err) {
                response.setFlash("Error al registrarse")
                response.redirect("/register")
            }
            else {
                response.redirect("/login")
            }

        })

    })

app.get("/imagen/:correo", middleLogueado, function (request, response) {
    daoUsers.getUserImageName(request.params.correo, function (err, img) {
        if (!err) {
            response.end(img)
        }
        else {
            console.log("error")
        }
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
