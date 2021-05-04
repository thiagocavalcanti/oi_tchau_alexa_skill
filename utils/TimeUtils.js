const msToTime = (ms) => ({
  hours: Math.trunc(ms / 3600000),
  minutes:
    Math.trunc((ms / 3600000 - Math.trunc(ms / 3600000)) * 60) +
    (((ms / 3600000 - Math.trunc(ms / 3600000)) * 60) % 1 !== 0 ? 1 : 0),
});

const formatDate = (date) =>
  date.getFullYear() +
  '-' +
  addZeroLeft(date.getMonth() + 1) +
  '-' +
  addZeroLeft(date.getDate());

const addZeroLeft = (number) => (number < 10 ? '0' + number : number);
module.exports = { msToTime, formatDate, addZeroLeft };
