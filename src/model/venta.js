// MODEL · Venta
import { gananciaCarrito, totalCarrito } from './carrito';

export const crearVenta = ({ carrito, metodo, usuario }) => ({
  id: Date.now(),
  fecha: new Date().toISOString(),
  metodo,
  total: totalCarrito(carrito),
  ganancia: gananciaCarrito(carrito),
  items: carrito.map((i) => ({ codigo: i.codigo, nombre: i.nombre, cant: i.cant })),
  usuario,
});

// Descuenta existencias automáticamente (nunca baja de 0)
export const descontarExistencias = (productos, carrito) =>
  productos.map((p) => {
    const i = carrito.find((x) => x.codigo === p.codigo);
    return i ? { ...p, stock: Math.max(0, p.stock - i.cant) } : p;
  });

// Cancelar no borra la venta: la marca como cancelada para que quede constancia
export const cancelarVenta = (ventas, id) =>
  ventas.map((v) => (v.id === id && !v.cancelada ? { ...v, cancelada: true, fechaCancelacion: new Date().toISOString() } : v));

// Las piezas de una venta cancelada regresan al inventario (si el producto sigue existiendo)
export const devolverExistencias = (productos, venta) =>
  productos.map((p) => {
    const i = venta.items.find((x) => x.codigo === p.codigo);
    return i ? { ...p, stock: p.stock + i.cant } : p;
  });

// Periodos que se pueden consultar en Ventas
export const PERIODOS = [
  { id: 'hoy', etiqueta: 'Hoy', titulo: 'Vendido hoy', dias: 1 },
  { id: 'semana', etiqueta: '7 días', titulo: 'Vendido en los últimos 7 días', dias: 7 },
  { id: 'mes', etiqueta: '30 días', titulo: 'Vendido en los últimos 30 días', dias: 30 },
];

export const ventasDelPeriodo = (ventas, periodoId) => {
  const p = PERIODOS.find((x) => x.id === periodoId) ?? PERIODOS[0];
  const inicio = new Date();
  inicio.setHours(0, 0, 0, 0);
  inicio.setDate(inicio.getDate() - (p.dias - 1));
  return ventas.filter((v) => new Date(v.fecha) >= inicio);
};
export const ventasDeHoy = (ventas) => ventasDelPeriodo(ventas, 'hoy');

// Totales: las ventas canceladas no cuentan
export const resumenDeVentas = (ventas) => {
  const validas = ventas.filter((v) => !v.cancelada);
  const suma = (lista) => lista.reduce((s, v) => s + v.total, 0);
  const total = suma(validas);
  const efectivo = suma(validas.filter((v) => v.metodo === 'efectivo'));
  return {
    cantidad: validas.length,
    total,
    ganancia: validas.reduce((s, v) => s + v.ganancia, 0),
    efectivo,
    tarjeta: total - efectivo,
  };
};
