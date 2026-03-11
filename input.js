const readline = require('readline');
const fs = require('fs');
const path = require('path');
const SaxonJS = require('saxon-js');

const filePath = path.join(__dirname, 'data', 'akce.xml');

// Inicializace XML souboru, pokud byl smazán nebo neexistuje
if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, '<?xml version="1.0" encoding="UTF-8"?>\n<akce>\n</akce>\n', 'utf8');
}

function pridejAkci(klavesa) {
    const novyObsah = `<?xml version="1.0" encoding="UTF-8"?>\n<akce>\n    <stisk klavesa="${klavesa}" />\n</akce>\n`;

    try {
        // Přepíšeme celý soubor, takže udržíme jen poslední stisknutou klávesu
        fs.writeFileSync(filePath, novyObsah, 'utf8');
        console.log(`[ULOŽENO] Klávesa: ${klavesa}`);

        aplikujPohyb();
      

    } catch (err) {
        console.error('Chyba při zápisu do XML:', err);
    }
}

// Inicializace čtení vstupů z klávesnice
readline.emitKeypressEvents(process.stdin);

if (process.stdin.isTTY) {
    process.stdin.setRawMode(true);
}

console.log('=========================================');
console.log('Sledování kláves aktivní.');
console.log('Zmáčkni W, A, S nebo D pro záznam akce.');
console.log('Pro ukončení stiskni Ctrl + C');
console.log('=========================================');

process.stdin.on('keypress', (str, key) => {
    // Ukončení aplikace přes Ctrl+C
    if (key.ctrl && key.name === 'c') {
        console.log('Ukončuji aplikaci...');
        process.exit();
    }

    // Zpracování kláves w, a, s, d (velká i malá písmena)
    if (key.name && ['w', 'a', 's', 'd'].includes(key.name.toLowerCase())) {
        pridejAkci(key.name.toLowerCase());
    }
});

async function aplikujPohyb() {
    const dataDir = path.join(__dirname, 'data');
    const edaFile = path.join(dataDir, 'eda.xml');
    const sefFile = path.join(dataDir, 'pohyb.sef.json');

    // Check if files exist
    if (!fs.existsSync(edaFile)) {
        console.error('[CHYBA] Soubor eda.xml nebyl nalezen.');
        return;
    }

    if (!fs.existsSync(sefFile)) {
        console.error('[CHYBA] Soubor pohyb.sef.json nebyl nalezen.');
        return;
    }

    try {
        const result = await SaxonJS.transform({
            stylesheetFileName: sefFile,
            sourceFileName: edaFile,
            destination: 'serialized'
        }, "async");

        // Uložení zpět do eda.xml
        fs.writeFileSync(edaFile, result.principalResult, 'utf8');
        console.log('[ÚSPĚCH] Pohyb aplikován a uložen.');

    } catch (e) {
        console.error('[CHYBA PŘI TRANSFORMACI]', e.message || e);
    }
}


function zobrazPozici() {

     const filePath = "data/eda.xml"; 
     try { 
        const data = fs.readFileSync(filePath, "utf8");
         const x = data.match(/<x>(.*?)<\/x>/)[1];
          const y = data.match(/<y>(.*?)<\/y>/)[1];
          
           console.log([POZICE] x: ${x}, y: ${y});
         } catch (err) {
             console.error("Chyba při čtení XML:", err);
             }
             }