const fs = require('fs');

if (fs.existsSync('index.html')) {
    let html = fs.readFileSync('index.html', 'utf8');

    // Add profColorBg to White-Labeling section
    html = html.replace(/<div style="flex:1;"><label data-en="Accent \(e.g. Blue\)">Accent \(z.B. Blau\)<\/label><input type="color" id="profColorAccent" value="#3498db" style="padding:0; height:40px;" onchange="saveProfile\(\)"><\/div>\n\s*<\/div>/, 
    `<div style="flex:1;"><label data-en="Accent (e.g. Blue)">Accent (z.B. Blau)</label><input type="color" id="profColorAccent" value="#3498db" style="padding:0; height:40px;" onchange="saveProfile()"></div>
                    <div style="flex:1;"><label data-en="Background">Hintergrund</label><input type="color" id="profColorBg" value="#000000" style="padding:0; height:40px;" onchange="saveProfile()"></div>
                </div>`);

    fs.writeFileSync('index.html', html, 'utf8');
}

if (fs.existsSync('js/profile.js')) {
    let js = fs.readFileSync('js/profile.js', 'utf8');

    // Add profColorBg to saveProfile
    js = js.replace(/const accentColorInput = document\.getElementById\('profColorAccent'\);/, 
    `const accentColorInput = document.getElementById('profColorAccent');\n    const bgColorInput = document.getElementById('profColorBg');`);

    js = js.replace(/safeSet\('grapp_color_accent', accentColorInput\.value\);/, 
    `safeSet('grapp_color_accent', accentColorInput.value);\n            if(bgColorInput) safeSet('grapp_color_bg', bgColorInput.value);`);

    js = js.replace(/localStorage\.removeItem\('grapp_color_accent'\);/, 
    `localStorage.removeItem('grapp_color_accent');\n            if(bgColorInput) bgColorInput.value = "#000000";\n            localStorage.removeItem('grapp_color_bg');`);

    // Add profColorBg to loadProfile
    js = js.replace(/if\(document\.getElementById\('profColorAccent'\)\) document\.getElementById\('profColorAccent'\)\.value = safeGet\('grapp_color_accent', "#3498db"\);/, 
    `if(document.getElementById('profColorAccent')) document.getElementById('profColorAccent').value = safeGet('grapp_color_accent', "#3498db");\n    if(document.getElementById('profColorBg')) document.getElementById('profColorBg').value = safeGet('grapp_color_bg', "#000000");`);

    fs.writeFileSync('js/profile.js', js, 'utf8');
}

if (fs.existsSync('js/app.js')) {
    let js = fs.readFileSync('js/app.js', 'utf8');

    // Add background color application to applyGymTheme
    js = js.replace(/var accentColor = safeGet\('grapp_color_accent', '#3498db'\);/, 
    `var accentColor = safeGet('grapp_color_accent', '#3498db');\n    var bgColor = safeGet('grapp_color_bg', '#000000');`);

    js = js.replace(/document\.documentElement\.style\.setProperty\('--accent-color', accentColor\);/, 
    `document.documentElement.style.setProperty('--accent-color', accentColor);\n    document.body.style.backgroundColor = bgColor;`);

    fs.writeFileSync('js/app.js', js, 'utf8');
}

console.log("Background Color Picker added successfully!");
