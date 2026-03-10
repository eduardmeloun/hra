const fs = require('fs');
const SaxonJS = require('saxon-js');

async function run() {
    console.log('Spouštím XSLT transformaci přes Saxon-JS...');
    try {
        const result = await SaxonJS.transform({
            stylesheetFileName: 'data/pohyb.sef.json',
            sourceFileName: 'data/eda.xml',
            destination: 'serialized'
        }, "async");

        const outputFile = 'test_out.xml';
        fs.writeFileSync(outputFile, result.principalResult);
        console.log(`[INFO] Výsledek úspěšně zapsán do ${outputFile}`);
    } catch (e) {
        console.error('[CHYBA]', e);
    }
}

run();