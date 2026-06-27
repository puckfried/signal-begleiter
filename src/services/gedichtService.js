import fs from 'node:fs';
import path from 'node:path';
import gedichte from '../database/ringelnatz_api_data.json'; // JSON mit 56 Gedichten

export function getNextGedicht() {
    const stateFile = path.join(process.cwd(), 'data', 'gedicht_index.txt');
    let index = 0;

    // 1. Schauen, wo wir letztes Mal stehen geblieben sind
    if (fs.existsSync(stateFile)) {
        const raw = fs.readFileSync(stateFile, 'utf-8');
        const parsed = parseInt(raw, 10);
        
        // Schutzschild 3: Nur übernehmen, wenn es eine echte Zahl ist UND wir nicht über das Ziel hinausschießen (z.B. wenn die JSON mal gekürzt wird)
        if (!isNaN(parsed) && parsed < gedichte.chapters.length) {
            index = parsed;
        }
    }

    // 2. Das aktuelle Gedicht holen
    const aktuellesGedicht = gedichte.chapters[index].content;

    // 3. Zähler um 1 erhöhen (und wieder bei 0 anfangen, wenn wir am Ende sind)
    let naechsterIndex = index + 1;
    if (naechsterIndex >= gedichte.chapters.length) {
        naechsterIndex = 0; // Nach Gedicht 50 kommt wieder Gedicht 1
    }

    // 4. Den neuen Stand für das nächste Mal sicher in der Textdatei speichern
    fs.writeFileSync(stateFile, naechsterIndex.toString());

    return aktuellesGedicht;
}