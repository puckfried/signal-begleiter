// Funktion die überprüft ob an der letzten bekannten Position eine Chance auf Aurora besteht 

import { getLastLocation } from "../database/db"
import { getAurora } from "../services/aurora";
import { getNightConditions } from "../services/weather";

export async function runNightlyCheck() {
    // 1. Dafür letzten Ort aus Datenbank holen
    const location = getLastLocation();
    const coord = {lat: location.latitude, lon: location.longitude}
    
    // 2. Wetter für Ort erfragen
    const nightWeather = await getNightConditions(coord)

    // 3. Aurora erfrage
    const auroraData = await getAurora(coord)

    // 4. Berechnen ob Aurora sichtbar
    if (auroraData.probability < 30){
        console.log(`Das sieht heute Nacht nicht gut aus, die Wahrscheinlichkeit ist ${auroraData.probability}% `)        
    }else {
        const times = nightWeather.filter( hour => hour.cloudPercentage < 50)
        if (times.length > 0){
            console.log("Heute gute Chancen")
            // Nachricht formulieren, Zeit aufschlüsseln, Ort mit angeben
            // Nachricht schickten
            return
        } else {
            console.log("Die Chancen sind nicht schlecht, aber das Wetter sieht nicht gut aus. Sucht nach Lücken in den Wolken")
            // Nachricht formulieren, Ort angeben
            // Nachricht schicken
        } 
    }
}