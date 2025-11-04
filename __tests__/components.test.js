/** @jest-environment jsdom */
import { createWeeklyCards, createCurrentCard } from '../src/components/weatherCard.js';

const sample = {
  city: 'Goiânia',
  country: 'Brazil',
  days: Array.from({length:7}).map((_,i)=>({
    date: `2025-01-0${i+2}`,
    temp_max: 30+i,
    temp_min: 20+i,
    precipitation_probability: 10*i,
    windspeed_max: 10+i,
    weathercode: [1,3,61,71,95,2,0][i],
    sunrise: `2025-01-0${i+2}T06:00`,
    sunset: `2025-01-0${i+2}T18:00`,
  }))
};

describe('components: createWeeklyCards', () => {
  test('monta 7 cards com dados esperados', () => {
    const el = createWeeklyCards(sample);
    expect(el.querySelector('.weekly-header h2').textContent).toContain('Goiânia');
    const cards = el.querySelectorAll('.day-card');
    expect(cards.length).toBe(7);
    // verificação de textos e classes
    expect(cards[0].querySelector('.temps .tmax').textContent).toMatch(/\d+°C/);
    expect(cards[0].style.backgroundImage).toContain('url(');
  });
});

describe('components: createCurrentCard', () => {
  test('monta card atual com cidade em destaque abaixo', () => {
    const frag = createCurrentCard({
      city: 'Goiânia',
      country: 'Brazil',
      current: {
        time: '2025-01-01T12:00',
        temperature: 30,
        windspeed: 12,
        precipitation_probability: 20,
        temp_max: 33,
        temp_min: 22,
        weathercode: 1,
      }
    });
    const wrapper = document.createElement('div');
    wrapper.appendChild(frag);
    const current = wrapper.querySelector('.current-card');
    expect(current).toBeTruthy();
    expect(wrapper.querySelector('.city-name').textContent).toContain('Goiânia');
  });
});
