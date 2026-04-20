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

function getDefaultDetailEditForm() {
  return {
    ingredientsText: '',
    cookingMethod: '',
    cookingStepsText: ''
  };
}

function getTodayParts() {
  const today = new Date();
  return {
    todayText: formatDate(today),
    year: today.getFullYear(),
    month: today.getMonth() + 1
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
    searchQuery: '',
    customSearchQuery: '',
    currentSeasonLabel: '',
    currentDateTagLabel: '',
    todayText: '',
    favoriteCount: 0,
    customCount: 0,
    recordCount: 0,
    appSummary: [
      '所有数据仅保存在当前微信客户端本地存储中。',
      '当前版本不接入服务器，不采集手机号或位置信息。',
      '菜谱推荐仅供参考，请结合个人饮食需求调整。'
    ],
    catalogFoods: [],
    filteredCustomFoods: [],
    favoriteFoods: [],
    records: [],
    todayPick: null,
    randomPick: null,
    weeklyDailyCount: 3,
    weeklyPlan: EMPTY_WEEKLY_PLAN,
    detailFood: null,
    detailVisible: false,
    detailEditing: false,
    detailEditForm: getDefaultDetailEditForm(),
    customFoods: [],
    customForm: getDefaultCustomForm(),
    recordYear: getTodayParts().year,
    recordMonth: getTodayParts().month,
    selectedRecordDate: getTodayParts().todayText,
    recordMonthLabel: '',
    recordCalendarDays: [],
    selectedDateRecords: [],
    weekSummaryText: '',
    monthSummaryText: ''
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
    const foodEdits = getStorage(STORAGE_KEYS.foodEdits, {});
    const rawRecords = getStorage(STORAGE_KEYS.records, []);
    const records = rawRecords
      .slice()
      .sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1))
      .map((record) => ({
        ...record,
        sourceLabel: record.source === 'daily' ? '每日推荐' : '随机抽取',
        displayTime: formatRecordDateTime(record.timestamp)
      }));
    const weeklyDailyCount = Number(getStorage(STORAGE_KEYS.weeklyDailyCount, 3)) || 3;
    const storedPlan = getStorage(STORAGE_KEYS.weeklyPlan, EMPTY_WEEKLY_PLAN);
    const allFoods = this.buildAllFoods(favoriteIds, customFoods, foodEdits);
    const catalogFoods = this.applyFilters(allFoods);
    const favoriteFoods = allFoods.filter((food) => food.isFavorite);
    const filteredCustomFoods = this.applyCustomSearch(
      customFoods.map((food) => {
        const merged = this.mergeFoodDraft(food, foodEdits[food.id]);
        return {
          ...merged,
          isFavorite: favoriteIds.includes(food.id)
        };
      })
    );
    const weeklyPlan = this.ensureWeeklyPlan(allFoods, currentSeason, weeklyDailyCount, storedPlan);
    const recordState = this.buildRecordState(records);

    this.setData({
      todayText: formatDate(now),
      currentSeasonLabel: SEASON_LABELS[currentSeason],
      currentDateTagLabel: DATE_TAG_LABELS[currentDateTag],
      favoriteCount: favoriteFoods.length,
      customCount: customFoods.length,
      recordCount: records.length,
      catalogFoods,
      filteredCustomFoods,
      favoriteFoods,
      records,
      customFoods,
      weeklyDailyCount,
      weeklyPlan,
      recordMonthLabel: recordState.recordMonthLabel,
      recordCalendarDays: recordState.recordCalendarDays,
      selectedRecordDate: recordState.selectedRecordDate,
      selectedDateRecords: recordState.selectedDateRecords,
      weekSummaryText: recordState.weekSummaryText,
      monthSummaryText: recordState.monthSummaryText
    });
  },

  buildAllFoods(favoriteIds, customFoods, foodEdits = {}) {
    return [...FOODS, ...customFoods].map((food) => {
      const merged = this.mergeFoodDraft(food, foodEdits[food.id]);
      return {
        ...merged,
        isFavorite: favoriteIds.includes(food.id),
        typeLabel: TYPE_LABELS[merged.type] || merged.type,
        trafficLabel: TRAFFIC_LABELS[merged.trafficLight] || merged.trafficLight,
        seasonText: merged.seasons.map((item) => SEASON_LABELS[item] || item).join(' / '),
        dateTagText: merged.dateTags.map((item) => DATE_TAG_LABELS[item] || item).join(' / ')
      };
    });
  },

  mergeFoodDraft(food, draft) {
    if (!draft) return food;
    return {
      ...food,
      ingredients: Array.isArray(draft.ingredients) && draft.ingredients.length ? draft.ingredients : food.ingredients,
      cookingMethod: draft.cookingMethod || food.cookingMethod,
      cookingSteps: Array.isArray(draft.cookingSteps) && draft.cookingSteps.length ? draft.cookingSteps : food.cookingSteps
    };
  },

  applyFilters(allFoods) {
    const season = SEASON_OPTIONS[this.data.seasonIndex].value;
    const dateTag = DATE_TAG_OPTIONS[this.data.dateTagIndex].value;
    const traffic = TRAFFIC_OPTIONS[this.data.trafficIndex].value;
    const type = TYPE_OPTIONS[this.data.typeIndex].value;
    const keyword = (this.data.searchQuery || '').trim().toLowerCase();

    return allFoods.filter((food) => {
      const matchSeason = season === 'all' || food.seasons.includes(season);
      const matchDate = dateTag === 'all' || food.dateTags.includes(dateTag);
      const matchTraffic = traffic === 'all' || food.trafficLight === traffic;
      const matchType = type === 'all' || food.type === type;
      const haystack = [
        food.name,
        food.description,
        food.bestTime,
        food.cookingMethod,
        ...(food.ingredients || []),
        ...(food.nutrients || []),
        ...((food.cookingSteps || []).map((step) => step.detail))
      ]
        .join(' ')
        .toLowerCase();
      const matchKeyword = !keyword || haystack.includes(keyword);
      return matchSeason && matchDate && matchTraffic && matchType && matchKeyword;
    });
  },

  applyCustomSearch(customFoods) {
    const keyword = (this.data.customSearchQuery || '').trim().toLowerCase();
    if (!keyword) {
      return customFoods;
    }

    return customFoods.filter((food) =>
      [
        food.name,
        food.description,
        food.bestTime,
        food.cookingMethod,
        ...(food.ingredients || []),
        ...(food.nutrients || []),
        ...((food.cookingSteps || []).map((step) => step.detail))
      ]
        .join(' ')
        .toLowerCase()
        .includes(keyword)
    );
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

  buildRecordState(records) {
    const { todayText, year, month } = getTodayParts();
    const recordYear = this.data.recordYear || year;
    const recordMonth = this.data.recordMonth || month;
    const selectedRecordDate = this.normalizeSelectedRecordDate(records, recordYear, recordMonth, this.data.selectedRecordDate || todayText);
    const monthPrefix = `${recordYear}-${String(recordMonth).padStart(2, '0')}`;
    const monthRecords = records.filter((record) => record.timestamp.startsWith(monthPrefix));
    const selectedDateRecords = records.filter((record) => record.timestamp.startsWith(selectedRecordDate));
    const weekSummaryRecords = records.filter((record) => {
      const current = parseDate(formatDate(new Date(record.timestamp)));
      const weekStart = getWeekStart(parseDate(selectedRecordDate));
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      return current >= weekStart && current <= weekEnd;
    });

    return {
      recordMonthLabel: `${recordYear} 年 ${recordMonth} 月`,
      recordCalendarDays: buildCalendarDays(recordYear, recordMonth, records, selectedRecordDate),
      selectedRecordDate,
      selectedDateRecords,
      weekSummaryText: buildSummaryText(weekSummaryRecords, '本周'),
      monthSummaryText: buildSummaryText(monthRecords, '本月')
    };
  },

  normalizeSelectedRecordDate(records, year, month, selectedDate) {
    const monthPrefix = `${year}-${String(month).padStart(2, '0')}`;
    if (selectedDate && selectedDate.startsWith(monthPrefix)) {
      return selectedDate;
    }

    const latest = records
      .map((record) => formatDate(new Date(record.timestamp)))
      .filter((dateText) => dateText.startsWith(monthPrefix))
      .sort()
      .pop();

    return latest || `${monthPrefix}-01`;
  },

  handleTabChange(event) {
    this.setData({ activeTab: event.currentTarget.dataset.tab }, () => this.refreshState());
  },

  handleFilterChange(event) {
    const field = event.currentTarget.dataset.field;
    const value = Number(event.detail.value);
    this.setData({ [field]: value }, () => this.refreshState());
  },

  handleSpinnerModeChange(event) {
    this.setData({ spinnerModeIndex: Number(event.detail.value) });
  },

  handleSearchInput(event) {
    this.setData({ searchQuery: event.detail.value }, () => this.refreshState());
  },

  clearSearch() {
    this.setData({ searchQuery: '' }, () => this.refreshState());
  },

  handleCustomSearchInput(event) {
    this.setData({ customSearchQuery: event.detail.value }, () => this.refreshState());
  },

  clearCustomSearch() {
    this.setData({ customSearchQuery: '' }, () => this.refreshState());
  },

  selectRecordDate(event) {
    this.setData({ selectedRecordDate: event.currentTarget.dataset.date }, () => this.refreshState());
  },

  changeRecordMonth(event) {
    const direction = Number(event.currentTarget.dataset.direction);
    const next = new Date(this.data.recordYear, this.data.recordMonth - 1 + direction, 1);
    this.setData(
      {
        recordYear: next.getFullYear(),
        recordMonth: next.getMonth() + 1
      },
      () => this.refreshState()
    );
  },

  goToTodayRecords() {
    const { todayText, year, month } = getTodayParts();
    this.setData(
      {
        recordYear: year,
        recordMonth: month,
        selectedRecordDate: todayText
      },
      () => this.refreshState()
    );
  },

  makeTodayPick() {
    const allFoods = this.buildAllFoods(
      getStorage(STORAGE_KEYS.favoriteIds, []),
      getStorage(STORAGE_KEYS.customFoods, []),
      getStorage(STORAGE_KEYS.foodEdits, {})
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
    const allFoods = this.buildAllFoods(favoriteIds, customFoods, getStorage(STORAGE_KEYS.foodEdits, {}));
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
      getStorage(STORAGE_KEYS.customFoods, []),
      getStorage(STORAGE_KEYS.foodEdits, {})
    );
    const food = allFoods.find((item) => item.id === foodId);
    if (!food) return;

    this.setData({
      detailFood: this.decorateDetailFood(food),
      detailVisible: true,
      detailEditing: false,
      detailEditForm: this.getDetailEditForm(food)
    });
  },

  decorateDetailFood(food) {
    return {
      ...food,
      nutrientsText: (food.nutrients || []).join('、'),
      ingredientsText: (food.ingredients || []).join('、'),
      stepLines: (food.cookingSteps || []).map((step, index) => `${index + 1}. ${step.detail}`)
    };
  },

  getDetailEditForm(food) {
    return {
      ingredientsText: (food.ingredients || []).join('\n'),
      cookingMethod: food.cookingMethod || '',
      cookingStepsText: (food.cookingSteps || []).map((step) => step.detail).join('\n')
    };
  },

  closeFoodDetail() {
    this.setData({
      detailFood: null,
      detailVisible: false,
      detailEditing: false,
      detailEditForm: getDefaultDetailEditForm()
    });
  },

  toggleDetailEditing() {
    const food = this.data.detailFood;
    if (!food) return;

    this.setData({
      detailEditing: !this.data.detailEditing,
      detailEditForm: this.getDetailEditForm(food)
    });
  },

  handleDetailEditInput(event) {
    const field = event.currentTarget.dataset.field;
    this.setData({
      [`detailEditForm.${field}`]: event.detail.value
    });
  },

  saveDetailEdit() {
    const food = this.data.detailFood;
    if (!food) return;

    const foodEdits = getStorage(STORAGE_KEYS.foodEdits, {});
    const ingredients = splitText(this.data.detailEditForm.ingredientsText, food.ingredients || []);
    const cookingMethod = (this.data.detailEditForm.cookingMethod || '').trim() || food.cookingMethod || '按个人习惯烹饪';
    const cookingSteps = buildStepsFromText(this.data.detailEditForm.cookingStepsText || cookingMethod);

    setStorage(STORAGE_KEYS.foodEdits, {
      ...foodEdits,
      [food.id]: {
        ingredients,
        cookingMethod,
        cookingSteps
      }
    });

    if (food.origin === 'user') {
      const customFoods = getStorage(STORAGE_KEYS.customFoods, []).map((item) =>
        item.id === food.id
          ? {
              ...item,
              ingredients,
              cookingMethod,
              cookingSteps
            }
          : item
      );
      setStorage(STORAGE_KEYS.customFoods, customFoods);
    }

    wx.showToast({ title: '已保存菜品修改', icon: 'none' });
    this.refreshState();
    this.openFoodDetail({ currentTarget: { dataset: { id: food.id } } });
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
      getStorage(STORAGE_KEYS.customFoods, []),
      getStorage(STORAGE_KEYS.foodEdits, {})
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
    const foodEdits = getStorage(STORAGE_KEYS.foodEdits, {});
    delete foodEdits[foodId];

    setStorage(STORAGE_KEYS.customFoods, customFoods);
    setStorage(STORAGE_KEYS.favoriteIds, favoriteIds);
    setStorage(STORAGE_KEYS.foodEdits, foodEdits);
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

function formatRecordDateTime(timestamp) {
  const date = new Date(timestamp);
  return `${formatDate(date)} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

function parseDate(dateText) {
  const [year, month, day] = dateText.split('-').map(Number);
  return new Date(year, (month || 1) - 1, day || 1);
}

function getWeekStart(date) {
  const current = new Date(date);
  const day = current.getDay() || 7;
  current.setHours(0, 0, 0, 0);
  current.setDate(current.getDate() - day + 1);
  return current;
}

function buildSummaryText(records, prefix) {
  if (!records.length) {
    return `${prefix}还没有记录。`;
  }

  const total = records.length;
  const categories = {
    meat: 0,
    vegetarian: 0,
    soup: 0,
    staple: 0
  };

  records.forEach((record) => {
    const type = record.option.meta?.type;
    if (type && typeof categories[type] === 'number') {
      categories[type] += 1;
    }
  });

  return `${prefix}共记录 ${total} 道菜，荤食 ${categories.meat} / 素食 ${categories.vegetarian} / 汤品 ${categories.soup} / 主食 ${categories.staple}。`;
}

function buildCalendarDays(year, month, records, selectedDate) {
  const firstDay = new Date(year, month - 1, 1);
  const lastDate = new Date(year, month, 0).getDate();
  const leadingBlanks = (firstDay.getDay() + 6) % 7;
  const recordMap = records.reduce((acc, record) => {
    const dateText = formatDate(new Date(record.timestamp));
    acc[dateText] = acc[dateText] || [];
    acc[dateText].push(record);
    return acc;
  }, {});
  const days = Array.from({ length: leadingBlanks }, () => null);

  for (let day = 1; day <= lastDate; day += 1) {
    const dateText = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dateRecords = (recordMap[dateText] || []).slice().sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1));
    days.push({
      date: dateText,
      isSelected: dateText === selectedDate,
      recordCount: dateRecords.length,
      preview: dateRecords.slice(0, 2).map((record) => record.option.label).join(' · ')
    });
  }

  return days;
}
