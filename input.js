const readline = require('readline');
const fs = require('fs');
const path = require('path');
const SaxonJS = require('saxon-js');
const { DOMParser } = require('@xmldom/xmldom');
const xpath = require('xpath');

const filePath = path.join(__dirname, 'data', 'akce.xml');

// Inicializace XML souboru, pokud byl smazán nebo neexistuje
if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, '<?xml version="1.0" encoding="UTF-8"?>\n<akce>\n</akce>\n', 'utf8');
}

// Inicializace čtení vstupů z klávesnice
readline.emitKeypressEvents(process.stdin);

if (process.stdin.isTTY) {
    process.stdin.setRawMode(true);
}

run().catch(err => console.error('[CHYBA PŘI STARTU]', err));

//==============================================================
//==============================================================
//==============================================================

async function readInput() {
    process.stdin.on('keypress', async (str, key) => {
        // Ukončení aplikace přes Ctrl+C
        if (key.ctrl && key.name === 'c') {
            console.log('Ukončuji aplikaci...');
            process.exit();
        }

        // Zpracování kláves w, a, s, d (velká i malá písmena)
        if (key.name && ['w', 'a', 's', 'd'].includes(key.name.toLowerCase())) {
            await pridejAkci(key.name.toLowerCase());
        }
    });
}

//==============================================================

async function run() {
    console.log('=========================================');
    console.log('Sledování kláves aktivní.');
    console.log('Zmáčkni W, A, S nebo D pro záznam akce.');
    console.log('Pro ukončení stiskni Ctrl + C');
    console.log('=========================================');

    await pridejAkci("reset");
    await readInput();
}

//==============================================================

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
        // console.log('[ÚSPĚCH] Pohyb aplikován a uložen.');

    } catch (e) {
        console.error('[CHYBA PŘI TRANSFORMACI]', e.message || e);
    }
}

//==============================================================

async function pridejAkci(klavesa) {
    let novyObsah = `<?xml version="1.0" encoding="UTF-8"?>\n<akce>\n    <stisk klavesa="${klavesa}" />\n</akce>\n`;

    try {
        // Přepíšeme celý soubor, takže udržíme jen poslední stisknutou klávesu
        fs.writeFileSync(filePath, novyObsah, 'utf8');
        // console.log(`[ULOŽENO] Klávesa: ${klavesa}`);

        await aplikujPohyb();
        await zobrazPozici();
        await generujSVG();

    } catch (err) {
        console.error('Chyba při zápisu do XML:', err);
    }
}

//==============================================================

async function zobrazPozici() {
    const filePath = "data/eda.xml";

    try {
        const xml = fs.readFileSync(filePath, "utf8");
        const doc = new DOMParser().parseFromString(xml, 'text/xml');

        const x = xpath.select1("/player/position/x/text()", doc);
        const y = xpath.select1("/player/position/y/text()", doc);
        const health = xpath.select1("/player/stats/health/text()", doc);

        console.log(`[POZICE] x: ${x}, y: ${y} | [ZDRAVÍ] ${health}`);

    } catch (err) {
        console.error("Chyba při čtení XML:", err);
    }
}


//==============================================================

