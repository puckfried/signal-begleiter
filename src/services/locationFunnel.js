import { readFile } from 'node:fs/promises';
import { extname } from 'node:path';
import { recognizeSign } from '../api/openai';
import { fetchCityForCoordinates, fetchCoordinatesForCity } from '../api/geocode';

async function processImage(fileId) {
    // 1. Datei vorbereiten -> Base64
    // const fileBuffer = await readFile(imagePath);
    // const base64 = fileBuffer.toString('base64');
    // const ext = extname(imagePath).toLowerCase().slice(1);
    // const mimeType = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';
    const signalApiUrl = process.env.SIGNAL_API_URL;
    const response = await fetch(`${signalApiUrl}/v1/attachments/${fileId}`);
    
    if (!response.ok) throw new Error(`Konnte Bild nicht laden: ${response.status}`)
    const mimeType = response.headers.get('content-type') || 'image/jpeg';
    const arrayBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    
    // 2. Ortsnamen erfragen -> OpenAI
    const placeName = await recognizeSign(base64, mimeType)  
    if (placeName.startsWith('ERROR:')) throw new Error(`Kein Ortsname erkennbar auf dem Bild: ${imagePath}`);
    
    // 3. Ortsnamen weiterverarbeiten -> Koordinaten
    return processTextToLocation(placeName);
}

async function processTextToLocation(placeName) {
    // Koordinaten erfragen -> Nominatim
    const rawData = await fetchCoordinatesForCity(placeName)

    return {
        place_name: rawData.display_name,
        latitude: parseFloat(parseFloat(rawData.lat).toFixed(5)),
        longitude: parseFloat(parseFloat(rawData.lon).toFixed(5))
    };
}


async function processCoordinates(latInput, lonInput) {
    // Koordinaten anpassen
    let lat = parseFloat(latInput);
    let lon = parseFloat(lonInput);
    if (isNaN(lat) || isNaN(lon)) throw new Error(`Ungültige Koordinaten: lat=${latInput}, lon=${lonInput}`);

    // Plausibilitätsprüfung 
    if (lon >= 52 && lon <= 72 && lat >= 4 && lat <= 30) {
        [lat, lon] = [lon, lat];
    }

    // Stadt anhand Koordinaten erfragen
    const rawData = fetchCityForCoordinates(lat,lon)

    const addr = rawData.address || {};
    const place_name = addr.village ?? addr.town ?? addr.city ?? rawData.display_name;
  
    return {
        place_name,
        latitude: parseFloat(lat.toFixed(5)),
        longitude: parseFloat(lon.toFixed(5))
    };
}

export async function determineLocation(inputPayload) {
    if (inputPayload.type === 'image') {
        return await processImage(inputPayload.data);
    }
    else if (inputPayload.type === 'coordinates') {
        return await processCoordinates(inputPayload.lat, inputPayload.lon);
    }
    else if (inputPayload.type === 'text') {
        console.log("Input ist reiner text")
        inputPayload.type = "text"
        return await processTextToLocation(inputPayload.data);
    }

    return { success: false, error: "Unbekanntes Eingabeformat" };
}
