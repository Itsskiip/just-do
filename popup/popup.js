import {saveItem, getItems, getLastId} from "../scripts/storage.js"

const headerText = document.getElementById("header-text")
const addButton = document.getElementById("add-button")

const taskList = document.getElementById("task-list")

const addForm = document.getElementById("add-form")

const newTaskName = document.getElementById("new-task-name")
const newTaskDescription = document.getElementById("new-task-description")
const newTaskDate = document.getElementById("new-task-date")

browser.runtime.connect({ name: "popup" });

const state = Object.freeze({
    TaskList: 0,
    AddPage: 1,
    EditPage: 2
})
let popupState = state.TaskList
let current_task
class Task {
    constructor(id, name, description, dueDate) {
        this.name = name
        this.description = description
        this.dueDate = dueDate
        this.id = id
    }
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
    label.innerHTML = 
        "<span>" + task.name + 
        "</span> <span class=\"w3-opacity\">" + 
        (task.dueDate === "" ? "&nbsp" :  " - " + task.dueDate) +
        "</span>"

    label.classList.add("w3-btn")
    label.name = 'label'
    label.addEventListener("click", () => initialise_edit_page(task))

    taskCard.appendChild(label)
    return taskCard
}

function initialise_list(){
    popupState = state.TaskList
    headerText.innerHTML = "Just Do"
    addButton.innerHTML = "+"
    taskList.classList.replace("w3-hide", "w3-show")
    addForm.classList.replace("w3-show", "w3-hide")
    
    addButton.disabled = false

    taskList.innerHTML = ''

    getItems("tasks", (results) => {
        const keys = Object.keys(results)
        keys.sort((k1, k2) => {
            let d1 = new Date(results[k1].dueDate)
            let d2 = new Date(results[k2].dueDate)

            if (isNaN(d1)) d1 = new Date()
            if (isNaN(d2)) d2 = new Date()

            return d1.getTime() - d2.getTime()
        })
        for (let key of keys){
            taskList.appendChild(formatTask(results[key]))
        }
    })
}

function initialise_add_page(){
    popupState = state.AddPage
    headerText.innerHTML = "Add Task"
    addButton.innerHTML = "Submit"

    addButton.disabled = true

    newTaskName.value = ''
    newTaskDate.value = ''
    newTaskDescription.value = ''

    addForm.classList.replace("w3-hide", "w3-show")
    taskList.classList.replace("w3-show", "w3-hide")
    
    newTaskName.focus()
}

function initialise_edit_page(task){
    popupState = state.EditPage
    headerText.innerHTML = "Edit Task"
    addButton.innerHTML = "Save"

    newTaskName.value = task.name
    newTaskDate.value = task.dueDate
    newTaskDescription.value = task.description

    current_task = task.id

    addForm.classList.replace("w3-hide", "w3-show")
    taskList.classList.replace("w3-show", "w3-hide")
}

//When opening the popup, initialise the lise
document.addEventListener("DOMContentLoaded", (e) => {
    initialise_list()
})

//Handles enabling/disabling the Submit button
newTaskName.addEventListener("input", (e) => {
    addButton.disabled = newTaskName.value === ""
})

async function addClicked(){
    let id
    switch (popupState) {
        case state.TaskList:
            initialise_add_page()
            return
        case state.AddPage:
            id = await getLastId("tasks")
            break
        case state.EditPage:
            id = current_task
            break
    }
    const task = new Task(
        id,
        newTaskName.value,
        newTaskDescription.value,
        newTaskDate.value)
    await saveItem("tasks", id, task)
    initialise_list()
}

//Note: Should probably listen for the submit event instead but I couldn't get it to work
document.addEventListener("keypress", (e) => {if (e.key === 'Enter' && !addButton.disabled) addClicked()}) 
addButton.addEventListener("click", addClicked)