async function generujSVG() {
    const dataDir = path.join(__dirname, 'data');
    const mapaFile = path.join(dataDir, 'mapa.xml');
    const edaFile = path.join(dataDir, 'eda.xml');
    const svgFile = path.join(dataDir, 'mapa_view.svg');

    try {
        const mapaStr = fs.readFileSync(mapaFile, 'utf8');
        const edaStr = fs.readFileSync(edaFile, 'utf8');
        const docMapa = new DOMParser().parseFromString(mapaStr, 'text/xml');

        // Parse tilesets
        const tilesetNodes = xpath.select("//tileset", docMapa);
        const tilesets = tilesetNodes.map(node => {
            const firstgid = parseInt(node.getAttribute("firstgid"), 10);
            const columns = parseInt(node.getAttribute("columns"), 10);
            const tileW = parseInt(node.getAttribute("tilewidth"), 10);
            const tileH = parseInt(node.getAttribute("tileheight"), 10);
            const imageNode = xpath.select1("image", node);
            const imageSource = imageNode.getAttribute("source");
            
            // Load and embed image
            const imagePath = path.join(dataDir, imageSource);
            let dataUri = "";
            try {
                const base64 = fs.readFileSync(imagePath).toString('base64');
                const ext = path.extname(imageSource).toLowerCase();
                const mime = (ext === '.jpg' || ext === '.jpeg') ? 'image/jpeg' : 'image/png';
                dataUri = `data:${mime};base64,${base64}`;
            } catch (e) {
                console.error(`Chyba při načítání obrázku ${imageSource}:`, e.message);
            }

            return { firstgid, columns, tileW, tileH, dataUri };
        });

        // Sort tilesets by firstgid descending to easily find the right one for a GID
        tilesets.sort((a, b) => b.firstgid - a.firstgid);

        // Parse Eda position
        const docEda = new DOMParser().parseFromString(edaStr, 'text/xml');
        const edaX = parseInt(xpath.select1("/player/position/x/text()", docEda).toString(), 10);
        const edaY = parseInt(xpath.select1("/player/position/y/text()", docEda).toString(), 10);

        // Parse layers
        const layerNodes = xpath.select("//layer", docMapa);
        const layers = layerNodes.map(node => {
            const csv = xpath.select1("data/text()", node).toString();
            return csv.replace(/\s+/g, '').split(',').filter(v => v !== '').map(Number);
        });

        const mapWidth = parseInt(docMapa.documentElement.getAttribute("width"), 10);
        const mapHeight = parseInt(docMapa.documentElement.getAttribute("height"), 10);
        const globalTileW = parseInt(docMapa.documentElement.getAttribute("tilewidth"), 10);
        const globalTileH = parseInt(docMapa.documentElement.getAttribute("tileheight"), 10);

        let svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${mapWidth * globalTileW}" height="${mapHeight * globalTileH}">\n`;
        svg += `  <defs>\n`;
        tilesets.forEach((ts) => {
            svg += `    <image id="ts_${ts.firstgid}" href="${ts.dataUri}" />\n`;
        });
        svg += `  </defs>\n`;
        
        svg += `  <rect width="100%" height="100%" fill="#a0d8ef"/>\n`;

        for (let l = 0; l < layers.length; l++) {
            const layer = layers[l];
            for (let i = 0; i < layer.length; i++) {
                const gid = layer[i];
                if (gid === 0) continue;
                
                const ts = tilesets.find(t => gid >= t.firstgid);
                if (!ts) continue;

                const localId = gid - ts.firstgid;
                const srcX = (localId % ts.columns) * ts.tileW;
                const srcY = Math.floor(localId / ts.columns) * ts.tileH;
                const destX = (i % mapWidth) * globalTileW;
                const destY = Math.floor(i / mapWidth) * globalTileH;
                
                svg += `  <svg x="${destX}" y="${destY}" width="${globalTileW}" height="${globalTileH}" viewBox="${srcX} ${srcY} ${ts.tileW} ${ts.tileH}">\n`;
                svg += `    <use href="#ts_${ts.firstgid}" />\n`;
                svg += `  </svg>\n`;
            }
        }

        // Add Eda marker
        const edaPixelX = edaX * globalTileW + (globalTileW / 2);
        const edaPixelY = edaY * globalTileH + (globalTileH / 2);
        
        svg += `  <!-- Eda Position -->\n`;
        svg += `  <circle cx="${edaPixelX}" cy="${edaPixelY}" r="24" fill="red" stroke="white" stroke-width="4" />\n`;
        svg += `  <text x="${edaPixelX}" y="${edaPixelY}" fill="white" font-family="sans-serif" font-size="16" font-weight="bold" text-anchor="middle" dy=".3em">Eda</text>\n`;

        svg += `</svg>`;

        fs.writeFileSync(svgFile, svg, 'utf8');
    } catch (err) {
        console.error("Chyba při generování SVG:", err);
    }
}

//==============================================================
