"use strict"

let listaTareas = [
    {text:"Preparar prácticas AW", tags:["universidad","awt"]}
    , {text: "Mirar fechas congreso", done: true, tags:[]}
    , {text: "Ir al supermercado", tags: ["personal", "básico"]}
    , {text: "Jugar al fútbol", done: false, tags:["personal", "deportes"]}
    , {text: "Hablar con profesor", done: false, tags:["universidad", "tp2"]}
    ]


function getToDoTasks(tasks){
    return tasks.filter(n => !n.done).map(n => n.text);
}

function findByTag(tasks, tag){
    return tasks.filter(n => n.tags.indexOf(tag) != -1).map(n => n = {text : n.text, tags: n.tags})
}

function findByTags(tasks, tags){
    return tasks.filter(n => tags.some(m => n.tags.indexOf(m) >= 0))
}

function countDone(tasks){
    return tasks.filter(n => n.done == true).length
}

function createTask(texto){
    let strs = texto.split(" ")

    let tags = strs.filter(n => n[0] === "@").map(n => n.slice(1))
    let nombre= strs.filter(n => n[0] !== "@").join(" ")

    return {text: nombre, tags: tags}
}


