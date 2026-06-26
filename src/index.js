import 'dotenv/config'; // Lädt die .env automatisch aus dem Root!
import { handleIncomingMessage } from './controller/messageController.js';
import { logError } from './utils/logger.js';
import { runNightlyCheck } from './controller/cronController.js';
import { hostname } from 'node:os';

const PORT = process.env.PORT || 3000;

Bun.serve({
    port: PORT,
    hostname: "0.0.0.0",
    async fetch(req){
        const url = new URL(req.url)

        if (req.method === 'POST' && url.pathname === '/webhook'){
            try {
                const payload = await req.json();
                console.log("Message auis signal: ", payload.params.envelope)

               
                handleIncomingMessage(payload).catch(err => {
                    logError("Fehler bei der Nachrichtenverarbeitung", err);
                });

                // Antwort an den Docker-Container: "Hab's bekommen!" (Entspricht res.send)
                return new Response("Webhook received", { status: 200 });

            } catch (error) {
                logError("Fehler beim Parsen des Webhooks", error);
                return new Response("Bad Request", { status: 400 });
            }
        }

        // 2. FALLBACK: Für alle anderen URLs (z.B. wenn jemand localhost:3000 im Browser öffnet)
        return new Response("AuroraBot Server läuft!", { status: 404 });
    }
}) 
// try {
//     if (command === '--test-photo') {
//         console.log("Starte Test: Foto-Verarbeitung...");
//         // Simuliere einen Signal-Upload
//         handleIncomingMessage({ type: 'image', data: './src/mockdata/schild.jpg' });
//     } 
    
//     else if (command === '--test-text') {
//         console.log("Starte Test: Text-Eingabe...");
//         // Simuliere eine Chat-Nachricht
//         handleIncomingMessage({ type: 'text', data: 'Jokkmokk' });
//     } 

//     else if (command === '--test-coord') {
//         console.log("Starte Test: Koordinaten-Eingabe...");
//         // Simuliere eine Chat-Nachricht
//         handleIncomingMessage({ type: 'coordinates', lat: '60', lon: "18" });
//     } 

//     else if (command === '--test-aurora') {
//         console.log("Starte Test: Nächtlicher Cron-Job...");
//         // Simuliere, dass es 22:00 Uhr ist
//         runNightlyCheck();
//     } 
//     else {
//         console.log("Bitte nutze einen Test-Befehl: --test-photo, --test-text, --test-aurora");
// }
// } catch (error){
//     logError(`Befehl ${command} gescheitert`, error)
// }