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
                connection.query("SELECT t.idTarea, t.texto, i1.hecho, e.texto AS tag "+
                "FROM aw_tareas_usuarios u JOIN aw_tareas_user_tareas i1 ON(u.idUser = i1.idUser) " +
                "JOIN aw_tareas_tareas t ON(i1.idTarea = t.idTarea) " +
                "JOIN aw_tareas_tareas_etiquetas i2 ON(t.idTarea = i2.idTarea) "+
                "JOIN aw_tareas_etiquetas e ON(i2.idEtiqueta = e.idEtiqueta) "+
                "WHERE u.email = ?;" , [email], 
                function(err, rows){
                    connection.release()
                    if(err){
                        callback(new Error("Error de acceso a la base de datos"))
                    }
                    else{
                        let tareasDistintas = null;
                        tareasDistintas = Array.from(new Set(
                            rows.map(t => t.idTarea))).map(idTarea => {
								return {
									ID: idTarea,
									Texto: rows.find(t => t.idTarea === idTarea).texto,
									Done: rows.find(t => t.idTarea === idTarea).hecho,
									Tags: Array.from(rows.map(function(t){
												if(t.idTarea === idTarea)
													return t.tag;
											})).filter(t => t!==undefined)
								}
                            })
                        callback(null, tareasDistintas)
                    }
                })
            }
        })
    }
}

module.exports = DAOTasks;