import fs from 'fs';
import path from 'path';

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else if (file.endsWith('.vue')) {
            results.push(file);
        }
    });
    return results;
}

const files = walk('./src/views');
let count = 0;
files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let newContent = content.replace(/<a\s+href="(\/[^"]*)"([^>]*)>([\s\S]*?)<\/a>/gi, '<RouterLink to="$1"$2>$3</RouterLink>');
    if (newContent !== content) {
        fs.writeFileSync(file, newContent);
        count++;
    }
});
console.log('Fixed ' + count + ' files.');
