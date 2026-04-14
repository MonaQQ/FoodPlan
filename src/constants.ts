import { DateTag, FoodNature, Season, TrafficLight } from './types';

export const seasonLabels: Record<Season, string> = {
  spring: '春令',
  summer: '夏令',
  autumn: '秋令',
  winter: '冬令'
};

export const dateTagLabels: Record<DateTag, string> = {
  weekday: '工作日',
  weekend: '周末',
  festival: '节庆'
};

export const trafficLightLabels: Record<TrafficLight, string> = {
  green: '绿色（可常吃）',
  yellow: '黄色（适量）',
  red: '红色（偶尔）'
};

export const typeLabels: Record<FoodNature, string> = {
  vegetarian: '素食',
  meat: '荤食'
};

export const trafficColors: Record<TrafficLight, string> = {
  green: '#22c55e',
  yellow: '#f59e0b',
  red: '#ef4444'
};
