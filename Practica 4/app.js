// app.js
const config = require("./config");
const DAOTasks = require("./DAOTasks");
const utils = require("./utils");
const path = require("path");
const mysql = require("mysql");
const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const { cachedDataVersionTag } = require("v8");
const Utils = require("./utils");
const { Console } = require("console");

// Crear un servidor Express.js
const app = express();

// Crear un pool de conexiones a la base de datos de MySQL
const pool = mysql.createPool(config.mysqlConfig);

// Crear una instancia de DAOTasks
const daoT = new DAOTasks(pool);

const ut = new utils();

//Direccion ficheros estaticos:
const ficherosEstaticos = path.join(__dirname, "public")

//Montamos motor de las ejs y ademas añadimos el path views
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

//Middleware static
app.use(express.static(ficherosEstaticos)) //Lo que hace es permitir buscar la url estatica
app.use(bodyParser.urlencoded({extended: false}))

app.get("/", function(request, response){
    response.redirect("/tasks")
})

//Get para tasks
app.get("/tasks", function(request, response){
   
    daoT.getAllTasks("usuario@ucm.es", function(err, result){
        if(err){
            console.log(err)        
        }
        else{
            response.status(200)
            response.render("tasks", {tasks: result})
        }
    })
})

app.post("/addTask", function(request, response){

   let des = request.body.descripcion
   let task = ut.createTask(des);
   

    daoT.insertTask("usuario@ucm.es", task, function(err, res){
        if (err){
            console.log("Error al insertar")
        }
        else{
            response.status(200)
            response.redirect("/tasks")
        }
    })
   
 
   


})

app.post("/finish/:taskId", function(request, response){

   
    let id = request.params.taskId
    daoT.markTaskDone(id, function(err){
        if (err){
            console.log("Error")
        }
        else{
            response.status(200)
            response.redirect("/tasks")
        }
    })

})

app.post("/deleteCompleted", function(request, response){
    daoT.deleteCompleted("usuario@ucm.es", function(err){
        if (err){
            console.log("Error")
        }
        else{
            response.status(200)
            response.redirect("/tasks")
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
