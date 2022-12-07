const Figura= require("./Figura.js");

class Elipse extends Figura{
    constructor(newX, newY, rh, rv, newColor){
        super(newX, newY, newColor)
        this.rh = rh
        this.rv = rv;
    }

    get proprh(){
        return this.rh
    }
    set proprh(newRh){
        this.rh = newRh
    }
    get proprv(){
        return this.rv
    }
    set proprv(newRv){
        this.rv = newRv
    }

    pintar(){
        let str = "Nos movemos a la posicion (["+ this.x +"], [" + this.y + "])\n"+
        "Cogemos la pintura de color [" + this.color + "]\n" +
        "Pintamos elipse de radios [" + this.rh + "] y [" + this.rv + "]"

        return str;
    }
}

module.exports = Elipse