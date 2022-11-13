"use strict"

class DAOTasks {
    constructor(pool) {
        this.pool = pool;
    }

    getAllTasks(email, callback) {
        this.pool.getConnection(function (err, connection) {
            if (err) {
                callback(new Error("Error de conexión a la base de datos"))
            }
            else {
                connection.query("SELECT t.idTarea, t.texto, i1.hecho, e.texto AS tag " +
                    "FROM aw_tareas_usuarios u JOIN aw_tareas_user_tareas i1 ON(u.idUser = i1.idUser) " +
                    "JOIN aw_tareas_tareas t ON(i1.idTarea = t.idTarea) " +
                    "JOIN aw_tareas_tareas_etiquetas i2 ON(t.idTarea = i2.idTarea) " +
                    "JOIN aw_tareas_etiquetas e ON(i2.idEtiqueta = e.idEtiqueta) " +
                    "WHERE u.email = ?;"
                    ,[email]
                    ,function (err, rows) {
                        connection.release()
                        if (err) {
                            callback(new Error("Error de acceso a la base de datos"))
                        }
                        else {
                            let tareasDistintas = [];
                            rows.forEach(function (e) {
                                let i = tareasDistintas.findIndex(n => n.ID === e.idTarea)
                                if (i === -1)
                                    tareasDistintas.push({ ID: e.idTarea, Texto: e.texto, Done: e.hecho, Tags: [e.tag] })
                                else
                                    tareasDistintas[i].Tags.push(e.tag)
                            })
                            callback(null, tareasDistintas)
                        }
                    })
            }
        })
    }

    insertTask(email, task, callback) {
        this.pool.getConnection(function (err, connection) {
            if (err) {
                callback(new Error("Error de conexión a la base de datos"))
            }
            else { //Lo primero que hacemos es seleccionar el id del usuario
                connection.query("SELECT idUser FROM aw_tareas_usuarios WHERE email = ?;", [email],
                    function (err, rows) {
                        if (err) {
                            connection.release()
                            callback(new Error("Error de acceso a la base de datos"))
                        }
                        else { //Si existe el usuario entonces buscamos si ya existe la tarea que queremos insertar
                            if (rows[0].idUser != null) {
                                let idUsuario = rows[0].idUser

                                if (task != null || task != undefined) {

                                    connection.query("SELECT idTarea FROM aw_tareas_tareas WHERE texto = ?", task.text,
                                        function (err, rows) {
                                            if (err) {
                                                connection.release()
                                                callback(new Error("Error de acceso a la base de datos"))
                                            }
                                            else { //Si existe guardamos su id, luego insertamos la tarea en caso de que no exista
                                                let idTarea
                                                if (rows.length != 0) {
                                                    idTarea = rows[0].idTarea
                                                }
                                                connection.query("INSERT IGNORE INTO aw_tareas_tareas(texto) VALUES(?); ", [task.text],
                                                    function (err, rows) {
                                                        if (err) {
                                                            connection.release()
                                                            callback(new Error("Error de acceso a la base de datos"))
                                                        }
                                                        else {
                                                            if (idTarea === undefined) {
                                                                idTarea = rows.insertId
                                                            }

                                                            //Ahora asignamos el userid y la taskid a la tabla intermedia                                                    

                                                            connection.query("INSERT INTO aw_tareas_user_tareas (idUser, idTarea, hecho) VALUES (?,?,?);",
                                                                [idUsuario, idTarea, task.done], function (err, rows) {
                                                                    if (err) {
                                                                        connection.release()
                                                                        callback(new Error("Error de acceso a la base de datos"))
                                                                    }
                                                                    else {
                                                                        if (task.tags != null) { //Si hay alguna tarea

                                                                            let where = "WHERE texto = ? "

                                                                            for (let i = 1; i < task.tags.length; i++) {
                                                                                where += "OR texto = ? "
                                                                            }
                                                                            //Buscamos todas las tags por si alguna ya existe
                                                                            connection.query("SELECT idEtiqueta AS idTag FROM aw_tareas_etiquetas " + where + ";", task.tags,
                                                                                function (err, rows) {
                                                                                    if (err) {
                                                                                        connection.release()
                                                                                        callback(new Error("Erros de acceso a la base de datos select"))
                                                                                    }
                                                                                    else {
                                                                                        let arrayIdTags = [] //Aqui guardamos las id de las tags que si existian
                                                                                        rows.forEach(tag => {
                                                                                            arrayIdTags.push(tag.idTag)
                                                                                        });

                                                                                        //Ahora insertaremos las tags que no existian ya
                                                                                        let insertTags = "INSERT IGNORE INTO aw_tareas_etiquetas(texto) VALUES "
                                                                                        task.tags.forEach(tag => {
                                                                                            insertTags += ",(?)"
                                                                                        });
                                                                                        insertTags = insertTags.slice(0, insertTags.indexOf(",")) + insertTags.slice(insertTags.indexOf(",") + 1) + ";"

                                                                                        connection.query(insertTags, task.tags, function (err, result) {
                                                                                            if (err) {
                                                                                                connection.release()
                                                                                                callback(new Error("Error de acceso a la base de datos\n" + err.message))
                                                                                            }
                                                                                            else { //Lo que haremos ahora es guardar los id de las tareas que acabamos de 
                                                                                                //Ademas creamos un array con el id de la tarea y de la tag para asociarlos a la
                                                                                                //tabla intermedia
                                                                                                let idTareaTags = []

                                                                                                arrayIdTags.forEach(id => {
                                                                                                    idTareaTags.push(idTarea)
                                                                                                    idTareaTags.push(id)
                                                                                                });

                                                                                                for (let i = 0; i < task.tags.length - arrayIdTags.length; i++) {
                                                                                                    idTareaTags.push(idTarea)
                                                                                                    idTareaTags.push(result.insertId + i)
                                                                                                }
                                                                                                //Unimos ambas inserciones con las correspondintes tablas intermedias
                                                                                                let insertTareasTags = "INSERT IGNORE INTO aw_tareas_tareas_etiquetas(idTarea, idEtiqueta) VALUES"

                                                                                                for (let i = 0; i < task.tags.length; i++) {
                                                                                                    if (i == 0) insertTareasTags += "(?, ?)"
                                                                                                    else insertTareasTags += ",(?, ?)"

                                                                                                }


                                                                                                connection.query(insertTareasTags, idTareaTags, function (err, result) {
                                                                                                    if (err) {
                                                                                                        callback(new Error("Error de acceso a la base de datos final"))
                                                                                                    }
                                                                                                    else {
                                                                                                        connection.release()
                                                                                                        callback(null, [idTarea, email])
                                                                                                    }
                                                                                                })
                                                                                            }
                                                                                        })
                                                                                    }
                                                                                })
                                                                        }
                                                                        else {
                                                                            connection.release()
                                                                            callback(null, [idTarea, email])
                                                                        }
                                                                    }
                                                                })
                                                        }
                                                    })
                                            }
                                        })
                                }
                                else {
                                    connection.release()
                                    callback(new Error("La tarea recibida es vacia"))
                                }
                            }
                            else {
                                connection.release()
                                callback(new Error("No existe el usuario"))
                            }
                        }

                    })
            }
        })
    }


