import fs from "fs";
import { cardToHtml } from "./cardPrettyPrinter";


const docsByTable = {
    "screens": [],
    "drugs": [],
    "action-cards": [],
    "about": [],
    "procedures": [],
    "modules": [],
    "notifications": [],
    "key-learning-points": [],
    "certificates": [],
    "cases": [],
    "onboarding": [],
};

const BACKUP_FILE = "/home/jstampe/Downloads/content";
const LANG_ID = "57153e33-dd43-63d8-337b-ce55028fddb6";

const OUTPUT_DIR = "./output/";

var globalHeaderCount = 0;

// try {
//     fs.unlinkSync(OUTPUT_FILE);
// } catch (e) {
//     console.log("No output file.");
// }

// const outputStream = fs.createWriteStream(OUTPUT_FILE);

const tocContent = {
    "screens": [],
    "drugs": [],
    "action-cards": [],
    "about": [],
    "procedures": [],
    "modules": [],
    "notifications": [],
    "key-learning-points": [],
    "certificates": [],
    "cases": [],
    "onboarding": [],
};
const bodyContent = {
    "screens": [],
    "drugs": [],
    "action-cards": [],
    "about": [],
    "procedures": [],
    "modules": [],
    "notifications": [],
    "key-learning-points": [],
    "certificates": [],
    "cases": [],
    "onboarding": [],
};

// function debug(obj) {
//     bodyContent.push(`<pre>${JSON.stringify(obj, null, 5)}</pre>`);
// }

const backupData = JSON.parse(fs.readFileSync(BACKUP_FILE).toString());
const languageDocuments = backupData.filter(doc => doc.langId === LANG_ID);

languageDocuments.forEach(doc => {
    const table = doc._table;
    if (docsByTable[table] === undefined) {
        docsByTable[table] = [];
    }

    docsByTable[table].push(doc);
});

function prettyPrintHeader() {
    return `<!doctype html>
        <html lang="en">
        <head>
            <meta charset="utf-8">
            <title>Safe Delivery Content output</title>
            <style>
                table td {
                    margin-top: 10px;
                }

                table td h1 {
                    font-size: 1.6em;
                    text-decoration: none;
                }

                table td h1 {
                    text-decoration: none;
                }

                table tbody tr:nth-child(odd){
                    background: #eee;
                }

                h1, h2 {
                    text-decoration: underline;
                }

                div#toc {
                    background-color: #eee;
                    margin-bottom: 50px;
                }

                div#toc h1,
                div#toc h2,
                div#toc h3 {
                    font-size: 1.5em;
                    font-weight: 400;
                    text-decoration: none;
                    color: black;
                }
                div#toc h2 {
                    font-size: 1em;
                    margin-left: 40px;
                }
                div#toc h3 {
                    font-size: 1em;
                    margin-left: 80px;
                }
                div#toc a {
                    // text-decoration: none;
                }

            </style>
        </head>
        <body>
        `;
}

function prettyPrintChapters(chapters, key) {
    chapters.forEach(chapter => {
        if (chapter.description) {
            const id = globalHeaderCount++;
            tocContent[key].push(`<a href="#${id}"><h3>Chapter: ${chapter.description}</h3></a>`);
            bodyContent[key].push(`<br/><br/><h3 id="${id}">Chapter: ${chapter.description}</h3>`);
        }
        const rows = chapter.cards.map(card => {
            return `<tr>
                <td style="width: 50%">${cardToHtml(card, card.adapted)}</td>
                <td style="width: 50%">${cardToHtml(card, card.translated)}</td>
            </tr>`;
        })
        bodyContent[key].push(`<table style="width: 100%;">
            <thead>
                <th style="width: 50%">Adapted</th>
                <th style="width: 50%">Translated</th>
            </thead>
            <tbody>${rows.join("")}</tbody>
        </table>`
        );
    });
}

