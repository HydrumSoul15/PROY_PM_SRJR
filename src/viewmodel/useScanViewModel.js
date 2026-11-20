// VIEWMODEL · Escanear
// Busca el producto por su código y controla la linterna y las lecturas repetidas de la cámara.
import { useRef, useState } from 'react';
import { useAppViewModel } from './AppViewModel';

export function useScanViewModel() {
  const { findByCode } = useAppViewModel();
  const [codigo, setCodigo] = useState(''); // código escrito a mano
  const [linterna, setLinterna] = useState(false);
  const bloqueo = useRef(false);

  // Resultado: { tipo: 'vacio' | 'encontrado' | 'noRegistrado', codigo }
  // La vista decide qué hacer con cada resultado (navegar, mostrar aviso...)
  const buscar = (c) => {
    c = String(c).trim();
    if (!c) return { tipo: 'vacio', codigo: c };
    if (findByCode(c)) {
      setCodigo('');
      return { tipo: 'encontrado', codigo: c };
    }
    return { tipo: 'noRegistrado', codigo: c };
  };

  // La cámara lee el mismo código varias veces seguidas: solo se acepta una lectura cada 2.5 s
  const aceptarLectura = () => {
    if (bloqueo.current) return false;
    bloqueo.current = true;
    setTimeout(() => (bloqueo.current = false), 2500);
    return true;
  };

  const alternarLinterna = () => setLinterna((l) => !l);
  const apagarLinterna = () => setLinterna(false);

  return { codigo, setCodigo, linterna, alternarLinterna, apagarLinterna, buscar, aceptarLectura };
}
