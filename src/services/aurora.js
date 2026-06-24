// Checkt ob Aurora an dem Ort wahrscheinlich

export async function getAurora( {lat, lon} ){
   
    if (lat == null || lon == null || isNaN(lat) || isNaN(lon))
        throw new Error(`Ungültige Koordinaten: lat=${lat}, lon=${lon}`);

    // Runden
    lat = Math.round(lat)
    lon = Math.round(lon)

    // Abfragen
    const res = await fetch("https://services.swpc.noaa.gov/json/ovation_aurora_latest.json")
    if (!res.ok) throw new Error(`NOAA Aurora API Fehler: ${res.status}`);
    const result = await res.json()
    const forecast = result["Forecast Time"]
    const place = result.coordinates.filter((el) => el[0]==lon && el[1]==lat)
    if (place.length === 0) throw new Error(`Keine Aurora-Daten für Koordinaten lat=${lat}, lon=${lon}`);

    return {
        forecastTime: forecast,
        lat,lon,
        probability: place[0][2]
    }
}