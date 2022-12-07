class Figura{
    constructor(newX, newY, newColor){
        this.x = newX
        this.y = newY
        if(newColor != null || newColor != undefined){
            this.color = newColor
        }
        else{
            this.color = "#000000"
        }
    }

    //metodos
    get propx(){
        return this.x;
    }
    set propx(newX){
        this.x = newX;
    }
    get propy(){
        return this.y;
    }
    set propy(newY){
        this.y = newY
    }
    get propcolor(){
        return this.color
    }
    set propcolor(newColor){
        if (color.lenght === 7 && color[0] === "#"){
            this.color = newColor
        }
    }

    esBlanca(){
        return this.color === "#FFFFFF"
    }

    pintar(){
        let str = "Nos movemos a la posicion (["+ this.x +"], [" + this.y + "])\n"+
        "Cogemos la pintura de color [" + this.color + "]"

        return str
    }

}

module.exports = Figura