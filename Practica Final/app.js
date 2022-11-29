// app.js
const config = require("./config");
const path = require("path");
const mysql = require("mysql");
const express = require("express");
const session = require("express-session")
const mysqlSession = require("express-mysql-session");
const bodyParser = require("body-parser");
const { check, validationResult } = require('express-validator');
const fs = require("fs");
const { cachedDataVersionTag } = require("v8");
const { Console } = require("console");

const multer = require("multer")
const multerFactory = multer({ dest: path.join(__dirname, "images")});

const DAOUsers = require("./DAOUsers.js");
const { response } = require("express");


//Creamos las sesiones
const MySqlStore = mysqlSession(session)
const sessionStore = new MySqlStore(config.mysqlConfig)

// Crear un servidor Express.js
const app = express();

// Crear un pool de conexiones a la base de datos de MySQL
const pool = mysql.createPool(config.mysqlConfig);
const daoUsers = new DAOUsers(pool)



//Direccion ficheros estaticos:
const ficherosEstaticos = path.join(__dirname, "public")

//Montamos motor de las ejs y ademas añadimos el path views
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

//Middleware static
app.use(express.static(ficherosEstaticos)) //Lo que hace es permitir buscar la url estatica
app.use(bodyParser.urlencoded({extended: false}))

//Middleware Sesiones
const middlewareSessions = session({
    saveUninitialized : false,
    name: "session-id",
    secret : "foobar34",
    resave: false,
    store: sessionStore
})

app.use(middlewareSessions)

function flashMiddleware(request, response, next){
    response.setFlash = function(msg){
        request.session.flashMsg = msg
    }
    response.locals.getAndClearFlash = function(){
        let msg = request.session.flashMsg
        delete request.session.flashMsg
        return msg
    }
    
    next()
}


app.use(flashMiddleware)

//Creamos los middle para meter las sesiones
function middleLogueado(req, res, next){
	//if usuario loggueado, next
	if(req.session.user){   
		next()
	}
	else res.redirect("/login")
}

function middleNoLogueado(req, res, next){
	//if usuario loggueado, next
	if(!req.session.user){
		next()
	}
	else res.redirect("/avisos")
}

app.get("/",function(request, response){
    response.redirect("/login")
})

//Pagina de avisos
app.get("/avisos",middleLogueado, function(request, response){
    response.status(200)
    response.render("avisos")//Falta cambiar el ejs
})

//Login
app.get("/login", middleNoLogueado, function(request, response){
    response.status(200)
    response.render("login")
})

app.get("/cerrarSesion", function(request, response){
    request.session.destroy()
    response.redirect("/login")
})

app.post("/login", 

    check("email", "Campo email vacio").not().isEmpty(),
    check("password", "Campo contraseña vacio").not().isEmpty(),

    function(request, response){
        const errors = validationResult(request);
        if (!errors.isEmpty()){
            response.status(200)
            response.setFlash("Formulario incompleto")
            response.redirect("/login")
        }       
        else{
            daoUsers.isUserCorrect(request.body.email, request.body.password, function(err, existe){
                if (err || !existe){
                    response.status(200)
                    response.setFlash("Usuario o contraseña incorrectos")
                    response.redirect("/login")
                }
                else{
                    request.session.user = request.body.email
                    response.redirect("/avisos")
                }
            })
        
        }
    }
)



//Registro
app.get("/register", middleNoLogueado,function(request, response){
    response.status(200)
    response.render("register", {errores: []})

})

app.post("/register", 
    multerFactory.single('imagen'), 
    check("password", "Contraseña insegura").isStrongPassword({
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1
    }),
    check("email", "Email inválido").isEmail(),
    check("usuario", "Campo nombre vacío").not().isEmpty(),
    function(request, response){
    //email
    //usuario
    //password
    //perfil
    //imagen
    //tecnico
    //numero
    const errors = validationResult(request);
        if (!errors.isEmpty()) {
            response.render("register", {errores: errors.array()})
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

    if (request.file){
        user.img = request.file.buffer
    }
    console.log(user.img)

    daoUsers.insertUser(user, function(err){
        if (err)
            console.log("Error")
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
