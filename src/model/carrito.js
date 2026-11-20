// MODEL · Carrito (la cuenta que se está cobrando)
// Funciones puras: reciben el carrito y devuelven uno nuevo

export const agregarAlCarrito = (carrito, p) =>
  carrito.some((i) => i.codigo === p.codigo)
    ? carrito.map((i) => (i.codigo === p.codigo ? { ...i, cant: i.cant + 1 } : i))
    : [...carrito, { ...p, cant: 1 }];

// d = +1 o -1; si la cantidad llega a 0, el producto sale de la cuenta
export const cambiarCantidad = (carrito, codigo, d) =>
  carrito.map((i) => (i.codigo === codigo ? { ...i, cant: i.cant + d } : i)).filter((i) => i.cant > 0);

export const totalCarrito = (carrito) => carrito.reduce((s, i) => s + i.venta * i.cant, 0);
export const gananciaCarrito = (carrito) => carrito.reduce((s, i) => s + (i.venta - i.compra) * i.cant, 0);

// Agrega a cada producto de la cuenta cuántas piezas hay realmente y si se pide más de lo que existe
export const conAvisosDeExistencias = (carrito, productos) =>
  carrito.map((i) => {
    const p = productos.find((x) => x.codigo === i.codigo);
    const disponible = p ? p.stock : 0;
    return { ...i, disponible, excede: i.cant > disponible };
  });
