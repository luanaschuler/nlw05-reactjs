export function convertDurationTotimeString (duration: number) {
    const hours = Math.floor(duration / 3600)  //divide numero por 60 e depois por 60.. entao 60*60 é 3600  
    const minutes = Math.floor((duration % 3600) / 60)
    const seconds = duration % 60

    const timeString = [hours, minutes, seconds]
    .map(unit => String(unit).padStart(2, '0'))
    .join(':')

    return timeString;
}