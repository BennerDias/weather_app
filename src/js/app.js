import { getWeeklyForecast } from './api.js';
import { createWeeklyCards, createCurrentCard } from '../components/weatherCard.js';

function bgByCode(code) {
  const SUNNY = 'https://media.istockphoto.com/id/491701259/pt/foto/c%C3%A9u-azul-com-sol.jpg?s=612x612&w=0&k=20&c=RCRVeEg12zAf5zt_-gIjjJyiadxuP0-ulBEMT3ggaxM=';
  const RAINY = 'https://sonhosdeletras.com.br/wp-content/uploads/2012/01/dia-chuvoso.jpg';
  const CLOUDY = 'https://static3.depositphotos.com/1001594/133/i/450/depositphotos_1337800-stock-photo-the-night-sky-with-heavy.jpg';
  const SNOWY = 'https://static.vecteezy.com/ti/fotos-gratis/p2/6175465-arvores-em-dia-frio-de-inverno-neve-foto.jpg';
  if ([0,1].includes(code)) return SUNNY;
  if ([2,3,45,48].includes(code)) return CLOUDY;
  if ([51,53,55,56,57,61,63,65,66,67,80,81,82,95,96,99].includes(code)) return RAINY;
  if ([71,73,75,77,85,86].includes(code)) return SNOWY;
  return CLOUDY;
}

function ensureBgLayer() {
  let layer = document.getElementById('bg-layer');
  if (!layer) {
    layer = document.createElement('div');
    layer.id = 'bg-layer';
    Object.assign(layer.style, {
      position: 'fixed',
      inset: '0',
      zIndex: '-1',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      opacity: '0.9',
    });
    document.body.prepend(layer);
    // Remover gradient pré-definido do body via inline, substitui completamente
    document.body.style.background = 'none';
  }
  return layer;
}

async function renderCity(city) {
  const resultEl = document.getElementById('result');
  resultEl.textContent = '🔄 Buscando previsão...';
  try {
    const data = await getWeeklyForecast(city);

    // Atualizar background conforme clima atual
    const code = data.current_code ?? 3;
    const url = bgByCode(code);
    const layer = ensureBgLayer();
    layer.style.backgroundImage = `url('${url}')`;

    // Aplicar classes no body conforme o grupo climático
    const body = document.body;
    body.classList.remove('body--sunny', 'body--cloudy', 'body--rainy', 'body--snowy');
    if ([0,1].includes(code)) body.classList.add('body--sunny');
    else if ([2,3,45,48].includes(code)) body.classList.add('body--cloudy');
    else if ([51,53,55,56,57,61,63,65,66,67,80,81,82,95,96,99].includes(code)) body.classList.add('body--rainy');
    else if ([71,73,75,77,85,86].includes(code)) body.classList.add('body--snowy');

    resultEl.textContent = '';
    resultEl.innerHTML = '';

    // Card atual destacado
    const currentFrag = createCurrentCard({
      city: data.city,
      country: data.country,
      current: data.current,
    });
    resultEl.appendChild(currentFrag);

    // Grid semanal
    const cards = createWeeklyCards(data);
    resultEl.appendChild(cards);
  } catch (e) {
    resultEl.textContent = `❌ Não foi possível obter a previsão para "${city}".`;
    console.error(e);
  }
}

document.getElementById('search-btn').addEventListener('click', async () => {
  const city = document.getElementById('city-input').value;
  renderCity(city);
});

// Carregar Goiânia por padrão ao iniciar
window.addEventListener('DOMContentLoaded', () => {
  document.getElementById('city-input').value = 'Goiânia';
  renderCity('Goiânia');
});