import {saveItem, getItems, getLastId} from "../scripts/storage.js"

const headerText = document.getElementById("header-text")
const addButton = document.getElementById("add-button")

const taskList = document.getElementById("task-list")

const addForm = document.getElementById("add-form")

const newTaskName = document.getElementById("new-task-name")
const newTaskDescription = document.getElementById("new-task-description")
const newTaskDate = document.getElementById("new-task-date")
const newTags=document.getElementById("taglist")



const addTagButton = document.getElementById("add-tag-btn")
const resetTagButton = document.getElementById('reset-tags')
const tagSelection = document.getElementById('tagSelect')






browser.runtime.connect({ name: "popup" });

const state = Object.freeze({
    TaskList: 0,
    AddPage: 1,
    EditPage: 2
})
let popupState = state.TaskList
let current_task
class Task {
    constructor(id, name, description, dueDate,tags) {
        this.name = name
        this.description = description
        this.dueDate = dueDate
        this.id = id
        this.tags=tags
        

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
      "<span style=\"display: inline-block;width:150px;text-overflow: ellipsis;overflow: hidden\">" + task.name +
      "</span> <span class=\"w3-opacity\"> - " + (task.dueDate === "" ? "&nbsp" :  " - " + task.dueDate) +
      "</span><br>" + 
      "<span style=\"display: inline-block;width:250px;color:grey;font-size:small;text-overflow: ellipsis;overflow: hidden\"> " + 
      task.description + "</span><br>" +
      formatTaskTag(task.tags)
      
    
    label.classList.add("w3-btn")
    label.name = 'label'
    label.addEventListener("click", () => initialise_edit_page(task))
  
    taskCard.appendChild(label)
    return taskCard
}


//------------------------------
addTagButton.addEventListener("click", addTag)
resetTagButton.addEventListener("click",resettags)
tagSelection.addEventListener('change',selectedTags)

function formatTagOption(){         //create the options for list
    
    tagSelection.innerHTML=''
    
    getItems("Tags", (results) => {
        var tag_list=Object.keys(results)

        tag_list.forEach(tag => {
            var tagOption = document.createElement('option');
            tagOption.value = tag;
            tagOption.textContent = tag;
            tagSelection.appendChild(tagOption);
        });
    })
}

function resettags() {  //Remove all tags in selection
    let confirmationwindow=confirm("Delete ALL tags?")
    if (confirmationwindow){
        getItems("Tags", (obj) => {
        
            Object.keys(obj).forEach(id => {
                delete obj[id];
            });
    
            
            browser.storage.local.set({ ["Tags"]: obj })
            .then(() => {
                formatTagOption()
                selectedTags()
            })  
        })
    }
    

}

function addTag() {             //append new tag
    var inputtag = document.getElementById("add-tag-tb")
    
    

    if (inputtag.value.trim() === ""){  //no need to account for duplicates
        alert("It is empty");
        return;
    }
    saveItem("Tags", inputtag.value.trim(), inputtag.value.trim())
    .then(() => {
        inputtag.value=''
        formatTagOption()
    })  
}


//accounting for Selected options
function selectedTags(){
    var selected = document.getElementById('selectedtags')
    
    selected.innerHTML=""
    var selectedValues = [];        //creates list with selected tags
    for (var i = 0; i < tagSelection.options.length; i++) {
        var option = tagSelection.options[i];
        if (option.selected) {
            selectedValues.push(option.value);

            var showtag = document.createElement('span')
            showtag.className = "w3-tag w3-light-gray w3-margin-right w3-margin-bottom"
            showtag.textContent = option.value
            selected.appendChild(showtag)

          
        }
    }
    var taglist=document.getElementById("taglist")
    taglist.textContent=selectedValues

}


function formatTaskTag(taglist){
    let list = taglist.split(',')
    let htmlstring=''
    
    for (let item of list){
        let format='<span class= "w3-tag w3-light-gray w3-margin-right w3-margin-bottom">'+ item.trim() +'</span>'
        htmlstring+=format

    }

    return htmlstring
}


//------------------------



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

//When opening the popup, initialise the list
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