function prettyPrintRaw(list, key) {
    const rows = list.map(elem => {
        return `<tr>
            <td style="width: 50%">${elem.adapted}</td>
            <td style="width: 50%">${elem.translated}</td>
        </tr>`;
    })
    bodyContent[key].push(`<table style="width: 100%;">
        <thead>
            <th style="width: 50%">Adapted</th>
            <th style="width: 50%">Translated</th>
        </thead>
        <tbody>${rows.join("")}</tbody>
    </table>`
    );
}

function prettyPrintNotifications(list) {
    const id = globalHeaderCount++;
    tocContent["notifications"].push(`<a href="#${id}"><h1>Notifications</h1></a>`);
    bodyContent["notifications"].push(`<h1 id="${id}">Notifications</h1>`);

    const rows = list.map(notification => {
        return `<tr>
            <td style="width: 50%">${notification.adapted ? notification.adapted.longDescription : ""}</td>
            <td style="width: 50%">${notification.translated ? notification.translated.longDescription : ""}</td>
        </tr>`;
    })
    bodyContent["notifications"].push(`<table style="width: 100%;">
        <thead>
            <th style="width: 50%">Adapted</th>
            <th style="width: 50%">Translated</th>
        </thead>
        <tbody>${rows.join("")}</tbody>
    </table>`
    );
}

function prettyPrintActionCards(list) {
    const id = globalHeaderCount++;
    tocContent["action-cards"].push(`<a href="#${id}"><h1>Action Cards</h1></a>`);
    bodyContent["action-cards"].push(`<h1 id="${id}">Action Cards</h1>`);

    list.forEach(ac => {
        // console.log(`Writing this: ${ac.description}`);
        const id = globalHeaderCount++;
        tocContent["action-cards"].push(`<a href="#${id}"><h2>Action Card: ${ac.description}</h2></a>`);
        bodyContent["action-cards"].push(`<br/><br/><h2 id="${id}">Action Card: ${ac.description}</h2>`);
        prettyPrintChapters(ac.chapters, "action-cards");
    });

    bodyContent["action-cards"].push("<br/><br/>");
}

function prettyPrintProcedures(list) {
    const id = globalHeaderCount++;
    tocContent["procedures"].push(`<a href="#${id}"><h1>Practical procedures</h1></a>`);
    bodyContent["procedures"].push(`<h1 id="${id}">Practical procedures</h1>`);

    list.forEach(ac => {
        // console.log(`Writing this: ${ac.description}`);
        const id = globalHeaderCount++;
        tocContent["procedures"].push(`<a href="#${id}"><h2>Procedure: ${ac.description}</h2></a>`);
        bodyContent["procedures"].push(`<br/><br/><h2 id="${id}">Procedure: ${ac.description}</h2>`);
        prettyPrintChapters(ac.chapters, "procedures");
    });

    bodyContent["procedures"].push("<br/><br/>");
}

function prettyPrintAbout(list) {
    const id = globalHeaderCount++;
    tocContent["about"].push(`<a href="#${id}"><h1>About</h1></a>`);
    bodyContent["about"].push(`<h1 id="${id}">About</h1>`);

    list.forEach(about => {
        // console.log(`Writing this: ${ac.description}`);
        const id = globalHeaderCount++;
        tocContent["about"].push(`<a href="#${id}"><h2>Section: ${about.section}</h2></a>`);
        bodyContent["about"].push(`<br/><br/><h2 id=${id}">Section: ${about.section}</h2>`);
        prettyPrintChapters(about.chapters, "about");
    });

    bodyContent["about"].push("<br/><br/>");
}

