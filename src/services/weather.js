const API_URL = (lat, lon) =>
    `https://opendata-download-metfcst.smhi.se/api/category/snow1g/version/1/geotype/point/lon/${lon}/lat/${lat}/data.json`;

export async function getNightConditions({ lat, lon }) {
    const res = await fetch(API_URL(lat, lon));
    if (!res.ok) throw new Error(`SMHI API Fehler: ${res.status} für lat=${lat}, lon=${lon}`);
    const { timeSeries } = await res.json();

    const now = new Date();
    const nightStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 21));
    const nightEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 3));

    const nightEntries = timeSeries.filter(({ time }) => {
        const t = new Date(time);
        return t >= nightStart && t <= nightEnd;
    });
    if (nightEntries.length === 0) throw new Error('SMHI liefert keine Daten für die kommende Nacht');

    return nightEntries.map(({ time, data }) => ({
        hour: new Date(time).getUTCHours(),
        cloudPercentage: (data.cloud_area_fraction / 8) * 100,
    }));
}

export async function getTomorrowForecast({ lat, lon }) {
    const res = await fetch(API_URL(lat, lon));
    if (!res.ok) throw new Error(`SMHI API Fehler: ${res.status} für lat=${lat}, lon=${lon}`);
    const { timeSeries } = await res.json();

    const now = new Date();
    const tomorrow = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));

    const dayEntries = timeSeries.filter(({ time }) => {
        const t = new Date(time);
        return t.getUTCFullYear() === tomorrow.getUTCFullYear()
            && t.getUTCMonth() === tomorrow.getUTCMonth()
            && t.getUTCDate() === tomorrow.getUTCDate()
            && t.getUTCHours() >= 5
            && t.getUTCHours() <= 22;
    });

    if (dayEntries.length === 0) throw new Error('SMHI liefert keine Daten für morgen');
    const temps = dayEntries.map(({ data }) => data.air_temperature);
    const totalRainMm = dayEntries.reduce((sum, { data }) => sum + data.precipitation_amount_mean_deterministic, 0);

    return {
        minTemp: Math.min(...temps),
        maxTemp: Math.max(...temps),
        totalRainMm: Math.round(totalRainMm * 10) / 10,
    };
}

// const test = await getNightConditions({lat:52.5, lon: 13.4})
// const test2 = await getTomorrowForecast({lat:52.5, lon: 13.4})
// console.log(test, test2)