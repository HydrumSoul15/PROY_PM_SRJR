import { calcularCobro, opcionesDeEfectivo } from '../../src/model/cobro';

describe('Cobro en efectivo', () => {
  test('calcula el cambio cuando el efectivo alcanza', () => {
    expect(calcularCobro(64, '100')).toEqual({ importe: 64, cambio: 36, alcanza: true });
  });
  test('no alcanza si el efectivo es menor al total', () => {
    expect(calcularCobro(64, '50').alcanza).toBe(false);
    expect(calcularCobro(64, '50').cambio).toBe(-14);
  });
  test('no alcanza mientras no se escriba nada', () => {
    expect(calcularCobro(64, '').alcanza).toBe(false);
  });
  test('redondea a centavos para evitar errores de decimales', () => {
    expect(calcularCobro(33.300000000000004, '50').cambio).toBe(16.7);
  });
  test('sugiere "Exacto" y hasta 3 billetes que alcanzan', () => {
    expect(opcionesDeEfectivo(64).map((o) => o.etiqueta)).toEqual(['Exacto', '$100', '$200', '$500']);
    expect(opcionesDeEfectivo(900).map((o) => o.etiqueta)).toEqual(['Exacto', '$1000']);
  });
});
