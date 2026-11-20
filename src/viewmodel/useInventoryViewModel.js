// VIEWMODEL · Inventario
// Filtra la lista, cuenta lo que falta surtir y coordina la importación desde Excel.
import { useState } from 'react';
import { filtrarProductos, nivelDeStock, productosBajos } from '../model/producto';
import { leerFilasDeExcel } from '../model/repository/excel';
import { useAppViewModel } from './AppViewModel';

export function useInventoryViewModel() {
  const { products, permisos, importProducts } = useAppViewModel();
  const [q, setQ] = useState('');
  const [soloBajos, setSoloBajos] = useState(false);

  // Devuelve { nuevos, actualizados, omitidos }, o null si canceló. Si el archivo no sirve, lanza error.
  const importar = async () => {
    const filas = await leerFilasDeExcel();
    return filas ? importProducts(filas) : null;
  };

  return {
    q, setQ, soloBajos, setSoloBajos,
    lista: filtrarProductos(products, q, soloBajos),
    hayProductos: products.length > 0,
    porSurtir: productosBajos(products).length,
    puedeImportar: permisos.importarExcel,
    nivelDeStock,
    importar,
  };
}
