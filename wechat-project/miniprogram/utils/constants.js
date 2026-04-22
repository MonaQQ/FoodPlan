const SEASON_OPTIONS = [
  { value: 'all', label: '全部时令' },
  { value: 'spring', label: '春令' },
  { value: 'summer', label: '夏令' },
  { value: 'autumn', label: '秋令' },
  { value: 'winter', label: '冬令' }
];

const DATE_TAG_OPTIONS = [
  { value: 'all', label: '全部场景' },
  { value: 'weekday', label: '工作日' },
  { value: 'weekend', label: '周末' },
  { value: 'festival', label: '节庆' }
];

const TRAFFIC_OPTIONS = [
  { value: 'all', label: '红绿灯' },
  { value: 'green', label: '绿灯（可常吃）' },
  { value: 'yellow', label: '黄灯（适量吃）' },
  { value: 'red', label: '红灯（偶尔吃）' }
];

const TYPE_OPTIONS = [
  { value: 'all', label: '全部分类' },
  { value: 'vegetarian', label: '素食' },
  { value: 'meat', label: '荤食' },
  { value: 'soup', label: '汤品' },
  { value: 'staple', label: '主食' }
];

const SEASON_LABELS = {
  spring: '春令',
  summer: '夏令',
  autumn: '秋令',
  winter: '冬令'
};

const DATE_TAG_LABELS = {
  weekday: '工作日',
  weekend: '周末',
  festival: '节庆'
};

const TRAFFIC_LABELS = {
  green: '绿灯',
  yellow: '黄灯',
  red: '红灯'
};

const TYPE_LABELS = {
  vegetarian: '素食',
  meat: '荤食',
  soup: '汤品',
  staple: '主食'
};

const TAB_OPTIONS = [
  { value: 'home', label: '推荐' },
  { value: 'catalog', label: '菜谱' },
  { value: 'custom', label: '自定义' },
  { value: 'planner', label: '计划' },
  { value: 'records', label: '记录' }
];

const SPINNER_MODES = [
  { value: 'all', label: '全部菜品' },
  { value: 'favorites', label: '只看收藏' },
  { value: 'custom', label: '只看自定义' }
];

module.exports = {
  DATE_TAG_LABELS,
  DATE_TAG_OPTIONS,
  SEASON_LABELS,
  SEASON_OPTIONS,
  SPINNER_MODES,
  TAB_OPTIONS,
  TRAFFIC_LABELS,
  TRAFFIC_OPTIONS,
  TYPE_LABELS,
  TYPE_OPTIONS
};
