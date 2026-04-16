import { useEffect, useMemo, useRef, useState } from 'react';
import { seasonLabels, trafficColors, trafficLightLabels } from '../constants';
import { FoodItem, Season, SpinnerOption } from '../types';
import { toSpinnerOption } from '../utils/food';
import { pickRandom } from '../utils/random';

type DailySpinnerProps = {
  foods: FoodItem[];
  season: Season;
  onResult: (option: SpinnerOption) => void;
  onInspectFood: (id: string) => void;
  onToggleFavorite: (id: string) => void;
};

export function DailySpinner({ foods, season, onResult, onInspectFood, onToggleFavorite }: DailySpinnerProps) {
  const options = useMemo(() => foods.filter((food) => food.seasons.includes(season)).map(toSpinnerOption), [foods, season]);

  const [isSpinning, setIsSpinning] = useState(false);
  const [rollingLabel, setRollingLabel] = useState('点击开始转盘');
  const [lastResult, setLastResult] = useState<SpinnerOption | null>(null);
  const rollingTimer = useRef<number>();

  useEffect(() => {
    return () => {
      rollingTimer.current && window.clearInterval(rollingTimer.current);
    };
  }, []);

  const handleSpin = () => {
    if (!options.length || isSpinning) return;
    setIsSpinning(true);
    let ticks = 0;
    rollingTimer.current && window.clearInterval(rollingTimer.current);
    rollingTimer.current = window.setInterval(() => {
      const sample = pickRandom(options);
      setRollingLabel(sample ? sample.label : '等待食材');
      ticks += 1;
      if (ticks >= 20) {
        rollingTimer.current && window.clearInterval(rollingTimer.current);
        const finalOption = pickRandom(options);
        if (finalOption) {
          setLastResult(finalOption);
          setRollingLabel(`今日推荐：${finalOption.label}`);
          onResult(finalOption);
        }
        setIsSpinning(false);
      }
    }, 90);
  };

  return (
    <section className="panel spinner-panel">
      <header className="panel-header">
        <div>
          <p className="eyebrow">每日推荐</p>
          <h2>{seasonLabels[season]}时令转盘</h2>
        </div>
        <p className="panel-description">根据当前时令抽取今日灵感菜，也可以顺手把喜欢的菜标成心动菜单。</p>
      </header>

      <div className="spinner-wheel">
        <div className={`wheel ${isSpinning ? 'spinning' : ''}`}>
          <span>{rollingLabel}</span>
        </div>
        <button className="primary-btn" onClick={handleSpin} disabled={!options.length || isSpinning}>
          {isSpinning ? '选择中…' : '开始转盘'}
        </button>
        <p className="candidate-hint">当前候选：{options.length ? options.length : '暂无'} 道菜</p>
      </div>

      <div className="candidate-list">
        {options.map((option) => (
          <div key={option.id} className="candidate-item">
            <div>
              <strong>{option.label}</strong>
              <span className="candidate-calorie">{option.calories ?? '--'} kcal</span>
              {option.meta?.isFavorite && <span className="inline-favorite">心动</span>}
            </div>
            <div className="candidate-actions">
              {option.meta?.trafficLight && (
                <span className="mini-tag" style={{ color: trafficColors[option.meta.trafficLight] }}>
                  {trafficLightLabels[option.meta.trafficLight]}
                </span>
              )}
              <button className="ghost-link" onClick={() => onToggleFavorite(option.id)}>
                {option.meta?.isFavorite ? '取消心动' : '标记心动'}
              </button>
              <button className="ghost-link" onClick={() => onInspectFood(option.id)}>
                查看
              </button>
            </div>
          </div>
        ))}
      </div>

      {lastResult && (
        <div className="result-card">
          <h3>今日菜品：{lastResult.label}</h3>
          <p>
            估算热量：<strong>{lastResult.calories ?? '--'} kcal</strong> · 红绿灯：
            {lastResult.meta?.trafficLight ? trafficLightLabels[lastResult.meta.trafficLight] : '--'}
          </p>
          <div className="result-actions">
            <button className="ghost-link" onClick={() => onToggleFavorite(lastResult.id)}>
              {lastResult.meta?.isFavorite ? '取消心动' : '加入心动菜单'}
            </button>
            <button className="ghost-link" onClick={() => onInspectFood(lastResult.id)}>
              查看详细食材
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
