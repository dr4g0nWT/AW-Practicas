"use strict"

class Utils{
     
    getToDoTasks(tasks){
        return tasks.filter(n => !n.done).map(n => n.text);
    }
    
     findByTag(tasks, tag){
        return tasks.filter(n => n.tags.indexOf(tag) != -1).map(n => n = {text : n.text, tags: n.tags})
    }
    
     findByTags(tasks, tags){
        return tasks.filter(n => tags.some(m => n.tags.indexOf(m) >= 0))
    }
    
     countDone(tasks){
        return tasks.filter(n => n.done == true).length
    }
    
     createTask(texto){
        let strs = texto.split(" ")
    
        let tags = strs.filter(n => n[0] === "@").map(n => n.slice(1)).map(n => n.trim()).filter(n => n !== '')
        let nombre= strs.filter(n => n[0] !== "@").join(" ")
        nombre = nombre.trim()
    
        if (nombre === '') return null;
        return {text: nombre, tags: tags}
    }

}

module.exports = Utils;




