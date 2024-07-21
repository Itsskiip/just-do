export function getLastId(field){
    return new Promise((resolve) => {
        getItems(field, (obj) => {
            const keys = Object.keys(obj);
            resolve(keys.length === 0 ? 0 : obj[keys[keys.length - 1]].id + 1);
        });
    });
}


export function saveItem(field, id, value){
    return getItems(field, (obj) => {
        obj[id] = value
        browser.storage.local.set({[field]: obj})
    })
}

export function removeItem(field, id){
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