// app.js
const config = require("./config");
const path = require("path");
const mysql = require("mysql");
const express = require("express");
const session = require("express-session")
const mysqlSession = require("express-mysql-session");
const bodyParser = require("body-parser");
const fs = require("fs");
const { cachedDataVersionTag } = require("v8");
const { Console } = require("console");

//Creamos las sesiones
const MySqlStore = mysqlSession(session)
const sessionStore = new MySqlStore(config.mysqlConfig)

// Crear un servidor Express.js
const app = express();

// Crear un pool de conexiones a la base de datos de MySQL
const pool = mysql.createPool(config.mysqlConfig);




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

app.get("/", function(request, response){
    response.redirect("/login")
})

//Login
app.get("/login", function(request, response){
    //Aqui comprobaremos si el usuario ya esta loggeado

    response.status(200)
    response.render("login")
})


//Registro
app.get("/register", function(request, response){
    //Aqui comprobaremos si el usuario ya esta loggeado

    response.status(200)
    response.render("register")
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
