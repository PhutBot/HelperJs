import * as fs from 'fs';

export function ReadFileLSV(filename) {
    const content = fs.readFileSync(filename).toString();
    return content.split('\n')
        .filter(line => !!line.trim());
}

export function WriteFileLSV(filename, data) {
    let content = '';
    data.forEach(val => {
        content += `${val}\n`;
    });

    fs.writeFileSync(filename, content);
}
