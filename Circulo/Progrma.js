//import {Elipse} from "/Elipse.js"
//import {Circulo} from "/Circulo.js"
//import {Figura} from "/Universidad/AW-Practicas/Circulo/Figura.js"
const FiguraClass= require("./Figura.js");
const ElipseClass= require("./Elipse.js");
const CirculoClass= require("./Circulo.js");

let figura = new FiguraClass(10,5)

console.log(figura.pintar())

figura.x = 15
figura.y = 25
figura.color = "#BBG12D"

console.log(figura.pintar())


let circulo = new CirculoClass(15, 15, 2, "#FFFFFF")

console.log(circulo.pintar())

circulo.r = 20

console.log(circulo.pintar())

let elipse = new ElipseClass(2,5, 10, 20, "#GGF")

console.log(elipse.pintar())

elipse.rh = 555
elipse.rv = 210
elipse.color = "#JJJJJJ"

console.log(elipse.pintar())