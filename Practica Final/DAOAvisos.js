"use strict"

class DAOAvisos{
    constructor(pool){
        this.pool = pool
        console.log("DAO Avisos creado")
    }

    insertAviso(aviso, callback){
        //AVISO es del tipo:
        //{texto : "", fecha : "", tipo : int, idUser : int, area : ""}

        this.pool.getConnection(function(err, connection){
            if(err){
                callback(new Error("Error de conexión a la base de datos"))
            }
            else{
                console.log("Aqui estoy")
                connection.query(`INSERT INTO UCM_AW_CAU_AVI_Avisos (texto, fecha, tipo, idUser, area, activo)
                VALUES (?, ?, ?, ?, ?, ?)`,
                [aviso.texto, aviso.fecha, aviso.tipo, aviso.idUser, aviso.area, true],
                function(err, result){
                    if(err){
                        connection.release()
                        callback(new Error("Problema en el acceso a la base de datos"))
                    }
                    else{
                        connection.release()
                        console.log("Final de insert")
                        callback(null)
                    }
                })
            }
        })
    }

    asignarTecnico(idAviso, idTecnico, callback){
        this.pool.getConnection(function(err, connection){
            if(err){
                callback(new Error("Error de conexión a la base de datos"))
            }
            else{
                connection.query(`UPDATE UCM_AW_CAU_AVI_Avisos SET idTecnico = ? WHERE idAviso = ?`,
                [idTecnico, idAviso],
                function(err, result){
                    if(err){
                        connection.release()
                        callback(new Error("Problema en el acceso a la base de datos"))
                    }
                    else{
                        connection.release()
                        callback(null)
                    }
                })
            }
        })
    }

    asignarRespuesta(idAviso, respuesta, callback){
        this.pool.getConnection(function(err, connection){
            if(err){
                callback(new Error("Error de conexión a la base de datos"))
            }
            else{
                connection.query(`UPDATE UCM_AW_CAU_AVI_Avisos SET respuesta = ? WHERE idAviso = ?`,
                [respuesta, idAviso],
                function(err, result){
                    if(err){
                        connection.release()
                        callback(new Error("Problema en el acceso a la base de datos"))
                    }
                    else{
                        connection.release()
                        callback(null)
                    }
                })
            }
        })
    }

    completarAviso(idAviso, callback){
        this.pool.getConnection(function(err, connection){
            if(err){
                callback(new Error("Error de conexión a la base de datos"))
            }
            else{
                connection.query(`UPDATE UCM_AW_CAU_AVI_Avisos SET activo = 0 WHERE idAviso = ?`,
                [idAviso],
                function(err, result){
                    if(err){
                        connection.release()
                        callback(new Error("Problema en el acceso a la base de datos"))
                    }
                    else{
                        connection.release()
                        callback(null)
                    }
                })
            }
        })
    }


    listarAvisosUsuario(idUser, activo, callback){
        this.pool.getConnection(function(err, connection){
            if(err){
                callback(new Error("Error de conexión a la base de datos"))
            }
            else{
                connection.query(`SELECT idAviso, texto, fecha, tipo, respuesta, area, idTecnico FROM
                UCM_AW_CAU_AVI_Avisos WHERE idUser = ? AND activo = ?`,
                [idUser, activo],
                function(err, result){
                    if(err){
                        connection.release()
                        callback(new Error("Problema en el acceso a la base de datos"))
                    }
                    else{
                        connection.release()
                        callback(null, result)
                    }
                })
            }
        })
    }

    listarAvisosTecnico(idTecnico, activo, callback){
        this.pool.getConnection(function(err, connection){
            if(err){
                callback(new Error("Error de conexión a la base de datos"))
            }
            else{
                connection.query(`SELECT idAviso, texto, fecha, tipo, respuesta, area, idTecnico FROM
                UCM_AW_CAU_AVI_Avisos WHERE idTecnico = ? AND activo = ?`,
                [idTecnico, activo],
                function(err, result){
                    if(err){
                        connection.release()
                        callback(new Error("Problema en el acceso a la base de datos"))
                    }
                    else{
                        connection.release()
                        callback(null, result)
                    }
                })
            }
        })
    }

    listarAvisosSinTencico(callback){
        this.pool.getConnection(function(err, connection){
            if(err){
                callback(new Error("Error de conexión a la base de datos"))
            }
            else{
                connection.query(`SELECT idAviso, texto, fecha, tipo, respuesta, activo, area, idTecnico FROM
                UCM_AW_CAU_AVI_Avisos WHERE idTecnico IS NULL`,
                function(err, result){
                    if(err){
                        connection.release()
                        callback(new Error("Problema en el acceso a la base de datos"))
                    }
                    else{
                        connection.release()
                        callback(null, result)
                    }
                })
            }
        })
    }

    listarAvisos
}

module.exports = DAOAvisos