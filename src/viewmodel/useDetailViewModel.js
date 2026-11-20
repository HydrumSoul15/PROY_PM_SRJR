// VIEWMODEL · Detalle de producto
// Maneja si se está viendo o editando, el formulario, el guardado y las fotos.
import { useState } from 'react';
import {
  formularioDeProducto, generarClave, nivelDeStock, productoDesdeFormulario, validarProducto,
} from '../model/producto';
import * as fotos from '../model/repository/fotos';
import { useAppViewModel } from './AppViewModel';

export function useDetailViewModel({ codigo, nuevo, copiaDe }) {
  const { permisos, products, findByCode, saveProduct, deleteProduct, addToCart } = useAppViewModel();
  const producto = findByCode(codigo);
  const base = findByCode(copiaDe || codigo || ''); // si es copia, parte de otro producto
  const [editando, setEditando] = useState(!!nuevo);
  const [form, setForm] = useState(() => formularioDeProducto(base, codigo, !!copiaDe));
  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));

  const claveNueva = generarClave(form, products);

  const cancelarEdicion = () => {
    setForm(formularioDeProducto(base, codigo, !!copiaDe));
    setEditando(false);
  };

  // Devuelve { ok: false, titulo, mensaje } o { ok: true, volver }
  const guardar = () => {
    if (!nuevo && !permisos.editarProductos)
      return { ok: false, titulo: 'Sin permiso', mensaje: 'Solo el dueño puede cambiar los datos de un producto.' };
    const error = validarProducto(form, products, !!nuevo);
    if (error) return { ok: false, ...error };
    saveProduct(productoDesdeFormulario(form, nuevo ? undefined : producto?.clave)); // la clave se genera sola al crear
    if (!nuevo) setEditando(false);
    return { ok: true, volver: !!nuevo };
  };

  // Devuelve 'sinPermiso' si el usuario no dio acceso a la cámara
  const pedirFoto = async (origen) => {
    const r = await origen();
    if (r?.sinPermiso) return 'sinPermiso';
    if (r) set('foto')(r.uri);
  };

  return {
    puedeVerCostos: permisos.verCostos,
    puedeEditar: permisos.editarProductos,
    puedeEliminar: permisos.eliminarProductos,
    producto,
    nuevo: !!nuevo,
    esCopia: !!copiaDe,
    nivel: producto ? nivelDeStock(producto) : 'ok',
    editando,
    empezarEdicion: () => permisos.editarProductos && setEditando(true),
    cancelarEdicion,
    form,
    set,
    claveMostrada: nuevo ? claveNueva : producto?.clave ?? claveNueva,
    guardar,
    tomarFoto: () => pedirFoto(fotos.tomarFoto),
    elegirFoto: () => pedirFoto(fotos.elegirFoto),
    eliminar: () => deleteProduct(producto.codigo),
    agregarALaCuenta: () => addToCart(producto),
  };
}
