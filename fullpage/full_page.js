import {saveItem, getItems, getLastId} from "../scripts/storage.js"

const headerText = document.querySelector("header h3")
const addButton = document.getElementById("add-button")
const taskList = document.getElementById("task-list")
const addForm = document.getElementById("add-form")
const newTaskName = document.getElementById("new-task-name")
const newTaskDescription = document.getElementById("new-task-description")
const newTaskDate = document.getElementById("new-task-date")
const newTags = document.getElementById("taglist")

const addTagButton = document.getElementById("add-tag-btn")
const resetTagButton = document.getElementById('reset-tags')
const tagSelection = document.getElementById('tagSelect')
const filterTags = document.getElementById("filter-tags")
const sortTasks = document.getElementById("sort-tasks")

const sortbar=document.getElementById("sort-container")

const state = Object.freeze({
    TaskList: 0,
    AddPage: 1,
    EditPage: 2
})

let pageState = state.TaskList
let current_task

class Task {
    constructor(id, name, description, dueDate, tags) {
        this.name = name
        this.description = description
        this.dueDate = dueDate
        this.id = id
        this.tags = tags
    }
}

function formatTask(task){
    const taskCard = document.createElement("li")
    taskCard.classList.add("w3-display-container", "task-item", "w3-theme-d3")

    const checkbox = document.createElement("input")
    checkbox.name = task.name
    checkbox.id = "cb-" + task.id
    checkbox.classList.add("w3-check", "w3-display-right")
    checkbox.type = "checkbox"
    checkbox.addEventListener("click", (e) => browser.runtime.sendMessage({"id":checkbox.id, "state":checkbox.checked}))
    taskCard.appendChild(checkbox)

    const label = document.createElement("label")
    label.innerHTML = `
        <span style="display:inline-block;  width:70%; float:left; text-align:left; text-overflow: ellipsis;overflow: hidden; vertical-align:bottom">${task.name}</span>
        ${task.dueDate ? `<span class="due-date" style="display: flex; align-items: center; justify-content: flex-end;"><i class="fa fa-calendar"></i> Due Date: ${task.dueDate}</span>` : ''}
        ${task.description ? `<span style="display:inline-block; width:90%; color:gray;font-size:small;text-overflow: ellipsis;overflow: hidden; float:left; text-align:left"> ${task.description}</span>` : ''}
        ${task.tags ? `<br>${formatTaskTag(task.tags)}` : ''}
    `
    label.classList.add("w3-btn")
    label.style = "text-align:left"
    label.addEventListener("click", () => initialise_edit_page(task))
    taskCard.appendChild(label)

    return taskCard
}

function formatTagOption(){
    tagSelection.innerHTML = ''
    filterTags.innerHTML = '<option value="all">All tags</option>'
    
    // Get unique tags from tasks
    getItems("tasks", (tasks) => {
        const tags = new Set()
        Object.values(tasks).forEach(task => {
            if (task.tags) {
                task.tags.split(',').forEach(tag => tags.add(tag.trim()))
            }
        })
        
        tags.forEach(tag => {
            const tagOption = document.createElement('option')
            tagOption.value = tag
            tagOption.textContent = tag
            tagSelection.appendChild(tagOption)
            filterTags.appendChild(tagOption.cloneNode(true))
        })
    })
}

function resettags() {
    if (confirm("Delete ALL tags?")) {
        getItems("Tags", (obj) => {
            Object.keys(obj).forEach(id => {
                delete obj[id]
            })
            browser.storage.local.set({ ["Tags"]: obj }).then(() => {
                formatTagOption()
                selectedTags()
            })
        })
    }
}

function addTag() {
    const inputtag = document.getElementById("add-tag-tb")
    console.log(inputtag.value)
    if (inputtag.value.trim() === "") {
        alert("It is empty")
        return
    }
    saveItem("Tags", inputtag.value.trim(), inputtag.value.trim())
    .then(() => {
        inputtag.value=''
        formatTagOption()
    })  
    
}

function selectedTags(){
    const selected = document.getElementById('selectedtags')
    selected.innerHTML = ""
    const selectedValues = []
    for (let i = 0; i < tagSelection.options.length; i++) {
        const option = tagSelection.options[i]
        if (option.selected) {
            selectedValues.push(option.value)
            const showtag = document.createElement('span')
            showtag.className = "w3-tag w3-light-gray w3-margin-small w3-left"
            showtag.textContent = option.value
            selected.appendChild(showtag)
        }
    }
    newTags.textContent = selectedValues
}

