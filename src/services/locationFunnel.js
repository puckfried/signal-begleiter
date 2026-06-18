import { readFile } from 'node:fs/promises';
import { extname } from 'node:path';

async function processImage(imagePath) {
    const fileBuffer = await readFile(imagePath);
    const base64 = fileBuffer.toString('base64');
    const ext = extname(imagePath).toLowerCase().slice(1);
    const mimeType = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
            model: 'gpt-5.4-mini',
            messages: [
                {
                    role: 'system',
                    content: 'Du bist ein Experte für europäische Straßenschilder, speziell in Schweden, Finnland, Norwegen, Dänemark und Norddeutschland. Antworte AUSSCHLIESSLICH mit dem Namen des Ortes, der auf dem Schild steht. Wenn kein Ortsname erkennbar ist, antworte exakt mit \'ERROR: Not found\'.'
                },
                {
                    role: 'user',
                    content: [{ type: 'image_url', image_url: { url: `data:${mimeType};base64,${base64}` } }]
                }
            ]
        })
    });

    if (!response.ok) throw new Error(`OpenAI API Fehler: ${response.status}`);
    const data = await response.json();
    const placeName = data.choices[0].message.content.trim();
    if (placeName.startsWith('ERROR:')) throw new Error(`Kein Ortsname erkennbar auf dem Bild: ${imagePath}`);
    return processText(placeName);
}

async function processText(placeName) {
    const url = new URL('https://nominatim.openstreetmap.org/search');
    url.searchParams.set('q', placeName);
    url.searchParams.set('format', 'json');
    url.searchParams.set('countrycodes', 'se,fi,no,dk,de');
    url.searchParams.set('featuretype', 'settlement');

    const response = await fetch(url.toString(), {
        headers: { 'User-Agent': 'AuroraBot/1.0' }
    });
    if (!response.ok) throw new Error(`Nominatim API Fehler: ${response.status}`);
    const results = await response.json();
    if (results.length === 0) throw new Error(`Ort nicht gefunden: "${placeName}"`);
    const first = results[0];

    return {
        place_name: first.display_name,
        latitude: parseFloat(parseFloat(first.lat).toFixed(5)),
        longitude: parseFloat(parseFloat(first.lon).toFixed(5))
    };
}

async function processCoordinates(latInput, lonInput) {
    let lat = parseFloat(latInput);
    let lon = parseFloat(lonInput);
    if (isNaN(lat) || isNaN(lon)) throw new Error(`Ungültige Koordinaten: lat=${latInput}, lon=${lonInput}`);

    // Swap if coordinates appear to be transposed
    if (lon >= 52 && lon <= 72 && lat >= 4 && lat <= 30) {
        [lat, lon] = [lon, lat];
    }

    const url = new URL('https://nominatim.openstreetmap.org/reverse');
    url.searchParams.set('lat', String(lat));
    url.searchParams.set('lon', String(lon));
    url.searchParams.set('format', 'json');

    const response = await fetch(url.toString(), {
        headers: { 'User-Agent': 'AuroraBot/1.0' }
    });
    if (!response.ok) throw new Error(`Nominatim Reverse-Geocoding Fehler: ${response.status}`);
    const data = await response.json();

    const addr = data.address;
    const place_name = addr.village ?? addr.town ?? addr.city ?? data.display_name;
    console.log(lat,lon, "SHOULD BE CORRECTED")
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
        return await processText(inputPayload.data);
    }

    return { success: false, error: "Unbekanntes Eingabeformat" };
}
