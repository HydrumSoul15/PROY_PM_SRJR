// VIEWMODEL · Estado compartido de toda la app
// Guarda el estado que las vistas "observan" (usuario, productos, ventas, usuarios, cuenta) y recibe las
// acciones del usuario; para trabajar con los datos le pide al Model, y para guardarlos al Repositorio.
import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  USUARIOS_INICIALES, buscarUsuario, permisosDe, puedeEliminarUsuario, usuarioPublico, validarNuevoUsuario, validarPassword,
} from '../model/usuarios';
import { PRODUCTOS_EJEMPLO, buscarPorCodigo, guardarProducto, importarFilas, productosBajos } from '../model/producto';
import { agregarAlCarrito, cambiarCantidad, totalCarrito } from '../model/carrito';
import { cancelarVenta, crearVenta, descontarExistencias, devolverExistencias, ventasDeHoy } from '../model/venta';
import { normalizarDatos } from '../model/respaldo';
import { cargarDatos, guardarDatos } from '../model/repository/almacenamiento';
import { generarSal, hashear } from '../model/repository/seguridad';

const Ctx = createContext();
export const useAppViewModel = () => useContext(Ctx);

export function AppViewModelProvider({ children }) {
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState(PRODUCTOS_EJEMPLO);
  const [sales, setSales] = useState([]);
  const [users, setUsers] = useState(USUARIOS_INICIALES);
  const [cart, setCart] = useState([]);
  const [ready, setReady] = useState(false);
  const [errorGuardado, setErrorGuardado] = useState(false);
  const [guardadoPermitido, setGuardadoPermitido] = useState(true); // se apaga si lo guardado no se pudo leer
  const permisos = user ? permisosDe(user) : null;

  // Al abrir, carga lo guardado (validándolo); después guarda cada cambio y avisa si no se pudo
  useEffect(() => {
    cargarDatos().then((d) => {
      const datos = d && normalizarDatos(d);
      if (datos) {
        setProducts(datos.products);
        setSales(datos.sales);
        setUsers(datos.users);
      } else if (d) {
        // Hay datos guardados pero no se pudieron leer: no se sobrescriben con los de ejemplo
        setGuardadoPermitido(false);
        setErrorGuardado(true);
      }
      setReady(true);
    });
  }, []);
  useEffect(() => {
    if (!ready || !guardadoPermitido) return;
    guardarDatos({ products, sales, users })
      .then(() => setErrorGuardado(false))
      .catch(() => setErrorGuardado(true));
  }, [products, sales, users, ready, guardadoPermitido]);

  // ---- Sesión ----
  const login = async (email, pass) => {
    const u = buscarUsuario(users, email);
    if (!u || (await hashear(pass, u.sal)) !== u.hash) return false;
    setUser(usuarioPublico(u));
    return true;
  };
  const logout = () => { setUser(null); setCart([]); };

  // ---- Productos ----
  const findByCode = (c) => buscarPorCodigo(products, c);
  const saveProduct = (p) => {
    const yaExiste = products.some((x) => x.codigo === p.codigo);
    if (yaExiste && !permisos?.editarProductos) return; // el empleado solo puede registrar productos nuevos
    setProducts((l) => guardarProducto(l, p));
  };
  const deleteProduct = (c) => {
    if (!permisos?.eliminarProductos) return;
    setProducts((l) => l.filter((x) => x.codigo !== c));
  };
  const importProducts = (filas) => {
    const { lista, nuevos, actualizados, omitidos } = importarFilas(products, filas);
    setProducts(lista);
    return { nuevos, actualizados, omitidos };
  };

  // ---- Cuenta y ventas ----
  const addToCart = (p) => setCart((c) => agregarAlCarrito(c, p));
  const changeQty = (codigo, d) => setCart((c) => cambiarCantidad(c, codigo, d));
  const total = totalCarrito(cart);
  const checkout = (metodo) => {
    setSales((s) => [crearVenta({ carrito: cart, metodo, usuario: user.nombre }), ...s]);
    setProducts((l) => descontarExistencias(l, cart));
    setCart([]);
  };
  const cancelSale = (id) => {
    if (!permisos?.cancelarVentas) return;
    const venta = sales.find((v) => v.id === id);
    if (!venta || venta.cancelada) return;
    setSales((l) => cancelarVenta(l, id));
    setProducts((l) => devolverExistencias(l, venta));
  };

  // ---- Usuarios y respaldo (solo dueño). Las acciones con contraseña devuelven el texto del error, o null si salió bien ----
  const addUser = async (datos) => {
    if (!permisos?.gestionarUsuarios) return 'No tienes permiso para esto.';
    const error = validarNuevoUsuario(datos, users);
    if (error) return error;
    const sal = generarSal();
    const hash = await hashear(datos.pass, sal);
    setUsers((l) => [...l, { id: `u${Date.now()}`, email: datos.email.trim().toLowerCase(), nombre: datos.nombre.trim(), rol: 'empleado', sal, hash }]);
    return null;
  };
  const changePassword = async (id, nueva) => {
    if (!permisos?.gestionarUsuarios) return 'No tienes permiso para esto.';
    const error = validarPassword(nueva);
    if (error) return error;
    const sal = generarSal();
    const hash = await hashear(nueva, sal);
    setUsers((l) => l.map((u) => (u.id === id ? { ...u, sal, hash } : u)));
    return null;
  };
  const removeUser = (id) => {
    if (!permisos?.gestionarUsuarios || !puedeEliminarUsuario(users, id, user)) return;
    setUsers((l) => l.filter((u) => u.id !== id));
  };
  const datosParaRespaldo = () => ({ products, sales, users });
  const restoreData = (datos) => {
    if (!permisos?.respaldar) return;
    setProducts(datos.products);
    setSales(datos.sales);
    setUsers(datos.users);
    setCart([]);
    setGuardadoPermitido(true);
    setErrorGuardado(false);
    setUser(null); // se vuelve a entrar con los usuarios del respaldo
  };

  // ---- Estado derivado que las vistas observan ----
  const lowStock = productosBajos(products);
  const salesToday = ventasDeHoy(sales);

  return (
    <Ctx.Provider
      value={{
        user, permisos, login, logout,
        products, findByCode, saveProduct, deleteProduct, importProducts,
        cart, addToCart, changeQty, total, checkout,
        sales, salesToday, cancelSale,
        users, addUser, changePassword, removeUser, datosParaRespaldo, restoreData,
        lowStock, errorGuardado,
      }}
    >
      {ready && children}
    </Ctx.Provider>
  );
}
