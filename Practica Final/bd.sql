
drop table usuarios;
drop table incidencias;
drop table respuesta;
drop table respuesta_incidencia;
drop table tecnico_incidencia;
drop table usuario_incidencia;


create table usuarios(
    idUser integer primary key auto_increment,
    email varchar(200) unique not null,
    password varchar(30) not null,
    img varchar(200),
    userName varchar(30) not null,
    perfil varchar(100) not null,
    tecnico integer,
    numEmpleado varchar(30)
);

create table incidencias(
    idIncidencia integer primary key auto_increment,
    texto text not null,
    fecha date not null,
    tipo integer not null,
    finalizado integer not null
);

create table respuesta(
    idRespuesta integer primary key auto_increment,
    idTecnico integer references usuarios(idUser),
    texto text not null
);

create table respuesta_incidencia(
    idRespuesta integer references respuesta(idRespuesta),
    idIncidencia integer references incidencias(idIncidencia)
);

create table tecnico_incidencia(
    idIncidencia integer references incidencias(idIncidencia),
    idTecnico integer references usuarios(idUser)
);

create table usuario_incidencia(
    idIncidencia integer references incidencias(idIncidencia),
    idUser integer references usuarios(idUser)
);

-- INSERT INTO aw_tareas_usuarios(email, password, img)
-- VALUES('usuario@ucm.es', 'user', 'user.jpg');

-- INSERT INTO aw_tareas_tareas(texto)
-- VALUES('Preparar prácticas AW'), ('Mirar fechas de congreso'),
-- ('Hablar con el profesor');

-- INSERT INTO aw_tareas_user_tareas (idUser, idTarea, hecho)
-- VALUES (1, 1,0), (1,2,1), (1,3,0);

-- INSERT INTO aw_tareas_etiquetas(texto)
-- VALUES ('Universidad'), ('AW'), ('TP'), ('Práctica'), ('Personal'), ('Académico'), ('Deporte'), ('Básico');

-- INSERT INTO aw_tareas_tareas_etiquetas(idTarea, idEtiqueta)
-- VALUES (1,1), (1,2), (1,3), (2,6),(3,5), (3,6);

