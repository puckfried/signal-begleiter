export async function recognizeSign(base64String, mimeType) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
            model: 'gpt-5.4-mini', // (Hier auf das korrekte Modell achten)
            messages: [
                {
                    role: 'system',
                    content: 'Du bist ein Experte für europäische Straßenschilder, speziell in Schweden, Finnland, Norwegen, Dänemark und Norddeutschland. Antworte AUSSCHLIESSLICH mit dem Namen des Ortes, der auf dem Schild steht. Wenn kein Ortsname erkennbar ist, antworte exakt mit \'ERROR: Not found\'.'
                },
                {
                    role: 'user',
                    content: [{ type: 'image_url', image_url: { url: `data:${mimeType};base64,${base64String}` } }]
                }
            ]
        })
    });

    if (!response.ok) throw new Error(`OpenAI API Fehler: ${response.message}`);
    const data = await response.json();
    return data.choices[0].message.content.trim();
}