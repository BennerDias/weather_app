import { getWeeklyForecast } from '../src/js/api.js';

function mockFetchSequence(responses) {
  let call = 0;
  global.fetch = jest.fn(async (url) => {
    const res = responses[call++];
    if (res instanceof Error) throw res;
    return {
      async json() { return res; },
      ok: true,
      status: 200,
      url
    };
  });
}

describe('API:getWeeklyForecast', () => {
  test('retorna dados semanais e atuais com sucesso', async () => {
    const geo = { results: [{ latitude: -16.68, longitude: -49.25, name: 'Goiânia', country: 'Brazil' }] };
    const weather = {
      current_weather: { time: '2025-01-01T12:00', temperature: 30, windspeed: 10, weathercode: 1 },
      daily: {
        time: ['2025-01-01','2025-01-02','2025-01-03','2025-01-04','2025-01-05','2025-01-06','2025-01-07','2025-01-08'],
        temperature_2m_max: [32,33,29,28,27,31,30,26],
        temperature_2m_min: [22,21,19,18,17,20,19,16],
        precipitation_probability_max: [10,20,30,40,50,60,70,80],
        windspeed_10m_max: [12,13,14,15,16,17,18,19],
        weathercode: [1,3,61,71,95,2,0,45],
        sunrise: ['2025-01-01T06:00','2025-01-02T06:00','2025-01-03T06:00','2025-01-04T06:00','2025-01-05T06:00','2025-01-06T06:00','2025-01-07T06:00','2025-01-08T06:00'],
        sunset:  ['2025-01-01T18:00','2025-01-02T18:00','2025-01-03T18:00','2025-01-04T18:00','2025-01-05T18:00','2025-01-06T18:00','2025-01-07T18:00','2025-01-08T18:00']
      }
    };
    mockFetchSequence([geo, weather]);
    const data = await getWeeklyForecast('Goiânia');
    expect(data.city).toBe('Goiânia');
    expect(data.current.temperature).toBe(30);
    expect(data.days).toHaveLength(7);
    expect(data.days[0]).toHaveProperty('temp_max');
    expect(data.current_code).toBe(1);
  });

  test('cidade não encontrada', async () => {
    const geo = { results: [] };
    mockFetchSequence([geo]);
    await expect(getWeeklyForecast('CidadeInexistente')).rejects.toThrow('Cidade não encontrada.');
  });

  test('dados diários indisponíveis', async () => {
    const geo = { results: [{ latitude: 0, longitude: 0, name: 'X', country: 'Y' }] };
    const weather = { current_weather: { time: '2025-01-01T12:00', temperature: 25, windspeed: 8, weathercode: 3 } };
    mockFetchSequence([geo, weather]);
    await expect(getWeeklyForecast('X')).rejects.toThrow('Dados diários indisponíveis.');
  });

  test('menos de 8 dias no daily', async () => {
    const geo = { results: [{ latitude: 0, longitude: 0, name: 'X', country: 'Y' }] };
    const weather = {
      current_weather: { time: '2025-01-01T12:00', temperature: 25, windspeed: 8, weathercode: 3 },
      daily: {
        time: ['2025-01-01','2025-01-02','2025-01-03'],
        temperature_2m_max: [28,29,27],
        temperature_2m_min: [18,17,16],
        precipitation_probability_max: [10,20,30],
        windspeed_10m_max: [10,12,11],
        weathercode: [3,61,2]
      }
    };
    mockFetchSequence([geo, weather]);
    const data = await getWeeklyForecast('X');
    // Deve retornar a partir de amanhã: só 2 dias possíveis
    expect(data.days.length).toBe(2);
  });
});
