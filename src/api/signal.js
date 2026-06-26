export async function sendSignalMessage(text, recipientGroupId) {
    const botNumber = process.env.SIGNAL_BOT_NUMBER;
    const signalApiUrl = process.env.SIGNAL_API_URL;

    // --- NEU: Das Präfix für Gruppen-IDs hinzufügen ---
    let formattedRecipient = recipientGroupId;
    // Wenn es keine Telefonnummer (+) ist und auch noch nicht "group." davorsteht:
    if (!recipientGroupId.startsWith('+') && !recipientGroupId.startsWith('group.')) {
        formattedRecipient = `group.${recipientGroupId}`;
    }

    const payload = {
        message: text,
        number: botNumber,
        recipients: [formattedRecipient] // Die API erwartet ein Array
    };

    const response = await fetch(`${signalApiUrl}/v2/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Signal Sende-Fehler (${response.status}): ${errorData}`);
    }

    return await response.json();
}

// const data = await sendSignalMessage("Hallo aus Javascript!", process.env.TEST_GROUP_ID)