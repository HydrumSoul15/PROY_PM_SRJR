import {
  PRODUCTOS_EJEMPLO as P, filtrarProductos, formularioDeProducto, generarClave, guardarProducto, importarFilas,
  nivelDeStock, productoDesdeFormulario, productosBajos, validarProducto,
} from '../../src/model/producto';

describe('Claves de producto', () => {
  test('usa las iniciales de categoría, tipo y presentación más un consecutivo', () => {
    expect(generarClave({ categoria: 'Comida', tipo: 'Frituras', presentacion: 'Bolsa Pequeña' }, P)).toBe('CFBP3');
  });
  test('ignora acentos y empieza en 1 si no hay ninguno igual', () => {
    expect(generarClave({ categoria: 'Álgebra', tipo: 'Único', presentacion: 'Éxito' }, P)).toBe('AUE1');
  });
});

describe('Búsqueda y existencias', () => {
  test('encuentra sin importar acentos ni mayúsculas', () => {
    expect(filtrarProductos(P, 'MARIA', false).map((p) => p.nombre)).toEqual(['Galletas Marías']);
  });
  test('busca también por clave y por código de barras', () => {
    expect(filtrarProductos(P, 'cfbp', false)).toHaveLength(2);
    expect(filtrarProductos(P, '7501055363057', false)).toHaveLength(1);
  });
  test('el filtro "por surtir" deja solo los de pocas existencias', () => {
    expect(filtrarProductos(P, '', true).map((p) => p.stock)).toEqual([3, 4]);
    expect(productosBajos(P)).toHaveLength(2);
  });
  test('nivel de existencias', () => {
    expect(nivelDeStock({ stock: 0 })).toBe('agotado');
    expect(nivelDeStock({ stock: 4 })).toBe('bajo');
    expect(nivelDeStock({ stock: 5 })).toBe('ok');
  });
});

describe('Captura de productos', () => {
  const f = formularioDeProducto(P[3], P[3].codigo, false);
  test('el formulario parte del producto y una copia deja vacíos stock y foto', () => {
    expect(f.venta).toBe('32');
    expect(formularioDeProducto(P[3], '', true)).toMatchObject({ codigo: '', stock: '', foto: '' });
  });
  test('exige código, nombre y precio de venta', () => {
    expect(validarProducto({ ...f, nombre: '  ' }, P, false).titulo).toBe('Faltan datos');
    expect(validarProducto({ ...f, venta: 'abc' }, P, false).titulo).toBe('Faltan datos');
  });
  test('no permite repetir el código de barras de un producto nuevo', () => {
    expect(validarProducto(f, P, true).titulo).toBe('Código repetido');
    expect(validarProducto(f, P, false)).toBeNull();
  });
  test('convierte el texto del formulario en números', () => {
    expect(productoDesdeFormulario({ ...f, compra: '', stock: '8' }, 'X1')).toMatchObject({ compra: 0, venta: 32, stock: 8, clave: 'X1' });
  });
  test('guardar agrega si es nuevo y reemplaza si ya existe, generando la clave', () => {
    const nuevo = { codigo: '9', nombre: 'Z', categoria: 'Comida', tipo: 'Frituras', presentacion: 'Bolsa Pequeña' };
    const lista = guardarProducto(P, nuevo);
    expect(lista).toHaveLength(P.length + 1);
    expect(lista.at(-1).clave).toBe('CFBP3');
    expect(guardarProducto(lista, { ...lista.at(-1), nombre: 'Z2' })).toHaveLength(P.length + 1);
  });
});

describe('Importar desde Excel', () => {
  test('cuenta nuevos, actualizados y omitidos, y entiende encabezados con acentos', () => {
    const r = importarFilas(P, [
      { Código: '1', Nombre: 'Nuevo', Venta: '$10', Stock: '3' },
      { codigo: P[0].codigo, nombre: 'Coca 600', venta: 19 },
      { codigo: '', nombre: 'sin código' },
    ]);
    expect([r.nuevos, r.actualizados, r.omitidos]).toEqual([1, 1, 1]);
    expect(r.lista.find((p) => p.codigo === '1')).toMatchObject({ venta: 10, stock: 3 });
    expect(r.lista.find((p) => p.codigo === P[0].codigo).nombre).toBe('Coca 600');
  });
});
