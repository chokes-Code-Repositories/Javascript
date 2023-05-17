function formatTimestamp(text) {
    const regex = /t:(\d+):([RFDTfdt])/g;
    const now = Math.floor(Date.now() / 1000).toFixed(0);

    return text.replace(regex, (match, timestamp, format) => {
        const unixTimestamp = parseInt(timestamp, 10);

        if (isNaN(unixTimestamp)) {
          return match; // Invalid timestamp, return the original match
        }

        const timeDiff = Math.abs(now - unixTimestamp);

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
    if (seconds < 60) {
      return `${seconds} second${seconds === 1 ? '' : 's'} ago`;
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
    } else if (seconds < 86400) {
      const hours = Math.floor(seconds / 3600);
      return `${hours} hour${hours === 1 ? '' : 's'} ago`;
    } else if (seconds < 2592000) {
      const days = Math.floor(seconds / 86400);
      return `${days} day${days === 1 ? '' : 's'} ago`;
    } else if (seconds < 31536000) {
      const months = Math.floor(seconds / 2592000);
      return `${months} month${months === 1 ? '' : 's'} ago`;
    } else {
      const years = Math.floor(seconds / 31536000);
      return `${years} year${years === 1 ? '' : 's'} ago`;
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

// Example usage
console.log(formatTimestamp("The event starts at: t:1684238700:F"));
console.log(formatTimestamp("This event has started t:1684241048:R, However, another event is scheduled t:1684242352:R"));
