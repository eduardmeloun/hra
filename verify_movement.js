const fs = require('fs');
const path = require('path');
const { Xslt, XmlParser } = require('xslt-processor');

async function testPohyb() {
    const dataDir = path.join(__dirname, 'data');
    const edaFile = path.join(dataDir, 'eda.xml');
    const akceFile = path.join(dataDir, 'akce.xml');
    const xsltFile = path.join(dataDir, 'pohyb.xslt');

    console.log('--- Initial State ---');
    console.log('eda.xml:', fs.readFileSync(edaFile, 'utf8'));
    console.log('akce.xml:', fs.readFileSync(akceFile, 'utf8'));

    try {
        const xmlString = fs.readFileSync(edaFile, 'utf8');
        const xsltString = fs.readFileSync(xsltFile, 'utf8');

        const parser = new XmlParser();
        const xsltEngine = new Xslt();

        const xmlDoc = parser.xmlParse(xmlString);
        const xsltDoc = parser.xmlParse(xsltString);

        console.log('Applying transformation...');
        const vysledek = await xsltEngine.xsltProcess(xmlDoc, xsltDoc);

        console.log('--- Result ---');
        console.log(vysledek);

        // Optional: save result for manual review if it looks correct
        // fs.writeFileSync(edaFile, vysledek, 'utf8');
        
    } catch (e) {
        console.error('Error during transformation:', e);
    }
}

testPohyb();
