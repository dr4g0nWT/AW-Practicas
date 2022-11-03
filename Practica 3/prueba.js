let task = { tags: ["hola"] }

let tagsins = ""

tagsins += "INSERT INTO aw_tareas_etiquetas(texto) VALUES"

task.tags.forEach(tag => {
    tagsins += ",(\"" + tag + "\")"
})

tagsins = tagsins.slice(0, tagsins.indexOf(",")) + tagsins.slice(tagsins.indexOf(",") + 1) + ";"

console.log(tagsins)