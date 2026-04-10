import fs from 'fs';
import path from 'path';

const importURL = "@import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400..700;1,400..700&family=Nunito:wght@400;600;700&display=swap');\n\n";

let styleCss = fs.readFileSync('src/style.css', 'utf8');
if (!styleCss.includes('fonts.googleapis.com')) {
    styleCss = importURL + styleCss;
    styleCss = styleCss.replace(/--sans:.*/g, "--sans: 'Nunito', system-ui, sans-serif;");
    styleCss = styleCss.replace(/--heading:.*/g, "--heading: 'Lora', Georgia, serif;");
    fs.writeFileSync('src/style.css', styleCss);
}

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { results = results.concat(walk(file)); }
        else if (file.endsWith('.vue')) { results.push(file); }
    });
    return results;
}

const files = walk('./src');
files.forEach(f => {
    let content = fs.readFileSync(f, 'utf8');
    let newContent = content.replace(/'Segoe UI', system-ui, sans-serif/g, "var(--sans)");
    newContent = newContent.replace(/'Segoe UI', Roboto, sans-serif/g, "var(--sans)");
    if (newContent !== content) { fs.writeFileSync(f, newContent); }
});

if (!styleCss.includes('.prestation-header h2')) {
    fs.appendFileSync('src/style.css', '\n\nh1, h2, h3, .footer-logo, .header-logo, .prestation-header h2, .prestation-section h2, .page-hero h1 { font-family: var(--heading) !important; }\n');
}
console.log('Fonts updated');
