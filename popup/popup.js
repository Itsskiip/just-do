import {saveItem, getItems, getLastId} from "../scripts/storage.js"

const headerText = document.getElementById("header-text")
const addButton = document.getElementById("add-button")

const taskList = document.getElementById("task-list")

const addForm = document.getElementById("add-form")

const newTaskName = document.getElementById("new-task-name")
const newTaskDescription = document.getElementById("new-task-description")
const newTaskDate = document.getElementById("new-task-date")

const addTagButton = document.getElementById("add-tag-btn")
const resetTagButton = document.getElementById('reset-tags')
const tagSelection = document.getElementById('tagSelect')

browser.runtime.connect({ name: "popup" });

const state = Object.freeze({
    TaskList: 0,
    AddPage: 1
})
let popupState = state.TaskList

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
    label.innerHTML = "<span style=\"display: inline-block;width:150px;text-overflow: ellipsis;overflow: hidden\">".concat(task.name, "</span> <span class=\"w3-opacity\"> - ", task.dueDate,"</span><br>")
    label.innerHTML+=("<span style=\"display: inline-block;width:250px;color:grey;font-size:small;text-overflow: ellipsis;overflow: hidden\"> " + task.description +"</span>")


    taskCard.appendChild(label)

    return taskCard
}


//------------------------------
addTagButton.addEventListener("click", addTag)
resetTagButton.addEventListener("click",resettags)
tagSelection.addEventListener('change',selectedTags)

function formatTagOption(){         //create the options for list
    var select = document.getElementById('tagSelect')
    select.innerHTML=''
    
    getItems("Tags", (results) => {
        var tag_list=Object.keys(results)

        tag_list.forEach(tag => {
            var tagOption = document.createElement('option');
            tagOption.value = tag;
            tagOption.textContent = tag;
            select.appendChild(tagOption);
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
    selected.innerHTML="<label>Selected Tags:</label>"
    var tagSelection = document.getElementById('tagSelect');

    var selectedValues = [];        //creates list with selected tags
    for (var i = 0; i < tagSelection.options.length; i++) {
        var option = tagSelection.options[i];
        if (option.selected) {
            selectedValues.push(option.value);

            var showtag = document.createElement('span')
            showtag.className = "w3-tag"
            showtag.textContent = option.value
            selected.appendChild(showtag)
        }
    }
    
    // Log all selected values
    console.log(selectedValues);




}





//------------------------



function initialise_list(){
    popupState = state.TaskList
    headerText.innerHTML = "Just Do"
    addButton.innerHTML = "+"
    taskList.classList.replace("w3-hide", "w3-show")
    addForm.classList.replace("w3-show", "w3-hide")

    taskList.innerHTML = ''

    getItems("tasks", (results) => {
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


addButton.addEventListener("click", async (e) => {
    switch (popupState) {
        case state.TaskList:
            initialise_add_page()
            formatTagOption()  
            selectedTags()         
            break
        case state.AddPage:
            const task = new Task(await getLastId("tasks"), newTaskName.value, newTaskDescription.value, newTaskDate.value)
            await saveItem("tasks", task.id, task)
            newTaskName.value = ''
            newTaskDate.value = ''
            newTaskDescription.value = ''
            initialise_list()            
            break
    }
})
