const fs = require('fs');
const path = require('path');
const { XmlParser, Xslt } = require('xslt-processor');

async function aplikujPohyb() {
    const dataDir = path.join(__dirname, 'data');
    const edaFile = path.join(dataDir, 'eda.xml');
    const xsltFile = path.join(dataDir, 'pohyb.xslt');
    
    // Check if files exist
    if (!fs.existsSync(edaFile)) {
        console.error('[CHYBA] Soubor eda.xml nebyl nalezen.');
        return;
    }
    
    if (!fs.existsSync(xsltFile)) {
        console.error('[CHYBA] Soubor pohyb.xslt nebyl nalezen.');
        return;
    }

    try {
        const xmlString = fs.readFileSync(edaFile, 'utf8');
        let xsltString = fs.readFileSync(xsltFile, 'utf8');

        // Náhrada document() v XSLT: Přečtení akce.xml manuálně skriptem
        const akceFile = path.join(dataDir, 'akce.xml');
        const akceString = fs.readFileSync(akceFile, 'utf8');
        const match = akceString.match(/klavesa="([wasd])"/i);
        const klavesa = match ? match[1].toLowerCase() : '';

        // Vložení do XSLT parseru
        xsltString = xsltString.replace('__KLAVESA__', klavesa);

        const parser = new XmlParser();
        const xsltEngine = new Xslt();

        // Parsování XML a XSLT
        const xmlDoc = parser.xmlParse(xmlString);
        const xsltDoc = parser.xmlParse(xsltString);

        // Aplikace XSLT
        const vysledek = await xsltEngine.xsltProcess(xmlDoc, xsltDoc);

        // Uložení zpět do eda.xml
        fs.writeFileSync(edaFile, vysledek, 'utf8');
        console.log('[ÚSPĚCH] Pohyb aplikován a uložen.');

    } catch (e) {
        console.error('[CHYBA PŘI TRANSFORMACI]', e.message || e);
    }
}

aplikujPohyb();
