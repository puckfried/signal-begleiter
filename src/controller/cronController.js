// Funktion die überprüft ob an der letzten bekannten Position eine Chance auf Aurora besteht 

import { sendSignalMessage } from "../api/signal";
import { getLastLocation } from "../database/db"
import { getAurora } from "../services/aurora";
import { getNightConditions } from "../services/weather";

export async function runNightlyCheck(isAsked=false) {
    // 1. Dafür letzten Ort aus Datenbank holen
    const location = getLastLocation();
    const coord = {lat: location.latitude, lon: location.longitude}
    
    // 2. Wetter für Ort erfragen
    const nightWeather = await getNightConditions(coord)

    // 3. Aurora erfrage
    const auroraData = await getAurora(coord)

    // 4. Berechnen ob Aurora sichtbar
    if (auroraData.probability < 30){
        const message = `Das sieht heute Nacht nicht gut aus, die Wahrscheinlichkeit ist ${auroraData.probability}% `        
        if (isAsked) {
            sendSignalMessage(message, process.env.SEND_GROUP_ID)
        }        
    }else {
        const times = nightWeather.filter( hour => hour.cloudPercentage < 50)
        if (times.length > 0){
            const times = times.map(el => el.hour)
            const message = `Heute richtig gute Chancen, das Wetter sieht gut aus, besonders um ${times.join(", ")} Uhr. Die Wahrscheinlichkeit ist ${auroraData.probability}%.`
            sendSignalMessage(message, process.env.SEND_GROUP_ID)
        } else {
            const message = `Die Chancen sind ${auroraData.probability}% aber es ist sehr bwwölkt.`
            sendSignalMessage(message, process.env.SEND_GROUP_ID)
        } 
    }
    return null
}
