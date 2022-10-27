"use strict"

class DAOTasks {
    constructor(pool) {
        this.pool = pool;
    }

    getAllTasks(email, callback){
        this.pool.getConnection(function(err, connection){
            if(err){
                callback(new Error("Error de conexión a la base de datos"))
            }
            else{
                connection.query("SELECT idUser FROM aw_tareas_usuarios WHERE email = ?" , [email], 
                function(err, rows){
                    if(err){
                        callback(new Error("Error de acceso a la base de datos"))
                    }
                })
            }
        })
    }
}

module.exports = DAOTasks;