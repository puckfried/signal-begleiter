import { determineLocation } from '../services/locationFunnel.js';
import { getTomorrowForecast } from '../services/weather.js';
import * as db from '../database/db.js'; 
import { sendSignalMessage } from '../api/signal.js';
import { getAuroraMsg, getHelpMsg, getWeatherMsg } from '../utils/messages.js';
import { getAurora } from '../services/aurora.js';
import { runNightlyCheck } from './cronController.js';
import { getNextGedicht } from '../services/gedichtService.js';




// async function getImageFromSignal(id){
    
//     const res = await fetch(`http://127.0.0.1:8080/v1/attachments/${id}`)
//     const arrayBuffer = await res.arrayBuffer()
//     return Buffer.from(arrayBuffer).toString("base64")
// }


async function parseSignalMessage(rawJson) {
    try {
        const dataMessage = rawJson.params.envelope?.dataMessage;
        if (!dataMessage) return null; // Keine echte Text/Bild-Nachricht (z.B. Tipp-Indikator)

        const incomingGroupId = dataMessage.groupInfo?.groupId || null;

        // 1. Bild
        if (dataMessage.attachments && dataMessage.attachments.length > 0) {
            const fileId = dataMessage.attachments[0].id; 
            return { type: 'image', data: fileId, groupId: incomingGroupId }; // Pfad anpassen je nach deinem Docker-Volume
        }

        // 2. Bild
        if (dataMessage.message) {
            const text = dataMessage.message.trim()
            if (text.startsWith("!")) return await sendSystemMessage(text)

            return { type: 'text', data: text, groupId: incomingGroupId };
        }

        return null;
    } catch (e) {
        console.log("fehler: ", e)
        return null;
    }
}

async function sendSystemMessage(systemMessage){
    const command = systemMessage.toLowerCase();
    
    if (command === "!help"){
        await sendSignalMessage(getHelpMsg(), process.env.SEND_GROUP_ID)
    } else if (command === "!wetter"){
        const location = await db.getLastLocation();
        if (!location || !location.latitude) {
            await sendSignalMessage("Ich brauche erst einen Standort! Schickt mir bitte ein Bild von einem Ortsschild, Koordinaten oder einen Ortsnamen.", process.env.SEND_GROUP_ID);
            return null;
        }
        const weather = await getTomorrowForecast({lat: location.latitude, lon: location.longitude})
        if (!weather) {
            await sendSignalMessage(`Für ${location.place_name} habe ich gerade leider keine Wetterdaten.`, process.env.SEND_GROUP_ID);
            return null;
        }

        await sendSignalMessage(getWeatherMsg(weather, location.place_name), process.env.SEND_GROUP_ID)
    } else if (command === "!aurora"){
        await runNightlyCheck(true)
    } else if (command === "!gedicht"){
        const gedicht = getNextGedicht()
        await sendSignalMessage(gedicht, process.env.SEND_GROUP_ID)
    }

    return null
}

export async function handleIncomingMessage(payload) {
    
    const cleanPayload = await parseSignalMessage(payload)
    
    // KLeiner logischer Fehler, bei Systemmeldungen wird die Gruppe nicht gecheckt, der payload wird null
    if (!cleanPayload || !cleanPayload.groupId) return; 

    const allowedGroup = process.env.ALLOWED_GROUP_ID;
    
    if (cleanPayload.groupId !== allowedGroup) {
        console.log(`[SECURITY] Ignoriere Nachricht aus unbefugter Gruppe: ${cleanPayload.groupId}`);
        return; // Wir brechen hier sofort und lautlos ab!
    }
    
    
    // 1. Ort bestimmen
    const result = await determineLocation(cleanPayload)
   

    if (result.error) {
        await sendSignalMessage(`Sorry, der Ort wurde nicht gefunden.`, process.env.SEND_GROUP_ID);
        return; // <-- Dieser Befehl ist Magie! Er beendet die Funktion hier auf der Stelle.
    }

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
    
    let message = `Willkommen in ${result.place_name}.`;
    
    if (weather) {
        message += ` Das Wetter für morgen: \nMinimum: ${weather.minTemp}°\nMaximum: ${weather.maxTemp}°\nRegen: ${weather.totalRainMm}mm.`;
    } else {
        message += ` (Für diese Region gibt es leider keine Wetterdaten).`;
    }

    // Rückgabe formulieren
    // const message = `Willkommen in ${result.place_name}. Das Wetter für morgen: \nMinimum: ${weather.minTemp}°\nMaximum: ${weather.maxTemp}°\nRegen: ${weather.totalRainMm}mm.`
    await sendSignalMessage(message, process.env.SEND_GROUP_ID)

    console.log(result)
    console.log(weather) 
    return
 }

