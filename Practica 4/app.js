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
// Crear un servidor Express.js
const app = express();
// Crear un pool de conexiones a la base de datos de MySQL
const pool = mysql.createPool(config.mysqlConfig);
// Crear una instancia de DAOTasks
const daoT = new DAOTasks(pool);
//Direccion ficheros estaticos:
const ficherosEstaticos = path.join(__dirname, "public")
//Montamos motor de las ejs y ademas añadimos el path views
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

//Middleware static
app.use(express.static(ficherosEstaticos)) //Lo que hace es permitir buscar la url estatica

//Get para tasks
app.get("/tasks", function(request, response){
    //Llamamos a la funcion getAllTasks
    daoT.getAllTasks("usuario@ucm.es", function(err, result){
        if(err){
            console.log(err)        
        }
        else{
            //console.log(result)
            response.render("tasks", {tasks: result})
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
