
// Aurora-Wahrscheinlichkeit erwartet Zahlen-Objekt {lat, lon} 

export async function getAurora( {lat, lon} ){
   
    // Fehlercheck ob lat lon vorhanden und Zahlen

    // Runden
    lat = Math.round(lat)
    lon = Math.round(lon)
    
    // Abfragen
    const res = await fetch("https://services.swpc.noaa.gov/json/ovation_aurora_latest.json")
    const result = await res.json()
    const forecast = result["Forecast Time"]
    const place = result.coordinates.filter((el) => el[0]==lon && el[1]==lat)
    
    return {
        forecastTime: forecast,
        lat,lon,
        probability: place[0][2]
    }
}