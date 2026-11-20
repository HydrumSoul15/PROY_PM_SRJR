// VIEWMODEL · Ajustes (solo dueño)
// Administra los usuarios y el respaldo de los datos.
import { useState } from 'react';
import { puedeEliminarUsuario, usuarioPublico } from '../model/usuarios';
import { normalizarDatos } from '../model/respaldo';
import { compartirRespaldo, leerRespaldo } from '../model/repository/archivos';
import { useAppViewModel } from './AppViewModel';

const FORMULARIO_VACIO = { nombre: '', email: '', pass: '' };

export function useSettingsViewModel() {
  const {
    user, users, products, sales, errorGuardado, addUser, changePassword, removeUser, datosParaRespaldo, restoreData,
  } = useAppViewModel();
  const [nuevo, setNuevo] = useState(FORMULARIO_VACIO);
  const set = (k) => (v) => setNuevo((n) => ({ ...n, [k]: v }));

  // Devuelve el texto del error, o null si se agregó
  const agregarEmpleado = async () => {
    const error = await addUser(nuevo);
    if (!error) setNuevo(FORMULARIO_VACIO);
    return error;
  };

  // Devuelve null si el usuario canceló, { ok: false } si el archivo no sirve, o { ok: true, productos, ventas }
  const restaurarRespaldo = async () => {
    const crudo = await leerRespaldo();
    if (!crudo) return null;
    const datos = normalizarDatos(crudo);
    if (!datos) return { ok: false };
    restoreData(datos);
    return { ok: true, productos: datos.products.length, ventas: datos.sales.length };
  };

  return {
    usuarios: users.map(usuarioPublico),
    miId: user.id,
    puedeEliminar: (id) => puedeEliminarUsuario(users, id, user),
    nuevo,
    set,
    agregarEmpleado,
    cambiarPassword: changePassword,
    eliminarUsuario: removeUser,
    conteo: { productos: products.length, ventas: sales.length },
    errorGuardado,
    guardarRespaldo: () => compartirRespaldo(datosParaRespaldo()),
    restaurarRespaldo,
  };
}
