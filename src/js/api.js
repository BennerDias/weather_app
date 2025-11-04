export async function getWeeklyForecast(cityName) {
  try {
    // 1) Geocoding da cidade (igual)
    const geoRes = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}`
    );
    const geoData = await geoRes.json();

    if (!geoData.results || geoData.results.length === 0) {
      throw new Error('Cidade não encontrada.');
    }

    const { latitude, longitude, name, country } = geoData.results[0];

    // 2) Previsão diária (8 dias: hoje + 7 futuros) + clima atual
    const weatherRes = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}` +
        `&current_weather=true` +
        `&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,windspeed_10m_max,weathercode,sunrise,sunset` +
        `&forecast_days=8` +  // Adicionado: garante 8 dias (hoje + 7 futuros)
        `&timezone=auto`
    );

    const weatherData = await weatherRes.json();
    const { daily } = weatherData;

    if (!daily) throw new Error('Dados diários indisponíveis.');

    // 3) Card grande (dia atual) - igual
    const current = {
      time: weatherData.current_weather?.time ?? new Date().toISOString(),
      temperature: weatherData.current_weather?.temperature ?? null,
      windspeed: weatherData.current_weather?.windspeed ?? null,
      weathercode: weatherData.current_weather?.weathercode ?? null,
      temp_max: daily.temperature_2m_max?.[0] ?? null,
      temp_min: daily.temperature_2m_min?.[0] ?? null,
      precipitation_probability: daily.precipitation_probability_max?.[0] ?? null,
    };

    // 4) Cards pequenos (7 dias a partir de amanhã)
    const startIndex = 1;  // Agora começa de amanhã (índice 1)
    const maxDays = 7;     // Fixo em 7, já que queremos exatamente 7 mini cards

    const days = Array.from({ length: maxDays }, (_, i) => {
      const idx = startIndex + i;  // idx = 1, 2, 3, ..., 7
      return {
        date: daily.time[idx],
        temp_max: daily.temperature_2m_max[idx],
        temp_min: daily.temperature_2m_min[idx],
        precipitation_probability: daily.precipitation_probability_max?.[idx] ?? null,
        windspeed_max: daily.windspeed_10m_max?.[idx] ?? null,
        weathercode: daily.weathercode?.[idx] ?? null,
        sunrise: daily.sunrise?.[idx] ?? null,
        sunset: daily.sunset?.[idx] ?? null,
      };
    });

    // 5) Retorno completo - igual
    return {
      city: name,
      country,
      latitude,
      longitude,
      current_code: weatherData.current_weather?.weathercode ?? null,
      current, // card grande (hoje)
      days, // cards pequenos (7 dias seguintes a partir de amanhã)
    };

  } catch (error) {
    console.error('Erro ao buscar previsão semanal:', error);
    throw error;
  }
}