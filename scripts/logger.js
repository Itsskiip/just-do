import { seedField, saveItem, getItems, log } from "./storage.js"
import "./browser-polyfill.min.js"

export const testMode = true // Toggles A/B testing and logging
const debug = true // Set to false before deploying. Otherwise, will re-seed every reload
const testType = "A" // A: With tags, B: Without tags

const filename = location.href.split("/").slice(-1)[0]

if (testMode){
    if (filename === "_generated_background_page.html") {
        getItems("seeded", (item) => {
            if (debug || Object.keys(item).length === 0){
                if (testType == "B"){
                    fetch("../seed/tasks.json").then((resp) => resp.json().then((jsn) => {
                        for (const task of jsn){
                            task.tags = ""
                            console.log(task)
                        }
                        seedField("tasks", jsn)
                    }))
                } else {
                    fetch("../seed/tasks.json").then((resp) => resp.json().then((jsn) => seedField("tasks", jsn)))
                    fetch("../seed/tags.json").then((resp) => resp.json().then((jsn) => seedField("tags", jsn)))
                }
                saveItem("seeded", 0, true)
                seedField("logs", {})
                log("extension loaded")
            }
        })
    } else {
        log("page loaded", filename)
        if (testType === "B"){
            if (filename == "popup.html" || filename == "full_page.html"){
                if (filename == "full_page.html") {
                    const tag_filter = document.getElementById("tag-filter")
                    tag_filter.classList.add("w3-hide")
                }
                const tags_section = document.getElementById("tags-section")
                tags_section.classList.add("w3-hide")
            }
        }
    }
}
