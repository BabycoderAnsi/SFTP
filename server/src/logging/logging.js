export function log(level, message, meta ={}){
    const entry = {
        timestamp: new Date().toISOString(),
        level,
        message,
        ...meta
    };

    console.log(JSON.stringify(entry));    
}
