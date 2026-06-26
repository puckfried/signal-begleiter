import { Database } from 'bun:sqlite';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
// const db = new Database(join(__dirname, '../../checkins.db'));
const db = new Database(join(__dirname, '../../data/checkins.db'));
// WETTER fehlt noch

db.exec(`
    CREATE TABLE IF NOT EXISTS checkins (
        id              INTEGER PRIMARY KEY AUTOINCREMENT,
        created_at      TEXT    NOT NULL,
        place_name      TEXT    NOT NULL,
        latitude        REAL    NOT NULL,
        longitude       REAL    NOT NULL,
        image_path      TEXT
    )
`);

const stmtInsert = db.prepare(`
    INSERT INTO checkins (created_at, place_name, latitude, longitude, image_path)
    VALUES ($created_at, $place_name, $latitude, $longitude, $image_path)
`);

const stmtLastLocation = db.prepare(`
    SELECT id, created_at, place_name, latitude, longitude
    FROM checkins
    ORDER BY id DESC
    LIMIT 1
`);

export function saveLocation({ place_name, latitude, longitude, image_path = null }) {
    const created_at = new Date().toISOString();
    // stmtInsert.run({ created_at, place_name, latitude, longitude, trigger_type: type, image_path });
    
    place_name = place_name ? place_name : `Nirgendwo bei Länge: ~${latitude} & Breite: ~${longitude}°` 

    stmtInsert.run({ 
        $created_at: created_at, 
        $place_name: place_name, 
        $latitude: latitude, 
        $longitude: longitude, 
        $image_path: image_path 
    });
}

export function getLastLocation() {
    const row = stmtLastLocation.get();
    if (!row) throw new Error('Keine gespeicherten Orte vorhanden');
    return row;
}
