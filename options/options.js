import "../scripts/browser-polyfill.min.js"
import "../scripts/logger.js"
import {getItems} from "../scripts/storage.js"

const codeSpan = document.getElementById("code")

getItems("logs", (logs) => {
    code = "ts|action|field|id|value\n"
    for (let ts of Object.keys(logs)){
        let log = logs[ts]
        code += ts + "|" + log.action + "|" + log.field + "|" + log.id + "|" + log.value + "\n"
    }
    codeSpan.innerHTML = btoa(code)
})