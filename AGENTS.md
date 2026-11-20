# Mi Casita — punto de venta e inventario (Expo / React Native)

App móvil para Abarrotes "Mi Casita". Funciona sin internet: los datos se guardan en el teléfono.

## Antes de tocar APIs de Expo o React Native

Expo cambia entre versiones. Lee la versión de `expo` en `package.json` y consulta la documentación de esa
versión (`https://docs.expo.dev/versions/v<major>.0.0/`) en lugar de confiar en la memoria.

## Comandos

```bash
npx expo install <paquete>   # SIEMPRE en lugar de npm install: elige la versión compatible con el SDK
npx expo start -c            # arrancar con la caché limpia
npx expo-doctor              # revisar dependencias y configuración
npx jest                     # pruebas del Modelo (carpeta tests/)
```

No ejecutes `npm audit fix --force`: puede subir paquetes a versiones incompatibles con el SDK.

## Navegación

Se usa **React Navigation** (stack + pestañas), definida en `App.js`. No se usa Expo Router: no crear la carpeta `src/app/`.

## Arquitectura: MVVM (Modelo – Vista – VistaModelo)

```
src/
├── model/        datos y reglas del negocio (sin pantallas, sin React)
│   └── repository/   único lugar que toca AsyncStorage, archivos, fotos, Excel, cámara de fotos y cifrado
├── viewmodel/    estado que la vista observa + acciones del usuario (un hook por pantalla + AppViewModel compartido)
└── view/         pantallas y estilos (solo dibujan y avisan al ViewModel)
    ├── screens/
    ├── theme.js      colores y sombra
    └── formato.js    textos y colores para mostrar (pesos, fechas, existencias)
```

Reglas de dependencia (se pueden comprobar con búsquedas de texto):

1. **Vista → VistaModelo**, nunca a `model/` ni a AsyncStorage.
2. **VistaModelo → Modelo**; no importa `react-native` ni componentes, y no usa `Alert` ni `navigation`.
3. **Modelo** no sabe que existen pantallas: nada de `react`, `Alert`, `navigation`, `@rneui`.
4. Navegar y mostrar avisos (`Alert`) es trabajo de la Vista. El VistaModelo solo devuelve el resultado.
5. Los permisos viven en un solo lugar: `permisosDe` en `src/model/usuarios.js`. Nunca preguntar por el rol dentro de una pantalla.

## Convenciones

- Textos de la interfaz en español. Colores solo desde `src/view/theme.js`.
- Dinero con `peso()` de `src/view/formato.js`. Los cálculos de cobro se redondean a centavos.
- Cada regla nueva del negocio lleva su prueba en `tests/model/`.
