const { FOODS } = require('../../utils/foods');
const {
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
} = require('../../utils/constants');
const {
  buildStepsFromText,
  formatDate,
  formatWeekday,
  getCurrentDateTag,
  getCurrentSeason,
  pickRandom,
  randomId,
  splitText
} = require('../../utils/helpers');
const { STORAGE_KEYS, getStorage, setStorage } = require('../../utils/storage');

const EMPTY_WEEKLY_PLAN = {
  startDate: '',
  dailyCount: 3,
  days: []
};

function getDefaultCustomForm() {
  return {
    id: '',
    name: '',
    description: '',
    calories: '',
    trafficLight: 'green',
    type: 'vegetarian',
    seasonsText: 'spring,summer',
    dateTagsText: 'weekday,weekend',
    nutrientsText: '',
    ingredientsText: '',
    bestTime: '',
    cookingMethod: '',
    cookingStepsText: ''
  };
}

Page({
  data: {
    activeTab: 'home',
    tabOptions: TAB_OPTIONS,
    seasonOptions: SEASON_OPTIONS,
    dateTagOptions: DATE_TAG_OPTIONS,
    trafficOptions: TRAFFIC_OPTIONS,
    typeOptions: TYPE_OPTIONS,
    spinnerModes: SPINNER_MODES,
    seasonIndex: 0,
    dateTagIndex: 0,
    trafficIndex: 0,
    typeIndex: 0,
    spinnerModeIndex: 0,
    currentSeasonLabel: '',
    currentDateTagLabel: '',
    todayText: '',
    favoriteCount: 0,
    customCount: 0,
    recordCount: 0,
    appSummary: [
      '所有数据仅保存在当前微信客户端本地存储中',
      '当前版本不接入服务器、不采集手机号或位置信息',
      '菜谱推荐仅供参考，请结合个人饮食需求调整'
    ],
    catalogFoods: [],
    favoriteFoods: [],
    records: [],
    todayPick: null,
    randomPick: null,
    weeklyDailyCount: 3,
    weeklyPlan: EMPTY_WEEKLY_PLAN,
    detailFood: null,
    detailVisible: false,
    customFoods: [],
    customForm: getDefaultCustomForm()
  },

  onLoad() {
    this.refreshState();
  },

  refreshState() {
    const now = new Date();
    const currentSeason = getCurrentSeason(now);
    const currentDateTag = getCurrentDateTag(now);
    const favoriteIds = getStorage(STORAGE_KEYS.favoriteIds, []);
    const customFoods = getStorage(STORAGE_KEYS.customFoods, []);
    const records = getStorage(STORAGE_KEYS.records, [])
      .sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1))
      .map((record) => ({
        ...record,
        sourceLabel: record.source === 'daily' ? '每日推荐' : '随机抽取',
        displayTime: String(record.timestamp || '').replace('T', ' ').replace('Z', '')
      }));
    const weeklyDailyCount = Number(getStorage(STORAGE_KEYS.weeklyDailyCount, 3)) || 3;
    const storedPlan = getStorage(STORAGE_KEYS.weeklyPlan, EMPTY_WEEKLY_PLAN);
    const allFoods = this.buildAllFoods(favoriteIds, customFoods);
    const catalogFoods = this.applyFilters(allFoods);
    const favoriteFoods = allFoods.filter((food) => food.isFavorite);
    const weeklyPlan = this.ensureWeeklyPlan(allFoods, currentSeason, weeklyDailyCount, storedPlan);

    this.setData({
      todayText: formatDate(now),
      currentSeasonLabel: SEASON_LABELS[currentSeason],
      currentDateTagLabel: DATE_TAG_LABELS[currentDateTag],
      favoriteCount: favoriteFoods.length,
      customCount: customFoods.length,
      recordCount: records.length,
      catalogFoods,
      favoriteFoods,
      records,
      customFoods,
      weeklyDailyCount,
      weeklyPlan
    });
  },

  buildAllFoods(favoriteIds, customFoods) {
    return [...FOODS, ...customFoods].map((food) => ({
      ...food,
      isFavorite: favoriteIds.includes(food.id),
      typeLabel: TYPE_LABELS[food.type] || food.type,
      trafficLabel: TRAFFIC_LABELS[food.trafficLight] || food.trafficLight,
      seasonText: food.seasons.map((item) => SEASON_LABELS[item] || item).join(' / '),
      dateTagText: food.dateTags.map((item) => DATE_TAG_LABELS[item] || item).join(' / ')
    }));
  },

  applyFilters(allFoods) {
    const season = SEASON_OPTIONS[this.data.seasonIndex].value;
    const dateTag = DATE_TAG_OPTIONS[this.data.dateTagIndex].value;
    const traffic = TRAFFIC_OPTIONS[this.data.trafficIndex].value;
    const type = TYPE_OPTIONS[this.data.typeIndex].value;

    return allFoods.filter((food) => {
      const matchSeason = season === 'all' || food.seasons.includes(season);
      const matchDate = dateTag === 'all' || food.dateTags.includes(dateTag);
      const matchTraffic = traffic === 'all' || food.trafficLight === traffic;
      const matchType = type === 'all' || food.type === type;
      return matchSeason && matchDate && matchTraffic && matchType;
    });
  },

  ensureWeeklyPlan(allFoods, season, dailyCount, plan) {
    const today = formatDate(new Date());
    if (plan && plan.startDate === today && plan.dailyCount === dailyCount && Array.isArray(plan.days) && plan.days.length === 7) {
      return this.decorateWeeklyPlan(plan, allFoods);
    }

    const nextPlan = this.generateWeeklyPlanData(allFoods, season, dailyCount);
    setStorage(STORAGE_KEYS.weeklyPlan, nextPlan);
    return this.decorateWeeklyPlan(nextPlan, allFoods);
  },

  decorateWeeklyPlan(plan, allFoods) {
    return {
      ...plan,
      days: plan.days.map((day) => ({
        ...day,
        weekdayLabel: formatWeekday(day.date),
        foodCards: day.foodIds
          .map((foodId) => allFoods.find((food) => food.id === foodId))
          .filter(Boolean)
          .map((food) => ({
            id: food.id,
            name: food.name,
            typeLabel: TYPE_LABELS[food.type],
            bestTime: food.bestTime,
            isFavorite: !!food.isFavorite
          }))
      }))
    };
  },

  generateWeeklyPlanData(allFoods, season, dailyCount) {
    const today = formatDate(new Date());
    return {
      startDate: today,
      dailyCount,
      days: Array.from({ length: 7 }, (_, offset) => this.buildDayPlan(allFoods, season, today, offset, dailyCount))
    };
  },

  buildDayPlan(allFoods, season, startDate, offset, dailyCount) {
    const baseDate = new Date(`${startDate}T00:00:00`);
    baseDate.setDate(baseDate.getDate() + offset);
    const date = formatDate(baseDate);
    const seasonalFoods = allFoods.filter((food) => food.seasons.includes(season));
    const source = seasonalFoods.length ? seasonalFoods : allFoods;
    const usedIds = new Set();
    const foodIds = [];

    while (foodIds.length < dailyCount) {
      const available = source.filter((food) => !usedIds.has(food.id));
      const fallback = allFoods.filter((food) => !usedIds.has(food.id));
      const picked = pickRandom(available.length ? available : fallback);
      if (!picked) break;
      usedIds.add(picked.id);
      foodIds.push(picked.id);
    }

    return { date, foodIds };
  },

  handleTabChange(event) {
    this.setData({ activeTab: event.currentTarget.dataset.tab });
  },

  handleFilterChange(event) {
    const field = event.currentTarget.dataset.field;
    const value = Number(event.detail.value);
    this.setData({ [field]: value }, () => this.refreshState());
  },

  handleSpinnerModeChange(event) {
    this.setData({ spinnerModeIndex: Number(event.detail.value) });
  },

  makeTodayPick() {
    const allFoods = this.buildAllFoods(
      getStorage(STORAGE_KEYS.favoriteIds, []),
      getStorage(STORAGE_KEYS.customFoods, [])
    );
    const currentSeason = getCurrentSeason(new Date());
    const currentDateTag = getCurrentDateTag(new Date());
    const pool = allFoods.filter(
      (food) => food.seasons.includes(currentSeason) && food.dateTags.includes(currentDateTag)
    );
    const picked = pickRandom(pool.length ? pool : allFoods);

    if (!picked) {
      wx.showToast({ title: '暂无可推荐菜品', icon: 'none' });
      return;
    }

    this.pushRecord(picked, 'daily');
    this.setData({ todayPick: picked });
    wx.showToast({ title: `今日推荐：${picked.name}`, icon: 'none' });
  },

  spinRandom() {
    const favoriteIds = getStorage(STORAGE_KEYS.favoriteIds, []);
    const customFoods = getStorage(STORAGE_KEYS.customFoods, []);
    const allFoods = this.buildAllFoods(favoriteIds, customFoods);
    const mode = SPINNER_MODES[this.data.spinnerModeIndex].value;
    let pool = allFoods;

    if (mode === 'favorites') {
      pool = allFoods.filter((food) => food.isFavorite);
    }
    if (mode === 'custom') {
      pool = customFoods.map((food) => ({
        ...food,
        isFavorite: favoriteIds.includes(food.id)
      }));
    }

    const picked = pickRandom(pool);
    if (!picked) {
      wx.showToast({ title: '当前模式下没有可抽取菜品', icon: 'none' });
      return;
    }

    this.pushRecord(picked, 'custom');
    this.setData({ randomPick: picked });
    wx.showToast({ title: `抽中了：${picked.name}`, icon: 'none' });
  },

  pushRecord(food, source) {
    const records = getStorage(STORAGE_KEYS.records, []);
    const record = {
      id: randomId(),
      option: {
        id: food.id,
        label: food.name,
        calories: food.calories,
        origin: food.origin === 'user' ? 'user' : 'system',
        meta: {
          trafficLight: food.trafficLight,
          type: food.type,
          isFavorite: !!food.isFavorite
        }
      },
      source,
      timestamp: new Date().toISOString()
    };

    setStorage(STORAGE_KEYS.records, [...records, record]);
    this.refreshState();
  },

  openFoodDetail(event) {
    const foodId = event.currentTarget.dataset.id;
    const allFoods = this.buildAllFoods(
      getStorage(STORAGE_KEYS.favoriteIds, []),
      getStorage(STORAGE_KEYS.customFoods, [])
    );
    const food = allFoods.find((item) => item.id === foodId);
    if (!food) return;

    this.setData({
      detailFood: {
        ...food,
        nutrientsText: (food.nutrients || []).join('、'),
        ingredientsText: (food.ingredients || []).join('、'),
        stepLines: (food.cookingSteps || []).map((step, index) => `${index + 1}. ${step.detail}`)
      },
      detailVisible: true
    });
  },

  closeFoodDetail() {
    this.setData({
      detailFood: null,
      detailVisible: false
    });
  },

  toggleFavorite(event) {
    const foodId = event.currentTarget.dataset.id;
    const favoriteIds = getStorage(STORAGE_KEYS.favoriteIds, []);
    const nextFavorite = !favoriteIds.includes(foodId);
    const next = favoriteIds.includes(foodId)
      ? favoriteIds.filter((item) => item !== foodId)
      : [...favoriteIds, foodId];

    setStorage(STORAGE_KEYS.favoriteIds, next);
    if (this.data.detailVisible && this.data.detailFood && this.data.detailFood.id === foodId) {
      this.setData({
        'detailFood.isFavorite': nextFavorite
      });
    }
    this.refreshState();
  },

  previewFavorite(event) {
    this.setData({ activeTab: 'catalog' });
    this.openFoodDetail(event);
  },

  handleWeeklyCountInput(event) {
    const value = Math.max(1, Math.min(7, Number(event.detail.value) || 1));
    this.setData({ weeklyDailyCount: value });
    setStorage(STORAGE_KEYS.weeklyDailyCount, value);
  },

  regenerateWeeklyPlan() {
    const allFoods = this.buildAllFoods(
      getStorage(STORAGE_KEYS.favoriteIds, []),
      getStorage(STORAGE_KEYS.customFoods, [])
    );
    const currentSeason = getCurrentSeason(new Date());
    const weeklyPlan = this.decorateWeeklyPlan(
      this.generateWeeklyPlanData(allFoods, currentSeason, this.data.weeklyDailyCount),
      allFoods
    );
    setStorage(STORAGE_KEYS.weeklyPlan, weeklyPlan);
    this.setData({ weeklyPlan });
    wx.showToast({ title: '已生成 7 天计划', icon: 'none' });
  },

  handleCustomInput(event) {
    const field = event.currentTarget.dataset.field;
    this.setData({
      [`customForm.${field}`]: event.detail.value
    });
  },

  saveCustomFood() {
    const form = this.data.customForm;
    const name = (form.name || '').trim();
    if (!name) {
      wx.showToast({ title: '请先填写菜名', icon: 'none' });
      return;
    }

    const customFoods = getStorage(STORAGE_KEYS.customFoods, []);
    const id = form.id || `custom-${randomId()}`;
    const item = {
      id,
      origin: 'user',
      name,
      description: (form.description || '').trim() || '自定义菜品',
      calories: Number(form.calories) || 0,
      trafficLight: this.normalizeSingle(form.trafficLight, ['green', 'yellow', 'red'], 'green'),
      type: this.normalizeSingle(form.type, ['vegetarian', 'meat', 'soup', 'staple'], 'vegetarian'),
      seasons: this.normalizeEnumList(form.seasonsText, ['spring', 'summer', 'autumn', 'winter'], ['spring']),
      dateTags: this.normalizeEnumList(form.dateTagsText, ['weekday', 'weekend', 'festival'], ['weekday']),
      nutrients: splitText(form.nutrientsText, ['均衡搭配']),
      ingredients: splitText(form.ingredientsText, ['按个人准备']),
      bestTime: (form.bestTime || '').trim() || '按需安排',
      cookingMethod: (form.cookingMethod || '').trim() || '按个人习惯烹饪',
      cookingSteps: buildStepsFromText(form.cookingStepsText)
    };

    const exists = customFoods.some((food) => food.id === id);
    const nextFoods = exists
      ? customFoods.map((food) => (food.id === id ? item : food))
      : [...customFoods, item];

    setStorage(STORAGE_KEYS.customFoods, nextFoods);
    this.resetCustomForm();
    this.refreshState();
    wx.showToast({ title: exists ? '已更新自定义菜品' : '已新增自定义菜品', icon: 'none' });
  },

  editCustomFood(event) {
    const foodId = event.currentTarget.dataset.id;
    const customFoods = getStorage(STORAGE_KEYS.customFoods, []);
    const food = customFoods.find((item) => item.id === foodId);
    if (!food) return;

    this.setData({
      activeTab: 'custom',
      customForm: {
        id: food.id,
        name: food.name,
        description: food.description,
        calories: String(food.calories),
        trafficLight: food.trafficLight,
        type: food.type,
        seasonsText: food.seasons.join(','),
        dateTagsText: food.dateTags.join(','),
        nutrientsText: (food.nutrients || []).join(','),
        ingredientsText: (food.ingredients || []).join(','),
        bestTime: food.bestTime,
        cookingMethod: food.cookingMethod,
        cookingStepsText: (food.cookingSteps || []).map((step) => step.detail).join('\n')
      }
    });
  },

  deleteCustomFood(event) {
    const foodId = event.currentTarget.dataset.id;
    const customFoods = getStorage(STORAGE_KEYS.customFoods, []).filter((food) => food.id !== foodId);
    const favoriteIds = getStorage(STORAGE_KEYS.favoriteIds, []).filter((id) => id !== foodId);

    setStorage(STORAGE_KEYS.customFoods, customFoods);
    setStorage(STORAGE_KEYS.favoriteIds, favoriteIds);
    this.resetCustomForm();
    this.refreshState();
    wx.showToast({ title: '已删除自定义菜品', icon: 'none' });
  },

  resetCustomForm() {
    this.setData({
      customForm: getDefaultCustomForm()
    });
  },

  removeRecord(event) {
    const recordId = event.currentTarget.dataset.id;
    const records = getStorage(STORAGE_KEYS.records, []).filter((item) => item.id !== recordId);
    setStorage(STORAGE_KEYS.records, records);
    this.refreshState();
  },

  clearRecords() {
    wx.showModal({
      title: '清空记录',
      content: '确定要清空所有历史记录吗？',
      success: (result) => {
        if (!result.confirm) return;
        setStorage(STORAGE_KEYS.records, []);
        this.refreshState();
      }
    });
  },

  normalizeEnumList(value, allowed, fallback) {
    const result = splitText(value)
      .map((item) => item.trim())
      .filter((item) => allowed.includes(item));
    return result.length ? result : fallback;
  },

  normalizeSingle(value, allowed, fallback) {
    const current = (value || '').trim();
    return allowed.includes(current) ? current : fallback;
  },

  noop() {}
});
