import { useEffect, useMemo, useState } from 'react';
import { trafficColors, trafficLightLabels, typeLabels } from '../constants';
import { FoodItem, SpinRecord } from '../types';
import { formatDate, formatDateTime } from '../utils/date';

type SpinRecordListProps = {
  records: SpinRecord[];
  foods: FoodItem[];
  onDelete: (id: string) => void;
  onClearAll: () => void;
  onAddRecord: (foodId: string, dateText: string, source: SpinRecord['source']) => void;
  onSelectFood: (id: string) => void;
  hasFood: (id: string) => boolean;
};

const sourceLabels: Record<SpinRecord['source'], string> = {
  daily: '每日推荐',
  custom: '自定义转盘'
};

const monthLabels = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];

export function SpinRecordList({ records, foods, onDelete, onClearAll, onAddRecord, onSelectFood, hasFood }: SpinRecordListProps) {
  const today = new Date();
  const todayText = formatDate(today);
  const [selectedYear, setSelectedYear] = useState<number>(today.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(today.getMonth() + 1);
  const [selectedDate, setSelectedDate] = useState<string>(todayText);
  const [pendingFoodId, setPendingFoodId] = useState<string>('');
  const [pendingFoodSearch, setPendingFoodSearch] = useState('');
  const [pendingSource, setPendingSource] = useState<SpinRecord['source']>('custom');

  const recordMap = useMemo(() => {
    return records.reduce<Record<string, SpinRecord[]>>((acc, record) => {
      const dateKey = formatDate(new Date(record.timestamp));
      acc[dateKey] ??= [];
      acc[dateKey].push(record);
      return acc;
    }, {});
  }, [records]);

  const currentMonthPrefix = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;

  useEffect(() => {
    if (!selectedDate.startsWith(currentMonthPrefix)) {
      const latestDateForMonth =
        Object.keys(recordMap)
          .filter((dateKey) => dateKey.startsWith(currentMonthPrefix))
          .sort()
          .at(-1) ?? `${currentMonthPrefix}-01`;
      setSelectedDate(latestDateForMonth);
    }
  }, [currentMonthPrefix, recordMap, selectedDate]);

  const selectedDateRecords = useMemo(
    () => (recordMap[selectedDate] ?? []).slice().sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1)),
    [recordMap, selectedDate]
  );

  const monthSummaryRecords = useMemo(
    () => records.filter((record) => formatDate(new Date(record.timestamp)).startsWith(currentMonthPrefix)),
    [currentMonthPrefix, records]
  );

  const weekSummaryRecords = useMemo(() => {
    const selected = parseDate(selectedDate);
    const weekStart = getWeekStart(selected);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    return records.filter((record) => {
      const current = parseDate(formatDate(new Date(record.timestamp)));
      return current >= weekStart && current <= weekEnd;
    });
  }, [records, selectedDate]);

  const calendarMonth = useMemo(() => buildCalendarMonth(selectedYear, selectedMonth, recordMap), [recordMap, selectedMonth, selectedYear]);
  const filteredFoods = useMemo(() => filterFoodsByName(foods, pendingFoodSearch), [foods, pendingFoodSearch]);

  const handleAddRecord = () => {
    if (!pendingFoodId) return;
    onAddRecord(pendingFoodId, selectedDate, pendingSource);
    setPendingFoodId('');
  };

  const shiftMonth = (direction: -1 | 1) => {
    const next = new Date(selectedYear, selectedMonth - 1 + direction, 1);
    setSelectedYear(next.getFullYear());
    setSelectedMonth(next.getMonth() + 1);
  };

  const goToToday = () => {
    setSelectedYear(today.getFullYear());
    setSelectedMonth(today.getMonth() + 1);
    setSelectedDate(todayText);
  };

  return (
    <section className="panel record-panel">
      <header className="panel-header">
        <div>
          <p className="eyebrow">历史记录</p>
          <h2>按月查看的记录日历</h2>
        </div>
        <div className="record-header-actions">
          <label className="inline-number-control">
            年份
            <input type="number" value={selectedYear} onChange={(event) => setSelectedYear(Number(event.target.value) || today.getFullYear())} />
          </label>
          <button className="secondary-btn" type="button" onClick={goToToday}>
            快速回到今天
          </button>
          <button
            className="secondary-btn danger-soft-btn"
            type="button"
            onClick={() => {
              if (records.length && window.confirm('确认一键清除全部历史记录吗？')) onClearAll();
            }}
            disabled={!records.length}
          >
            一键清除记录
          </button>
        </div>
      </header>

      {records.length === 0 ? (
        <p className="empty-hint">暂无记录，先去转盘试试吧！</p>
      ) : (
        <>
          <div className="summary-grid">
            <article className="summary-card">
              <p className="eyebrow">自然周点评</p>
              <h3>{formatWeekRange(selectedDate)}</h3>
              <p>{buildPeriodSummary(weekSummaryRecords, '本周')}</p>
            </article>
            <article className="summary-card">
              <p className="eyebrow">自然月点评</p>
              <h3>{currentMonthPrefix}</h3>
              <p>{buildPeriodSummary(monthSummaryRecords, '本月')}</p>
            </article>
          </div>

          <section className="calendar-single-panel">
            <div className="calendar-switcher">
              <button className="secondary-btn small" type="button" onClick={() => shiftMonth(-1)}>
                上个月
              </button>
              <div className="calendar-switcher-center">
                <strong>
                  {selectedYear} 年 {monthLabels[selectedMonth - 1]}
                </strong>
                <label className="filter-select month-select">
                  <span>选择月份</span>
                  <select value={selectedMonth} onChange={(event) => setSelectedMonth(Number(event.target.value))}>
                    {monthLabels.map((label, index) => (
                      <option key={label} value={index + 1}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <button className="secondary-btn small" type="button" onClick={() => shiftMonth(1)}>
                下个月
              </button>
            </div>

            <div className="calendar-weekdays">
              {['一', '二', '三', '四', '五', '六', '日'].map((weekday) => (
                <span key={`${calendarMonth.month}-${weekday}`}>{weekday}</span>
              ))}
            </div>
            <div className="calendar-grid">
              {calendarMonth.days.map((day, index) =>
                day ? (
                  <button
                    key={`${calendarMonth.month}-${day.date}`}
                    type="button"
                    className={`calendar-day ${selectedDate === day.date ? 'selected' : ''} ${day.records.length ? 'has-records' : ''}`}
                    onClick={() => setSelectedDate(day.date)}
                  >
                    <span className="calendar-day-number">{Number(day.date.slice(8, 10))}</span>
                    <span className="calendar-day-count">{day.records.length ? `${day.records.length}条` : ''}</span>
                    <span className="calendar-day-preview">{day.records.slice(0, 2).map((record) => record.option.label).join(' · ')}</span>
                  </button>
                ) : (
                  <div key={`${calendarMonth.month}-blank-${index}`} className="calendar-day blank" />
                )
              )}
            </div>
          </section>

          <section className="record-day-panel">
            <div className="record-day-header">
              <div>
                <p className="eyebrow">按天记录</p>
                <h3>{selectedDate}</h3>
                <p>{buildDailySummary(selectedDateRecords)}</p>
              </div>
              <span className="record-group-count">{selectedDateRecords.length} 条记录</span>
            </div>

            <div className="record-add-form">
              <div className="filter-select">
                <span>搜索菜品</span>
                <input
                  type="text"
                  className="search-input"
                  placeholder="按菜名模糊搜索"
                  value={pendingFoodSearch}
                  onChange={(event) => setPendingFoodSearch(event.target.value)}
                />
              </div>
              <label className="filter-select">
                <span>补记菜品</span>
                <select value={pendingFoodId} onChange={(event) => setPendingFoodId(event.target.value)}>
                  <option value="">请选择菜品</option>
                  {filteredFoods.map((food) => (
                    <option key={food.id} value={food.id}>
                      {food.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="filter-select">
                <span>记录来源</span>
                <select value={pendingSource} onChange={(event) => setPendingSource(event.target.value as SpinRecord['source'])}>
                  <option value="custom">自定义转盘</option>
                  <option value="daily">每日推荐</option>
                </select>
              </label>
              <button className="primary-btn" type="button" onClick={handleAddRecord} disabled={!pendingFoodId}>
                添加其他菜品
              </button>
            </div>

            <ul className="record-list record-list-open">
              {selectedDateRecords.length === 0 && <p className="empty-hint">这一天还没有记录，可以直接补记菜品。</p>}
              {selectedDateRecords.map((record) => (
                <li key={record.id} className="record-item">
                  <div className="record-main">
                    <strong>{record.option.label}</strong>
                    {record.option.meta?.isFavorite && <span className="favorite-badge small">心动</span>}
                    {record.option.calories ? <span className="record-calorie">{record.option.calories} kcal</span> : null}
                    {record.option.meta?.trafficLight && (
                      <span className="mini-tag" style={{ color: trafficColors[record.option.meta.trafficLight] }}>
                        {trafficLightLabels[record.option.meta.trafficLight]}
                      </span>
                    )}
                  </div>
                  <div className="record-sub">
                    <span>{sourceLabels[record.source]}</span>
                    {record.option.meta?.type && <span>{typeLabels[record.option.meta.type]}</span>}
                    <span>{formatDateTime(new Date(record.timestamp))}</span>
                  </div>
                  <div className="record-actions">
                    {hasFood(record.option.id) && (
                      <button type="button" onClick={() => onSelectFood(record.option.id)} aria-label="查看详情">
                        查看
                      </button>
                    )}
                    <button type="button" onClick={() => onDelete(record.id)} aria-label="删除记录">
                      删除
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </section>
  );
}

function buildDailySummary(records: SpinRecord[]) {
  if (!records.length) return '当天还没有抽取记录，补记后会自动生成点评。';
  return buildPeriodSummary(records, '当天');
}

function buildPeriodSummary(records: SpinRecord[], prefix: string) {
  if (!records.length) return `${prefix}还没有记录。`;

  const total = records.length;
  const meatCount = records.filter((record) => record.option.meta?.type === 'meat').length;
  const vegetarianCount = records.filter((record) => record.option.meta?.type === 'vegetarian').length;
  const soupCount = records.filter((record) => record.option.meta?.type === 'soup').length;
  const stapleCount = records.filter((record) => record.option.meta?.type === 'staple').length;
  const calories = records.map((record) => record.option.calories).filter((value): value is number => typeof value === 'number' && value > 0);
  const averageCalories = calories.length ? Math.round(calories.reduce((sum, value) => sum + value, 0) / calories.length) : 0;

  const structureComment = `分类分布为 荤食${meatCount} / 素食${vegetarianCount} / 汤品${soupCount} / 主食${stapleCount}`;
  const calorieComment = averageCalories ? `平均热量约 ${averageCalories} kcal` : '热量信息还不够完整';

  return `${prefix}共记录 ${total} 道菜，${structureComment}，${calorieComment}。`;
}

function buildCalendarMonth(year: number, month: number, recordMap: Record<string, SpinRecord[]>) {
  const firstDay = new Date(year, month - 1, 1);
  const lastDate = new Date(year, month, 0).getDate();
  const leadingBlanks = (firstDay.getDay() + 6) % 7;
  const days: Array<{ date: string; records: SpinRecord[] } | null> = Array.from({ length: leadingBlanks }, () => null);

  for (let day = 1; day <= lastDate; day += 1) {
    const dateText = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    days.push({
      date: dateText,
      records: (recordMap[dateText] ?? []).slice().sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1))
    });
  }

  return { month, days };
}

function parseDate(dateText: string) {
  const [year, month, day] = dateText.split('-').map(Number);
  return new Date(year, (month || 1) - 1, day || 1);
}

function getWeekStart(date: Date) {
  const current = new Date(date);
  const day = current.getDay() || 7;
  current.setHours(0, 0, 0, 0);
  current.setDate(current.getDate() - day + 1);
  return current;
}

function formatWeekRange(dateText: string) {
  const start = getWeekStart(parseDate(dateText));
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return `${formatDate(start)} - ${formatDate(end)}`;
}

function filterFoodsByName<T extends { name: string }>(foods: T[], keyword: string) {
  const normalized = keyword.trim().toLowerCase();
  if (!normalized) return foods;
  return foods.filter((food) => food.name.toLowerCase().includes(normalized));
}
