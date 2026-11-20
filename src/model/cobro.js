// MODEL · Cobro
// Reglas para cobrar en efectivo: cuánto falta, cuánto se devuelve y qué billetes se sugieren

export const redondear = (n) => Math.round(n * 100) / 100;
const BILLETES = [20, 50, 100, 200, 500, 1000];

export const calcularCobro = (total, recibido) => {
  const importe = redondear(total);
  const cambio = redondear((parseFloat(recibido) || 0) - importe);
  return { importe, cambio, alcanza: recibido !== '' && cambio >= 0 };
};

// "Exacto" y hasta 3 billetes que sí alcanzan para pagar
export const opcionesDeEfectivo = (importe) => [
  { etiqueta: 'Exacto', valor: importe },
  ...BILLETES.filter((b) => b > importe).slice(0, 3).map((b) => ({ etiqueta: `$${b}`, valor: b })),
];
