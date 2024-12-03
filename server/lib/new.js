const fs = require('fs');

function extractStructure(data) {
    if (Array.isArray(data)) {
        return data.length ? [extractStructure(data[0])] : [];
    } else if (typeof data === 'object' && data !== null) {
        const result = {};
        for (const [key, value] of Object.entries(data)) {
            result[key] = extractStructure(value);
        }
        return result;
    } else {
        return null;
    }
}

// Load JSON file
const data = JSON.parse(fs.readFileSync('data.json', 'utf8'));

// Get structure
const structure = extractStructure(data);

console.log(JSON.stringify(structure, null, 4));
