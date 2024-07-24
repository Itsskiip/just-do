import "../scripts/browser-polyfill.min.js"
import "../scripts/logger.js"
import {getItems} from "../scripts/storage.js"

const codeSpan = document.getElementById("code")

getItems("logs", (logs) => {
    code = "ts|action|field|id|value\n"
    for (let ts of Object.keys(logs)){
        let log = logs[ts]
        code += ts + "|" + log.action + "|" + log.field + "|" + log.id + "|" + JSON.stringify(log.value) + "\n"
    }
    codeSpan.value = btoa(code)
})

const copyBtn = document.getElementById("copy-btn")
const copyText = document.getElementById("code");
const tooltip = document.getElementById("my-tooltip");

copyBtn.addEventListener("click", (e) => {
    navigator.clipboard.writeText(copyText.value);
    tooltip.innerHTML = "Copied!";
})
copyBtn.addEventListener("mouseout", (e) => {
    tooltip.innerHTML = "Copy to clipboard";
})