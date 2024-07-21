import "./scripts/browser-polyfill.min.js"
import "./scripts/logger.js"
import {removeItem, saveItem, getItems} from "./scripts/storage.js"
import {fetchOpenAI} from "./scripts/gptassistant.js"

const state = Object.freeze({
    TaskList: 0,
    AddPage: 1,
    EditPage: 2
})


let data = {}
let autofill = false
let apiKey = ''
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

// not sure if need this?
// browser.browserAction.onClicked.addListener(() => {
//     browser.tabs.create({
//       url: browser.runtime.getURL("full_page.html")
//     });
//   });
  

//create context menu
browser.contextMenus.create({
    "id": "Autofill",
    "title": "Auto Fill \"%s\"",
    "contexts": ["selection"]
});

browser.contextMenus.onClicked.addListener(async function(clickData) {
    if (clickData.menuItemId == "Autofill") {
        autofill = true;
        highlighted_text = clickData.selectionText
        browser.action.openPopup();
        }
});

