
drop table UCM_AW_CAU_USU_Usuarios;



create table UCM_AW_CAU_USU_Usuarios(
    idUser integer primary key auto_increment,
    email varchar(200) unique not null,
    password varchar(30) not null,
    img blob,
    userName varchar(30) not null,
    perfil varchar(100) not null,
    tecnico integer,
    numEmpleado varchar(30)
);




