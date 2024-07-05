const headerText = document.getElementById("header-text")
const addButton = document.getElementById("add-button")

const taskList = document.getElementById("task-list")

const addForm = document.getElementById("add-form")

const newTaskName = document.getElementById("new-task-name")
const newDescription = document.getElementById("new-description")
const newTaskDate = document.getElementById("new-task-date")

const state = Object.freeze({
    TaskList: 0,
    AddPage: 1
})
let popupState = state.TaskList

class Task {
    constructor(id, name, dueDate,description) {
        this.name = name
        this.dueDate = dueDate
        this.id = id
        this.description = description || ""
    }
}

function getLastId(){
    return browser.storage.local.get(null).then((results) => {
        const keys = Object.keys(results)
        if (keys.length === 0) {
            return 0
        } else {
            return results[keys[keys.length - 1]].id + 1
        }
    })
}

function saveTask(task){
    browser.storage.local.set({[task.id]: task})
}

function formatTask(task){
    const taskCard = document.createElement("li")
    taskCard.classList.add("w3-display-container")
    
    const checkbox = document.createElement("input")
    checkbox.name = task.name
    checkbox.id = "cb-" + task.id
    checkbox.name = "cb"
    checkbox.classList.add("w3-check","w3-display-right","w3-margin-right","w3-btn")
    checkbox.type = "checkbox"
    checkbox.addEventListener("click", (e) => browser.runtime.sendMessage({"id":checkbox.id, "state":checkbox.checked}))
    taskCard.appendChild(checkbox)

    const label = document.createElement("label")
    label.innerHTML = "<span style=\"display: inline-block;width:150px;text-overflow: ellipsis;overflow: hidden\">".concat(task.name, "</span> <span class=\"w3-opacity\"> - ", task.dueDate,  "</span><br><span style=\"display: inline-block;width:250px;color:grey;font-size:small;text-overflow: ellipsis;overflow: hidden\">",task.description, "</span>")
   


    taskCard.appendChild(label)

    return taskCard
}

function initialise_list(){
    popupState = state.TaskList
    headerText.innerHTML = "Just Do"
    addButton.innerHTML = "+"
    taskList.classList.replace("w3-hide", "w3-show")
    addForm.classList.replace("w3-show", "w3-hide")

    taskList.innerHTML = ''

    browser.storage.local.get(null).then((results) => {
        const keys = Object.keys(results)
        for (let key of keys){
            taskList.appendChild(formatTask(results[key]))
        }
    })
}

function initialise_add_page(){
    popupState = state.AddPage
    headerText.innerHTML = "Add Page"
    addButton.innerHTML = "Submit"

    addForm.classList.replace("w3-hide", "w3-show")
    taskList.classList.replace("w3-show", "w3-hide")
}

document.addEventListener("DOMContentLoaded", (e) => {
    initialise_list()
})

browser.runtime.connect({ name: "popup" });

addButton.addEventListener("click", async (e) => {
    switch (popupState) {
        case state.TaskList:
            initialise_add_page()
            break
        case state.AddPage:
            const task = new Task(await getLastId(), newTaskName.value,newTaskDate.value,newDescription.value)
            saveTask(task)
            newTaskName.value = ''
            newTaskDate.value = ''
            newDescription.value=''
            initialise_list()
            break
    }
})
