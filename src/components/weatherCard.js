const WEATHER_CODE_MAP = [
  // Simplified mapping groups
  { codes: [0, 1], bg: 'sun.png', label: 'Ensolarado' },
  { codes: [2, 3], bg: 'cloud.png', label: 'Parcialmente nublado' },
  { codes: [45, 48], bg: 'cloud.png', label: 'Neblina' },
  { codes: [51, 53, 55, 61, 63, 65, 80, 81, 82], bg: 'rain.png', label: 'Chuva' },
  { codes: [56, 57, 66, 67, 71, 73, 75, 77, 85, 86], bg: 'sun-rain.png', label: 'Neve/Granizo' },
  { codes: [95, 96, 99], bg: 'rain.png', label: 'Tempestade' },
];

function pickBgByWeatherCode(code) {
  // Mapear para URLs externas
  const SUNNY = 'https://media.istockphoto.com/id/491701259/pt/foto/c%C3%A9u-azul-com-sol.jpg?s=612x612&w=0&k=20&c=RCRVeEg12zAf5zt_-gIjjJyiadxuP0-ulBEMT3ggaxM=';
  const RAINY = 'https://sonhosdeletras.com.br/wp-content/uploads/2012/01/dia-chuvoso.jpg';
  const CLOUDY = 'https://static3.depositphotos.com/1001594/133/i/450/depositphotos_1337800-stock-photo-the-night-sky-with-heavy.jpg';
  const SNOWY = 'https://static.vecteezy.com/ti/fotos-gratis/p2/6175465-arvores-em-dia-frio-de-inverno-neve-foto.jpg';

  if ([0,1].includes(code)) return SUNNY; // ensolarado
  if ([2,3,45,48].includes(code)) return CLOUDY; // nublado/neblina
  if ([51,53,55,56,57,61,63,65,66,67,80,81,82,95,96,99].includes(code)) return RAINY; // chuvoso/tempestade
  if ([71,73,75,77,85,86].includes(code)) return SNOWY; // nevando
  return CLOUDY;
}

function formatDateISOToBR(isoDate) {
  const d = new Date(isoDate);
  return d.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' });
}

export function createWeeklyCards({ city, country, days }) {
  const wrapper = document.createElement('div');
  wrapper.className = 'weekly-grid';

  const header = document.createElement('div');
  header.className = 'weekly-header';
  header.innerHTML = `<h2>${city}, ${country}</h2><p>Previsão para 7 dias (a partir de amanhã)</p>`;
  wrapper.appendChild(header);

  const grid = document.createElement('div');
  grid.className = 'cards-grid';
  wrapper.appendChild(grid);

  days.forEach(d => {
    const card = document.createElement('div');
    card.className = 'day-card';
    const bgImg = pickBgByWeatherCode(d.weathercode ?? 3);
    card.style.backgroundImage = `url('${bgImg}')`;

    const ppt = d.precipitation_probability != null ? `${d.precipitation_probability}%` : '—';
    const wind = d.windspeed_max != null ? `${d.windspeed_max} km/h` : '—';

    card.innerHTML = `
      <div class="overlay">
        <div class="date">${formatDateISOToBR(d.date)}</div>
        <div class="temps">
          <span class="tmax">↑ ${Math.round(d.temp_max)}°C</span>
          <span class="tmin">↓ ${Math.round(d.temp_min)}°C</span>
        </div>
        <div class="meta">
          <span>🌧️ ${ppt}</span>
          <span>💨 ${wind}</span>
        </div>
        ${d.sunrise || d.sunset ? `<div class="sun-times">🌅 ${d.sunrise?.slice(11,16) ?? ''} · 🌇 ${d.sunset?.slice(11,16) ?? ''}</div>` : ''}
      </div>
    `;

    grid.appendChild(card);
  });

  return wrapper;
}

export function createCurrentCard({ city, country, current }) {
  const { time, temperature, windspeed, precipitation_probability, temp_max, temp_min, weathercode } = current;
  const card = document.createElement('div');
  card.className = 'current-card';

  const bg = pickBgByWeatherCode(weathercode ?? 3);
  // sem imagem interna, usamos overlay escuro no CSS

  const left = document.createElement('div');
  left.className = 'left';
  left.innerHTML = `
    <div class="when">${new Date(time).toLocaleString('pt-BR')}</div>
    <div class="temps"><span class="tmax">↑ ${Math.round(temp_max)}°C</span> <span class="tmin">↓ ${Math.round(temp_min)}°C</span></div>
    <div class="current-meta"><span>�� ${windspeed} km/h</span><span>🌧️ ${precipitation_probability ?? '—'}%</span></div>
  `;

  const right = document.createElement('div');
  right.className = 'right';
  right.innerHTML = `
    <div class="now">Agora</div>
    <div class="now-temp" style="font-size:2.4rem;font-weight:700;">${Math.round(temperature)}°C</div>
  `;

  card.appendChild(left);
  card.appendChild(right);

  const cityName = document.createElement('div');
  cityName.className = 'city-name';
  cityName.textContent = `${city}, ${country}`;

  const frag = document.createDocumentFragment();
  frag.appendChild(card);
  frag.appendChild(cityName);
  return frag;
}