    markTaskDone(idTask, callback) {

        this.pool.getConnection(function (err, connection) {

            if (err)
                callback(new Error("Error de conexión a la base de datos"))
            else {

                connection.query("update aw_tareas_user_tareas set hecho = 1 where idTarea = ?",
                    [idTask],
                    function (err) {
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
    
                //Obtenemos al usuario por su email
                connection.query(`
                    select idUser
                    from aw_tareas_usuarios
                    where email = ?
                `,
                [email],
                function(err, res){
         
                    if (err){
                        connection.release()
                        callback(new Error("Error de acceso a la base de datos"))
                    }  
                    else{
                        
                        if (res.length == 0){
                            connection.release()
                            callback(new Error("Usuario no existe"));
                        }
                        else{ // Si existe un usuario con el email especificado
    
                            let idUser = res[0]["idUser"]
                            
                            //Borramos todas las tareas terminadas del usuario
                            connection.query(
                                `delete
                                 from aw_tareas_user_tareas
                                 where idUser = ? and hecho = 1`,
                                 [idUser],
                                 function(err){

                                    if (err){
                                        connection.release()
                                        callback(new Error("Error de acceso a la base de datos"))
                                    }        
                                    else{

                                        //Agrupamos por todas las tareas existentes y contamos cuantos usuarios las tienen
                                        connection.query(
                                            `select t.idTarea, count(idUser) as num
                                             from aw_tareas_user_tareas u right join aw_tareas_tareas t on(t.idTarea = u.idTarea)
                                             group by t.idTarea`,
                                             function(err, res){

                                                if (err){
                                                    connection.release()
                                                    callback(new Error("Error de acceso a la base de datos"))
                                                }
                                                else{
                                                    
                                                    //Nos quedamos con el id aquellas tareas que no tienen ningun usuario asociado
                                                    let borrar = res.filter(e => e["num"] == 0).map(e => e["idTarea"])

                                                    if (borrar.length == 0){ //Si no hay ninguna tarea "suelta" acabamos
                                                        connection.release()
                                                        callback(null)
                                                    }        
                                                    else{ //En caso contrario borramos dichas tareas de la tabla tareas y la tabla tareas_etiquetas

                                                        let deleteTarea = "delete from aw_tareas_tareas where "
                                                        let deleteTarea_etiqueta = "delete from aw_tareas_tareas_etiquetas where "

                                                        let add = ""
                                                        for (let i = 0; i < borrar.length; i++){
                                                            if (i > 0) add += " or "
                                                            add += "idTarea = ?"   
                                                        }
                                                        deleteTarea += add
                                                        deleteTarea_etiqueta += add

                                                        connection.query(deleteTarea, borrar, function(err){
                                                                if (err){
                                                                    connection.release()
                                                                    callback(err)
                                                                }      
                                                                else{
                                                                    connection.query(deleteTarea_etiqueta, borrar, function(err){
                                                                        connection.release()
                                                                        if (err)
                                                                            callback(new Error(err))
                                                                        else
                                                                            callback(null)
                                                                    })
                                                                }
                                                            }
                                                        )
                                                    }
                                                }
                                            }
                                        )
                                    }
                                 }
                            )
                        }
                    }
                })
            }
        })
    }
}



module.exports = DAOTasks;