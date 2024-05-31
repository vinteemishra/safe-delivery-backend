'use strict';

function uuidv4() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
        var r = Math.random() * 16 | 0, v = c == "x" ? r : (r & 0x3 | 0x8); // tslint:disable-line
        return v.toString(16);
    });
}
export function createUniqueKeyWithDate() {
    const ts = new Date().toISOString().replace(/[-:,.ZT]/g, "");
    const uuid = uuidv4();
    return `${ts}_${uuid}`;
}