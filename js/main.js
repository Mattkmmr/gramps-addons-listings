"use strict";

function replaceInString(fullString, search, replacement) {
    return fullString.split(search).join(replacement);
}

function create_entry(item, step) {
    let category = document.getElementById("select_category").value;
    let selected_language = document.getElementById("select_language").value

    if (item && (category === "All" || item.t === category)) {
        let card_item = document.createElement("div");
        card_item.setAttribute("class", "col col-12 col-md-6 col-xl-4 px-2 pb-3");
        card_item.style.minWidth = "20rem";

        let card_inner = document.createElement("div");
        card_inner.setAttribute("class", "border shadow p-3 h-100");

        let card_header = document.createElement("div");
        card_header.setAttribute("class", "fw-bold");
        card_header.innerText = item.n2;

        let card_subheader = document.createElement("div");
        card_subheader.setAttribute("class", "text-secondary");
        if (selected_language !== "en") {
            card_subheader.innerText = item.n
        }

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
        card_desc.innerText = item.d2;

        let card_row_download = document.createElement("div");
        card_row_download.setAttribute("class", "text-center");

        let card_download_btn = document.createElement("a");
        card_download_btn.setAttribute("class", "btn btn-outline-primary btn-sm col-4 text-nowrap me-2");
        if (step === "gramps") {
            card_download_btn.setAttribute("href", "https://github.com/gramps-project/addons/raw/master/gramps51/download/" + item.z);
        } else if (step === "isotammi") {
            card_download_btn.setAttribute("href", "https://github.com/Taapeli/isotammi-addons/raw/master/addons/gramps51/download/" + item.z);
        }
        card_download_btn.style.borderRadius = "0rem";

        let card_wiki_btn = document.createElement("a");
        card_wiki_btn.setAttribute("class", "btn btn-outline-secondary btn-sm col-4 text-nowrap disabled");
        card_wiki_btn.style.borderRadius = "0rem";

        // wiki_links from wiki.js
        wiki_links.forEach(element => {
            if (element.i === item.i && element.w !== "") {
                card_wiki_btn.setAttribute("href", "https://gramps-project.org/wiki/index.php/" + element.w);
                card_wiki_btn.classList.remove("disabled");
                card_wiki_btn.classList.remove("btn-outline-secondary");
                card_wiki_btn.classList.add("btn-outline-primary");
            }
        })

        let dowload_icon = document.createElement("span");
        dowload_icon.setAttribute("class", "bi bi-arrow-down-square-fill me-1");

        let download_text = document.createElement("span");
        download_text.innerText = "Download";

        let wiki_icon = document.createElement("span");
        wiki_icon.setAttribute("class", "bi bi-globe me-1");

        let wiki_text = document.createElement("span");
        wiki_text.innerText = "Wiki";

        card_download_btn.append(dowload_icon);
        card_download_btn.append(download_text);

        card_wiki_btn.append(wiki_icon);
        card_wiki_btn.append(wiki_text);

        card_row_download.append(card_download_btn);
        card_row_download.append(card_wiki_btn);

        card_body.append(card_tag4);
        card_body.append(card_tag1);
        card_body.append(card_tag2);
        card_body.append(card_tag3);
        card_body.append(card_desc);
        card_body.append(card_row_download);

        card_inner.append(card_header);
        if (selected_language !== "en") {
            card_inner.append(card_subheader);
        }
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
    data.sort((a, b) => a.n.localeCompare(b.n)).forEach(element => {
        let entry = create_entry(element, current_step)
        if (entry !== 0) {
            the_content.append(entry);
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

function get_gramps_data(txt) {
    // gramps listings aren't JSON, remove chars causing parsing errors
    txt = replaceInString(txt, ":'", ':"');
    txt = replaceInString(txt, "',", '",');
    txt = replaceInString(txt, "'}", '"}');
    txt = replaceInString(txt, ' "N', 'N');
    txt = replaceInString(txt, '" ', '');
    txt = replaceInString(txt, " '", '"');
    txt = replaceInString(txt, "\\'", '');
    return txt.split(/\r\n|\n|\r/);
}

function get_isotammi_data(txt) {
    // isotammi listings aren't JSON, remove chars causing parsing errors
    txt = replaceInString(txt, "{'", '{"');
    txt = replaceInString(txt, ": '", ': "');
    txt = replaceInString(txt, "':", '":');
    txt = replaceInString(txt, "',", '",');
    txt = replaceInString(txt, ", '", ', "');
    txt = replaceInString(txt, "'}", '"}');
    return txt.split(/\r\n|\n|\r/);
}

function data_text_to_json(arr1, arr2) {
    let arr_json1 = [];
    let arr_json2 = [];

    // arr1 to JSON
    arr1.forEach(element => {
        if (element != "") {
            let item = false;
            try {
                item = JSON.parse(element);
            } catch (err) {
                // console.log(err);
                item = { "t": "", "i": "", "n": "", "v": "", "g": "", "d": "", "z": "" }
            }
            if (item) {
                arr_json1.push(item);
            }
        }
    });

    // arr2 to JSON
    arr2.forEach(element => {
        if (element != "") {
            let item = false;
            try {
                item = JSON.parse(element);
            } catch (err) {
                // console.log(err);
                item = { "t": "", "i": "", "n": "", "v": "", "g": "", "d": "", "z": "" }
            }
            if (item) {
                arr_json2.push(item);
            }
        }
    });

    // combine both JSON arrays
    let selected_language = document.getElementById("select_language").value
    for (let i = 0; i < arr_json1.length; i++) {
        const e1 = arr_json1[i];
        const e2 = arr_json2[i];
        e1.d2 = e2.d;
        e1.n2 = e2.n;
    }
    return arr_json1;
}

function fetch_data() {
    let project = document.getElementById("select_project").value
    let selected_version = document.getElementById("select_version").value
    let selected_language = document.getElementById("select_language").value
    let languages_isotammi = ["en", "fi", "sv"];  // languages supported by isotammi
    let url_gramps_1 = `https://raw.githubusercontent.com/gramps-project/addons/master/${selected_version}/listings/addons-en.txt`;
    let url_gramps_2 = `https://raw.githubusercontent.com/gramps-project/addons/master/${selected_version}/listings/addons-${selected_language}.txt`;
    let url_isotammi_1 = `https://raw.githubusercontent.com/Taapeli/isotammi-addons/master/addons/${selected_version}/listings/addons-en.txt`;
    let url_isotammi_2 = `https://raw.githubusercontent.com/Taapeli/isotammi-addons/master/addons/${selected_version}/listings/addons-en.txt`;
    if (languages_isotammi.includes(selected_language)) {
        url_isotammi_2 = `https://raw.githubusercontent.com/Taapeli/isotammi-addons/master/addons/${selected_version}/listings/addons-${selected_language}.txt`;
    }

    Promise.all([
        fetch(url_gramps_1).then(res => res.text())
            .then(txt => get_gramps_data(txt)),
        fetch(url_gramps_2).then(res => res.text())
            .then(txt => get_gramps_data(txt)),
        fetch(url_isotammi_1).then(res => res.text())
            .then(txt => get_isotammi_data(txt)),
        fetch(url_isotammi_2).then(res => res.text())
            .then(txt => get_isotammi_data(txt))
    ])
        .then(([gramps_arr1, gramps_arr2, isotammi_arr1, isotammi_arr2]) => {
            let gramps_json = data_text_to_json(gramps_arr1, gramps_arr2);
            let isotammi_json = data_text_to_json(isotammi_arr1, isotammi_arr2);

            if (project === "all") {
                show_entries(gramps_json, true, "gramps");
                show_entries(isotammi_json, false, "isotammi");
            } else if (project === "gramps") {
                show_entries(gramps_json, true, "gramps");
            } else if (project === "isotammi") {
                show_entries(isotammi_json, true, "isotammi");
            }
        });
    // });
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
