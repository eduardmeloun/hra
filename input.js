const readline = require('readline');
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'data', 'akce.xml');

// Inicializace XML souboru, pokud byl smazán nebo neexistuje
if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, '<?xml version="1.0" encoding="UTF-8"?>\n<akce>\n</akce>\n', 'utf8');
}

function pridejAkci(klavesa) {
    const cas = new Date().toISOString();
    const novyZaznam = `    <stisk klavesa="${klavesa}" cas="${cas}" />\n`;

    try {
        // Načteme stávající obsah XML
        let obsah = fs.readFileSync(filePath, 'utf8');
        
        // Odstraníme koncový tag </akce> na konci souboru
        obsah = obsah.replace(/<\/akce>\s*$/, '');
        
        // Přidáme nový záznam a znovu uzavřeme tag </akce>
        obsah += novyZaznam + '</akce>\n';
        
        // Uložíme aktualizovaný obsah zpět do souboru
        fs.writeFileSync(filePath, obsah, 'utf8');
        console.log(`[ULOŽENO] Klávesa: ${klavesa}`);
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
