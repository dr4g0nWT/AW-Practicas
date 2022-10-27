
drop table aw_tareas_usuarios;
drop table aw_tareas_tareas;
drop table aw_tareas_etiquetas;
drop table aw_tareas_user_tareas;
drop table aw_tareas_tareas_etiquetas;


create table aw_tareas_usuarios(
    idUser integer primary key auto_increment,
    email varchar(200) unique not null,
    password varchar(30) not null,
    img varchar(200)
);

create table aw_tareas_tareas(
    idTarea integer primary key auto_increment,
    texto text not null
);

create table aw_tareas_etiquetas(
    idEtiqueta integer primary key auto_increment,
    texto text not null
);

create table aw_tareas_user_tareas(
    idUser integer references aw_tareas_usuarios(idUser),
    idTarea integer references aw_tareas_tareas(idTarea),
    hecho integer not null,
    PRIMARY KEY(idUser, idTarea)
);

create table aw_tareas_tareas_etiquetas(
    idTarea integer references aw_tareas_tareas(idTarea),
    idEtiqueta integer references aw_etiquetas(idEtiqueta),
    primary key (idTarea, idEtiqueta)
);

INSERT INTO aw_tareas_usuarios(email, password, img)
VALUES('aitor.tilla@ucm.es', 'aitor', 'aitor.jpg'), ('felipe.lotas@ucm.es', 'felipe',
'felipe.jpg'),('steve.curros@ucm.es', 'steve', 'steve.jpg'), ('bill.puertas@ucm.es', 'bill', 'bill.jpg');

INSERT INTO aw_tareas_tareas(texto)
VALUES('Preparar prácticas AW'), ('Mirar fechas de congreso'), ('Ir al Supermercado'), ('Jugar al Fútbol'),
('Hablar con el profesor');

INSERT INTO aw_tareas_user_tareas (idUser, idTarea, hecho)
VALUES (1, 1,0), (1,2,1), (1,3,0), (1,4,0), (1,5,0), (2, 3,0), (2,4,0), (2,5,0), (3,1,0), (3,2,0), (3,3,1), (3,4,0), (4,1,1), (4,2,0),
(4,3,1), (4,4,0) ;

INSERT INTO aw_tareas_etiquetas(texto)
VALUES ('Universidad'), ('AW'), ('TP'), ('Práctica'), ('Personal'), ('Académico'), ('Deporte'), ('Básico');

INSERT INTO aw_tareas_tareas_etiquetas(idTarea, idEtiqueta)
VALUES (1,1), (1,2), (1,3), (2,6),(3,5), (3,6), (4,5), (4,7), (5,1), (5,3);

/*

SELECT * 
FROM aw_tareas_usuarios u JOIN aw_tareas_user_tareas i1 ON(u.idUser = i1.idUser) 
JOIN aw_tareas_tareas t ON(i1.idTarea = t.idTarea)
JOIN aw_tareas_tareas_etiquetas i2 ON(t.idTarea = i2.idTarea) 
JOIN aw_tareas_etiquetas e ON(i2.idEtiqueta = e.idEtiqueta)
WHERE u.idUser = 1;


*/
