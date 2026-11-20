// MODEL · Producto
// Datos de ejemplo y reglas de negocio de los productos (sin nada de pantalla ni de almacenamiento)

export const STOCK_BAJO = 5; // menos de 5 piezas = "por surtir"
export const esStockBajo = (p) => p.stock < STOCK_BAJO;
export const productosBajos = (lista) => lista.filter(esStockBajo);
export const buscarPorCodigo = (lista, c) => lista.find((p) => p.codigo === String(c).trim());

export const sinAcentos = (t) => t.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

// Clave interna: iniciales de Categoría + Tipo + Presentación y un consecutivo
// Ej.: Comida · Frituras · Bolsa Pequeña  ->  CFBP1, CFBP2, ...
export const generarClave = (p, lista) => {
  const prefijo =
    [p.categoria, p.tipo, p.presentacion].join(' ').split(/\s+/).filter(Boolean)
      .map((w) => sinAcentos(w)[0].toUpperCase()).join('') || 'P';
  const usados = lista
    .filter((x) => x.clave && x.clave.startsWith(prefijo))
    .map((x) => parseInt(x.clave.slice(prefijo.length)))
    .filter((n) => !isNaN(n));
  return prefijo + ((usados.length ? Math.max(...usados) : 0) + 1);
};

// Agrega el producto a la lista, o lo actualiza si ya existe el código de barras
export const guardarProducto = (lista, p) => {
  const prod = p.clave ? p : { ...p, clave: generarClave(p, lista) };
  return lista.some((x) => x.codigo === prod.codigo)
    ? lista.map((x) => (x.codigo === prod.codigo ? prod : x))
    : [...lista, prod];
};

// Importar productos desde las filas de un Excel/CSV
// (columnas: codigo, nombre, categoria, tipo, presentacion, compra, venta, stock)
export const importarFilas = (productos, filas) => {
  const norm = (t) => sinAcentos(String(t)).toLowerCase().trim();
  const num = (v) => parseFloat(String(v).replace(/[^0-9.]/g, '')) || 0;
  const txt = (v) => String(v ?? '').trim();
  const lista = [...productos];
  let nuevos = 0, actualizados = 0, omitidos = 0;
  filas.forEach((fila) => {
    const r = {};
    Object.keys(fila).forEach((k) => (r[norm(k)] = fila[k]));
    const codigo = txt(r.codigo), nombre = txt(r.nombre);
    if (!codigo || !nombre) { omitidos++; return; }
    const prod = {
      codigo, nombre, categoria: txt(r.categoria), tipo: txt(r.tipo), presentacion: txt(r.presentacion),
      compra: num(r.compra), venta: num(r.venta), stock: Math.round(num(r.stock)),
    };
    const i = lista.findIndex((x) => x.codigo === codigo);
    if (i >= 0) { lista[i] = { ...lista[i], ...prod, clave: lista[i].clave || generarClave(prod, lista) }; actualizados++; }
    else { lista.push({ ...prod, clave: generarClave(prod, lista) }); nuevos++; }
  });
  return { lista, nuevos, actualizados, omitidos };
};

// Productos de ejemplo (códigos inventados: cámbialos por los reales de tu tienda)
export const PRODUCTOS_EJEMPLO = [
  { codigo: '7501055363057', nombre: 'Coca-Cola 600 ml', categoria: 'Bebidas', tipo: 'Refrescos', presentacion: 'Botella Mediana', clave: 'BRBM1', compra: 12, venta: 18, stock: 24 },
  { codigo: '7501000111206', nombre: 'Galletas Marías', categoria: 'Comida', tipo: 'Galletas', presentacion: 'Paquete Chico', clave: 'CGPC1', compra: 10, venta: 15, stock: 3 },
  { codigo: '7501008030177', nombre: 'Sabritas 45 g', categoria: 'Comida', tipo: 'Frituras', presentacion: 'Bolsa Pequeña', clave: 'CFBP1', compra: 13, venta: 18, stock: 12 },
  { codigo: '7501011112222', nombre: 'Doritos 150 g', categoria: 'Comida', tipo: 'Frituras', presentacion: 'Bolsa Pequeña', clave: 'CFBP2', compra: 24, venta: 32, stock: 8 },
  { codigo: '7501020540000', nombre: 'Leche entera 1 L', categoria: 'Lácteos', tipo: 'Leche', presentacion: 'Caja Grande', clave: 'LLCG1', compra: 22, venta: 28, stock: 4 },
  { codigo: '7501031311309', nombre: 'Frijol negro 1 kg', categoria: 'Abarrotes', tipo: 'Granos', presentacion: 'Bolsa Grande', clave: 'AGBG1', compra: 30, venta: 40, stock: 15 },
];

// ---- Búsqueda, estado de existencias y captura de productos ----
const plano = (t) => sinAcentos(t).toLowerCase();

// Busca por nombre, código de barras o clave (sin importar acentos ni mayúsculas)
export const filtrarProductos = (productos, texto, soloBajos) => {
  const q = plano(texto);
  return productos.filter(
    (p) => plano(`${p.nombre} ${p.codigo} ${p.clave ?? ''}`).includes(q) && (!soloBajos || esStockBajo(p))
  );
};

// 'agotado' | 'bajo' | 'ok': las vistas deciden colores y textos según este nivel
export const nivelDeStock = (p) => (p.stock === 0 ? 'agotado' : esStockBajo(p) ? 'bajo' : 'ok');

// Datos iniciales del formulario (todo como texto, porque así se escribe)
export const formularioDeProducto = (base, codigo, esCopia) => ({
  codigo: codigo || '',
  nombre: base?.nombre ?? '',
  categoria: base?.categoria ?? '',
  tipo: base?.tipo ?? '',
  presentacion: base?.presentacion ?? '',
  compra: String(base?.compra ?? ''),
  venta: String(base?.venta ?? ''),
  stock: esCopia ? '' : String(base?.stock ?? ''),
  foto: esCopia ? '' : base?.foto ?? '',
});

// Regla: código, nombre y precio de venta son obligatorios; el código no se puede repetir
export const validarProducto = (f, productos, esNuevo) => {
  if (!f.codigo.trim() || !f.nombre.trim() || isNaN(parseFloat(f.venta)))
    return { titulo: 'Faltan datos', mensaje: 'Código, nombre y precio de venta son obligatorios.' };
  if (esNuevo && buscarPorCodigo(productos, f.codigo))
    return { titulo: 'Código repetido', mensaje: 'Ya existe un producto con ese código de barras.' };
  return null;
};

// Convierte el texto del formulario en un producto con números; la clave se genera sola si no hay
export const productoDesdeFormulario = (f, clave) => ({
  codigo: f.codigo.trim(),
  nombre: f.nombre.trim(),
  categoria: f.categoria.trim(),
  tipo: f.tipo.trim(),
  presentacion: f.presentacion.trim(),
  foto: f.foto,
  clave,
  compra: parseFloat(f.compra) || 0,
  venta: parseFloat(f.venta),
  stock: parseInt(f.stock) || 0,
});
