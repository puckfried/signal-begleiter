export async function fetchCoordinatesForCity(placeName) {
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
    return results[0]; // Gibt einfach das rohe, gefundene Objekt zurück
}



export async function fetchCityForCoordinates(lat, lon) {
    const url = new URL('https://nominatim.openstreetmap.org/reverse');
    
    url.searchParams.set('lat', String(lat));
    url.searchParams.set('lon', String(lon));
    url.searchParams.set('format', 'json');

    const response = await fetch(url.toString(), {
        headers: { 'User-Agent': 'AuroraBot/1.0' }
    });
    
    if (!response.ok) throw new Error(`Nominatim Reverse-Geocoding Fehler: ${response.status}`);
    
    // Gib das rohe Antwort-Objekt zurück
    return await response.json();
}