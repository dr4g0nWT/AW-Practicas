"use strict"

class DAOUsers {
    constructor(pool) {
        this.pool = pool;
    }

    insertUser(user, callback) {
        this.pool.getConnection(function (err, connection) {
            if (err)
                callback(new Error("Error de conexión a la base de datos"))
            else {
                connection.query(
                    `insert into UCM_AW_CAU_USU_Usuarios (email, password, img, userName, perfil, tecnico, numEmpleado, fecha, activo) 
                    values (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [user.email, user.password, user.img, user.userName, user.perfil, user.tecnico, user.numEmpleado, user.fecha, 1],
                    function (err) {
                        if (err)
                            callback(new Error("Error de acceso a la base de datos"));
                        else
                            callback(null);
                    }
                )
            }
        })
    }

    isUserCorrect(email, password, callback) {
        this.pool.getConnection(function (err, connection) {
            if (err) {
                callback(new Error("Error de conexión a la base de datos"));
            }
            else {
                connection.query("SELECT * FROM UCM_AW_CAU_USU_Usuarios WHERE email = ? AND password = ? AND activo = 1",
                    [email, password],
                    function (err, rows) {
                        connection.release(); 
                        if (err) {
                            callback(new Error("Error de acceso a la base de datos"));
                        }
                        else {
                            if (rows.length === 0) {
                                callback(null, false); 
                            }
                            else {
                                callback(null, {
                                    idUser: rows[0].idUser,
                                    nombre: rows[0].userName,
                                    perfil: rows[0].perfil,
                                    tecnico: rows[0].tecnico,
                                    numero: rows[0].numEmpleado,
                                    fecha: rows[0].fecha,
                                    activo: rows[0].activo
                                });
                            }
                        }
                    });
            }
        }
        );
    }

    getActivo(email, callback){
        this.pool.getConnection(function (err, connection) {
            if (err) {
                callback(new Error("Error de conexión a la base de datos"));
            }
            else {
                connection.query("SELECT idUser, activo FROM UCM_AW_CAU_USU_Usuarios WHERE email = ?", [email],
                    function (err, rows) {
                        connection.release();
                        if (err) {
                            callback(new Error("Error de acceso a la base de datos"));
                        }
                        else {
                            if(rows.length > 0)
                                callback(null, [rows[0].activo, rows[0].idUser])
                            else
                                callback(null, null)
                        }
                    });
            }
        }
        );
    }

    setActivo(idUser,activo, callback){
        this.pool.getConnection(function (err, connection) {
            if (err) {
                callback(new Error("Error de conexión a la base de datos"));
            }
            else {
                connection.query("UPDATE UCM_AW_CAU_USU_Usuarios SET activo = ? WHERE idUser = ?", [activo, idUser],
                    function (err, rows) {
                        connection.release(); 
                        if (err) {
                            callback(new Error("Error de acceso a la base de datos"));
                        }
                        else {
                            callback(null)
                        }
                    });
            }
        }
        );
    }

    getAllTecnicos(callback) {
        this.pool.getConnection(function (err, connection) {
            if (err) {
                callback(new Error("Error de conexión a la base de datos"));
            }
            else {
                connection.query("SELECT idUser, userName FROM UCM_AW_CAU_USU_Usuarios WHERE tecnico = 1 AND activo = 1",
                    function (err, rows) {
                        connection.release(); 
                        if (err) {
                            callback(new Error("Error de acceso a la base de datos"));
                        }
                        else {
                            if (rows.length === 0) {
                                callback(null, []); 
                            }
                            else {
                                callback(null, rows);
                            }
                        }
                    });
            }
        }
        );
    }

    getAllUsers(callback) {
        this.pool.getConnection(function (err, connection) {
            if (err) {
                callback(new Error("Error de conexión a la base de datos"));
            }
            else {
                connection.query("SELECT idUser, userName, fecha, tecnico FROM UCM_AW_CAU_USU_Usuarios WHERE activo IS NOT NULL AND activo = 1",
                    function (err, rows) {
                        connection.release();
                        if (err) {
                            callback(new Error("Error de acceso a la base de datos"));
                        }
                        else {
                            if (rows.length === 0) {
                                callback(null, []); 
                            }
                            else {
                                callback(null, rows);
                            }
                        }
                    });
            }
        });
    }

    getUserImageName(email, callback) {

        this.pool.getConnection(function (err, connection) {

            if (err)
                callback(new Error("Error de conexión a la base de datos"))
            else {

                connection.query(`SELECT img FROM UCM_AW_CAU_USU_Usuarios WHERE email = ?`,
                    [email],
                    function (err, rows) {

                        connection.release()
                        if (err)
                            callback(new Error("Error de acceso a la base de datos"))
                        else {
                            if (rows.length === 0)
                                callback(new Error("No existe el usuario"))
                            else
                                callback(null, rows[0].img)


                        }



                    }
                )


            }

        })



    }


}

module.exports = DAOUsers;