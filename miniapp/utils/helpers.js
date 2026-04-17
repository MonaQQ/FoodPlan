function getCurrentSeason(date = new Date()) {
  const month = date.getMonth() + 1;
  if (month >= 3 && month <= 5) return 'spring';
  if (month >= 6 && month <= 8) return 'summer';
  if (month >= 9 && month <= 11) return 'autumn';
  return 'winter';
}

function getCurrentDateTag(date = new Date()) {
  const day = date.getDay();
  return day === 0 || day === 6 ? 'weekend' : 'weekday';
}

function pad(value) {
  return String(value).padStart(2, '0');
}

function formatDate(date = new Date()) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function formatDateTime(date = new Date()) {
  return `${formatDate(date)} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function formatWeekday(dateText) {
  const date = new Date(`${dateText}T00:00:00`);
  return ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][date.getDay()];
}

function randomId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function pickRandom(items) {
  if (!Array.isArray(items) || !items.length) return null;
  const index = Math.floor(Math.random() * items.length);
  return items[index] || null;
}

function splitText(value, fallback = []) {
  if (!value) return fallback;
  return value
    .split(/[\n,，]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function buildStepsFromText(value) {
  const lines = splitText(value);
  if (!lines.length) {
    return [
      {
        title: '烹饪步骤',
        duration: '按需',
        detail: '按个人习惯烹饪'
      }
    ];
  }

  return lines.map((detail, index) => ({
    title: `步骤 ${index + 1}`,
    duration: '按需',
    detail
  }));
}

module.exports = {
  buildStepsFromText,
  formatDate,
  formatDateTime,
  formatWeekday,
  getCurrentDateTag,
  getCurrentSeason,
  pickRandom,
  randomId,
  splitText
};
