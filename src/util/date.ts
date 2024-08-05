function isInvalidDate(date: string) {
   const d = new Date(date);
   return d.toString() === 'Invalid Date';
}

function getDateWithoutTime(date: Date): Date {
   date.setHours(0);
   date.setMinutes(0);
   date.setSeconds(0);
   date.setMilliseconds(0);
   return date;
}

export {
   isInvalidDate,
   getDateWithoutTime,
}
