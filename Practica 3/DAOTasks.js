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
                                connection.query("INSERT INTO aw_tareas_tareas(texto) VALUES(?); ", [task.text],
                                function(err, rows){
                                    if(err){
                                        callback(err)
                                    }
                                    else{
                                        let idTarea = rows.insertId
                                        
                                        //Ahora asignamos el userid y la tagid a la tabla intermedia
                                        console.log("AHORA")
                                        connection.query("INSERT INTO aw_tareas_user_tareas (idUser, idTarea, hecho) VALUES (?,?,?);"
                                        [idUsuario, idTarea, task.done], function(err, rows){
                                            if(err){
                                                callback(err)
                                            }
                                            else{
                                                if(task.tags != null){ //Si hay alguna tarea
                                                    let insertTags = ""
                                                    console.log("LLEGO")
                                                    insertTags += "INSERT INTO aw_tareas_etiquetas(texto) VALUES "
                                                    task.tags.forEach(tag => {
                                                        insertTags += ",(\"" + tag + "\")"
                                                    });
                                                    insertTags = insertTags.slice(0, insertTags.indexOf(",")) + insertTags.slice(insertTags.indexOf(",") + 1) + ";"
        
                                                    connection.query(insertTags, function(err, result){
                                                        if(err){
                                                            callback(err)
                                                        }
                                                        else{
                                                            let idTareas = []
                                                            let idTarea1 = result.insertId
                                                            
                                                            for(let i = 0; i<task.tags.length; i++){
                                                                idTareas.push(idTarea1 + i)
                                                            }
                                                            console.log(idTareas + "," + task.tags.length)
                                                            let insertTareasTags = "INSERT INTO aw_tareas_tareas_etiquetas(idTarea, idEtiqueta) VALUES ("+ idTarea +
                                                                "," + idTarea1 + ")"
                                                            
                                                            for(let i = 1 ; i<task.tags.length ; i++){
                                                                let id = i + idTarea1
                                                                insertTareasTags += ",("+ idTarea + "," + id + ")"
                                                            }
                                                            //Unimos ambas inserciones con las correspondintes tablas intermedias
                                                            connection.query(insertTareasTags, function(err, result){
                                                                if(err){
                                                                    callback(err)
                                                                }
                                                                else{
                                                                    connection.release()
                                                                    console.log("Tareas insertadas correctamente")
                                                                    callback(null, result)
                                                                }
                                                            })
                                                        }
                                                    })
                                                }
                                                else{
                                                    callback(null, rows)
                                                }
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