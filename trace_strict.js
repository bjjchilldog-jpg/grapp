const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');
let lines = html.split('\n');
let depth = 0;
let appCont = -1;

for(let i=0; i<lines.length; i++) {
    let line = lines[i];
    
    if (line.includes('class="app-container"')) {
        appCont = depth;
    }
    
    let opens = (line.match(/<div/g) || []).length;
    let closes = (line.match(/<\/div>/g) || []).length;
    
    depth += opens - closes;
    
    if (appCont !== -1 && depth <= appCont) {
        console.log('app-container CLOSES PREMATURELY at line ' + (i+1));
        console.log('Line content:', line.trim());
        appCont = -1;
    }
}
