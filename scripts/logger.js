const testMode = true
const testType = "A"
const filename = location.href.split("/").slice(-1)[0]

if (testMode){
    if (testType === "B"){
        if (filename === "popup.html"){
            const tags_section = document.getElementById("tags-section")
            tags_section.classList.add("w3-hide")
        } else if (filename == "full_page.html") {
            const tag_filter = document.getElementById("tag-filter")
            console.log(tag_filter)
            tag_filter.classList.add("w3-hide")
        }
    }
}

