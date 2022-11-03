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
    
    insertTask(email, task, callback){
        this.pool.getConnection(function(err, connection){
            if(err){
                callback(new Error("Error de conexión a la base de datos"))
            }
            else{
                connection.query("SELECT idUser FROM aw_tareas_usuarios WHERE email = ?;" , [email], 
                function(err, rows){
                    //connection.release();
                    if(err){
                        callback(new Error("Error de acceso a la base de datos 1"))
                    }
                    else{
                        if(rows[0].idUser != null){
                            let idUsuario = rows[0].idUser
                            let tagsins = ""
                            if(task != null){                              

                                if(task.tags != null){
                                    tagsins += "INSERT INTO aw_tareas_etiquetas(texto) VALUES"

                                    task.tags.forEach(tag => {
                                        tagsins += ",("+ tag + ")"
                                    })

                                    tagsins = tagsins.slice(0, tagsins.indexOf(",")) + tagsins.slice(tagsins.indexOf(",") + 1) + ";"
                                } 
                                                           
                                connection.query("INSERT INTO aw_tareas_tareas(texto) VALUES(?); "+ tagsins , [task.text],
                                function(err, rows){
                                    if(err){
                                        callback(err)
                                    }
                                    else{
                                        let idTarea = rows.insertId
                                        let insTareaUser = "INSERT INTO aw_tareas_usuar_tareas VALUES (" + idUsuario + "," + idTarea + ", "+ task.done + ");"
                                        let insTareaTags = ""
                                        if(rows.length>1){
                                            insTareaTags = "INSERT INTO aw_tareas_tareas_etiquetas VALUES (" + idTarea + "," + rows[1].idTag  + ")"
                                            if(rows.length > 2){
                                                for (let i = 2; i < rows.length; i++) {
                                                    insTareaTags += ",(" + idTarea + "," + rows[1].idTag  + ")"                                        
                                                }
                                            }                                           
                                        }
                                        
                                        connection.query(insTareaUser + insTareaTags + ";", function(err, rows){
                                            connection.release()
                                            if(err){
                                                callback(new Error("Error de acceso a la base de datos 3"))
                                            }
                                            else{
                                                callback(null, idTarea)
                                            }
                                        })
                                       
                                    }
                                })
                            }                            
                        }
                    }
                })
            }
        })
    }

}

module.exports = DAOTasks;