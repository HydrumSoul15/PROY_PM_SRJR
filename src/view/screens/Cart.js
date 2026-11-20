// VIEW · Cobro: dibuja la cuenta y avisa al ViewModel lo que hace el usuario
import React, { useEffect, useRef } from 'react';
import { Animated, FlatList, KeyboardAvoidingView, Platform, Pressable, View } from 'react-native';
import { Button, Icon, Input, Text } from '@rneui/themed';
import { useCartViewModel } from '../../viewmodel/useCartViewModel';
import { colores, sombra } from '../theme';
import { peso } from '../formato';

// Botón redondo para sumar o quitar piezas
function Paso({ icono, color, onPress, etiqueta }) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={6}
      accessibilityRole="button"
      accessibilityLabel={etiqueta}
      style={({ pressed }) => ({
        width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center',
        backgroundColor: pressed ? '#e0e0e0' : '#f1f1f1',
      })}
    >
      <Icon name={icono} type="mci" size={22} color={color} />
    </Pressable>
  );
}

// Pantalla que confirma la venta: la palomita aparece con un pequeño rebote
function Confirmacion({ datos, onCerrar }) {
  const escala = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(escala, { toValue: 1, friction: 5, useNativeDriver: true }).start();
  }, [escala]);
  const efectivo = datos.metodo === 'efectivo';
  return (
    <View
      style={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: colores.crema,
        alignItems: 'center', justifyContent: 'center', padding: 24,
      }}
    >
      <Animated.View
        style={{
          width: 110, height: 110, borderRadius: 55, backgroundColor: colores.verde, alignItems: 'center',
          justifyContent: 'center', transform: [{ scale: escala }], ...sombra,
        }}
      >
        <Icon name="check" type="mci" size={64} color={colores.blanco} />
      </Animated.View>
      <Text style={{ fontSize: 26, fontWeight: 'bold', color: colores.texto, marginTop: 20 }}>Venta registrada</Text>
      <Text style={{ fontSize: 16, color: colores.gris, marginTop: 4 }}>
        {peso(datos.total)} · {efectivo ? 'efectivo' : 'tarjeta'}
      </Text>
      {efectivo && (
        <View style={{ alignItems: 'center', marginTop: 24 }}>
          <Text style={{ fontSize: 16, color: colores.gris }}>Cambio a devolver</Text>
          <Text style={{ fontSize: 44, fontWeight: 'bold', color: colores.verdeOscuro }}>{peso(datos.cambio)}</Text>
        </View>
      )}
      <Button
        title="Listo"
        onPress={onCerrar}
        containerStyle={{ alignSelf: 'stretch', marginTop: 32 }}
        buttonStyle={{ backgroundColor: colores.verde, paddingVertical: 14, borderRadius: 12 }}
        titleStyle={{ fontWeight: 'bold' }}
      />
    </View>
  );
}

