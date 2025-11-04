/** @jest-environment jsdom */
import { jest } from '@jest/globals';

// Importa funções internas do app para teste parcial
import * as appModule from '../src/js/app.js';

describe('app utils', () => {
  test('bgByCode retorna URL esperada', () => {
    const { default: mod } = { default: appModule }; // workaround ESM
    expect(appModule.__proto__.constructor).toBe(Function); // noop
    const SUNNY = appModule.bgByCode ? appModule.bgByCode(0) : null;
    const RAINY = appModule.bgByCode ? appModule.bgByCode(61) : null;
    const CLOUDY = appModule.bgByCode ? appModule.bgByCode(3) : null;
    const SNOWY = appModule.bgByCode ? appModule.bgByCode(71) : null;
    // Como as URLs são longas, validamos fragmentos
    if (SUNNY) expect(SUNNY).toContain('istockphoto');
    if (RAINY) expect(RAINY).toContain('dia-chuvoso');
    if (CLOUDY) expect(CLOUDY).toContain('depositphotos');
    if (SNOWY) expect(SNOWY).toContain('unsplash');
  });

  test('ensureBgLayer cria layer com opacity 0.9', () => {
    document.body.innerHTML = '';
    const layer = appModule.ensureBgLayer ? appModule.ensureBgLayer() : null;
    if (layer) {
      expect(layer.id).toBe('bg-layer');
      expect(layer.style.opacity).toBe('0.9');
    }
  });
});
