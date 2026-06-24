export function logError(context, error) {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] ERROR in ${context}:`);
    console.error(error.message || error);
    // console.error(error.stack); // Optional für tiefes Debugging
}