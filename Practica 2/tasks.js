"use strict"

let listaTareas = [
    {text:"Preparar prácticas AW", tags:["universidad","awt"]}
    , {text: "Mirar fechas congreso", done: true, tags:[]}
    , {text: "Ir al supermercado", tags: ["personal", "básico"]}
    , {text: "Jugar al fútbol", done: false, tags:["personal", "deportes"]}
    , {text: "Hablar con profesor", done: false, tags:["universidad", "tp2"]}
    ]


function getToDoTasks(tareas){
    return tareas.filter(function(tarea){ //Devolvemos el resultado de filtrar las tareas que no estan done y luego mapeamos al texto
        return !tarea.done
    }).map(function(tarea){
        return tarea.text
    })
}

function findByTag(tareas, tag){
    let t = tareas.filter(function(tarea){
        return tarea.tags.indexOf(tag) != -1
    })

    return t.map(function(tarea){
        return {text : tarea.text, tags : tarea.tags}
    })
}

function findByTag(tareas, tag){
    let t = tareas.filter(function(tarea){
        return tarea.tags.indexOf(tag) != -1
    })

    return t.map(function(tarea){
        return {text : tarea.text, tags : tarea.tags}
    })
}





//console.log(getToDoTasks(listaTareas))
console.log(findByTag(listaTareas, "personal"))