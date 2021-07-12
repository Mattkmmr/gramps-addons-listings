"use strict";

function replaceInString(fullString, search, replacement) {
    return fullString.split(search).join(replacement);
}

function create_entry(element) {
    let category = document.getElementById("select_category").value;
    let item = false;

    // Error handling for SyntaxError and parsing errors because gramps addon listings aren't JSON
    try {
        item = JSON.parse(element);
    } catch (err) {
        // console.log("SyntaxError: Unable to parse: " + element);
    }

    if (item && (category === "All" || item.t === category)) {
        let card_item = document.createElement("div");
        card_item.setAttribute("class", "col col-12 col-md-6 col-xl-4 px-2 pb-3");
        card_item.style.minWidth = "20rem";

        let card_inner = document.createElement("div");
        card_inner.setAttribute("class", "border shadow p-3 h-100");

        let card_header = document.createElement("div");
        card_header.setAttribute("class", "fw-bold");
        card_header.innerText = item.n;

        let card_body = document.createElement("div");

        let card_tag1 = document.createElement("span");
        card_tag1.setAttribute("class", "badge bg-dark me-1");
        card_tag1.innerText = item.t;

        let card_tag2 = document.createElement("span");
        card_tag2.setAttribute("class", "badge bg-secondary bi bi-puzzle-fill me-1");
        card_tag2.innerText = " " + item.v;

        let card_tag3 = document.createElement("span");
        card_tag3.setAttribute("class", "badge bg-secondary bi bi-diagram-3-fill");
        card_tag3.innerText = " " + item.g;

        let card_desc = document.createElement("div");
        card_desc.setAttribute("class", "mb-2");
        card_desc.innerText = item.d;

        let card_row_download = document.createElement("div");
        card_row_download.setAttribute("class", "text-center");

        let card_download = document.createElement("a");
        card_download.setAttribute("class", "btn btn-outline-primary btn-sm col-6");
        card_download.setAttribute("href", "https://github.com/gramps-project/addons/raw/master/gramps51/download/" + item.z);
        card_download.innerText = "Download"
        card_download.style.borderRadius = "0rem";

        card_row_download.append(card_download)

        card_body.append(card_tag1);
        card_body.append(card_tag2);
        card_body.append(card_tag3);
        card_body.append(card_desc);
        card_body.append(card_row_download);

        card_inner.append(card_header);
        card_inner.append(card_body);
        card_item.append(card_inner);
        return card_item
    } else {
        return 0;
    }
}

function show_entries(data) {

    let the_content = document.getElementById("content");
    if (the_content.children.length > 0) {
        the_content.innerHTML = ''
    }
    data.forEach(element => {
        if (element !== "") {
            let entry = create_entry(element)
            if (entry !== 0) {
                the_content.append(entry);
            }
        }
    });
};

function update_language() {
    let version = document.getElementById("select_version").value;
    // let languages = "js/languages.js"
    languages.forEach(item => {
        let option = document.createElement("option");
        option.value = item[0];
        if (item[1] !== item[2]) {
            option.text = item[2] + " | " + item[1];
        } else {
            option.text = item[2];
        }
        if (item[0] === "en") {
            option.setAttribute("selected", "selected");
        }
        document.getElementById("select_language").append(option);
    })
}

function fetch_data() {
    let gramps_version = document.getElementById("select_version").value
    let gramps_language = document.getElementById("select_language").value
    let url = `https://raw.githubusercontent.com/gramps-project/addons/master/${gramps_version}/listings/addons-${gramps_language}.txt`;
    fetch(url)
        .then(response => response.text())
        // gramps addon listings aren't JSON => replace chars causing parsing errors
        .then(txt => replaceInString(txt, ":'", ':"'))
        .then(txt => replaceInString(txt, "',", '",'))
        .then(txt => replaceInString(txt, "'}", '"}'))
        .then(txt => replaceInString(txt, ' "', ''))
        .then(txt => replaceInString(txt, '" ', ''))
        .then(txt => replaceInString(txt, "\\'", ''))
        .then(txt => txt.split(/\r\n|\n|\r/))
        .then(show_entries);
}

function main() {
    let categories = ["Database", "Exporter", "Gramplet", "Gramps View", "Importer", "Map service", "Plugin lib", "Quickreport", "Report", "Rule", "Tool"];
    categories.forEach(item => {
        let option = document.createElement("option");
        option.value = item;
        option.text = item;
        document.getElementById("select_category").append(option);
    })
    update_language();

    document.getElementById("search").onclick = fetch_data;
}

document.addEventListener("DOMContentLoaded", main);
