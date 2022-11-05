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


// daoUser.isUserCorrect("aitor.tilla@ucm.es", "aitor", cb_isUserCorrect);
// function cb_isUserCorrect(err, result) {
//     if (err) {
//         console.log(err.message);
//     } else if (result) {
//         console.log("Usuario y contraseña correctos");
//     } else {
//         console.log("Usuario y/o contraseña incorrectos");
//     }
// }

daoUser.getUserImageName("bill.puertas@ucm.es", function(err, res){
    if (err)
        console.log(err.message)
    else
        console.log(res)

})

// function cb_getAllTasks(err, result) {
//     if (err) {
//         console.log(err.message);
//     } else if (result != null) {
//         console.log(result);
//     } else {
//         console.log("Usuario y/o contraseña incorrectos");
//     }
// }
// daoTask.getAllTasks("aitor.tilla@ucm.es", cb_getAllTasks);

// function cb_insertTaks(err, result){
//     if(err){
//         console.log(err.message)
//     }
//     else if(result != null){
//         console.log(result)
//     }
//     else{
//         console.log("Insercion fallida")
//     }
// }

// let task = {text: "Hola que tal estas", done: false, tags: ["Hola", "Adios", "Que"]}
// daoTask.insertTask("aitor.tilla@ucm.es", task, cb_insertTaks)