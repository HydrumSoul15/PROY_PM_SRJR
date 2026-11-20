// VIEW · Inicio: solo dibuja lo que le entrega el ViewModel
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Animated, Pressable, ScrollView, View } from 'react-native';
import { Button, Icon, Text } from '@rneui/themed';
import { useHomeViewModel } from '../../viewmodel/useHomeViewModel';
import { colores, sombra } from '../theme';
import { fechaLarga, peso } from '../formato';

// El número de ventas sube desde donde estaba hasta el valor actual
function useConteo(valor) {
  const anim = useRef(new Animated.Value(0)).current;
  const [mostrado, setMostrado] = useState(0);
  useEffect(() => {
    const id = anim.addListener(({ value }) => setMostrado(value));
    Animated.timing(anim, { toValue: valor, duration: 700, useNativeDriver: false }).start();
    return () => anim.removeListener(id);
  }, [valor, anim]);
  return mostrado;
}

// Botón grande de acceso rápido; se encoge un poco al tocarlo
function Atajo({ icono, titulo, detalle, onPress, principal }) {
  const escala = useRef(new Animated.Value(1)).current;
  const mover = (v) => Animated.spring(escala, { toValue: v, useNativeDriver: true, speed: 40, bounciness: 0 }).start();
  const tinta = principal ? colores.blanco : colores.verdeOscuro;
  return (
    <Animated.View style={{ flex: 1, transform: [{ scale: escala }] }}>
      <Pressable
        onPress={onPress}
        onPressIn={() => mover(0.96)}
        onPressOut={() => mover(1)}
        accessibilityRole="button"
        accessibilityLabel={titulo}
        style={{
          minHeight: 120,
          borderRadius: 16,
          padding: 16,
          justifyContent: 'space-between',
          backgroundColor: principal ? colores.verde : colores.blanco,
          borderWidth: principal ? 0 : 2,
          borderColor: colores.verde,
          ...sombra,
        }}
      >
        <Icon name={icono} type="mci" size={36} color={tinta} style={{ alignSelf: 'flex-start' }} />
        <View>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: tinta }}>{titulo}</Text>
          <Text style={{ fontSize: 14, color: principal ? '#e8f5e9' : colores.gris }}>{detalle}</Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const tarjeta = {
  backgroundColor: colores.blanco,
  borderRadius: 16,
  padding: 16,
  marginBottom: 16,
  ...sombra,
};

export default function Home({ navigation }) {
  const vm = useHomeViewModel();
  const { resumen, porSurtir } = vm;
  const ventasMostradas = useConteo(resumen.total);

  const cerrar = () => {
    if (!vm.hayCuentaAbierta) return vm.cerrarSesion();
    Alert.alert('Cerrar sesión', 'Tienes una cuenta abierta y se va a borrar. ¿Quieres salir?', [
      { text: 'Seguir aquí' },
      { text: 'Cerrar sesión', style: 'destructive', onPress: vm.cerrarSesion },
    ]);
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colores.crema }} contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
      <Text style={{ fontSize: 26, fontWeight: 'bold', color: colores.texto }}>¡Hola, {vm.nombre}!</Text>
      <Text style={{ fontSize: 15, color: colores.gris, marginBottom: 16 }}>{fechaLarga()}</Text>

      {vm.errorGuardado && (
        <View style={{ ...tarjeta, backgroundColor: '#fff3e0', flexDirection: 'row', alignItems: 'center' }}>
          <Icon name="alert-outline" type="mci" size={26} color={colores.naranja} />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={{ fontSize: 15, fontWeight: 'bold', color: colores.texto }}>No se pudieron guardar los últimos cambios</Text>
            <Text style={{ fontSize: 14, color: colores.gris }}>
              {vm.puedeIrAAjustes ? 'Haz un respaldo en Ajustes para no perder tus datos.' : 'Avisa al dueño.'}
            </Text>
          </View>
          {vm.puedeIrAAjustes && (
            <Button title="Ajustes" type="clear" titleStyle={{ color: colores.naranja, fontSize: 16 }} onPress={() => navigation.navigate('Ajustes')} />
          )}
        </View>
      )}

      <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
        <Atajo principal icono="barcode-scan" titulo="Escanear producto" detalle="Con la cámara" onPress={() => navigation.navigate('Escanear')} />
        <Atajo icono="cart-outline" titulo="Nueva cuenta" detalle="Cobrar una venta" onPress={() => navigation.navigate('Cobro')} />
      </View>

      {vm.verResumen && (
        <View style={tarjeta}>
          <Text style={{ fontSize: 15, color: colores.gris }}>Vendido hoy</Text>
          <Text style={{ fontSize: 38, fontWeight: 'bold', color: colores.verdeOscuro }}>{peso(ventasMostradas)}</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}>
            <Text style={{ fontSize: 15, color: colores.gris }}>
              {resumen.cantidad} {resumen.cantidad === 1 ? 'venta' : 'ventas'}
            </Text>
            <Text style={{ fontSize: 15, color: colores.gris }}>Ganancia bruta {peso(resumen.ganancia)}</Text>
          </View>
        </View>
      )}

      <View style={tarjeta}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: porSurtir.length ? 6 : 0 }}>
          <Icon
            name={porSurtir.length ? 'alert-outline' : 'check-circle-outline'}
            type="mci"
            size={26}
            color={porSurtir.length ? colores.naranja : colores.verde}
          />
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: colores.texto, marginLeft: 8, flex: 1 }}>
            {porSurtir.length ? `Por surtir (${porSurtir.length})` : 'Todo en orden'}
          </Text>
        </View>
        {porSurtir.length === 0 && (
          <Text style={{ fontSize: 15, color: colores.gris, marginTop: 4 }}>Hay existencias suficientes de todos los productos.</Text>
        )}
        {porSurtir.slice(0, 5).map((p) => (
          <Pressable
            key={p.codigo}
            onPress={() => navigation.navigate('Detalle', { codigo: p.codigo })}
            style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderTopWidth: 1, borderTopColor: '#eee' }}
          >
            <Text numberOfLines={1} style={{ fontSize: 16, color: colores.texto, flex: 1 }}>{p.nombre}</Text>
            <Text style={{ fontSize: 15, fontWeight: 'bold', color: p.stock === 0 ? colores.rojo : colores.naranja }}>
              {p.stock === 0 ? 'Agotado' : `${p.stock} pzas`}
            </Text>
            <Icon name="chevron-right" type="mci" size={22} color={colores.gris} />
          </Pressable>
        ))}
        {porSurtir.length > 5 && (
          <Button
            title={`Ver los ${porSurtir.length} en inventario`}
            type="clear"
            titleStyle={{ color: colores.verde, fontSize: 16 }}
            onPress={() => navigation.navigate('Inventario')}
          />
        )}
      </View>

      <Button
        title="Cerrar sesión"
        type="clear"
        icon={{ name: 'logout', type: 'mci', color: colores.gris, size: 20 }}
        titleStyle={{ color: colores.gris, fontSize: 16 }}
        onPress={cerrar}
      />
    </ScrollView>
  );
}
