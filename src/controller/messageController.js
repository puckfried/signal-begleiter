import { determineLocation } from '../services/locationFunnel.js';
import { getTomorrowForecast } from '../services/weather.js';
import * as db from '../database/db.js'; 

async function getImageFromSignal(id){
    
    const res = await fetch(`http://127.0.0.1:8080/v1/attachments/${id}`)
    const arrayBuffer = await res.arrayBuffer()
    return Buffer.from(arrayBuffer).toString("base64")
}


function parseSignalMessage(rawJson) {
    console.log("parse Signal Message")
    try {
        const dataMessage = rawJson.params.envelope?.dataMessage;
        if (!dataMessage) return null; // Keine echte Text/Bild-Nachricht (z.B. Tipp-Indikator)

        // 1. Ist es ein Bild?
        if (dataMessage.attachments && dataMessage.attachments.length > 0) {
            console.log("Bild enthalten")
            // Signal speichert Bilder lokal im Container/Volume, du bekommst meist eine ID/Pfad
            // const base64Img = getImageFromSignal(dataMessage.attachments[0].id)
            const fileId = dataMessage.attachments[0].id; 

            return { type: 'image', data: fileId }; // Pfad anpassen je nach deinem Docker-Volume
        }

        // 2. Ist es eine Koordinate?
        if (dataMessage.message) {
            const text = dataMessage.message.trim()
            const coordRegex = /^([-+]?\d{1,2}[.,]\d+)\s*[,;\s]\s*([-+]?\d{1,3}[.,]\d+)$/;
            const match = text.match(coordRegex)

            if (match){
                console.log("Koordinaten erkannt")
                const lat = match[1].replace(',', '.');
                const lon = match[2].replace(',', '.');
                
                return {
                    type: "coordinates",
                    lat, lon 
                }
            }
            // 3. Fallback Text
            return { type: 'text', data: text };
        }

        return null;
    } catch (e) {
        console.log("fehler: ", e)
        return null;
    }
}

export async function handleIncomingMessage(payload) {
    
    const cleanPayload = parseSignalMessage(payload)
    if (!cleanPayload) return;
    
    // 1. Ort bestimmen
    const result = await determineLocation(cleanPayload)
   
    // Später: signal.sendMessage(result.error);

    // 2. Ort in Datenbank übertragen
    db.saveLocation({
        place_name: result.place_name,
        latitude: result.latitude,
        longitude: result.longitude,
        type: payload.type,
        // Wenn es ein Bild war, steht der Pfad in payload.data. Sonst übergeben wir null.
        image_path: payload.type === 'image' ? payload.data : null
    });

    // 3. Wetter erfragen
    const weather = await getTomorrowForecast({lat: result.latitude, lon: result.longitude})
    

    // 4. Wetter in Tabelle Wetter eintragen


    console.log(result)
    console.log(weather) 
 }

