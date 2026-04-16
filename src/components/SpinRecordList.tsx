import { formatDate, formatDateTime } from '../utils/date';
import { SpinRecord } from '../types';
import { trafficColors, trafficLightLabels, typeLabels } from '../constants';

type SpinRecordListProps = {
  records: SpinRecord[];
  onDelete: (id: string) => void;
  onSelectFood: (id: string) => void;
  hasFood: (id: string) => boolean;
};

const sourceLabels: Record<SpinRecord['source'], string> = {
  daily: '每日推荐',
  custom: '自定义转盘'
};

export function SpinRecordList({ records, onDelete, onSelectFood, hasFood }: SpinRecordListProps) {
  const groupedRecords = records.reduce<Record<string, SpinRecord[]>>((acc, record) => {
    const dateKey = formatDate(new Date(record.timestamp));
    acc[dateKey] ??= [];
    acc[dateKey].push(record);
    return acc;
  }, {});

  const sortedEntries = Object.entries(groupedRecords).sort(([left], [right]) => (left < right ? 1 : -1));

  return (
    <section className="panel record-panel">
      <header className="panel-header">
        <div>
          <p className="eyebrow">历史记录</p>
          <h2>按日期整理的抽取记录</h2>
        </div>
        <p className="panel-description">同一天的菜品会自动归档在一起，并生成一段简单点评。</p>
      </header>

      {sortedEntries.length === 0 && <p className="empty-hint">暂无记录，先去转盘试试吧！</p>}

      <div className="record-group-list">
        {sortedEntries.map(([dateKey, dayRecords]) => (
          <section key={dateKey} className="record-group">
            <div className="record-group-header">
              <div>
                <h3>{dateKey}</h3>
                <p>{buildDailySummary(dayRecords)}</p>
              </div>
              <span className="record-group-count">{dayRecords.length} 条记录</span>
            </div>

            <ul className="record-list">
              {dayRecords
                .slice()
                .sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1))
                .map((record) => (
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
                        <button onClick={() => onSelectFood(record.option.id)} aria-label="查看详情">
                          查看
                        </button>
                      )}
                      <button onClick={() => onDelete(record.id)} aria-label="删除记录">
                        删除
                      </button>
                    </div>
                  </li>
                ))}
            </ul>
          </section>
        ))}
      </div>
    </section>
  );
}

function buildDailySummary(records: SpinRecord[]) {
  const total = records.length;
  const favoriteCount = records.filter((record) => record.option.meta?.isFavorite).length;
  const meatCount = records.filter((record) => record.option.meta?.type === 'meat').length;
  const vegetarianCount = records.filter((record) => record.option.meta?.type === 'vegetarian').length;
  const calories = records.map((record) => record.option.calories).filter((value): value is number => typeof value === 'number' && value > 0);
  const averageCalories = calories.length ? Math.round(calories.reduce((sum, value) => sum + value, 0) / calories.length) : 0;

  const balanceComment =
    meatCount && vegetarianCount
      ? `荤素搭配 ${meatCount}:${vegetarianCount}`
      : meatCount
        ? '这天偏荤，适合下一餐补点清爽蔬菜'
        : '这天整体偏清爽，适合保持轻负担节奏';

  const favoriteComment = favoriteCount ? `其中有 ${favoriteCount} 道心动菜` : '还没有标记心动菜';
  const calorieComment = averageCalories ? `平均热量约 ${averageCalories} kcal` : '热量信息还不够完整';

  return `当天共抽到 ${total} 道菜，${balanceComment}，${favoriteComment}，${calorieComment}。`;
}
