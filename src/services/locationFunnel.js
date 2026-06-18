// 1. Private Hilfsfunktionen (die nur diese Datei kennt)
// async function processImage(imagePath) { ... ruft OpenAI auf ... }
// async function processText(text) { ... nutzt Nominatim Fuzzy Search ... }
// async function processCoordinates(lat, lon) { ... macht den Bounding-Box-Check ... }

// 2. Der eigentliche Trichter (Die Hauptfunktion)
export async function determineLocation(inputPayload) {
    if (inputPayload.type === 'image') {
        return await processImage(inputPayload.data);
    } 
    else if (inputPayload.type === 'coordinates') {
        return await processCoordinates(inputPayload.lat, inputPayload.lon);
    } 
    else if (inputPayload.type === 'text') {
        return await processText(inputPayload.data);
    }
    
    return { success: false, error: "Unbekanntes Eingabeformat" };
}