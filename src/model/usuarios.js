// MODEL · Usuarios y permisos
// Las contraseñas nunca se guardan: solo su "hash" (resultado de mezclarla con una sal propia de cada usuario).

// Usuarios con los que arranca la app (contraseña de ambos: 1234). El dueño puede cambiarlas desde Ajustes.
export const USUARIOS_INICIALES = [
  {
    id: 'dueno', email: 'dueno@micasita.com', nombre: 'Dueño', rol: 'dueño',
    sal: 'sal-dueno', hash: '7b42139da2b6e1f23e27de2c95422521548e58972b808b6186a25c31b1b4b0fc',
  },
  {
    id: 'empleado', email: 'empleado@micasita.com', nombre: 'Empleado', rol: 'empleado',
    sal: 'sal-empleado', hash: '494ec89465498aaf80af14fdbc20c7b0c57569a340fd294cc2012f466c5ea3c5',
  },
];

// Botones de acceso rápido de la demostración (dejan de servir si se cambia la contraseña)
export const CUENTAS_DEMO = [
  { email: 'dueno@micasita.com', pass: '1234', nombre: 'Dueño' },
  { email: 'empleado@micasita.com', pass: '1234', nombre: 'Empleado' },
];

export const buscarUsuario = (lista, email) => lista.find((u) => u.email === email.trim().toLowerCase()) ?? null;

// Lo único que las pantallas pueden ver de un usuario (sin sal ni hash)
export const usuarioPublico = ({ id, email, nombre, rol }) => ({ id, email, nombre, rol, esDueno: rol === 'dueño' });

// Devuelven el texto del error, o null si todo está bien
export const validarPassword = (pass) => (pass.length < 4 ? 'La contraseña debe tener al menos 4 caracteres.' : null);
export const validarNuevoUsuario = ({ nombre, email, pass }, lista) => {
  if (!nombre.trim()) return 'Escribe el nombre del empleado.';
  if (!/^\S+@\S+\.\S+$/.test(email.trim())) return 'Escribe un correo válido.';
  if (buscarUsuario(lista, email)) return 'Ya existe un usuario con ese correo.';
  return validarPassword(pass);
};

// No se puede eliminar al dueño ni a uno mismo
export const puedeEliminarUsuario = (lista, id, actual) => {
  const u = lista.find((x) => x.id === id);
  return !!u && u.rol !== 'dueño' && u.id !== actual.id;
};

// Qué puede hacer cada rol. Es la única regla de permisos de la app: las demás capas solo la consultan.
export const permisosDe = (usuario) => {
  const dueno = usuario.rol === 'dueño';
  return {
    verCostos: dueno,          // precio de compra y ganancia por pieza
    verVentas: dueno,          // pestaña Ventas y resumen del día
    cancelarVentas: dueno,
    editarProductos: dueno,    // cambiar un producto que ya existe
    eliminarProductos: dueno,
    importarExcel: dueno,
    gestionarUsuarios: dueno,  // pestaña Ajustes: usuarios y respaldo
    respaldar: dueno,
  };
};