export default function Cart({ navigation }) {
  const vm = useCartViewModel();

  return (
    <View style={{ flex: 1, backgroundColor: colores.crema }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <FlatList
          data={vm.cuenta}
          keyExtractor={(i) => i.codigo}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ padding: 16, flexGrow: 1 }}
          ListEmptyComponent={
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
              <Icon name="cart-outline" type="mci" size={72} color={colores.verde} />
              <Text style={{ fontSize: 22, fontWeight: 'bold', color: colores.texto, marginTop: 12 }}>La cuenta está vacía</Text>
              <Text style={{ fontSize: 16, color: colores.gris, textAlign: 'center', marginVertical: 8 }}>
                Escanea un producto para agregarlo.
              </Text>
              <Button
                title="Ir a escanear"
                onPress={() => navigation.navigate('Escanear')}
                containerStyle={{ marginTop: 8 }}
                buttonStyle={{ backgroundColor: colores.verde, paddingHorizontal: 28, borderRadius: 12 }}
              />
            </View>
          }
          renderItem={({ item }) => (
            <View
              style={{
                backgroundColor: colores.blanco, borderRadius: 14, padding: 12, marginBottom: 10,
                flexDirection: 'row', alignItems: 'center', ...sombra,
              }}
            >
              <View style={{ flex: 1, paddingRight: 8 }}>
                <Text numberOfLines={2} style={{ fontSize: 16, fontWeight: 'bold', color: colores.texto }}>{item.nombre}</Text>
                <Text style={{ fontSize: 14, color: colores.gris }}>{peso(item.venta)} c/u</Text>
                {item.excede && (
                  <Text style={{ fontSize: 13, fontWeight: 'bold', color: colores.naranja, marginTop: 2 }}>
                    {item.disponible > 0 ? `Solo hay ${item.disponible} en existencias` : 'Sin existencias registradas'}
                  </Text>
                )}
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <Paso
                    icono={item.cant === 1 ? 'delete-outline' : 'minus'}
                    color={item.cant === 1 ? colores.rojo : colores.texto}
                    etiqueta={item.cant === 1 ? 'Quitar de la cuenta' : 'Quitar una pieza'}
                    onPress={() => vm.cambiarCantidad(item.codigo, -1)}
                  />
                  <Text style={{ fontSize: 18, fontWeight: 'bold', minWidth: 24, textAlign: 'center', color: colores.texto }}>
                    {item.cant}
                  </Text>
                  <Paso icono="plus" color={colores.verde} etiqueta="Agregar una pieza" onPress={() => vm.cambiarCantidad(item.codigo, 1)} />
                </View>
                <Text style={{ fontSize: 15, fontWeight: 'bold', color: colores.verdeOscuro, marginTop: 6 }}>
                  {peso(item.venta * item.cant)}
                </Text>
              </View>
            </View>
          )}
        />

        {vm.cuenta.length > 0 && (
          <View
            style={{
              backgroundColor: colores.blanco, borderTopLeftRadius: 20, borderTopRightRadius: 20,
              padding: 16, paddingBottom: 12, ...sombra,
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <Text style={{ fontSize: 16, color: colores.gris }}>Total a cobrar</Text>
              <Text style={{ fontSize: 32, fontWeight: 'bold', color: colores.verdeOscuro }}>{peso(vm.importe)}</Text>
            </View>

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
              {vm.opciones.map((o) => {
                const activo = parseFloat(vm.recibido) === o.valor;
                return (
                  <Pressable
                    key={o.etiqueta}
                    onPress={() => vm.setRecibido(String(o.valor))}
                    style={{
                      paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20, borderWidth: 1.5,
                      borderColor: colores.verde, backgroundColor: activo ? colores.verde : colores.blanco,
                    }}
                  >
                    <Text style={{ fontSize: 15, fontWeight: 'bold', color: activo ? colores.blanco : colores.verde }}>{o.etiqueta}</Text>
                  </Pressable>
                );
              })}
            </View>

            <Input
              placeholder="Efectivo recibido"
              value={vm.recibido}
              onChangeText={vm.setRecibido}
              keyboardType="decimal-pad"
              containerStyle={{ paddingHorizontal: 0, marginTop: 10 }}
              leftIcon={{ name: 'cash', type: 'mci', color: colores.verde }}
            />

            {vm.recibido !== '' && (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
                <Text style={{ fontSize: 16, color: colores.gris }}>{vm.cambio >= 0 ? 'Cambio a devolver' : 'Faltan'}</Text>
                <Text style={{ fontSize: 24, fontWeight: 'bold', color: vm.cambio >= 0 ? colores.verde : colores.naranja }}>
                  {peso(Math.abs(vm.cambio))}
                </Text>
              </View>
            )}

            {vm.hayExceso && (
              <Text style={{ fontSize: 14, color: colores.naranja, marginBottom: 8 }}>
                Hay productos que superan las existencias. Puedes cobrar, pero revisa tu inventario.
              </Text>
            )}
            <Button
              title="Cobrar en efectivo"
              disabled={!vm.alcanza}
              onPress={() => vm.cobrar('efectivo')}
              containerStyle={{ marginBottom: 8 }}
              buttonStyle={{ backgroundColor: colores.verde, paddingVertical: 14, borderRadius: 12 }}
              disabledStyle={{ backgroundColor: '#c8e6c9', borderRadius: 12, paddingVertical: 14 }}
              disabledTitleStyle={{ color: colores.blanco }}
              titleStyle={{ fontWeight: 'bold' }}
            />
            <Button
              title="Registrar pago con tarjeta"
              type="outline"
              onPress={() => vm.cobrar('tarjeta')}
              buttonStyle={{ borderColor: colores.verde, borderWidth: 1.5, paddingVertical: 12, borderRadius: 12 }}
              titleStyle={{ color: colores.verde, fontWeight: 'bold' }}
            />
            <Text style={{ fontSize: 13, color: colores.gris, textAlign: 'center', marginTop: 6 }}>
              La app solo registra el pago; el cobro se hace en tu terminal.
            </Text>
          </View>
        )}
      </KeyboardAvoidingView>

      {vm.confirmacion && <Confirmacion datos={vm.confirmacion} onCerrar={vm.cerrarConfirmacion} />}
    </View>
  );
}
