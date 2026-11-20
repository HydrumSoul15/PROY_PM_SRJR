// MODEL · Repositorio de Excel (Data Source)
// Deja elegir un .xlsx o .csv y devuelve sus filas
import * as DocumentPicker from 'expo-document-picker';
import { File } from 'expo-file-system';
import * as XLSX from 'xlsx';

// Devuelve las filas de la primera hoja, o null si el usuario canceló. Lanza error si el archivo no sirve.
export const leerFilasDeExcel = async () => {
  const r = await DocumentPicker.getDocumentAsync({ type: '*/*', copyToCacheDirectory: true });
  if (r.canceled) return null;
  const b64 = await new File(r.assets[0].uri).base64();
  const libro = XLSX.read(b64, { type: 'base64' });
  return XLSX.utils.sheet_to_json(libro.Sheets[libro.SheetNames[0]], { defval: '', raw: false });
};
