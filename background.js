import "./scripts/browser-polyfill.min.js"
import {removeItem, saveItem, getItems} from "./scripts/storage.js"
import {fetchOpenAI} from "./scripts/gptassistant.js"

browser.runtime.connect({ name: "popup" });
const state = Object.freeze({
    TaskList: 0,
    AddPage: 1,
    EditPage: 2
})


let data = {}
let autofill = false
let apiKey = null
let highlighted_text = ''

browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message === "get_autofill") {
        if (autofill) {
            if (apiKey === null){
                apiKey = getItems('OpenAI_Key', (result) => {
                    if (Object.keys(result).length === 0 || result["key"] === null) {
                        apiKey = prompt("Please enter your OpenAI API Key.") // Doesn't work, need to replace with another option
                        saveItem("OpenAI_Key", "key", apiKey)
                    } else {
                        apiKey = result["key"]
                    }
                    fetchOpenAI(highlighted_text, apiKey).then((resp) => {
                        sendResponse(resp)
                        autofill = false
                    })
                })
            } else {
                fetchOpenAI(highlighted_text, apiKey).then((resp) => { //refactor to avoid duplicate code
                    sendResponse(resp)
                    autofill = false
                })
            }
            
        } else {
            sendResponse(false)
        }
    }
    else{
        data[message.id] = message.state
    }
    return true
})

browser.runtime.onConnect.addListener((port) => {
    if (port.name === "popup") {
        port.onDisconnect.addListener(async () => {
            for (let key of Object.keys(data)){
                if (data[key]){
                    await removeItem("tasks", key.split('-',2)[1])
                }
            }
            data = {}
        });
    }
});

//create context menu
browser.contextMenus.create({
    "id": "Autofill",
    "title": "Auto Fill \"%s\"",
    "contexts": ["selection"]
});

// async function updateState(newState) {
//     await browser.storage.local.set({ popupState: newState });
//     sendMessageToPopup(newState);
// }

// // Send a message to the popup if it's open
// function sendMessageToPopup(message) {
//     browser.runtime.sendMessage({ popupState: message }).catch(error => console.error("Error sending message:", error));
// }

browser.contextMenus.onClicked.addListener(async function(clickData) {
    if (clickData.menuItemId == "Autofill") {
        // const lastId = await getLastId();
        // const task = new Task(lastId, clickData.selectionText, "");
        // saveTask(task); 
        // await browser.storage.local.set({ popupState: "AddPage" });
        autofill = true;
        highlighted_text = clickData.selectionText
        browser.action.openPopup();
        // initialise_add_page();
        // try {
        // const task_json = await fetchOpenAI(clickData.selectionText)
        // const task_json = fetchOpenAI(clickData.selectionText)
        // console.log(task_json)
        // } catch(error){
        //     console.error('Error:', error)
        }
});

