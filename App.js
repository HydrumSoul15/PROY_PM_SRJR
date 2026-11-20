import React, { useEffect, useState } from 'react';
import { Image, View } from 'react-native';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ThemeProvider, createTheme, Icon, registerCustomIconType } from '@rneui/themed';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppViewModelProvider, useAppViewModel } from './src/viewmodel/AppViewModel';
import { colores } from './src/view/theme';
import Login from './src/view/screens/Login';
import Home from './src/view/screens/Home';
import Scan from './src/view/screens/Scan';
import Cart from './src/view/screens/Cart';
import Inventory from './src/view/screens/Inventory';
import Sales from './src/view/screens/Sales';
import Detail from './src/view/screens/Detail';
import Settings from './src/view/screens/Settings';

registerCustomIconType('mci', MaterialCommunityIcons);

// Tema de los componentes (botones y textos) y de la navegación (fondo crema entre pantallas)
const theme = createTheme({
  lightColors: { primary: colores.verde },
  components: { Button: { radius: 10, size: 'lg' }, Text: { style: { fontSize: 18 } } },
});
const temaNavegacion = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, background: colores.crema, primary: colores.verde },
};
const encabezado = {
  headerStyle: { backgroundColor: colores.verde },
  headerTintColor: '#fff',
  headerTitleStyle: { fontWeight: 'bold' },
};

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const tab = (name, component, icon) => (
  <Tab.Screen
    name={name}
    component={component}
    options={{ tabBarIcon: ({ color, size }) => <Icon name={icon} type="mci" color={color} size={size} /> }}
  />
);

function Tabs() {
  const { permisos } = useAppViewModel();
  return (
    <Tab.Navigator screenOptions={{ tabBarActiveTintColor: colores.verde, ...encabezado }}>
      {tab('Inicio', Home, 'home')}
      {tab('Escanear', Scan, 'barcode-scan')}
      {tab('Cobro', Cart, 'cart')}
      {tab('Inventario', Inventory, 'package-variant')}
      {permisos.verVentas && tab('Ventas', Sales, 'chart-bar')}
      {permisos.gestionarUsuarios && tab('Ajustes', Settings, 'cog-outline')}
    </Tab.Navigator>
  );
}

function Root() {
  const { user } = useAppViewModel();
  return (
    <Stack.Navigator>
      {!user ? (
        <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />
      ) : (
        <>
          <Stack.Screen name="Tabs" component={Tabs} options={{ headerShown: false }} />
          <Stack.Screen name="Detalle" component={Detail} options={{ title: 'Producto', ...encabezado }} />
        </>
      )}
    </Stack.Navigator>
  );
}

// Pantalla de bienvenida con el logo (aparece 2 segundos al abrir la app)
function Splash() {
  return (
    <View style={{ flex: 1, backgroundColor: colores.crema, alignItems: 'center', justifyContent: 'center' }}>
      <Image source={require('./assets/logo.png')} style={{ width: 240, height: 240 }} resizeMode="contain" />
    </View>
  );
}

export default function App() {
  const [splash, setSplash] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setSplash(false), 2000);
    return () => clearTimeout(t);
  }, []);
  if (splash) return <Splash />;
  return (
    <SafeAreaProvider>
      <ThemeProvider theme={theme}>
        <AppViewModelProvider>
          <NavigationContainer theme={temaNavegacion}>
            <Root />
          </NavigationContainer>
        </AppViewModelProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
