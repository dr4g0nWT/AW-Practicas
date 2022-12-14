
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
    numEmpleado varchar(30),
    fecha datetime not null,
    activo integer
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

INSERT INTO `ucm_aw_cau_usu_usuarios`(`email`, `password`, `img`, `userName`, `perfil`, `tecnico`, `numEmpleado`, `activo`) VALUES ('samu@ucm.es','Xd01',null,'Samuel','Alumno',null,null, 1);

INSERT INTO `ucm_aw_cau_usu_usuarios`(`email`, `password`, `img`, `userName`, `perfil`, `tecnico`, `numEmpleado`, `activo`) VALUES ('pablo@ucm.es','Xd01',null,'Pablo','PAS',1,'agdr123', 1);

INSERT INTO `ucm_aw_cau_avi_avisos` (`idAviso`, `texto`, `fecha`, `tipo`, `idTecnico`, `idUser`, `respuesta`, `area`, `activo`) VALUES (NULL, 'Suegerencia 1', '2022-12-04', '2', NULL, '1', NULL, 'Comunicaciones: Correo electrónico', '1');

