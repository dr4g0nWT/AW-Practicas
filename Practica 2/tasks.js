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


console.log("Prueba de getToDoTasks\n")
console.log(getToDoTasks(listaTareas))
console.log("---------------")

console.log("Prueba de findByTag\n")
console.log(findByTag(listaTareas, "personal"))
console.log("---------------")

console.log("Prueba de findByTags\n")
console.log(findByTags(listaTareas, ["personal","practicas"]))
console.log("---------------")

console.log("Prueba de countDone\n")
console.log(countDone(listaTareas));
console.log("---------------")

console.log("Pruebas de createTask\nCaso 1\n")
console.log(createTask("Ir al medico @personal @salud"))
console.log("Caso 2\n")
console.log(createTask("@universidad @practica Peraparar practicas TP"))
console.log("Caso 3\n")
console.log(createTask("Ir a @deporte entrenar"))
