const STORAGE_KEYS = {
  favoriteIds: 'miniapp-favorite-ids',
  customFoods: 'miniapp-custom-foods',
  foodEdits: 'miniapp-food-edits',
  spinnerSelectedFoodIds: 'miniapp-spinner-selected-food-ids',
  spinnerActiveFoodIds: 'miniapp-spinner-active-food-ids',
  records: 'miniapp-records',
  weeklyDailyCount: 'miniapp-weekly-daily-count',
  weeklyPlan: 'miniapp-weekly-plan'
};

function getStorage(key, fallback) {
  try {
    const value = wx.getStorageSync(key);
    return value === '' || value === undefined ? fallback : value;
  } catch (_error) {
    return fallback;
  }
}

function setStorage(key, value) {
  wx.setStorageSync(key, value);
}

module.exports = {
  STORAGE_KEYS,
  getStorage,
  setStorage
};
