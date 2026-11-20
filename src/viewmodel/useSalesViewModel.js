// VIEWMODEL · Ventas
// Entrega las ventas del periodo elegido, sus totales, cuál venta está desplegada y la cancelación.
import { useState } from 'react';
import { PERIODOS, resumenDeVentas, ventasDelPeriodo } from '../model/venta';
import { useAppViewModel } from './AppViewModel';

export function useSalesViewModel() {
  const { sales, permisos, cancelSale } = useAppViewModel();
  const [periodo, setPeriodo] = useState('hoy');
  const [abierta, setAbierta] = useState(null);
  const alternar = (id) => setAbierta((a) => (a === id ? null : id));

  const ventas = ventasDelPeriodo(sales, periodo);
  return {
    periodos: PERIODOS,
    periodo,
    setPeriodo,
    tituloPeriodo: PERIODOS.find((p) => p.id === periodo).titulo,
    ventas,
    resumen: resumenDeVentas(ventas),
    abierta,
    alternar,
    puedeCancelar: permisos.cancelarVentas,
    cancelar: cancelSale,
  };
}