function prettyPrintDrugs(list) {
    const id = globalHeaderCount++;
    tocContent["drugs"].push(`<a href="#${id}"><h1>Drugs</h1></a>`);
    bodyContent["drugs"].push(`<h1 id="${id}">Drugs</h1>`);

    list.forEach(drug => {
        if (drug.description) {
            const id = globalHeaderCount++;
            tocContent["drugs"].push(`<a href="#${id}"><h2>Drug: ${drug.description}</h2></a>`);
            bodyContent["drugs"].push(`<br/><br/><h2 id="${id}">Drug: ${drug.description}</h2>`);
        }
        const rows = drug.cards.map(card => {
            return `<tr>
                <td style="width: 50%">${cardToHtml(card, card.adapted)}</td>
                <td style="width: 50%">${cardToHtml(card, card.translated)}</td>
            </tr>`;
        })
        bodyContent["drugs"].push(`<table style="width: 100%;">
            <thead>
                <th style="width: 50%">Adapted</th>
                <th style="width: 50%">Translated</th>
            </thead>
            <tbody>${rows.join("")}</tbody>
        </table>`
        );
    });

    bodyContent["drugs"].push("<br/><br/>");
}


function prettyPrintQuestions(questions, key) {
    questions.forEach(q => {
        const rows = [];

        if (q.description.adapted || q.description.translated) {
            rows.push(`<tr>
                <td><b>Description:</b></td>
                <td>${q.description.adapted}</td>
                <td>${q.description.translated}</td>
            </tr>`
            );
        }
        rows.push(`<tr>
            <td><b>Question:</b></td>
            <td>${q.question.adapted}</td>
            <td>${q.question.translated}</td>
        </tr>`
        );
        (q.answers || []).forEach(answer => {
            rows.push(`<tr>
                <td>Answer:</td>
                <td>${answer.value.adapted}</td>
                <td>${answer.value.translated}</td>
            </tr>`);
        });

        bodyContent[key].push(`<table style="width: 100%;">
            <thead>
                <th></th>
                <th>Adapted</th>
                <th>Translated</th>
            </thead>
            <tbody>${rows.join("")}</tbody>
        </table>`
        );
    });
}

function prettyPrintKeyLearningPoints(list) {
    const id = globalHeaderCount++;
    tocContent["key-learning-points"].push(`<a href="#${id}"><h1>Key Learning Points</h1></a>`);
    bodyContent["key-learning-points"].push(`<h1 id="${id}">Key Learning Points</h1>`);

    list.forEach(klp => {
        const id = globalHeaderCount++;
        tocContent["key-learning-points"].push(`<a href="#${id}"><h2>KLP: ${klp.description}</h2></a>`);
        bodyContent["key-learning-points"].push(`<br/><br/><h2 id="${id}">KLP: ${klp.description}</h2>`);
        prettyPrintQuestions(klp.questions, "key-learning-points");
    });

    bodyContent["key-learning-points"].push("<br/><br/>");
}

function prettyPrintCases(list) {
    const id = globalHeaderCount++;
    tocContent["cases"].push(`<a href="#${id}"><h1>Cases</h1></a>`);
    bodyContent["cases"].push(`<h1 id="${id}">Cases</h1>`);

    list.forEach(caze => {
        const id = globalHeaderCount++;
        tocContent["cases"].push(`<a href="#${id}"><h2>Case: ${caze.comment}</h2></a>`);
        bodyContent["cases"].push(`<br/><br/><h2 id="${id}">${caze.comment}</h2>`);

        bodyContent["cases"].push(`<table style="width: 100%;">
                <thead>
                    <th>Description</th>
                    <th>Translated description</th>
                </thead>
                <tbody>
                    <tr>
                        <td>${caze.masterDescription}</td>
                        <td>${caze.description}</td>
                    </tr>
                </tbody>
            </table>
            <br>`
        );
        prettyPrintQuestions(caze.questions, "cases");
    });

    bodyContent["cases"].push("<br/><br/>");
}

