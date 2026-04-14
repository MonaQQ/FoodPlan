import { useEffect, useMemo, useRef, useState } from 'react';
import { seasonLabels, trafficLightLabels, trafficColors } from '../constants';
import { FoodItem, Season, SpinnerOption } from '../types';
import { toSpinnerOption } from '../utils/food';
import { pickRandom } from '../utils/random';

type DailySpinnerProps = {
  foods: FoodItem[];
  season: Season;
  onResult: (option: SpinnerOption) => void;
  onInspectFood: (id: string) => void;
};

export function DailySpinner({ foods, season, onResult, onInspectFood }: DailySpinnerProps) {
  const options = useMemo(() => {
    return foods.filter((food) => food.seasons.includes(season)).map(toSpinnerOption);
  }, [foods, season]);

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
          setRollingLabel(`🎉 ${finalOption.label}`);
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
        <p className="panel-description">
          根据系统时间自动匹配当前时令菜，只需点击按钮即可获得今日灵感菜。
        </p>
      </header>

      <div className="spinner-wheel">
        <div className={`wheel ${isSpinning ? 'spinning' : ''}`}>
          <span>{rollingLabel}</span>
        </div>
        <button className="primary-btn" onClick={handleSpin} disabled={!options.length || isSpinning}>
          {isSpinning ? '选择中…' : '开始转盘'}
        </button>
        <p className="candidate-hint">
          当前候选：{options.length ? options.length : '暂无'} 道菜
        </p>
      </div>

      <div className="candidate-list">
        {options.map((option) => (
          <div key={option.id} className="candidate-item">
            <div>
              <strong>{option.label}</strong>
              <span className="candidate-calorie">{option.calories ?? '--'} kcal</span>
            </div>
            {option.meta?.trafficLight && (
              <span className="mini-tag" style={{ color: trafficColors[option.meta.trafficLight] }}>
                {trafficLightLabels[option.meta.trafficLight]}
              </span>
            )}
            <button className="ghost-link" onClick={() => onInspectFood(option.id)}>
              查看
            </button>
          </div>
        ))}
      </div>

      {lastResult && (
        <div className="result-card">
          <h3>今日菜品：{lastResult.label}</h3>
          <p>
            估算热量：<strong>{lastResult.calories ?? '--'} kcal</strong> · 红绿灯：
            {lastResult.meta?.trafficLight ? trafficLightLabels[lastResult.meta.trafficLight] : '—'}
          </p>
          <button className="ghost-link" onClick={() => onInspectFood(lastResult.id)}>
            查看详细食材
          </button>
        </div>
      )}
    </section>
  );
}
