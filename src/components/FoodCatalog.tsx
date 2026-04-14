import { useMemo } from 'react';
import { dateTagLabels, seasonLabels, trafficColors, trafficLightLabels, typeLabels } from '../constants';
import { DateTag, FoodItem, FoodNature, Season, TrafficLight } from '../types';

export type FilterState = {
  season: Season | 'all';
  dateTag: DateTag | 'all';
  traffic: TrafficLight | 'all';
  type: FoodNature | 'all';
};

type FoodCatalogProps = {
  foods: FoodItem[];
  filters: FilterState;
  onFilterChange: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
  onSelectFood: (id: string) => void;
};

export function FoodCatalog({ foods, filters, onFilterChange, onSelectFood }: FoodCatalogProps) {
  const filteredFoods = useMemo(() => {
    return foods.filter((food) => {
      const matchSeason = filters.season === 'all' || food.seasons.includes(filters.season);
      const matchDate = filters.dateTag === 'all' || food.dateTags.includes(filters.dateTag);
      const matchTraffic = filters.traffic === 'all' || food.trafficLight === filters.traffic;
      const matchType = filters.type === 'all' || food.type === filters.type;
      return matchSeason && matchDate && matchTraffic && matchType;
    });
  }, [foods, filters]);

  return (
    <section className="panel catalog-panel">
      <header className="panel-header">
        <div>
          <p className="eyebrow">饮食分类</p>
          <h2>常见食材热量与类别</h2>
        </div>
        <p className="panel-description">
          通过时令、日期、红绿灯与素荤分类快速定位，所有食材都标注了热量，方便搭配。
        </p>
      </header>

      <div className="filters-row">
        <FilterSelect
          label="时令"
          value={filters.season}
          options={withAllOption(seasonLabels)}
          onChange={(value) => onFilterChange('season', value as FilterState['season'])}
        />
        <FilterSelect
          label="日期场景"
          value={filters.dateTag}
          options={withAllOption(dateTagLabels)}
          onChange={(value) => onFilterChange('dateTag', value as FilterState['dateTag'])}
        />
        <FilterSelect
          label="红绿灯"
          value={filters.traffic}
          options={withAllOption(trafficLightLabels)}
          onChange={(value) => onFilterChange('traffic', value as FilterState['traffic'])}
        />
        <FilterSelect
          label="素/荤"
          value={filters.type}
          options={withAllOption(typeLabels)}
          onChange={(value) => onFilterChange('type', value as FilterState['type'])}
        />
      </div>

      <div className="food-grid">
        {filteredFoods.map((food) => (
          <article
            key={food.id}
            className="food-card"
            role="button"
            tabIndex={0}
            onClick={() => onSelectFood(food.id)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onSelectFood(food.id);
              }
            }}
          >
            <div className="food-card-header">
              <h3>{food.name}</h3>
              <span className="calorie-tag">{food.calories} kcal / 100g</span>
            </div>
            <p className="food-description">{food.description}</p>
            <div className="food-tags">
              <Tag color="var(--color-primary)" label={typeLabels[food.type]} />
              <Tag color={trafficColors[food.trafficLight]} label={trafficLightLabels[food.trafficLight]} />
              <Tag color="#0891b2" label={food.seasons.map((s) => seasonLabels[s]).join(' · ')} />
              <Tag color="#7c3aed" label={food.dateTags.map((d) => dateTagLabels[d]).join(' · ')} />
            </div>
            <div className="nutrients-row">
              {food.nutrients.map((nutrient) => (
                <span key={nutrient} className="nutrient-chip">
                  {nutrient}
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

type FilterSelectProps = {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
};

function FilterSelect({ label, value, options, onChange }: FilterSelectProps) {
  return (
    <label className="filter-select">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function Tag({ label, color }: { label: string; color: string }) {
  return (
    <span className="tag-chip" style={{ backgroundColor: `${color}22`, color }}>
      {label}
    </span>
  );
}

function withAllOption<T extends string>(map: Record<string, string>) {
  return [{ value: 'all', label: '全部' }, ...Object.entries(map).map(([value, label]) => ({ value, label }))];
}
