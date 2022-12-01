
drop table UCM_AW_CAU_USU_Usuarios;
drop table UCM_AW_CAU_AVI_Avisos;


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

create table UCM_AW_CAU_AVI_Avisos(
    idAviso integer primary key auto_increment,
    texto varchar(1000) not null,
    fecha date not null,
    tipo integer,
    idTecnico integer references UCM_AW_CAU_USU_Usuarios(idUser),
    idUser integer references UCM_AW_CAU_USU_Usuarios(idUser),
    respuesta varchar(1000),
    area varchar(100),
    activo integer
);

INSERT INTO `ucm_aw_cau_usu_usuarios`(`email`, `password`, `img`, `userName`, `perfil`, `tecnico`, `numEmpleado`) VALUES ('samu@ucm.es','Xd01',null,'Samuel','Alumno',null,null);

INSERT INTO `ucm_aw_cau_usu_usuarios`(`email`, `password`, `img`, `userName`, `perfil`, `tecnico`, `numEmpleado`) VALUES ('pablo@ucm.es','Xd01',null,'Pablo','PAS',1,'agdr123');




