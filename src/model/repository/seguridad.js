// MODEL · Repositorio de seguridad (Data Source)
// Convierte una contraseña en un hash (SHA-256 con sal) para no guardarla nunca tal cual.
import * as Crypto from 'expo-crypto';

export const generarSal = () => Crypto.randomUUID();
export const hashear = (pass, sal) => Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, sal + pass);
