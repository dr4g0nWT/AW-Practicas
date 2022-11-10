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
                        let tareasDistintas = [];
                        rows.forEach(function(e){
                            let i = tareasDistintas.findIndex(n => n.ID === e.idTarea)
                            if ( i === -1)
                                tareasDistintas.push({ID: e.idTarea, Texto: e.texto, Done: e.hecho, Tags: [e.tag]})   
                            else
                                tareasDistintas[i].Tags.push(e.tag)
            
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
                    if(err){
                        connection.release()
                        callback(new Error("Error de acceso a la base de datos"))
                    }
                    else{
                        if(rows[0].idUser != null){
                            let idUsuario = rows[0].idUser
                           
                            if(task != null || task != undefined){                      
                                connection.query("INSERT INTO aw_tareas_tareas(texto) VALUES(?); ", [task.text],
                                function(err, rows){
                                    if(err){
                                        connection.release()
                                        callback(new Error("Error de acceso a la base de datos"))
                                    }
                                    else{
                                        let idTarea = rows.insertId                                       
                                        //Ahora asignamos el userid y la tagid a la tabla intermedia
                                  
                                        connection.query("INSERT INTO aw_tareas_user_tareas (idUser, idTarea, hecho) VALUES (?,?,?);",
                                        [idUsuario, idTarea, task.done], function(err, rows){
                                            if(err){
                                                connection.release()
                                                callback(new Error("Error de acceso a la base de datos"))
                                            }
                                            else{
                                                if(task.tags != null){ //Si hay alguna tarea
                                                    let insertTags = "INSERT INTO aw_tareas_etiquetas(texto) VALUES "
                                                    task.tags.forEach(tag => {
                                                        insertTags += ",(?)"
                                                    });
                                                    insertTags = insertTags.slice(0, insertTags.indexOf(",")) + insertTags.slice(insertTags.indexOf(",") + 1) + ";"                                                   

                                                    connection.query(insertTags, task.tags, function(err, result){
                                                        if(err){
                                                            connection.release()
                                                            callback(new Error("Error de acceso a la base de datos"))
                                                        }
                                                        else{
                                                            let idTareaTags = []
                                                
                                                            
                                                            for(let i = 0; i<task.tags.length; i++){
                                                                idTareaTags.push(idTarea)
                                                                idTareaTags.push(result.insertId + i)
                                                            }                                                            

                                                            let insertTareasTags = "INSERT INTO aw_tareas_tareas_etiquetas(idTarea, idEtiqueta) VALUES"
                                                            
                                                            for(let i = 0; i<task.tags.length ; i++){
                                                                if (i == 0) insertTareasTags += "(?, ?)"
                                                                else insertTareasTags += ",(?, ?)"
                                                                
                                                            }
                                                            //Unimos ambas inserciones con las correspondintes tablas intermedias
                                                            connection.query(insertTareasTags, idTareaTags , function(err, result){
                                                                if(err){
                                                                    callback(new Error("Error de acceso a la base de datos"))
                                                                }
                                                                else{
                                                                    connection.release()
                                                                    callback(null, idTarea)
                                                                }
                                                            })
                                                        }
                                                    })
                                                }
                                                else{
                                                    connection.release()
                                                    callback(null, idTarea)
                                                }
                                            }
                                        })
                                        
                                        
                                       
                                       
                                    }
                                })
                            }
                            else{
                                connection.release()
                                callback(new Error("La tarea recibida es vacia"))
                            }                            
                        }
                        else{
                            connection.release()
                            callback(new Error("No existe el usuario"))
                        }
                    }

                })
            }
        })
    }


    markTaskDone(idTask, callback){

        this.pool.getConnection(function(err, connection){

            if (err)
                callback(new Error("Error de conexión a la base de datos"))
            else{

                connection.query("update aw_tareas_user_tareas set hecho = 1 where idTarea = ?",
                [idTask],
                function(err){
                    connection.release()
                    if (err)
                        callback(new Error("Error de acceso a la base de datos"))
                    else
                        callback(null)

                })
            }


        })

    }

    deleteCompleted(email, callback){

        this.pool.getConnection(function(err, connection){

            if (err)
                callback(new Error("Error de conexión a la base de datos"))
            else{

                connection.query(`

                    delete t
                    from aw_tareas_user_tareas t join aw_tareas_usuarios u on(t.idUser = u.idUser)
                    where u.email = ? and t.hecho = 1
                
                `,
                [email],
                function(err){

                    connection.release()
                    if (err)
                        callback(new Error("Error de acceso a la base de datos"))
                    else
                        callback(null)

                })


            }
        })

    }


}

module.exports = DAOTasks;