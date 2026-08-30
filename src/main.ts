import './styles.css';
import { HomeWorkoutApp } from './ui/app';

const root = document.querySelector<HTMLDivElement>('#app');
if (!root) throw new Error('App root is missing.');

new HomeWorkoutApp(root).start();

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => { void navigator.serviceWorker.register('/service-worker.js'); });
}
