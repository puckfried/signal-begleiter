import 'dotenv/config'; // Lädt die .env automatisch aus dem Root!

// Importe der Module
import { determineLocation } from './services/locationFunnel.js';
import { getTomorrowForecast } from './services/weather.js';
// import { db } ...
// import { aurora } ...

// Error Handling
function logError(context, error) {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] ERROR in ${context}:`);
    console.error(error.message || error);
    // console.error(error.stack); // Optional für tiefes Debugging
}


// Die Handler-Funktionen definieren
async function handleIncomingMessage(payload) {
    // Signal Payload auswerten

    const result = await determineLocation(payload)
    console.log(payload)
    const weather = await getTomorrowForecast({lat: result.latitude, lon: result.longitude})
    console.log(result)
    console.log(weather) 
 }

 async function runNightlyCheck() {
    console.log("Here soll Aurora gecheckt werden")
 }

// Die Kommandozeilen-Weiche (Der Test-Modus)
const args = process.argv.slice(2);
const command = args[0];
try {
    if (command === '--test-photo') {
        console.log("Starte Test: Foto-Verarbeitung...");
        // Simuliere einen Signal-Upload
        handleIncomingMessage({ type: 'image', data: './src/mockdata/schild.jpg' });
    } 
    else if (command === '--test-text') {
        console.log("Starte Test: Text-Eingabe...");
        // Simuliere eine Chat-Nachricht
        handleIncomingMessage({ type: 'text', data: 'Jokkmokk' });
    } 
    else if (command === '--test-aurora') {
        console.log("Starte Test: Nächtlicher Cron-Job...");
        // Simuliere, dass es 22:00 Uhr ist
        runNightlyCheck();
    } 
    else {
        console.log("Bitte nutze einen Test-Befehl: --test-photo, --test-text, --test-aurora");

}
} catch (error){
    logError(`Befehl ${command} gescheitert`, error)
}