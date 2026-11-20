// VIEW · Formato de textos y colores para mostrar en pantalla
import { colores } from './theme';

// 1234.5 -> $1,234.50
export const peso = (n) => '$' + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

// "Viernes, 30 de octubre"
export const fechaLarga = () => {
  const f = new Date().toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' });
  return f.charAt(0).toUpperCase() + f.slice(1);
};

// Color y texto de las existencias según el nivel que calcula el Modelo ('agotado' | 'bajo' | 'ok')
export const estiloDeStock = (nivel, stock) =>
  ({
    agotado: { texto: 'Agotado', fondo: '#ffebee', tinta: colores.rojo },
    bajo: { texto: `${stock} pzas`, fondo: '#fff3e0', tinta: colores.naranja },
    ok: { texto: `${stock} pzas`, fondo: '#e8f5e9', tinta: colores.verdeOscuro },
  })[nivel];

// 02:35 p. m.
export const horaCorta = (iso) => new Date(iso).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });

// lun, 26 oct, 02:35 p. m.
export const diaYHora = (iso) =>
  new Date(iso).toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'short' }) + ', ' + horaCorta(iso);
