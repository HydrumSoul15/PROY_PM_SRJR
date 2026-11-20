// MODEL · Repositorio (Data Source)
// Único lugar que sabe dónde se guardan los datos: hoy en el teléfono con AsyncStorage,
// así la app funciona sin internet. Si algún día se cambia por SQLite o una API, solo cambia este archivo.
import AsyncStorage from '@react-native-async-storage/async-storage';

const CLAVE = 'micasita_v2';

// Devuelve { products, sales, users } o null si no hay nada guardado
export const cargarDatos = async () => {
  try {
    const j = await AsyncStorage.getItem(CLAVE);
    return j ? JSON.parse(j) : null;
  } catch (e) {
    return null;
  }
};

// Si no se puede guardar (por ejemplo, sin espacio), la promesa falla y el ViewModel avisa a la pantalla
export const guardarDatos = async (datos) => {
  await AsyncStorage.setItem(CLAVE, JSON.stringify(datos));
};
