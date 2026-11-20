// VIEWMODEL · Cobro
// Lleva el efectivo recibido, pide al Modelo el cambio y las sugerencias, y registra la venta.
import { useState } from 'react';
import { conAvisosDeExistencias } from '../model/carrito';
import { calcularCobro, opcionesDeEfectivo } from '../model/cobro';
import { useAppViewModel } from './AppViewModel';

export function useCartViewModel() {
  const { cart, products, total, changeQty, checkout } = useAppViewModel();
  const [recibido, setRecibido] = useState('');
  const [confirmacion, setConfirmacion] = useState(null); // datos de la venta recién cobrada

  const { importe, cambio, alcanza } = calcularCobro(total, recibido);
  const opciones = opcionesDeEfectivo(importe);
  const cuenta = conAvisosDeExistencias(cart, products); // cada producto trae "disponible" y "excede"

  const cobrar = (metodo) => {
    setConfirmacion({ metodo, total: importe, cambio: metodo === 'efectivo' ? cambio : 0 });
    checkout(metodo);
    setRecibido('');
  };

  return {
    cuenta,
    hayExceso: cuenta.some((i) => i.excede),
    importe,
    recibido,
    setRecibido,
    cambio,
    alcanza,
    opciones,
    cambiarCantidad: changeQty,
    cobrar,
    confirmacion,
    cerrarConfirmacion: () => setConfirmacion(null),
  };
}
