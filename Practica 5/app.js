// app.js
const config = require("./config");
const DAOTasks = require("./DAOTasks");
const utils = require("./utils");
const path = require("path");
const mysql = require("mysql");
const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session")
const mysqlSession = require("express-mysql-session")
const DAOUsers = require("./DAOUsers.js");
const { response } = require("express");

const MySqlStore = mysqlSession(session)
const sessionStore = new MySqlStore(config.mysqlConfig)

// Crear un servidor Express.js
const app = express();

// Crear un pool de conexiones a la base de datos de MySQL
const pool = mysql.createPool(config.mysqlConfig);

// Crear una instancia de DAOTasks
const daoT = new DAOTasks(pool);
const daoU = new DAOUsers(pool)
const ut = new utils();

//Direccion ficheros estaticos:
const ficherosEstaticos = path.join(__dirname, "public")

//Montamos motor de las ejs y ademas añadimos el path views
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

//Middleware static
app.use(express.static(ficherosEstaticos)) //Lo que hace es permitir buscar la url estatica
app.use(bodyParser.urlencoded({extended: false}))

const middlewareSessions = session({
    saveUninitialized: false,
    name: "session-id",
    secret: "foobar34",
    resave: false,
    store: sessionStore
})

app.use(middlewareSessions)

function middleLogueado(req, res, next) {
    //if usuario loggueado, next
    if (req.session.currentUser) {
        res.locals.userEmail = req.session.currentUser
        next()
    }
    else res.redirect("/login")
}


app.get("/", function(request, response){
    response.redirect("/login")
})

app.get("/login", function(request, response){
    response.status(200)
    response.render("login", {errorMsg: null})
})

app.post("/login", function(request, response){

    daoU.isUserCorrect(request.body.email, request.body.password, function (err, existe) {
        if (err || !existe) {
            response.render("login", {errorMsg: "Dirección decorreo y/o contraseña no válidos"})
        }
        else {
            request.session.currentUser = request.body.email
            response.redirect("/tasks")
        }
    })

})

app.post("/logout", middleLogueado, function(request, response){
    request.session.destroy()
    response.redirect("/login")
})

//Get para tasks
app.get("/tasks", middleLogueado, function(request, response){
   
    daoT.getAllTasks(request.session.currentUser, function(err, result){
        if(err){
            response.status(404)     
        }
        else{
            response.status(200)
            response.render("tasks", {tasks: result})
        }
    })
})

app.post("/addTask", middleLogueado, function(request, response){

   let des = request.body.descripcion
   let task = ut.createTask(des);
   

    daoT.insertTask(request.session.currentUser, task, function(err, res){
        if (err){
            response.status(404)
        }
        else{
            response.status(200)
            response.redirect("/tasks")
        }
    })
   

})

app.post("/finish/:taskId", middleLogueado, function(request, response){
    let id = request.params.taskId
    daoT.markTaskDone(id, request.session.currentUser, function(err){
        if (err){
            response.status(404)
        }
        else{
            response.status(200)
            response.redirect("/tasks")
        }
    })

})

app.post("/deleteCompleted", middleLogueado, function(request, response){
    daoT.deleteCompleted(request.session.currentUser, function(err){
        if (err){
            response.status(404)
        }
        else{
            response.status(200)
            response.redirect("/tasks")
        }
    })
})

app.get("/imagenUsuario", middleLogueado, function(request, response){
    daoU.getUserImageName(request.session.currentUser, function(err, img){
        response.sendFile(path.join(__dirname, "public", "profile_imgs", (err || !img) ?"noUser.png" : img))
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
