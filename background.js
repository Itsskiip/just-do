import "../node_modules/webextension-polyfill/dist/browser-polyfill.min.js"
import {removeItem} from "./scripts/storage.js"

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

browser.contextMenus.onClicked.addListener(async function(clickData) {
    if (clickData.menuItemId == "Autofill") {
        // const lastId = await getLastId();
        // const task = new Task(lastId, clickData.selectionText, "");
        // saveTask(task); 
        browser.action.openPopup()
        console.log(clickData.selectionText)
    }
});