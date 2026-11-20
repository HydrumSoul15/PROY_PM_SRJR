// VIEW · Escanear: dibuja el visor y avisa al ViewModel; él decide qué resultado hubo
import React, { useEffect, useRef } from 'react';
import {
  Alert, Animated, Keyboard, KeyboardAvoidingView, Linking, Platform, Pressable, ScrollView, Vibration, View,
} from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Button, Icon, Input, Text } from '@rneui/themed';
import { useScanViewModel } from '../../viewmodel/useScanViewModel';
import { colores, sombra } from '../theme';

const ALTO_VISOR = 300;
const MARCO_ALTO = 150;
const llenar = { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 };

const Esquina = ({ estilo }) => (
  <View style={[{ position: 'absolute', width: 32, height: 32, borderColor: colores.blanco }, estilo]} />
);

// Marco con la línea que sube y baja mientras la cámara busca un código
function Marco({ destello }) {
  const linea = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const bucle = Animated.loop(
      Animated.sequence([
        Animated.timing(linea, { toValue: MARCO_ALTO - 3, duration: 1400, useNativeDriver: true }),
        Animated.timing(linea, { toValue: 0, duration: 1400, useNativeDriver: true }),
      ])
    );
    bucle.start();
    return () => bucle.stop();
  }, [linea]);

  return (
    <View pointerEvents="none" style={{ ...llenar, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ width: '80%', height: MARCO_ALTO }}>
        <Esquina estilo={{ top: 0, left: 0, borderTopWidth: 4, borderLeftWidth: 4, borderTopLeftRadius: 10 }} />
        <Esquina estilo={{ top: 0, right: 0, borderTopWidth: 4, borderRightWidth: 4, borderTopRightRadius: 10 }} />
        <Esquina estilo={{ bottom: 0, left: 0, borderBottomWidth: 4, borderLeftWidth: 4, borderBottomLeftRadius: 10 }} />
        <Esquina estilo={{ bottom: 0, right: 0, borderBottomWidth: 4, borderRightWidth: 4, borderBottomRightRadius: 10 }} />
        <Animated.View
          style={{
            position: 'absolute', left: 8, right: 8, height: 3, borderRadius: 2,
            backgroundColor: colores.naranja, transform: [{ translateY: linea }],
          }}
        />
        {/* Destello verde cuando se lee un código */}
        <Animated.View style={{ ...llenar, borderRadius: 10, backgroundColor: colores.verde, opacity: destello }} />
      </View>
    </View>
  );
}

export default function Scan({ navigation }) {
  const vm = useScanViewModel();
  const [perm, pedir] = useCameraPermissions();
  const enfocada = useIsFocused();
  const destello = useRef(new Animated.Value(0)).current;

  // Al salir de la pantalla la linterna se apaga
  useEffect(() => {
    if (!enfocada) vm.apagarLinterna();
  }, [enfocada]); // eslint-disable-line react-hooks/exhaustive-deps

  // El ViewModel dice qué pasó; la vista decide cómo mostrarlo
  const buscar = (c) => {
    const r = vm.buscar(c);
    if (r.tipo === 'vacio') return;
    Keyboard.dismiss();
    if (r.tipo === 'encontrado') {
      Vibration.vibrate(60);
      return navigation.navigate('Detalle', { codigo: r.codigo });
    }
    Alert.alert('Producto no encontrado', `El código ${r.codigo} todavía no está registrado. ¿Quieres registrarlo ahora?`, [
      { text: 'No' },
      { text: 'Registrar', onPress: () => navigation.navigate('Detalle', { codigo: r.codigo, nuevo: true }) },
    ]);
  };

  const alEscanear = ({ data }) => {
    if (!vm.aceptarLectura()) return; // evita lecturas repetidas
    Animated.sequence([
      Animated.timing(destello, { toValue: 0.45, duration: 120, useNativeDriver: true }),
      Animated.timing(destello, { toValue: 0, duration: 280, useNativeDriver: true }),
    ]).start();
    buscar(data);
  };

  const puedePedir = perm?.canAskAgain !== false;

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colores.crema }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }} keyboardShouldPersistTaps="handled">
        {perm && !perm.granted ? (
          <View
            style={{
              height: ALTO_VISOR, borderRadius: 16, padding: 24, alignItems: 'center', justifyContent: 'center',
              backgroundColor: colores.blanco, ...sombra,
            }}
          >
            <Icon name="camera-outline" type="mci" size={52} color={colores.verde} />
            <Text style={{ fontSize: 17, color: colores.texto, textAlign: 'center', marginVertical: 14 }}>
              {puedePedir
                ? 'Para escanear, Mi Casita necesita usar la cámara de tu teléfono.'
                : 'El permiso de la cámara está desactivado. Actívalo en los ajustes del teléfono.'}
            </Text>
            <Button
              title={puedePedir ? 'Permitir cámara' : 'Abrir ajustes'}
              onPress={puedePedir ? pedir : () => Linking.openSettings()}
              buttonStyle={{ backgroundColor: colores.verde, paddingHorizontal: 24 }}
            />
          </View>
        ) : (
          <View style={{ height: ALTO_VISOR, borderRadius: 16, overflow: 'hidden', backgroundColor: '#111' }}>
            {perm?.granted && enfocada && (
              <>
                <CameraView
                  style={llenar}
                  enableTorch={vm.linterna}
                  onBarcodeScanned={alEscanear}
                  barcodeScannerSettings={{ barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e', 'code128'] }}
                />
                <Marco destello={destello} />
                <Pressable
                  onPress={vm.alternarLinterna}
                  accessibilityRole="button"
                  accessibilityLabel={vm.linterna ? 'Apagar linterna' : 'Encender linterna'}
                  style={{
                    position: 'absolute', top: 12, right: 12, width: 44, height: 44, borderRadius: 22,
                    backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <Icon name={vm.linterna ? 'flashlight' : 'flashlight-off'} type="mci" size={24} color={colores.blanco} />
                </Pressable>
              </>
            )}
          </View>
        )}

        <Text style={{ textAlign: 'center', fontSize: 16, color: colores.gris, marginVertical: 14 }}>
          Centra el código de barras dentro del marco
        </Text>

        <View style={{ backgroundColor: colores.blanco, borderRadius: 16, padding: 16, paddingBottom: 8, ...sombra }}>
          <Text style={{ fontSize: 17, fontWeight: 'bold', color: colores.texto, marginBottom: 10 }}>
            ¿No lo lee? Escribe el código
          </Text>
          <Input
            placeholder="Código de barras"
            value={vm.codigo}
            onChangeText={vm.setCodigo}
            keyboardType="numeric"
            returnKeyType="search"
            onSubmitEditing={() => buscar(vm.codigo)}
            containerStyle={{ paddingHorizontal: 0 }}
            leftIcon={{ name: 'barcode', type: 'mci', color: colores.verde }}
          />
          <Button
            title="Buscar producto"
            onPress={() => buscar(vm.codigo)}
            buttonStyle={{ backgroundColor: colores.verde, paddingVertical: 14, borderRadius: 12 }}
            titleStyle={{ fontWeight: 'bold' }}
            containerStyle={{ marginBottom: 8 }}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
