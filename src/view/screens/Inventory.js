// VIEW · Inventario: dibuja la lista y avisa al ViewModel lo que hace el usuario
import React from 'react';
import { Alert, FlatList, Image, Pressable, TextInput, View } from 'react-native';
import { Button, Icon, Text } from '@rneui/themed';
import { useInventoryViewModel } from '../../viewmodel/useInventoryViewModel';
import { colores, sombra } from '../theme';
import { estiloDeStock, peso } from '../formato';

function Filtro({ texto, activo, onPress }) {
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

export default function Inventory({ navigation }) {
  const vm = useInventoryViewModel();

  const importar = async () => {
    try {
      const res = await vm.importar();
      if (!res) return;
      Alert.alert('Importación lista', `${res.nuevos} nuevos, ${res.actualizados} actualizados, ${res.omitidos} omitidos (sin código o nombre).`);
    } catch (e) {
      Alert.alert('No se pudo importar', 'Revisa que sea un .xlsx o .csv con las columnas de la plantilla.\n\n' + e.message);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colores.crema }}>
      <View style={{ padding: 16, paddingBottom: 8 }}>
        <View
          style={{
            flexDirection: 'row', alignItems: 'center', backgroundColor: colores.blanco,
            borderRadius: 14, paddingHorizontal: 12, ...sombra,
          }}
        >
          <Icon name="magnify" type="mci" color={colores.gris} />
          <TextInput
            value={vm.q}
            onChangeText={vm.setQ}
            placeholder="Buscar por nombre, código o clave"
            placeholderTextColor="#9e9e9e"
            autoCorrect={false}
            style={{ flex: 1, fontSize: 16, paddingVertical: 12, paddingHorizontal: 8, color: colores.texto }}
          />
          {vm.q !== '' && (
            <Pressable onPress={() => vm.setQ('')} hitSlop={8} accessibilityLabel="Borrar búsqueda">
              <Icon name="close-circle" type="mci" color={colores.gris} size={20} />
            </Pressable>
          )}
        </View>
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 12, alignItems: 'center' }}>
          <Filtro texto="Todos" activo={!vm.soloBajos} onPress={() => vm.setSoloBajos(false)} />
          <Filtro texto={`Por surtir (${vm.porSurtir})`} activo={vm.soloBajos} onPress={() => vm.setSoloBajos(true)} />
          <Text style={{ flex: 1, textAlign: 'right', fontSize: 14, color: colores.gris }}>
            {vm.lista.length} {vm.lista.length === 1 ? 'producto' : 'productos'}
          </Text>
        </View>
      </View>

      <FlatList
        data={vm.lista}
        keyExtractor={(p) => p.codigo}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16, flexGrow: 1 }}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', padding: 32 }}>
            <Icon name="package-variant" type="mci" size={64} color={colores.verde} />
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: colores.texto, marginTop: 10 }}>
              {vm.hayProductos ? 'No encontramos ese producto' : 'Aún no tienes productos'}
            </Text>
            <Text style={{ fontSize: 15, color: colores.gris, textAlign: 'center', marginTop: 6 }}>
              {vm.hayProductos
                ? 'Revisa el nombre o escribe el código de barras completo.'
                : 'Agrega el primero con el botón "Nuevo producto".'}
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const e = estiloDeStock(vm.nivelDeStock(item), item.stock);
          return (
            <Pressable
              onPress={() => navigation.navigate('Detalle', { codigo: item.codigo })}
              style={({ pressed }) => ({
                flexDirection: 'row', alignItems: 'center', backgroundColor: pressed ? '#f5f5f5' : colores.blanco,
                borderRadius: 14, padding: 12, marginBottom: 10, ...sombra,
              })}
            >
              {item.foto ? (
                <Image source={{ uri: item.foto }} style={{ width: 52, height: 52, borderRadius: 12 }} />
              ) : (
                <View style={{ width: 52, height: 52, borderRadius: 12, backgroundColor: colores.verde, alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ fontSize: 22, fontWeight: 'bold', color: colores.blanco }}>{item.nombre[0]}</Text>
                </View>
              )}
              <View style={{ flex: 1, marginHorizontal: 12 }}>
                <Text numberOfLines={1} style={{ fontSize: 16, fontWeight: 'bold', color: colores.texto }}>{item.nombre}</Text>
                <Text style={{ fontSize: 14, color: colores.gris }}>{item.clave ?? '—'} · {peso(item.venta)}</Text>
              </View>
              <View style={{ backgroundColor: e.fondo, borderRadius: 12, paddingVertical: 4, paddingHorizontal: 10 }}>
                <Text style={{ fontSize: 14, fontWeight: 'bold', color: e.tinta }}>{e.texto}</Text>
              </View>
              <Icon name="chevron-right" type="mci" size={22} color={colores.gris} />
            </Pressable>
          );
        }}
      />

      <View
        style={{
          flexDirection: 'row', gap: 10, padding: 12, backgroundColor: colores.blanco,
          borderTopLeftRadius: 20, borderTopRightRadius: 20, ...sombra,
        }}
      >
        <Button
          title="Nuevo producto"
          icon={{ name: 'plus', type: 'mci', color: colores.blanco, size: 20 }}
          onPress={() => navigation.navigate('Detalle', { codigo: '', nuevo: true })}
          containerStyle={{ flex: 1 }}
          buttonStyle={{ backgroundColor: colores.verde, paddingVertical: 12, borderRadius: 12 }}
          titleStyle={{ fontSize: 16, fontWeight: 'bold' }}
        />
        {vm.puedeImportar && (
          <Button
            title="Importar Excel"
            type="outline"
            icon={{ name: 'file-excel-outline', type: 'mci', color: colores.verde, size: 20 }}
            onPress={importar}
            containerStyle={{ flex: 1 }}
            buttonStyle={{ borderColor: colores.verde, borderWidth: 1.5, paddingVertical: 11, borderRadius: 12 }}
            titleStyle={{ color: colores.verde, fontSize: 16, fontWeight: 'bold' }}
          />
        )}
      </View>
    </View>
  );
}
