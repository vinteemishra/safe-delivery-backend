# Overview of (some) scripts

---

## prettyPrintContent

Is used to extract all content of a language version from a backup file to HTML.

#### How?

Update correct paths in `printContentFromBackup.js`:

- `BACKUP_FILE`

- `LANG_ID`

and execute with `node run.js`

This will create a bunch of HTML files in `output`.

#### Docx

It's possible to create a document in `docx` format if you have `libreoffice` installed.

run `./build.sh`

---

## duplicateLanguage.js

Is used to create a new copy of an existing language

#### How

- Create a new language in the CMS with the desired destination Name and Asset choice.

- Insert the language id from the language you want to copy and the language id from the newly created language in `duplicateLanguage.js`

- Run the script from sda-cms root directory:
        `NODE_ENV=production node tools/duplicateLanguage.js`

---

## extractTableEvents.js

Is used to extract all raw analytics events.

This may take a couple of hours and will generate at least 12 Gb of data.

---

## separationOfMaster.js

Was used as a one-time script ensure that all languages have their own copy of master content copied to their `adapted` or `translated` columns (if they were missing).

This was an issue because of a large change to Master content was pending, but translaters needed all existing master content to say unchanged in `adapted` and/or `translated`.

---

## mapping-extract.js

Can be run to manually update analytics mappings. This now happens automatically whenever a language is published.

---

## wordCount.js

Is used to count words for a given language. Has been used for statistics when collecting offers from translation agencies