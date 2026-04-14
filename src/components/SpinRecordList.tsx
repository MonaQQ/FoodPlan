import { formatDateTime } from '../utils/date';
import { SpinRecord } from '../types';
import { trafficColors, trafficLightLabels } from '../constants';

type SpinRecordListProps = {
  records: SpinRecord[];
  onDelete: (id: string) => void;
  onMove: (id: string, direction: 'up' | 'down') => void;
  onSelectFood: (id: string) => void;
  hasFood: (id: string) => boolean;
};

const sourceLabels: Record<SpinRecord['source'], string> = {
  daily: '每日推荐',
  custom: '自定义转盘'
};

export function SpinRecordList({ records, onDelete, onMove, onSelectFood, hasFood }: SpinRecordListProps) {
  return (
    <section className="panel record-panel">
      <header className="panel-header">
        <div>
          <p className="eyebrow">历史记录</p>
          <h2>已抽取菜品（无限容量）</h2>
        </div>
        <p className="panel-description">可随时调整排列顺序或删除，方便备忘与分享。</p>
      </header>

      <ul className="record-list">
        {records.map((record, index) => (
          <li key={record.id} className="record-item">
            <div className="record-main">
              <strong>{record.option.label}</strong>
              {record.option.calories && <span className="record-calorie">{record.option.calories} kcal</span>}
              {record.option.meta?.trafficLight && (
                <span
                  className="mini-tag"
                  style={{ color: trafficColors[record.option.meta.trafficLight] }}
                >
                  {trafficLightLabels[record.option.meta.trafficLight]}
                </span>
              )}
            </div>
            <div className="record-sub">
              <span>{sourceLabels[record.source]}</span>
              <span>{formatDateTime(new Date(record.timestamp))}</span>
            </div>
            <div className="record-actions">
              {hasFood(record.option.id) && (
                <button onClick={() => onSelectFood(record.option.id)} aria-label="查看详情">
                  查
                </button>
              )}
              <button onClick={() => onMove(record.id, 'up')} disabled={index === 0} aria-label="向前移动">
                ↑
              </button>
              <button
                onClick={() => onMove(record.id, 'down')}
                disabled={index === records.length - 1}
                aria-label="向后移动"
              >
                ↓
              </button>
              <button onClick={() => onDelete(record.id)} aria-label="删除记录">
                删除
              </button>
            </div>
          </li>
        ))}
      </ul>

      {records.length === 0 && <p className="empty-hint">暂无记录，先去转盘试试吧！</p>}
    </section>
  );
}