function formatTaskTag(tagListStr){
    let list = tagListStr.split(',')
    let htmlstring=''
    
    for (let item of list){
        let format='<span class="w3-tag w3-light-gray" style="display: inline-block; margin-right: 5px;">' + item.trim() + '</span>'
        htmlstring+=format
     
    }
   
    return htmlstring
}

addTagButton.addEventListener("click", addTag)
resetTagButton.addEventListener("click", resettags)
tagSelection.addEventListener('change', selectedTags)
filterTags.addEventListener('change', filterTasks)
sortTasks.addEventListener('change', initialise_list) // Reinitialize list on sort change

headerText.addEventListener('click', () => {
    browser.tabs.create({ url: "../fullpage/full_page.html" })
})

function initialise_list(){
    pageState = state.TaskList
    headerText.innerHTML = "Just Do"
    addButton.innerHTML = "+"
    taskList.classList.replace("w3-hide", "w3-show")
    addForm.classList.replace("w3-show", "w3-hide")
    sortbar.classList.replace("w3-hide", "w3-show")
    addButton.disabled = false
    taskList.innerHTML = ''

    getItems("tasks", (results) => {
        const keys = Object.keys(results)
        if (sortTasks.value === 'due-date') {
            keys.sort((k1, k2) => {
                const d1 = new Date(results[k1].dueDate)
                const d2 = new Date(results[k2].dueDate)
                return d1 - d2
            })
        } else {
            keys.sort((k1, k2) => results[k2].id - results[k1].id)
        }
        keys.forEach(key => {
            taskList.appendChild(formatTask(results[key]))
        })
        formatTagOption()
        filterTasks()
    })
}

function initialise_add_page(){
    pageState = state.AddPage
    headerText.innerHTML = "Add Task"
    addButton.innerHTML = "Submit"
    addButton.disabled = true
    newTaskName.value = ''
    newTaskDate.value = ''
    newTaskDescription.value = ''
    newTags.textContent = ''
    
    addForm.classList.replace("w3-hide", "w3-show")
    taskList.classList.replace("w3-show", "w3-hide")
    sortbar.classList.replace("w3-show", "w3-hide")
    newTaskName.focus()
}

function initialise_edit_page(task){
    pageState = state.EditPage
    headerText.innerHTML = "Edit Task"
    addButton.innerHTML = "Save"
    newTaskName.value = task.name
    newTaskDate.value = task.dueDate
    newTaskDescription.value = task.description
    newTags.textContent = task.tags
    current_task = task.id
    addForm.classList.replace("w3-hide", "w3-show")
    taskList.classList.replace("w3-show", "w3-hide")
    sortbar.classList.replace("w3-show", "w3-hide")
}

document.addEventListener("DOMContentLoaded", initialise_list)
newTaskName.addEventListener("input", () => {
    addButton.disabled = newTaskName.value === ""
})

async function addClicked(){
    
    let id
    switch (pageState) {
        case state.TaskList:
            initialise_add_page()
            formatTagOption()
            selectedTags()
            
            return
        case state.AddPage:
            id = await getLastId("tasks")
            break
        case state.EditPage:
            id = current_task
            break
    }
    const task = new Task(id, newTaskName.value, newTaskDescription.value, newTaskDate.value, newTags.textContent)
    await saveItem("tasks", id, task)
    initialise_list()
}

function filterTasks() {
    const selectedFilter = filterTags.value
    const tasks = document.querySelectorAll(".task-item")
    tasks.forEach(task => {
        const taskTags = task.querySelector("label").innerHTML.match(/<span class="w3-tag.*?>(.*?)<\/span>/g)
        if (selectedFilter === "all") {
            task.style.display = "block"
        } else {
            const tags = taskTags ? taskTags.map(tag => tag.replace(/<.*?>/g, '').trim()) : []
            if (tags.includes(selectedFilter)) {
                task.style.display = "block"
            } else {
                task.style.display = "none"
            }
        }
    })
}

document.addEventListener("keypress", (e) => {
    if (e.key === 'Enter' && !addButton.disabled) addClicked()
})
addButton.addEventListener("click", addClicked)

browser.runtime.sendMessage("get_autofill").then((response) => {
    if (response !== false) {
        addClicked().then(() => {
            if (response.task !== null) {
                newTaskName.value = response.task
                addButton.disabled = newTaskName.value === ""
            }
            if (response.description !== null) {
                newTaskDescription.value = response.description
            }
            if (response.dueDate !== null) {
                newTaskDate.value = response.dueDate
            }
        })
    }
})
