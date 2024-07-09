import "./browser-polyfill.js"

let data = {}

browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    data[message.id] = message.state
    console.log(data)
})

browser.runtime.onConnect.addListener(function(port) {
    if (port.name === "popup") {
        
        port.onDisconnect.addListener(function() {
            for (let key of Object.keys(data)){
                if (data[key]){
                    browser.storage.local.remove(key.split('-',2)[1])
                }
            }
            data = {}
        });
    }
});

//create context menu
var contextMenuItem = {
    "id": "selectedText",
    "title": "Auto Fill \"%s\"",
    "contexts": ["selection"]
};

browser.contextMenus.create(contextMenuItem);

browser.contextMenus.onClicked.addListener(async function(clickData) {
    if (clickData.menuItemID === "selectedText" && clickData.selectionText) {
        const lastId = await getLastId();
        const task = new Task(lastId, clickData.selectionText, "");
        saveTask(task); 

    browser.action.openPopup()
    }
});