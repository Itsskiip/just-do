import "../node_modules/webextension-polyfill/dist/browser-polyfill.min.js"
import {removeItem} from "./scripts/storage.js"
// import {initialise_add_page} from "./popup/popup.js"

// import {fetchOpenAI} from "./scripts/gptassistant.js"

browser.runtime.connect({ name: "popup" });
const state = Object.freeze({
    TaskList: 0,
    AddPage: 1,
    EditPage: 2
})


let data = {}

browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    data[message.id] = message.state
    console.log(data)
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
        browser.action.openPopup();
        browser.runtime.sendMessage({id: "AddPage", });
        // initialise_add_page();
        // try {
        // const task_json = await fetchOpenAI(clickData.selectionText)
        // const task_json = fetchOpenAI(clickData.selectionText)
        // console.log(task_json)
        // } catch(error){
        //     console.error('Error:', error)
        }
});

