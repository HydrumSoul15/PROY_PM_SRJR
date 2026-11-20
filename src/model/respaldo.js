// MODEL · Respaldo
// Revisa que un archivo de respaldo (o lo guardado en el teléfono) tenga la forma correcta antes de usarlo,
// para que un archivo dañado o equivocado no rompa la app.
import { USUARIOS_INICIALES } from './usuarios';

const esTexto = (v) => typeof v === 'string';
const esNumero = (v) => typeof v === 'number' && !isNaN(v);

const esProducto = (p) => !!p && esTexto(p.codigo) && esTexto(p.nombre) && esNumero(p.venta) && esNumero(p.compra) && esNumero(p.stock);
const esVenta = (v) => !!v && esNumero(v.id) && esTexto(v.fecha) && esNumero(v.total) && esNumero(v.ganancia) && Array.isArray(v.items);
const esUsuario = (u) =>
  !!u && esTexto(u.id) && esTexto(u.email) && esTexto(u.nombre) && esTexto(u.sal) && esTexto(u.hash) && (u.rol === 'dueño' || u.rol === 'empleado');

// Devuelve { products, sales, users } listo para usar, o null si el archivo no sirve.
// Si los usuarios no vienen (respaldos anteriores) o no hay dueño, se usan los iniciales.
export const normalizarDatos = (d) => {
  if (!d || !Array.isArray(d.products) || !Array.isArray(d.sales)) return null;
  if (!d.products.every(esProducto) || !d.sales.every(esVenta)) return null;
  const usuariosValidos = Array.isArray(d.users) && d.users.every(esUsuario) && d.users.some((u) => u.rol === 'dueño');
  return { products: d.products, sales: d.sales, users: usuariosValidos ? d.users : USUARIOS_INICIALES };
};
