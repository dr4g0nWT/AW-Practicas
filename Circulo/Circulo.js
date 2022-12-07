const Elipse= require("./Elipse.js");

class Circulo extends Elipse{
    constructor(newX, newY, r, newColor){
        super(newX, newY, r, r, newColor)
        this.r = r
    }

    get propr(){
        return this.r
    }
    set propr(newR){
        this.r = newR
    }
    
}
module.exports = Circulo



