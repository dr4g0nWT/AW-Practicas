"use strict"

class DAOAvisos{
    constructor(pool){
        this.pool = pool
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

    listarAvisosUsuarioCategorias(idUser, callback){
        this.pool.getConnection(function(err, connection){
            if (err){
                callback(new Error("Error de conexión a la base de datos"))
            }
            else{
                connection.query(
                    `SELECT tipo, COUNT(*) as contador
                     FROM UCM_AW_CAU_AVI_Avisos
                     WHERE idUser = ?
                     GROUP BY tipo`,
                     [idUser],
                function(err, result){
                    connection.release()
                    if (err)
                        callback(new Error("Problema en el acceso a la base de datos"))
                    else
                        callback(null, result)

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
                connection.query(`
                SELECT A.idAviso, A.texto, A.fecha, A.tipo, A.respuesta, A.area, A.idTecnico, U.userName, U.perfil 
                FROM UCM_AW_CAU_AVI_Avisos A JOIN UCM_AW_CAU_USU_Usuarios U ON(A.idUser = U.idUser)
                WHERE A.idUser = ? AND A.activo = ?`,
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
                connection.query(`
                SELECT A.idAviso, A.texto, A.fecha, A.tipo, A.respuesta, A.area, A.idTecnico, U.userName, U.perfil 
                FROM UCM_AW_CAU_AVI_Avisos A JOIN UCM_AW_CAU_USU_Usuarios U ON(A.idUser = U.idUser)
                WHERE A.idTecnico = ? AND A.activo = ?`,
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

    listarAvisos(callback){
        this.pool.getConnection(function(err, connection){
            if(err){
                callback(new Error("Error de conexión a la base de datos"))
            }
            else{
                connection.query(`
                SELECT A.idAviso, A.texto, A.fecha, A.tipo, A.respuesta, A.area, A.idTecnico, U.userName, U.perfil 
                FROM UCM_AW_CAU_AVI_Avisos A JOIN UCM_AW_CAU_USU_Usuarios U ON(A.idUser = U.idUser)
                WHERE A.activo = 1`,
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

}

module.exports = DAOAvisos