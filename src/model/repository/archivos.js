// MODEL · Repositorio de archivos de respaldo (Data Source)
// Guarda una copia de los datos en un archivo para compartirla, y lee un respaldo elegido por el usuario.
import * as DocumentPicker from 'expo-document-picker';
import * as Sharing from 'expo-sharing';
import { File, Paths } from 'expo-file-system';

// Crea el archivo y abre el menú de compartir (guardar en Archivos, Drive, WhatsApp, correo...)
export const compartirRespaldo = async (datos) => {
  const ahora = new Date();
  const archivo = new File(Paths.cache, `respaldo-micasita-${ahora.toISOString().slice(0, 10)}.json`);
  archivo.create({ overwrite: true });
  archivo.write(JSON.stringify({ app: 'micasita', version: 2, fecha: ahora.toISOString(), ...datos }));
  if (!(await Sharing.isAvailableAsync())) throw new Error('Este teléfono no permite compartir archivos.');
  await Sharing.shareAsync(archivo.uri, { mimeType: 'application/json', dialogTitle: 'Guardar respaldo de Mi Casita' });
};

// Devuelve el contenido del respaldo ya convertido, o null si el usuario canceló. Lanza error si no es un JSON válido.
export const leerRespaldo = async () => {
  const r = await DocumentPicker.getDocumentAsync({ type: '*/*', copyToCacheDirectory: true });
  if (r.canceled) return null;
  return JSON.parse(await new File(r.assets[0].uri).text());
};
