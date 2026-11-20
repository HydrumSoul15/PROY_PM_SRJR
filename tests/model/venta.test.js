import { PRODUCTOS_EJEMPLO as P } from '../../src/model/producto';
import { agregarAlCarrito, cambiarCantidad, conAvisosDeExistencias, gananciaCarrito, totalCarrito } from '../../src/model/carrito';
import {
  cancelarVenta, crearVenta, descontarExistencias, devolverExistencias, resumenDeVentas, ventasDeHoy, ventasDelPeriodo,
} from '../../src/model/venta';

const doritos = P[3];
const dosDoritos = agregarAlCarrito(agregarAlCarrito([], doritos), doritos);
const diasAtras = (n) => new Date(Date.now() - n * 24 * 3600 * 1000).toISOString();

describe('Cuenta', () => {
  test('juntar el mismo producto suma piezas y el total', () => {
    expect(dosDoritos).toHaveLength(1);
    expect(totalCarrito(dosDoritos)).toBe(64);
    expect(gananciaCarrito(dosDoritos)).toBe(16);
  });
  test('al llegar a 0 piezas el producto sale de la cuenta', () => {
    expect(cambiarCantidad(dosDoritos, doritos.codigo, -2)).toHaveLength(0);
    expect(cambiarCantidad(dosDoritos, doritos.codigo, -1)[0].cant).toBe(1);
  });
  test('avisa cuando se piden más piezas de las que hay', () => {
    const cuenta = [{ ...P[1], cant: 5 }, { ...doritos, cant: 1 }]; // galletas: solo 3 en existencias
    const [galletas, dor] = conAvisosDeExistencias(cuenta, P);
    expect(galletas).toMatchObject({ disponible: 3, excede: true });
    expect(dor.excede).toBe(false);
  });
});

describe('Venta', () => {
  const venta = crearVenta({ carrito: dosDoritos, metodo: 'efectivo', usuario: 'Dueño' });
  test('guarda total, ganancia y piezas', () => {
    expect(venta).toMatchObject({ total: 64, ganancia: 16, metodo: 'efectivo', usuario: 'Dueño' });
    expect(venta.items).toEqual([{ codigo: doritos.codigo, nombre: doritos.nombre, cant: 2 }]);
  });
  test('cobrar descuenta existencias y nunca baja de 0', () => {
    expect(descontarExistencias(P, dosDoritos)[3].stock).toBe(6);
    const muchas = [{ ...doritos, cant: 99 }];
    expect(descontarExistencias(P, muchas)[3].stock).toBe(0);
  });
  test('cancelar marca la venta y devuelve las piezas', () => {
    const ventas = cancelarVenta([venta], venta.id);
    expect(ventas[0].cancelada).toBe(true);
    expect(cancelarVenta(ventas, venta.id)[0].fechaCancelacion).toBe(ventas[0].fechaCancelacion); // no se cancela dos veces
    expect(devolverExistencias(descontarExistencias(P, dosDoritos), venta)[3].stock).toBe(8);
  });
});

describe('Resumen y periodos', () => {
  const hoy = { id: 1, fecha: diasAtras(0), metodo: 'efectivo', total: 100, ganancia: 30, items: [] };
  const tarjeta = { id: 2, fecha: diasAtras(0), metodo: 'tarjeta', total: 50, ganancia: 10, items: [] };
  const hace3 = { id: 3, fecha: diasAtras(3), metodo: 'efectivo', total: 20, ganancia: 5, items: [] };
  const hace20 = { id: 4, fecha: diasAtras(20), metodo: 'tarjeta', total: 40, ganancia: 8, items: [] };
  const todas = [hoy, tarjeta, hace3, hace20];

  test('separa hoy, 7 días y 30 días', () => {
    expect(ventasDeHoy(todas).map((v) => v.id)).toEqual([1, 2]);
    expect(ventasDelPeriodo(todas, 'semana').map((v) => v.id)).toEqual([1, 2, 3]);
    expect(ventasDelPeriodo(todas, 'mes')).toHaveLength(4);
  });
  test('suma efectivo y tarjeta', () => {
    expect(resumenDeVentas([hoy, tarjeta])).toEqual({ cantidad: 2, total: 150, ganancia: 40, efectivo: 100, tarjeta: 50 });
  });
  test('las ventas canceladas no cuentan en los totales', () => {
    expect(resumenDeVentas([hoy, { ...tarjeta, cancelada: true }])).toMatchObject({ cantidad: 1, total: 100, tarjeta: 0 });
  });
});
