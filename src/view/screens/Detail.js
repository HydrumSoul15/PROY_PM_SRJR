// VIEW · Detalle de producto: dibuja la ficha o el formulario y avisa al ViewModel lo que hace el usuario
import React, { useLayoutEffect } from 'react';
import { Alert, Image, KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { Button, Icon, Input, Text } from '@rneui/themed';
import { useDetailViewModel } from '../../viewmodel/useDetailViewModel';
import { colores, sombra } from '../theme';
import { estiloDeStock, peso } from '../formato';

const caja = { backgroundColor: colores.blanco, borderRadius: 16, padding: 16, marginBottom: 14, ...sombra };
const AVISO = { agotado: 'Ya no hay piezas.', bajo: '¡Surtir pronto!', ok: 'Hay existencias suficientes.' };
const etiqueta = { color: colores.texto, fontSize: 16 };

export default function Detail({ route, navigation }) {
  const vm = useDetailViewModel(route.params);
  const { producto: p, form: f, set } = vm;

  useLayoutEffect(() => {
    navigation.setOptions({ title: vm.editando ? (vm.nuevo ? 'Nuevo producto' : 'Editar producto') : 'Producto' });
  }, [navigation, vm.editando, vm.nuevo]);

  const guardar = () => {
    const r = vm.guardar();
    if (!r.ok) return Alert.alert(r.titulo, r.mensaje);
    if (r.volver) navigation.goBack();
  };
  const cancelar = () => (vm.nuevo ? navigation.goBack() : vm.cancelarEdicion());
  const conFoto = async (accion) => {
    if ((await accion()) === 'sinPermiso')
      Alert.alert('Permiso necesario', 'Activa el permiso de la cámara para tomar la foto.');
  };
  const eliminar = () =>
    Alert.alert('Eliminar producto', `¿Dar de baja "${p.nombre}"?`, [
      { text: 'Cancelar' },
      { text: 'Eliminar', style: 'destructive', onPress: () => { vm.eliminar(); navigation.goBack(); } },
    ]);

  if (!vm.editando && !p) return null;

  // ---------- Modo edición / producto nuevo ----------
  if (vm.editando)
    return (
      <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colores.crema }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
          {vm.esCopia && (
            <View style={{ ...caja, backgroundColor: '#fff3e0' }}>
              <Text style={{ fontSize: 15, color: colores.texto }}>
                Copia de otro producto: escribe el nuevo código de barras y ajusta lo que cambie.
              </Text>
            </View>
          )}

          <View style={{ ...caja, alignItems: 'center' }}>
            {f.foto ? (
              <Image source={{ uri: f.foto }} style={{ width: 160, height: 160, borderRadius: 12 }} />
            ) : (
              <View style={{ width: 160, height: 160, borderRadius: 12, backgroundColor: '#eee', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="camera-outline" type="mci" size={48} color={colores.gris} />
                <Text style={{ color: colores.gris, fontSize: 14 }}>Sin foto</Text>
              </View>
            )}
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
              <Button
                title="Tomar foto"
                size="sm"
                onPress={() => conFoto(vm.tomarFoto)}
                buttonStyle={{ backgroundColor: colores.verde, borderRadius: 10 }}
              />
              <Button
                title="Galería"
                size="sm"
                type="outline"
                onPress={() => conFoto(vm.elegirFoto)}
                buttonStyle={{ borderColor: colores.verde, borderRadius: 10 }}
                titleStyle={{ color: colores.verde }}
              />
            </View>
          </View>

          <View style={caja}>
            <Input label="Código de barras" labelStyle={etiqueta} value={f.codigo} onChangeText={set('codigo')} keyboardType="numeric" disabled={!vm.nuevo} />
            <Input label="Nombre (ej. Doritos 150 g)" labelStyle={etiqueta} value={f.nombre} onChangeText={set('nombre')} />
            <Input label="Categoría (ej. Comida)" labelStyle={etiqueta} value={f.categoria} onChangeText={set('categoria')} />
            <Input label="Tipo (ej. Frituras)" labelStyle={etiqueta} value={f.tipo} onChangeText={set('tipo')} />
            <Input label="Presentación (ej. Bolsa Pequeña)" labelStyle={etiqueta} value={f.presentacion} onChangeText={set('presentacion')} />
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colores.crema, borderRadius: 10, padding: 10 }}>
              <Icon name="key-variant" type="mci" size={20} color={colores.verde} />
              <Text style={{ fontSize: 15, color: colores.texto, marginLeft: 8, flex: 1 }}>
                Clave interna: <Text style={{ fontWeight: 'bold' }}>{vm.claveMostrada}</Text>
                {'  '}(se genera sola)
              </Text>
            </View>
          </View>

          <View style={caja}>
            {vm.puedeVerCostos && <Input label="Precio de compra" labelStyle={etiqueta} value={f.compra} onChangeText={set('compra')} keyboardType="decimal-pad" />}
            <Input label="Precio de venta" labelStyle={etiqueta} value={f.venta} onChangeText={set('venta')} keyboardType="decimal-pad" />
            <Input label="Existencias" labelStyle={etiqueta} value={f.stock} onChangeText={set('stock')} keyboardType="numeric" />
          </View>

          <Button
            title="Guardar"
            onPress={guardar}
            containerStyle={{ marginBottom: 10 }}
            buttonStyle={{ backgroundColor: colores.verde, paddingVertical: 14, borderRadius: 12 }}
            titleStyle={{ fontWeight: 'bold' }}
          />
          <Button
            title="Cancelar"
            type="outline"
            onPress={cancelar}
            buttonStyle={{ borderColor: colores.gris, borderWidth: 1.5, paddingVertical: 12, borderRadius: 12 }}
            titleStyle={{ color: colores.gris, fontWeight: 'bold' }}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    );

  // ---------- Ficha del producto ----------
  const e = estiloDeStock(vm.nivel, p.stock);
  const datos = [p.categoria, p.tipo, p.presentacion].filter(Boolean);
  return (
    <ScrollView style={{ flex: 1, backgroundColor: colores.crema }} contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
      <View style={caja}>
        {p.foto ? (
          <Image source={{ uri: p.foto }} style={{ width: '100%', height: 220, borderRadius: 12 }} resizeMode="cover" />
        ) : (
          <View style={{ height: 120, borderRadius: 12, backgroundColor: colores.verde, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 56, fontWeight: 'bold', color: colores.blanco }}>{p.nombre[0]}</Text>
          </View>
        )}
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: colores.texto, marginTop: 14 }}>{p.nombre}</Text>
        {datos.length > 0 && (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
            {datos.map((d) => (
              <View key={d} style={{ backgroundColor: colores.crema, borderRadius: 12, paddingVertical: 4, paddingHorizontal: 10 }}>
                <Text style={{ fontSize: 14, color: colores.texto }}>{d}</Text>
              </View>
            ))}
          </View>
        )}
        <Text style={{ fontSize: 40, fontWeight: 'bold', color: colores.verdeOscuro, marginTop: 10 }}>{peso(p.venta)}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
          <View style={{ backgroundColor: e.fondo, borderRadius: 12, paddingVertical: 4, paddingHorizontal: 10 }}>
            <Text style={{ fontSize: 15, fontWeight: 'bold', color: e.tinta }}>
              {vm.nivel === 'agotado' ? 'Agotado' : `Existencias: ${p.stock}`}
            </Text>
          </View>
          <Text style={{ fontSize: 15, color: e.tinta, marginLeft: 10, flex: 1 }}>{AVISO[vm.nivel]}</Text>
        </View>
      </View>

      {vm.puedeVerCostos && (
        <View style={{ ...caja, flexDirection: 'row', justifyContent: 'space-between' }}>
          <View>
            <Text style={{ fontSize: 14, color: colores.gris }}>Precio de compra</Text>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: colores.texto }}>{peso(p.compra)}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ fontSize: 14, color: colores.gris }}>Ganancia por pieza</Text>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: colores.verde }}>{peso(p.venta - p.compra)}</Text>
          </View>
        </View>
      )}

      <View style={caja}>
        <Text style={{ fontSize: 15, color: colores.texto }}>
          Clave: <Text style={{ fontWeight: 'bold' }}>{p.clave ?? 'sin clave (edita para generarla)'}</Text>
        </Text>
        <Text style={{ fontSize: 14, color: colores.gris, marginTop: 4 }}>Código de barras: {p.codigo}</Text>
      </View>

      <Button
        title="Agregar a la cuenta"
        icon={{ name: 'cart-plus', type: 'mci', color: colores.blanco }}
        onPress={() => { vm.agregarALaCuenta(); navigation.navigate('Tabs', { screen: 'Cobro' }); }}
        containerStyle={{ marginBottom: 10 }}
        buttonStyle={{ backgroundColor: colores.verde, paddingVertical: 14, borderRadius: 12 }}
        titleStyle={{ fontWeight: 'bold' }}
      />
      <View style={{ flexDirection: 'row', gap: 10 }}>
        {vm.puedeEditar && (
        <Button
          title="Editar"
          type="outline"
          icon={{ name: 'pencil-outline', type: 'mci', color: colores.verde, size: 20 }}
          onPress={vm.empezarEdicion}
          containerStyle={{ flex: 1 }}
          buttonStyle={{ borderColor: colores.verde, borderWidth: 1.5, paddingVertical: 11, borderRadius: 12 }}
          titleStyle={{ color: colores.verde, fontWeight: 'bold' }}
        />
        )}
        <Button
          title="Duplicar"
          type="outline"
          icon={{ name: 'content-copy', type: 'mci', color: colores.verde, size: 20 }}
          onPress={() => navigation.push('Detalle', { codigo: '', nuevo: true, copiaDe: p.codigo })}
          containerStyle={{ flex: 1 }}
          buttonStyle={{ borderColor: colores.verde, borderWidth: 1.5, paddingVertical: 11, borderRadius: 12 }}
          titleStyle={{ color: colores.verde, fontWeight: 'bold' }}
        />
      </View>
      {vm.puedeEliminar && (
      <Button
        title="Eliminar producto"
        type="clear"
        icon={{ name: 'delete-outline', type: 'mci', color: colores.rojo, size: 20 }}
        onPress={eliminar}
        containerStyle={{ marginTop: 8 }}
        titleStyle={{ color: colores.rojo, fontSize: 16 }}
      />
      )}
    </ScrollView>
  );
}
