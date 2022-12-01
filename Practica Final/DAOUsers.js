"use strict"

class DAOUsers{
    constructor(pool) {
        this.pool = pool;
        console.log("Dao creado")
    }

    insertUser(user, callback){
        this.pool.getConnection(function(err, connection){
            if (err)
                callback(new Error("Error de conexión a la base de datos"))
            else{
                connection.query(
                    `insert into UCM_AW_CAU_USU_Usuarios (email, password, img, userName, perfil, tecnico, numEmpleado) 
                    values (?, ?, ?, ?, ?, ?, ?)`,
                    [user.email, user.password, user.img, user.userName, user.perfil, user.tecnico, user.numEmpleado],
                    function(err){
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
                connection.query("SELECT * FROM UCM_AW_CAU_USU_Usuarios WHERE email = ? AND password = ?",
                    [email, password],
                    function (err, rows) {
                        connection.release(); // devolver al pool la conexión
                        if (err) {
                            callback(new Error("Error de acceso a la base de datos"));
                        }
                        else {
                            if (rows.length === 0) {
                                callback(null, false); //no está el usuario con el password proporcionado
                            }
                            else {
                                callback(null, {
                                    username: rows[0].userName, 
                                    perfil: rows[0].perfil,
                                    tecnico: rows[0].tecnico,
                                    numero: rows[0].numEmpleado
                                });
                            }
                        }
                    });
            }
        }
        );
    }

    getUserImageName(email, callback){

        this.pool.getConnection(function(err, connection){

            if (err) 
                callback(new Error("Error de conexión a la base de datos"))
            else{

                connection.query(`SELECT img FROM UCM_AW_CAU_USU_Usuarios WHERE email = ?`,
                    [email],
                    function(err, rows){

                        connection.release()
                        if (err) 
                            callback(new Error("Error de acceso a la base de datos"))
                        else{
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