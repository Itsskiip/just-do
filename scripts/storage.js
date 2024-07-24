import { testMode } from "./logger.js";
import "./browser-polyfill.min.js"

export function getLastId(field){
    return new Promise((resolve) => {
        getItems(field, (obj) => {
            const keys = Object.keys(obj);
            resolve(keys.length === 0 ? 0 : parseInt(obj[keys[keys.length - 1]].id) + 1);
        });
    });
}

export async function log(action, field = "", id = "", value = ""){
    saveItem("logs", Date.now(), {"action": action, "field": field, "id": id, "value": value}, false)
}

export function saveItem(field, id, value, useLog = testMode){
    if (useLog){
        log("save", field, id, value)
    }
    return getItems(field, (obj) => {
        obj[id] = value
        browser.storage.local.set({[field]: obj})
    })
}

export function seedField(field, seedObj){
    browser.storage.local.set({[field]: seedObj})
}

export function removeItem(field, id, useLog = testMode){
    if (useLog) {
        log("remove", field, id)
    }
    return getItems(field, (obj) => {
        delete obj[id]
        browser.storage.local.set({[field]: obj})
    })
}

export function getItems(field, fn){
    return browser.storage.local.get(field).then((obj) => {  
        return fn(field in obj ? obj[field] : {})
    })
}