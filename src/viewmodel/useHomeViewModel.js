// VIEWMODEL · Inicio
// Prepara lo que Inicio muestra: quién es el usuario, el resumen del día y lo que falta surtir.
import { resumenDeVentas } from '../model/venta';
import { useAppViewModel } from './AppViewModel';

export function useHomeViewModel() {
  const { user, permisos, logout, cart, salesToday, lowStock, errorGuardado } = useAppViewModel();
  return {
    nombre: user.nombre,
    verResumen: permisos.verVentas,
    puedeIrAAjustes: permisos.gestionarUsuarios,
    errorGuardado,
    resumen: resumenDeVentas(salesToday),
    porSurtir: lowStock,
    hayCuentaAbierta: cart.length > 0,
    cerrarSesion: logout,
  };
}
