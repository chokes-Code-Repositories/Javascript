/*
t:UNIX_TIMESTAMP:R = Relative time
t:UNIX_TIMESTAMP:F = [Day of week], [Month] [Day], [Year] at [Time]
t:UNIX_TIMESTAMP:f = [Month] [Day], [Year] at [Time]
t:UNIX_TIMESTAMP:D = [Month] [Day], [Year]
t:UNIX_TIMESTAMP:d = [Month]/[Day]/[Year]
t:UNIX_TIMESTAMP:T = [Hour]:[Minute]:[Second] [AM/PM]
t:UNIX_TIMESTAMP:t = [Hour]:[Minute] [AM/PM]
*/
const htmlElement = document.querySelector('html');
const preferredLanguage = htmlElement.getAttribute('lang') || navigator.language;
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
            return formatDate(unixTimestamp);
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
    const rtf = new Intl.RelativeTimeFormat(preferredLanguage, { numeric: 'auto' });
    if (absSeconds < 60) {
        return rtf.format(seconds, 'second');
    } else if (absSeconds < 3600) {
        const minutes = Math.floor(seconds / 60);
        return rtf.format(minutes, 'minute');
    } else if (absSeconds < 86400) {
        const hours = Math.floor(seconds / 3600);
        return rtf.format(hours, 'hour');
    } else if (absSeconds < 604800) {
        const days = Math.floor(seconds / 86400);
        return rtf.format(days, 'day');
    } else if (absSeconds < 2628000) {
        const weeks = Math.floor(seconds / 604800);
        return rtf.format(weeks, 'week');
    } else if (absSeconds < 31536000) {
        const months = Math.floor(seconds / 2628000);
        return rtf.format(months, 'month');
    } else {
        const years = Math.floor(seconds / 31536000);
        return rtf.format(years, 'year');
    }
}

function formatDateWithTime(unixTimestamp, includeDayOfWeek, includeYear) {
    // use Intl.DateTimeFormat
    const date = new Date(unixTimestamp * 1000);
    const options = {
        weekday: includeDayOfWeek ? 'long' : undefined,
        year: includeYear ? 'numeric' : undefined,
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
    };
    return new Intl.DateTimeFormat(preferredLanguage, options).format(date);
}
function formatDate(unixTimestamp) {
    const date = new Date(unixTimestamp * 1000);
    const options = {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    };
    return new Intl.DateTimeFormat(preferredLanguage, options).format(date);
}
function formatDateSlashSeparated(unixTimestamp) {
    const date = new Date(unixTimestamp * 1000);
    const options = {
        month: 'numeric',
        day: 'numeric',
        year: 'numeric'
    };
    return new Intl.DateTimeFormat(preferredLanguage, options).format(date);
}
function formatTime(unixTimestamp, includeSeconds) {
    const date = new Date(unixTimestamp * 1000);
    const options = {
        hour: 'numeric',
        minute: 'numeric',
        second: includeSeconds ? 'numeric' : undefined,
        hour12: true
    };
    return new Intl.DateTimeFormat(preferredLanguage, options).format(date);
}
