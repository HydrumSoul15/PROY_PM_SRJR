// VIEW · Ventas: solo dibuja lo que le entrega el ViewModel
import React from 'react';
import { Alert, FlatList, Pressable, View } from 'react-native';
import { Button, Icon, Text } from '@rneui/themed';
import { useSalesViewModel } from '../../viewmodel/useSalesViewModel';
import { colores, sombra } from '../theme';
import { diaYHora, horaCorta, peso } from '../formato';

const caja = { backgroundColor: colores.blanco, borderRadius: 16, ...sombra };

const Dato = ({ icono, color, etiqueta, valor }) => (
  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
    <Icon name={icono} type="mci" size={22} color={color} />
    <View style={{ marginLeft: 8 }}>
      <Text style={{ fontSize: 14, color: colores.gris }}>{etiqueta}</Text>
      <Text style={{ fontSize: 17, fontWeight: 'bold', color: colores.texto }}>{valor}</Text>
    </View>
  </View>
);

function Periodo({ texto, activo, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        paddingVertical: 7, paddingHorizontal: 14, borderRadius: 20, borderWidth: 1.5,
        borderColor: colores.verde, backgroundColor: activo ? colores.verde : colores.blanco,
      }}
    >
      <Text style={{ fontSize: 15, fontWeight: 'bold', color: activo ? colores.blanco : colores.verde }}>{texto}</Text>
    </Pressable>
  );
}

export default function Sales() {
  const vm = useSalesViewModel();
  const { resumen } = vm;
  const n = resumen.cantidad;
  const esHoy = vm.periodo === 'hoy';

  const cancelar = (v) =>
    Alert.alert(
      'Cancelar venta',
      `Se quitarán ${peso(v.total)} de los totales y las piezas regresarán al inventario. Esta acción no se puede deshacer.`,
      [
        { text: 'Volver' },
        { text: 'Cancelar venta', style: 'destructive', onPress: () => vm.cancelar(v.id) },
      ]
    );

  return (
    <FlatList
      style={{ backgroundColor: colores.crema }}
      contentContainerStyle={{ padding: 16, paddingBottom: 32, flexGrow: 1 }}
      data={vm.ventas}
      keyExtractor={(v) => String(v.id)}
      ListHeaderComponent={
        <View style={{ marginBottom: vm.ventas.length ? 8 : 0 }}>
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 14 }}>
            {vm.periodos.map((p) => (
              <Periodo key={p.id} texto={p.etiqueta} activo={vm.periodo === p.id} onPress={() => vm.setPeriodo(p.id)} />
            ))}
          </View>
          <View style={{ ...caja, padding: 16 }}>
            <Text style={{ fontSize: 15, color: colores.gris }}>{vm.tituloPeriodo}</Text>
            <Text style={{ fontSize: 38, fontWeight: 'bold', color: colores.verdeOscuro }}>{peso(resumen.total)}</Text>
            <Text style={{ fontSize: 15, color: colores.gris }}>
              {n} {n === 1 ? 'venta' : 'ventas'} · Ganancia bruta {peso(resumen.ganancia)}
            </Text>
            <View style={{ height: 1, backgroundColor: '#eee', marginVertical: 14 }} />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Dato icono="cash" color={colores.verde} etiqueta="En efectivo" valor={peso(resumen.efectivo)} />
              <Dato icono="credit-card-outline" color={colores.naranja} etiqueta="Con tarjeta" valor={peso(resumen.tarjeta)} />
            </View>
          </View>
          {vm.ventas.length > 0 && (
            <Text style={{ fontSize: 17, fontWeight: 'bold', color: colores.texto, marginTop: 20 }}>
              {esHoy ? 'Ventas de hoy' : 'Ventas del periodo'}
            </Text>
          )}
        </View>
      }
      ListEmptyComponent={
        <View style={{ alignItems: 'center', padding: 32 }}>
          <Icon name="receipt" type="mci" size={64} color={colores.verde} />
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: colores.texto, marginTop: 10 }}>
            {esHoy ? 'Aún no hay ventas hoy' : 'No hay ventas en este periodo'}
          </Text>
          <Text style={{ fontSize: 15, color: colores.gris, textAlign: 'center', marginTop: 6 }}>
            Cuando cobres una cuenta, aparecerá aquí.
          </Text>
        </View>
      }
      renderItem={({ item }) => {
        const abierto = vm.abierta === item.id;
        const efec = item.metodo === 'efectivo';
        const cancelada = !!item.cancelada;
        const pzas = item.items.reduce((s, i) => s + i.cant, 0);
        return (
          <Pressable
            onPress={() => vm.alternar(item.id)}
            style={{ ...caja, padding: 14, marginTop: 10, opacity: cancelada ? 0.65 : 1 }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View
                style={{
                  width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center',
                  backgroundColor: cancelada ? '#eeeeee' : efec ? '#e8f5e9' : '#fff3e0',
                }}
              >
                <Icon
                  name={cancelada ? 'close' : efec ? 'cash' : 'credit-card-outline'}
                  type="mci"
                  size={22}
                  color={cancelada ? colores.gris : efec ? colores.verde : colores.naranja}
                />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text
                    style={{
                      fontSize: 18, fontWeight: 'bold', color: colores.texto,
                      textDecorationLine: cancelada ? 'line-through' : 'none',
                    }}
                  >
                    {peso(item.total)}
                  </Text>
                  {cancelada && (
                    <View style={{ backgroundColor: '#ffebee', borderRadius: 10, paddingVertical: 2, paddingHorizontal: 8, marginLeft: 8 }}>
                      <Text style={{ fontSize: 12, fontWeight: 'bold', color: colores.rojo }}>Cancelada</Text>
                    </View>
                  )}
                </View>
                <Text style={{ fontSize: 14, color: colores.gris }}>
                  {esHoy ? horaCorta(item.fecha) : diaYHora(item.fecha)} · {pzas} {pzas === 1 ? 'pieza' : 'piezas'} · {item.usuario}
                </Text>
              </View>
              <Icon name={abierto ? 'chevron-up' : 'chevron-down'} type="mci" size={24} color={colores.gris} />
            </View>
            {abierto && (
              <View style={{ marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#eee' }}>
                {item.items.map((i) => (
                  <Text key={i.codigo} style={{ fontSize: 15, color: colores.texto, marginBottom: 2 }}>
                    {i.cant} × {i.nombre}
                  </Text>
                ))}
                <Text style={{ fontSize: 14, color: colores.gris, marginTop: 6 }}>Pago con {efec ? 'efectivo' : 'tarjeta'}</Text>
                {cancelada ? (
                  <Text style={{ fontSize: 14, color: colores.rojo, marginTop: 4 }}>
                    Venta cancelada: las piezas regresaron al inventario.
                  </Text>
                ) : (
                  vm.puedeCancelar && (
                    <Button
                      title="Cancelar esta venta"
                      type="clear"
                      icon={{ name: 'close-circle-outline', type: 'mci', color: colores.rojo, size: 20 }}
                      titleStyle={{ color: colores.rojo, fontSize: 16 }}
                      containerStyle={{ alignSelf: 'flex-start', marginTop: 4 }}
                      onPress={() => cancelar(item)}
                    />
                  )
                )}
              </View>
            )}
          </Pressable>
        );
      }}
    />
  );
}
