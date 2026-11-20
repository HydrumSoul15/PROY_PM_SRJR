// VIEWMODEL · Login
// Guarda lo que se escribe, decide si se puede entrar y expone el mensaje de error.
import { useState } from 'react';
import { CUENTAS_DEMO } from '../model/usuarios';
import { useAppViewModel } from './AppViewModel';

export function useLoginViewModel() {
  const { login } = useAppViewModel();
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [verPass, setVerPass] = useState(false);
  const [error, setError] = useState('');

  const cambiarEmail = (t) => { setEmail(t); setError(''); };
  const cambiarPass = (t) => { setPass(t); setError(''); };
  const alternarVerPass = () => setVerPass((v) => !v);

  // Devuelve true si entró; la vista usa el false para sacudir la tarjeta
  const entrar = async () => {
    if (!email.trim() || !pass) {
      setError('Escribe tu correo y tu contraseña.');
      return false;
    }
    if (!(await login(email, pass))) {
      setError('El correo o la contraseña no coinciden.');
      return false;
    }
    return true;
  };

  // Accesos de prueba para la demostración
  const entrarComo = async (cuenta) => {
    setEmail(cuenta.email);
    setPass(cuenta.pass);
    if (!(await login(cuenta.email, cuenta.pass))) setError('Esa cuenta de prueba ya cambió de contraseña.');
  };

  return { email, pass, verPass, error, cuentasDemo: CUENTAS_DEMO, cambiarEmail, cambiarPass, alternarVerPass, entrar, entrarComo };
}
