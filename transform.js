const fs = require('fs');
const { XmlParser, Xslt } = require('xslt-processor');

async function run() {
    console.log('Spouštím XSLT transformaci přes Node.js...');
    try {
        const xmlString = fs.readFileSync('cislo.xml', 'utf8');
        const xsltString = fs.readFileSync('vypocet.xslt', 'utf8');

        const parser = new XmlParser();
        const xsltEngine = new Xslt();

        console.log('Parsování souborů...');
        const xmlDoc = parser.xmlParse(xmlString);
        const xsltDoc = parser.xmlParse(xsltString);

        console.log('Aplikování XSLT...');
        // xsltProcess returns a Promise
        const vysledek = await xsltEngine.xsltProcess(xmlDoc, xsltDoc);

        const outputFile = 'vysledek_node.xml';
        fs.writeFileSync(outputFile, vysledek);
        console.log(`[INFO] Výsledek úspěšně zapsán do ${outputFile}`);
    } catch (e) {
        console.error('[CHYBA]', e);
    }
}

run();
