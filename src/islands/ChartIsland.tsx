import InteractiveChart from '../components/InteractiveChart';
import type { ChartConfig } from '../content/types';
import { mountIsland } from './mount';
import './chart.css';

export function mount(el: HTMLElement, config: ChartConfig) {
  mountIsland(el, <InteractiveChart config={config} />);
}
