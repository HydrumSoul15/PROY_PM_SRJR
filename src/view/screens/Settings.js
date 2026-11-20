// VIEW · Ajustes (solo dueño): respaldo de datos y usuarios
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { Button, Icon, Input, Text } from '@rneui/themed';
import { useSettingsViewModel } from '../../viewmodel/useSettingsViewModel';
import { colores, sombra } from '../theme';

const caja = { backgroundColor: colores.blanco, borderRadius: 16, padding: 16, marginBottom: 16, ...sombra };
const titulo = { fontSize: 18, fontWeight: 'bold', color: colores.texto };
const texto = { fontSize: 15, color: colores.gris, marginTop: 4, marginBottom: 12 };
const botonVerde = { backgroundColor: colores.verde, paddingVertical: 12, borderRadius: 12 };
const botonLinea = { borderColor: colores.verde, borderWidth: 1.5, paddingVertical: 11, borderRadius: 12 };

export default function Settings() {
  const vm = useSettingsViewModel();
  const [cambiandoId, setCambiandoId] = useState(null);
  const [nuevaPass, setNuevaPass] = useState('');
  const [agregando, setAgregando] = useState(false);

  const guardarRespaldo = async () => {
    try {
      await vm.guardarRespaldo();
    } catch (e) {
      Alert.alert('No se pudo crear el respaldo', e.message);
    }
  };

  const restaurar = () =>
    Alert.alert(
      'Restaurar respaldo',
      'Se reemplazarán TODOS los productos, ventas y usuarios actuales por los del archivo. Después tendrás que volver a entrar.',
      [
        { text: 'Cancelar' },
        {
          text: 'Elegir archivo',
          style: 'destructive',
          onPress: async () => {
            try {
              const r = await vm.restaurarRespaldo();
              if (!r) return;
              if (!r.ok) return Alert.alert('Archivo no válido', 'Ese archivo no es un respaldo de Mi Casita o está dañado. No se cambió nada.');
              Alert.alert('Respaldo restaurado', `${r.productos} productos y ${r.ventas} ventas. Vuelve a entrar con tu usuario.`);
            } catch (e) {
              Alert.alert('No se pudo leer el archivo', 'Revisa que sea un respaldo de Mi Casita (.json).');
            }
          },
        },
      ]
    );

  const guardarPass = async (id) => {
    const error = await vm.cambiarPassword(id, nuevaPass);
    if (error) return Alert.alert('No se pudo cambiar', error);
    setCambiandoId(null);
    setNuevaPass('');
    Alert.alert('Listo', 'La contraseña se cambió.');
  };

  const agregar = async () => {
    const error = await vm.agregarEmpleado();
    if (error) return Alert.alert('No se pudo agregar', error);
    setAgregando(false);
  };

  const eliminar = (u) =>
    Alert.alert('Eliminar usuario', `¿Quitar a ${u.nombre}? Ya no podrá entrar a la app.`, [
      { text: 'Cancelar' },
      { text: 'Eliminar', style: 'destructive', onPress: () => vm.eliminarUsuario(u.id) },
    ]);

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colores.crema }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
        {vm.errorGuardado && (
          <View style={{ ...caja, backgroundColor: '#fff3e0', flexDirection: 'row', alignItems: 'center' }}>
            <Icon name="alert-outline" type="mci" size={26} color={colores.naranja} />
            <Text style={{ flex: 1, marginLeft: 10, fontSize: 15, color: colores.texto }}>
              No se pudieron guardar los últimos cambios en el teléfono. Haz un respaldo ahora.
            </Text>
          </View>
        )}

        <View style={caja}>
          <Text style={titulo}>Respaldo de datos</Text>
          <Text style={texto}>
            Tienes {vm.conteo.productos} productos y {vm.conteo.ventas} ventas guardados en este teléfono. Haz una copia en un
            archivo para recuperarla si cambias de teléfono o reinstalas la app.
          </Text>
          <Button
            title="Guardar respaldo"
            icon={{ name: 'content-save-outline', type: 'mci', color: colores.blanco, size: 20 }}
            onPress={guardarRespaldo}
            containerStyle={{ marginBottom: 10 }}
            buttonStyle={botonVerde}
            titleStyle={{ fontWeight: 'bold' }}
          />
          <Button
            title="Restaurar respaldo"
            type="outline"
            icon={{ name: 'backup-restore', type: 'mci', color: colores.verde, size: 20 }}
            onPress={restaurar}
            buttonStyle={botonLinea}
            titleStyle={{ color: colores.verde, fontWeight: 'bold' }}
          />
        </View>

        <View style={caja}>
          <Text style={titulo}>Usuarios</Text>
          <Text style={texto}>Las contraseñas no se guardan tal cual: solo una versión cifrada.</Text>

          {vm.usuarios.map((u) => (
            <View key={u.id} style={{ borderTopWidth: 1, borderTopColor: '#eee', paddingVertical: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <View
                  style={{
                    width: 40, height: 40, borderRadius: 20, backgroundColor: '#e8f5e9',
                    alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <Icon name={u.esDueno ? 'shield-account-outline' : 'account-outline'} type="mci" size={22} color={colores.verde} />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={{ fontSize: 16, fontWeight: 'bold', color: colores.texto }}>
                    {u.nombre}
                    {u.id === vm.miId ? ' (tú)' : ''}
                  </Text>
                  <Text style={{ fontSize: 14, color: colores.gris }}>{u.email} · {u.rol}</Text>
                </View>
              </View>

              {cambiandoId === u.id ? (
                <View>
                  <Input
                    placeholder="Nueva contraseña"
                    value={nuevaPass}
                    onChangeText={setNuevaPass}
                    secureTextEntry
                    autoCapitalize="none"
                    containerStyle={{ paddingHorizontal: 0 }}
                    leftIcon={{ name: 'lock-outline', type: 'mci', color: colores.verde }}
                  />
                  <View style={{ flexDirection: 'row', gap: 10 }}>
                    <Button title="Guardar" onPress={() => guardarPass(u.id)} containerStyle={{ flex: 1 }} buttonStyle={botonVerde} />
                    <Button
                      title="Cancelar"
                      type="outline"
                      onPress={() => { setCambiandoId(null); setNuevaPass(''); }}
                      containerStyle={{ flex: 1 }}
                      buttonStyle={{ ...botonLinea, borderColor: colores.gris }}
                      titleStyle={{ color: colores.gris }}
                    />
                  </View>
                </View>
              ) : (
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <Button
                    title="Cambiar contraseña"
                    type="outline"
                    size="sm"
                    onPress={() => { setCambiandoId(u.id); setNuevaPass(''); }}
                    buttonStyle={{ borderColor: colores.verde, borderRadius: 10 }}
                    titleStyle={{ color: colores.verde, fontSize: 15 }}
                  />
                  {vm.puedeEliminar(u.id) && (
                    <Button
                      title="Eliminar"
                      type="clear"
                      size="sm"
                      onPress={() => eliminar(u)}
                      titleStyle={{ color: colores.rojo, fontSize: 15 }}
                    />
                  )}
                </View>
              )}
            </View>
          ))}

          {agregando ? (
            <View style={{ borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 12 }}>
              <Text style={{ fontSize: 16, fontWeight: 'bold', color: colores.texto, marginBottom: 8 }}>Nuevo empleado</Text>
              <Input placeholder="Nombre" value={vm.nuevo.nombre} onChangeText={vm.set('nombre')} containerStyle={{ paddingHorizontal: 0 }} />
              <Input
                placeholder="Correo"
                value={vm.nuevo.email}
                onChangeText={vm.set('email')}
                autoCapitalize="none"
                keyboardType="email-address"
                containerStyle={{ paddingHorizontal: 0 }}
              />
              <Input
                placeholder="Contraseña"
                value={vm.nuevo.pass}
                onChangeText={vm.set('pass')}
                secureTextEntry
                autoCapitalize="none"
                containerStyle={{ paddingHorizontal: 0 }}
              />
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <Button title="Agregar" onPress={agregar} containerStyle={{ flex: 1 }} buttonStyle={botonVerde} />
                <Button
                  title="Cancelar"
                  type="outline"
                  onPress={() => setAgregando(false)}
                  containerStyle={{ flex: 1 }}
                  buttonStyle={{ ...botonLinea, borderColor: colores.gris }}
                  titleStyle={{ color: colores.gris }}
                />
              </View>
            </View>
          ) : (
            <Button
              title="Agregar empleado"
              type="outline"
              icon={{ name: 'account-plus-outline', type: 'mci', color: colores.verde, size: 20 }}
              onPress={() => setAgregando(true)}
              containerStyle={{ marginTop: 8 }}
              buttonStyle={botonLinea}
              titleStyle={{ color: colores.verde, fontWeight: 'bold' }}
            />
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
