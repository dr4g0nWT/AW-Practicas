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
                connection.query(`INSERT INTO UCM_AW_CAU_AVI_Avisos (texto, fecha, tipo, idUser, area, activo)
                VALUES (?, ?, ?, ?, ?, ?)`,
                [aviso.texto, aviso.fecha, aviso.tipo, aviso.idUser, aviso.area, true],
                function(err, result){
                    if(err){
                        callback(new Error("Problema en el acceso a la base de datos"))
                    }
                    else{
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
                        callback(new Error("Problema en el acceso a la base de datos"))
                    }
                    else{
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
                        callback(new Error("Problema en el acceso a la base de datos"))
                    }
                    else{
                        callback(null)
                    }
                })
            }
        })
    }


    listarAvisosUsuario(idUser, callback){
        this.pool.getConnection(function(err, connection){
            if(err){
                callback(new Error("Error de conexión a la base de datos"))
            }
            else{
                connection.query(`SELECT texto, fecha, tipo, respuesta, area, activo, idTecnico FROM
                UCM_AW_CAU_AVI_Avisos WHERE idUser = ?`,
                [idUser],
                function(err, result){
                    if(err){
                        callback(new Error("Problema en el acceso a la base de datos"))
                    }
                    else{
                        callback(null)
                    }
                })
            }
        })
    }

    listarAvisosTecnico(idTecnico, callback){
        this.pool.getConnection(function(err, connection){
            if(err){
                callback(new Error("Error de conexión a la base de datos"))
            }
            else{
                connection.query(`SELECT texto, fecha, tipo, respuesta, area, activo, idTecnico FROM
                UCM_AW_CAU_AVI_Avisos WHERE idTecnico = ?`,
                [idTecnico],
                function(err, result){
                    if(err){
                        callback(new Error("Problema en el acceso a la base de datos"))
                    }
                    else{
                        callback(null)
                    }
                })
            }
        })
    }
}

module.exports(DAOAvisos)