function prettyPrintCertificate(list) {
    const id = globalHeaderCount++;
    tocContent["certificates"].push(`<a href="#${id}"><h1>Certificates</h1></a>`);
    bodyContent["certificates"].push(`<h1 id="${id}">Certificates</h1>`);
    list.forEach(cert => {
        const id = globalHeaderCount++;
        tocContent["certificates"].push(`<a href="#${id}"><h2>Certificate: ${cert.name}</h2></a>`);
        bodyContent["certificates"].push(`<br/><br/><h2 id="${id}">${cert.name}</h2>`);

        const rows = cert.cards.map(card => {
            return `<tr>
                <td style="width: 50%">${cardToHtml(card, card.adapted)}</td>
                <td style="width: 50%">${cardToHtml(card, card.translated)}</td>
            </tr>`;
        })
        bodyContent["certificates"].push(`<table style="width: 100%;">
            <thead>
                <th style="width: 50%">Adapted</th>
                <th style="width: 50%">Translated</th>
            </thead>
            <tbody>${rows.join("")}</tbody>
        </table>`
        );
    });
}

function prettyPrintScreens(list) {
    const id = globalHeaderCount++;
    tocContent["screens"].push(`<a href="#${id}"><h1>Screen texts</h1></a>`);
    bodyContent["screens"].push(`<h1 id="${id}">Screen texts</h1>`);
    prettyPrintRaw(list, "screens");
    bodyContent["screens"].push("<br/><br/>");
}



function prettyPrintOnboarding(list) {
    const id = globalHeaderCount++;
    tocContent["onboarding"].push(`<a href="#${id}"><h1>Onboarding questions</h1></a>`);
    bodyContent["onboarding"].push(`<h1 id="${id}">Onboarding questions</h1>`);

    const rows = [];
    list.forEach(onb => {
        rows.push(`<tr>
                <td><b>Question:</b></td>
                <td><b>${onb.question.adapted}</b></td>
                <td><b>${onb.question.translated}</b></td>
            </tr>`
        );
        onb.answers.forEach(a => {
            rows.push(`<tr>
                <td>Answer:</td>
                <td>${a.adapted}</td>
                <td>${a.translated}</td>
            </tr>`)
        });
        rows.push(`<tr>
                <td colspan="3">&nbsp;</td>
            </tr>`
        );

    });
    bodyContent["onboarding"].push(`<table style="width: 100%;">
        <thead>
            <th></th>
            <th>Adapted</th>
            <th>Translated</th>
        </thead>
        <tbody>${rows.join("")}</tbody>
    </table>`
    );
}

Object.keys(docsByTable).forEach(key => {
    const arr = docsByTable[key];
    console.log(`${key} = ${arr.length}`);
})

// outputStream.addListener("finish", () => { outputStream.end(); outputStream.close(); });

prettyPrintHeader();

prettyPrintOnboarding(docsByTable["onboarding"]);

// All with chapters
prettyPrintActionCards(docsByTable["action-cards"]);
prettyPrintProcedures(docsByTable["procedures"]);
prettyPrintAbout(docsByTable["about"]);
// Direct cards
prettyPrintDrugs(docsByTable["drugs"]);

// Learning platform
prettyPrintKeyLearningPoints(docsByTable["key-learning-points"]);
prettyPrintCertificate(docsByTable["certificates"]);
prettyPrintCases(docsByTable["cases"]);

// Notifications
prettyPrintNotifications(docsByTable["notifications"]);

// Raw
prettyPrintScreens(docsByTable["screens"]);

const keys = [
    "onboarding",
    "action-cards",
    "procedures",
    "about",
    "drugs",
    "key-learning-points",
    "certificates",
    "cases",
    "notifications",
    "screens",
];
let allContent = [];
let allToc = [];

function writeOutput(name, toc, content) {
    const tocHtml = toc.length > 1 ? `<h1>Table of Content</h1><div id="toc">${toc.join("")}</div>` : '';
    const output = `${prettyPrintHeader()}${tocHtml}${content.join("")}`;
    fs.writeFileSync(`${OUTPUT_DIR}${name}.html`, output);
}

// Write each subject separately
keys.forEach(k => {
    allContent = allContent.concat(bodyContent[k]);
    allToc = allToc.concat(tocContent[k]);
    writeOutput(k, tocContent[k], bodyContent[k]);
})

// Also write everytihing combined
writeOutput("everything", allToc, allContent);
