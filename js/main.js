"use strict";

function replaceInString(fullString, search, replacement) {
    return fullString.split(search).join(replacement);
}

function create_entry(element, step) {
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

        let card_tag4 = document.createElement("span");
        card_tag4.setAttribute("class", "badge bg-primary me-1");
        if (step === "gramps") {
            card_tag4.innerText = "Gramps";
        } else if (step === "isotammi") {
            card_tag4.innerText = "Isotammi";
        }

        let card_desc = document.createElement("div");
        card_desc.setAttribute("class", "mb-2");
        card_desc.innerText = item.d;

        let card_row_download = document.createElement("div");
        card_row_download.setAttribute("class", "text-center");

        let card_download_btn = document.createElement("a");
        card_download_btn.setAttribute("class", "btn btn-outline-primary btn-sm col-6");
        if (step === "gramps") {
            card_download_btn.setAttribute("href", "https://github.com/gramps-project/addons/raw/master/gramps51/download/" + item.z);
        } else if (step === "isotammi") {
            card_download_btn.setAttribute("href", "https://github.com/Taapeli/isotammi-addons/raw/master/addons/gramps51/download/" + item.z);
        }
        card_download_btn.innerText = "Download"
        card_download_btn.style.borderRadius = "0rem";

        card_row_download.append(card_download_btn)

        card_body.append(card_tag4);
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

function show_entries(data, reset, current_step) {
    let the_content = document.getElementById("content");
    if (reset && the_content.children.length > 0) {
        the_content.innerHTML = ''
    }
    data.forEach(element => {
        if (element !== "") {
            let entry = create_entry(element, current_step)
            if (entry !== 0) {
                the_content.append(entry);
            }
        }
    });
};

function update_language() {
    // languages from languages.js
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

function get_gramps_data(url_gramps) {
    return fetch(url_gramps)
        .then(response =>
            response.text()
            // gramps listings aren't JSON, remove chars causing parsing errors
                .then(txt => replaceInString(txt, ":'", ':"'))
                .then(txt => replaceInString(txt, "',", '",'))
                .then(txt => replaceInString(txt, "'}", '"}'))
                .then(txt => replaceInString(txt, ' "', ''))
                .then(txt => replaceInString(txt, '" ', ''))
                .then(txt => replaceInString(txt, "\\'", ''))
                .then(txt => txt.split(/\r\n|\n|\r/)));
}

function get_isotammi_data(url_isotammi) {
    return fetch(url_isotammi)
        .then(response =>
            response.text()
            // isotammi listings aren't JSON, remove chars causing parsing errors
                .then(txt => replaceInString(txt, "{'", '{"'))
                .then(txt => replaceInString(txt, ": '", ': "'))
                .then(txt => replaceInString(txt, "':", '":'))
                .then(txt => replaceInString(txt, "',", '",'))
                .then(txt => replaceInString(txt, ", '", ', "'))
                .then(txt => replaceInString(txt, "'}", '"}'))
                .then(txt => txt.split(/\r\n|\n|\r/)));
}

function fetch_data() {
    let project = document.getElementById("select_project").value
    let gramps_version = document.getElementById("select_version").value
    let gramps_language = document.getElementById("select_language").value
    let languages_isotammi = ["en", "fi", "sv"];  // languages supported by isotammi
    let url_gramps = `https://raw.githubusercontent.com/gramps-project/addons/master/${gramps_version}/listings/addons-${gramps_language}.txt`;
    let url_isotammi = `https://raw.githubusercontent.com/Taapeli/isotammi-addons/master/addons/${gramps_version}/listings/addons-en.txt`;

    // update language if supported by isotammi, else fallback to english
    if (languages_isotammi.includes(gramps_language)) {
        url_isotammi = `https://raw.githubusercontent.com/Taapeli/isotammi-addons/master/addons/${gramps_version}/listings/addons-${gramps_language}.txt`;
    }

    // fetch data and create entries
    if (project === "all") {
        get_gramps_data(url_gramps).then(data => show_entries(data, true, "gramps"));
        get_isotammi_data(url_isotammi).then(data => show_entries(data, false, "isotammi"));
    } else if (project === "gramps") {
        get_gramps_data(url_gramps).then(data => show_entries(data, true, "gramps"));
    } else if (project === "isotammi") {
        get_isotammi_data(url_isotammi).then(data => show_entries(data, true, "isotammi"));
    }
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
