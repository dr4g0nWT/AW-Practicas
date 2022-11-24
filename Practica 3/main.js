"use strict";
const mysql = require("mysql");
const config = require("./config");
const DAOUsers = require("./DAOUsers.js");
const DAOTasks = require("./DAOTasks");
const { database } = require("./config");

// Crear el pool de conexiones

const pool = mysql.createPool({
    host: config.host,
    user: config.user,
    password: config.password,
    database: config.database
});

let daoUser = new DAOUsers(pool);
let daoTask = new DAOTasks(pool);


// Definición de las funciones callback
// Uso de los métodos de las clases DAOUsers y DAOTasks


//daoUser.isUserCorrect("aitor.tilla@ucm.es", "aitor", cb_isUserCorrect);
function cb_isUserCorrect(err, result) {
    if (err) {
        console.log(err.message);
    } else if (result) {
        console.log("Usuario y contraseña correctos");
    } else {
        console.log("Usuario y/o contraseña incorrectos");
    }
}

//daoUser.getUserImageName("bill.puertas@ucm.es", cb_getUserImageName);
function cb_getUserImageName(err,result){
    if (err){
        console.log(err.message)
    }
    else{
        console.log(result)
    }
}



//daoTask.getAllTasks("steve.curros@ucm.es", cb_getAllTasks);
function cb_getAllTasks(err, result) {
    if (err) {
        console.log(err.message);
    } else if (result != null) {
        console.log(result);
    } else {
        console.log("Tareas: " + result);
    }
}


let task = { text: "Hacer la colada", done: false, tags: ["Meditacion", "Hogar", "Limpieza"] }

daoTask.insertTask("steve.curros@ucm.es", task, cb_insertTaks)
function cb_insertTaks(err, result) {
    if (err) {
        console.log(err.message)
    }
    else if (result != null) {
        console.log("Se ha insertado correctamente la tarea con id: " + result[0] + "\nAl usuario: " + result[1])
    }
    else {
        console.log("Insercion fallida")
    }
}


//daoTask.markTaskDone(3, cb_markTaskDone)
function cb_markTaskDone(err){
    if (err)
        console.log(err.message)
    else
        console.log("Marcar Completado")
}

//daoTask.deleteCompleted("aitor.tilla@ucm.es", cb_deleteCompleted)
function cb_deleteCompleted(err){
    if (err)
        console.log(err.message)
    else
        console.log("Borrar completado")
}