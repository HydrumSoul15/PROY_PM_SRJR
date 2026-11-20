// MODEL · Repositorio de fotos (Data Source)
// Toma o elige la foto del producto y la guarda en una carpeta propia de la app
import * as ImagePicker from 'expo-image-picker';
import { Directory, File, Paths } from 'expo-file-system';

const guardarFoto = (uri) => {
  try {
    const dir = new Directory(Paths.document, 'fotos');
    if (!dir.exists) dir.create();
    const destino = new File(dir, `${Date.now()}.jpg`);
    new File(uri).copy(destino);
    return destino.uri;
  } catch (e) {
    return uri;
  }
};

// Devuelve { uri }, { sinPermiso: true } o null si el usuario canceló
export const tomarFoto = async () => {
  const perm = await ImagePicker.requestCameraPermissionsAsync();
  if (!perm.granted) return { sinPermiso: true };
  const r = await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.5 });
  return r.canceled ? null : { uri: guardarFoto(r.assets[0].uri) };
};

export const elegirFoto = async () => {
  const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.5 });
  return r.canceled ? null : { uri: guardarFoto(r.assets[0].uri) };
};
