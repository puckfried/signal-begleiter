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


export function getWeatherMsg(weather){
    const message = `Das Wetter für morgen: ${weather.minTemp.toFixed(0)}-${weather.maxTemp.toFixed(0)} Grad und ${weather.totalRainMm} mm Regen.`
    return message
}

export function getAuroraMsg(auroraInfo){
    const message = `Um ${auroraInfo.forecastTime} beträgt die Wahrscheinlichkeit ${auroraInfo.probability}%`
    return message
}