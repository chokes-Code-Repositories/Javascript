/*
t:UNIX_TIMESTAMP:R = Relative time
t:UNIX_TIMESTAMP:F = [Day of week], [Month] [Day], [Year] at [Time]
t:UNIX_TIMESTAMP:f = [Month] [Day], [Year] at [Time]
t:UNIX_TIMESTAMP:D = [Month] [Day], [Year]
t:UNIX_TIMESTAMP:d = [Month]/[Day]/[Year]
t:UNIX_TIMESTAMP:T = [Hour]:[Minute]:[Second] [AM/PM]
t:UNIX_TIMESTAMP:t = [Hour]:[Minute] [AM/PM]
*/
function formatTimestamp(text) {
    const regex = /t:(\d+):([RFDTfdt])/g;
    const now = Math.floor(Date.now() / 1000).toFixed(0);
    return text.replace(regex, (match, timestamp, format) => {
        const unixTimestamp = parseInt(timestamp, 10);
        if (isNaN(unixTimestamp)) {
          return match; // Invalid timestamp, return the original match
        }
        const timeDiff = unixTimestamp - now;
        switch (format) {
          case 'R':
            return getTimeAgoString(timeDiff);
          case 'F':
            return formatDateWithTime(unixTimestamp, true, true);
          case 'f':
            return formatDateWithTime(unixTimestamp, false, true);
          case 'D':
            return formatDateWithTime(unixTimestamp, false, false);
          case 'd':
            return formatDateSlashSeparated(unixTimestamp);
          case 'T':
            return formatTime(unixTimestamp, true);
          case 't':
            return formatTime(unixTimestamp, false);
          default:
            return match; // Unknown format, return the original match
        }
    });
}

function getTimeAgoString(seconds) {
    const absSeconds = Math.abs(seconds);
    const isPast = seconds < 0;
    const isSingular = absSeconds === 1;
    if (absSeconds < 60) {
        return isPast ? `${absSeconds} second${isSingular ? '' : 's'} ago` : `in ${absSeconds} second${isSingular ? '' : 's'}`;
    } else if (absSeconds < 3600) {
        const minutes = Math.floor(absSeconds / 60);
        return isPast ? `${minutes} minute${isSingular ? '' : 's'} ago` : `in ${minutes} minute${isSingular ? '' : 's'}`;
    } else if (absSeconds < 86400) {
        const hours = Math.floor(absSeconds / 3600);
        return isPast ? `${hours} hour${isSingular ? '' : 's'} ago` : `in ${hours} hour${isSingular ? '' : 's'}`;
    } else if (absSeconds < 604800) {
        const days = Math.floor(absSeconds / 86400);
        return isPast ? `${days} day${isSingular ? '' : 's'} ago` : `in ${days} day${isSingular ? '' : 's'}`;
    } else if (absSeconds < 2628000) {
        const weeks = Math.floor(absSeconds / 604800);
        return isPast ? `${weeks} week${isSingular ? '' : 's'} ago` : `in ${weeks} week${isSingular ? '' : 's'}`;
    } else if (absSeconds < 31536000) {
        const months = Math.floor(absSeconds / 2628000);
        return isPast ? `${months} month${isSingular ? '' : 's'} ago` : `in ${months} month${isSingular ? '' : 's'}`;
    } else {
        const years = Math.floor(absSeconds / 31536000);
        return isPast ? `${years} year${isSingular ? '' : 's'} ago` : `in ${years} year${isSingular ? '' : 's'}`;
    }
}

function formatDateWithTime(unixTimestamp, includeDayOfWeek, includeYear) {
    const date = new Date(unixTimestamp * 1000);
    const dayOfWeek = getDayOfWeekString(date.getDay());
    const month = getMonthString(date.getMonth());
    const day = date.getDate();
    const year = date.getFullYear();
    const time = formatTime(unixTimestamp, true);
    let formattedDate = '';
    if (includeDayOfWeek) {
      formattedDate += dayOfWeek + ', ';
    }
    formattedDate += month + ' ' + day;
    if (includeYear) {
      formattedDate += ', ' + year;
    }
    formattedDate += ' at ' + time;
    return formattedDate;
}

function formatDateSlashSeparated(unixTimestamp) {
    const date = new Date(unixTimestamp * 1000);
    const month = padNumber(date.getMonth() + 1);
    const day = padNumber(date.getDate());
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
}

function formatTime(unixTimestamp, includeSeconds) {
    const date = new Date(unixTimestamp * 1000);
    let hours = date.getHours();
    const minutes = padNumber(date.getMinutes());
    const seconds = includeSeconds ? ':' + padNumber(date.getSeconds()) : '';
    const period = hours >= 12 ? 'PM' : 'AM';
    if (hours === 0) {
      hours = 12;
    } else if (hours > 12) {
      hours -= 12;
    }
    return `${hours}:${minutes}${seconds} ${period}`;
}

function getDayOfWeekString(day) {
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return daysOfWeek[day];
}
function getMonthString(month) {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return months[month];
}
function padNumber(number) {
    return number.toString().padStart(2, '0');
}
