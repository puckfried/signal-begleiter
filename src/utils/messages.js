export function getHelpMsg(){
    const message = `
Hilfe

!help -> zeigt dieses Fenster
!wetter -> zeigt das Wetter an eurem Ort
!aurora -> Aurora Wahrscheinlichkeit für die nächsten Stunden

Sendet ein Bild oder Koordinaten, um einen neuen Ort zu registrieren.
`
    return message 
}


export function getWeatherMsg(weather, place){
    const message = `Das Wetter für morgen in ${place}:\nMinimum: ${weather.minTemp.toFixed(0)}°\nMaximum: ${weather.maxTemp.toFixed(0)}°\nRegen: ${weather.totalRainMm}mm.`
    return message
}

export function getAuroraMsg(auroraInfo){
    const message = `Um ${auroraInfo.forecastTime} beträgt die Wahrscheinlichkeit ${auroraInfo.probability}%`
    return message
}