/*
t:UNIX_TIMESTAMP:C = Live Countdown
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
let countdownInterval;

function formatTimestamp(text) {
    const regex = /t:(\d+):([RCDFTfdt])/g;
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
                //case 'C':
                //return getCountdownString(timeDiff);
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

function getCountdownString(seconds) {
    if (seconds <= 0) {
        return `Countdown expired ${getTimeAgoString(seconds)}`;
    }

    const years = Math.floor(seconds / 31536000);
    const months = Math.floor((seconds % 31536000) / 2628000);
    const weeks = Math.floor(((seconds % 31536000) % 2628000) / 604800);
    const days = Math.floor((((seconds % 31536000) % 2628000) % 604800) / 86400);
    const hours = Math.floor(((((seconds % 31536000) % 2628000) % 604800) % 86400) / 3600);
    const minutes = Math.floor((((((seconds % 31536000) % 2628000) % 604800) % 86400) % 3600) / 60);
    const remainingSeconds = ((((((seconds % 31536000) % 2628000) % 604800) % 86400) % 3600) % 60);

    const timeUnits = [{
            value: years,
            unit: 'year'
        },
        {
            value: months,
            unit: 'month'
        },
        {
            value: weeks,
            unit: 'week'
        },
        {
            value: days,
            unit: 'day'
        },
        {
            value: hours,
            unit: 'hour'
        },
        {
            value: minutes,
            unit: 'minute'
        },
        {
            value: remainingSeconds,
            unit: 'second'
        }
    ];

    let countdownString = '';
    let hideUnits = true;

    for (let i = 0; i < timeUnits.length; i++) {
        const {
            value,
            unit
        } = timeUnits[i];
        if (value > 0) {
            countdownString += value + ' ' + (value === 1 ? unit : unit + 's') + ', ';
            hideUnits = false;
        } else if (!hideUnits) {
            countdownString += '0 ' + unit + 's, ';
        }
    }

    countdownString = countdownString.trim();
    countdownString = countdownString.slice(0, -1); // Remove trailing comma and space

    return countdownString;
}


function getTimeAgoString(seconds) {
    const absSeconds = Math.abs(seconds);
    const rtf = new Intl.RelativeTimeFormat(preferredLanguage, {
        numeric: 'auto'
    });

    if (absSeconds < 60) {
        const isPast = seconds < 0;
        return rtf.format(isPast ? seconds : seconds, 'second');
    } else if (absSeconds < 3600) {
        const minutes = Math.floor(seconds / 60);
        const isPast = minutes < 0;
        return rtf.format(isPast ? minutes : minutes, 'minute');
    } else if (absSeconds < 86400) {
        const hours = Math.floor(seconds / 3600);
        const isPast = hours < 0;
        return rtf.format(isPast ? hours : hours, 'hour');
    } else if (absSeconds < 604800) {
        const days = Math.floor(seconds / 86400);
        const isPast = days < 0;
        return rtf.format(isPast ? days : days, 'day');
    } else if (absSeconds < 2628000) {
        const weeks = Math.floor(seconds / 604800);
        const isPast = weeks < 0;
        return rtf.format(isPast ? weeks : weeks, 'week');
    } else if (absSeconds < 31536000) {
        const months = Math.floor(seconds / 2628000);
        const isPast = months < 0;
        return rtf.format(isPast ? months : months, 'month');
    } else {
        const years = Math.floor(seconds / 31536000);
        const isPast = years < 0;
        return rtf.format(isPast ? years : years, 'year');
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

function updateCountdowns() {
    const regex = /\bt:(\d+):C\b/;
    const countdownElements = document.querySelectorAll('.countdown');
    countdownElements.forEach(element => {
        const timestamp = element.getAttribute('data-timestamp');
        const remainingSeconds = timestamp - Math.floor(Date.now() / 1000);
        const countdownString = getCountdownString(remainingSeconds);
        const originalHTML = element.getAttribute('data-original-html');
        const newHTML = originalHTML.replace(regex, countdownString);
        element.innerHTML = newHTML;
    });
}

// Main \\
window.boot.register('page-ready', () => {
    let changedTimestamps = 0;
    const container = document.querySelector('.contents');
    const elements = container.querySelectorAll('*');
    elements.forEach(element => {
        const text = element.innerHTML;

        const replacedText = formatTimestamp(text);

        if (text !== replacedText) {
            element.innerHTML = replacedText;
            changedTimestamps++;
        }
    });

    // Countdowns \\
    elements.forEach(element => {
        const inputHTML = element.innerHTML;
        const regex = /\bt:(\d+):C\b/;
        const match = inputHTML.match(regex);

        if (match) {
            const unixTimestamp = parseInt(match[1], 10);

            if (isNaN(unixTimestamp)) return;

            element.classList.add('countdown');
            element.setAttribute('data-timestamp', unixTimestamp);
            element.setAttribute('data-original-html', inputHTML);

            const countdownString = getCountdownString(unixTimestamp - Math.floor(Date.now() / 1000));
            const modifiedHTML = inputHTML.replace(regex, countdownString);
            element.innerHTML = modifiedHTML;
        }
    });
})

countdownInterval = setInterval(updateCountdowns, 1000)
