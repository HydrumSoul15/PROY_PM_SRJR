import { CUENTAS_DEMO, USUARIOS_INICIALES as U, buscarUsuario, permisosDe, puedeEliminarUsuario, usuarioPublico, validarNuevoUsuario, validarPassword } from '../../src/model/usuarios';
import { normalizarDatos } from '../../src/model/respaldo';
import { PRODUCTOS_EJEMPLO as P } from '../../src/model/producto';

const [dueno, empleado] = U;

describe('Usuarios', () => {
  test('el correo se busca sin importar mayúsculas ni espacios', () => {
    expect(buscarUsuario(U, ' Dueno@MiCasita.com ').id).toBe('dueno');
    expect(buscarUsuario(U, 'otro@x.com')).toBeNull();
  });
  test('los datos públicos no incluyen sal ni hash', () => {
    expect(Object.keys(usuarioPublico(dueno)).sort()).toEqual(['email', 'esDueno', 'id', 'nombre', 'rol']);
  });
  test('las cuentas de prueba existen en los usuarios iniciales', () => {
    CUENTAS_DEMO.forEach((c) => expect(buscarUsuario(U, c.email)).not.toBeNull());
  });
  test('reglas para un empleado nuevo', () => {
    const ok = { nombre: 'Ana', email: 'ana@micasita.com', pass: '1234' };
    expect(validarNuevoUsuario(ok, U)).toBeNull();
    expect(validarNuevoUsuario({ ...ok, nombre: ' ' }, U)).toMatch(/nombre/);
    expect(validarNuevoUsuario({ ...ok, email: 'ana' }, U)).toMatch(/correo/);
    expect(validarNuevoUsuario({ ...ok, email: 'dueno@micasita.com' }, U)).toMatch(/Ya existe/);
    expect(validarNuevoUsuario({ ...ok, pass: '12' }, U)).toMatch(/4 caracteres/);
    expect(validarPassword('1234')).toBeNull();
  });
  test('no se puede eliminar al dueño ni a uno mismo', () => {
    expect(puedeEliminarUsuario(U, 'empleado', dueno)).toBe(true);
    expect(puedeEliminarUsuario(U, 'dueno', empleado)).toBe(false);
    expect(puedeEliminarUsuario(U, 'empleado', empleado)).toBe(false);
  });
});

describe('Permisos', () => {
  test('el dueño puede todo', () => {
    expect(Object.values(permisosDe(dueno)).every(Boolean)).toBe(true);
  });
  test('el empleado no puede nada de lo restringido', () => {
    expect(Object.values(permisosDe(empleado)).every((v) => v === false)).toBe(true);
  });
});

describe('Respaldo', () => {
  const venta = { id: 1, fecha: new Date().toISOString(), total: 10, ganancia: 2, items: [] };
  test('acepta datos correctos y completa los usuarios si no vienen', () => {
    const d = normalizarDatos({ products: P, sales: [venta] });
    expect(d.users).toBe(U);
    expect(d.products).toHaveLength(P.length);
  });
  test('conserva los usuarios del respaldo si son válidos y hay dueño', () => {
    expect(normalizarDatos({ products: P, sales: [], users: U }).users).toBe(U);
    expect(normalizarDatos({ products: P, sales: [], users: [empleado] }).users).toBe(U); // sin dueño: usa los iniciales
  });
  test('rechaza archivos dañados o equivocados', () => {
    expect(normalizarDatos(null)).toBeNull();
    expect(normalizarDatos({ products: 'x', sales: [] })).toBeNull();
    expect(normalizarDatos({ products: [{ codigo: 1 }], sales: [] })).toBeNull();
    expect(normalizarDatos({ products: P, sales: [{ id: 'x' }] })).toBeNull();
  });
});
