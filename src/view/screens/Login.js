// VIEW · Login: solo dibuja la pantalla y le avisa al ViewModel lo que hace el usuario
import React, { useEffect, useRef } from 'react';
import { Animated, Image, KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { Button, Icon, Input, Text } from '@rneui/themed';
import { useLoginViewModel } from '../../viewmodel/useLoginViewModel';
import { colores, sombra } from '../theme';

// Déjalo en false para la entrega al cliente: oculta los accesos de prueba
const MODO_DEMO = true;

export default function Login() {
  const vm = useLoginViewModel();
  const passRef = useRef(null);

  // Único movimiento de entrada: el logo aparece con un fundido y crece un poco
  const logoAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(logoAnim, { toValue: 1, duration: 700, useNativeDriver: true }).start();
  }, [logoAnim]);

  // La tarjeta se sacude cuando algo sale mal, para que se note el error
  const sacudida = useRef(new Animated.Value(0)).current;
  const sacudir = () =>
    Animated.sequence([
      Animated.timing(sacudida, { toValue: 10, duration: 60, useNativeDriver: true }),
      Animated.timing(sacudida, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(sacudida, { toValue: 6, duration: 60, useNativeDriver: true }),
      Animated.timing(sacudida, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();

  const entrar = async () => {
    if (!(await vm.entrar())) sacudir();
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colores.crema }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 20 }}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View
          style={{
            alignSelf: 'center',
            marginBottom: 24,
            borderRadius: 90,
            backgroundColor: colores.crema,
            ...sombra,
            opacity: logoAnim,
            transform: [{ scale: logoAnim.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] }) }],
          }}
        >
          <Image source={require('../../../assets/logo.png')} style={{ width: 180, height: 180, borderRadius: 90 }} />
        </Animated.View>

        <Animated.View
          style={{
            backgroundColor: colores.blanco,
            borderRadius: 16,
            paddingTop: 20,
            paddingHorizontal: 8,
            paddingBottom: 16,
            ...sombra,
            transform: [{ translateX: sacudida }],
          }}
        >
          <Input
            label="Correo"
            labelStyle={{ color: colores.texto, fontSize: 16 }}
            value={vm.email}
            onChangeText={vm.cambiarEmail}
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            keyboardType="email-address"
            returnKeyType="next"
            onSubmitEditing={() => passRef.current?.focus()}
            leftIcon={{ name: 'email-outline', type: 'mci', color: colores.verde }}
          />
          <Input
            ref={passRef}
            label="Contraseña"
            labelStyle={{ color: colores.texto, fontSize: 16 }}
            value={vm.pass}
            onChangeText={vm.cambiarPass}
            secureTextEntry={!vm.verPass}
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="password"
            returnKeyType="done"
            onSubmitEditing={entrar}
            leftIcon={{ name: 'lock-outline', type: 'mci', color: colores.verde }}
            rightIcon={{
              name: vm.verPass ? 'eye-off-outline' : 'eye-outline',
              type: 'mci',
              color: colores.gris,
              onPress: vm.alternarVerPass,
            }}
          />

          {vm.error !== '' && (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginHorizontal: 10, marginBottom: 12 }}>
              <Icon name="alert-circle-outline" type="mci" color={colores.rojo} size={22} />
              <Text style={{ color: colores.rojo, fontSize: 15, marginLeft: 6, flex: 1 }}>{vm.error}</Text>
            </View>
          )}

          <Button
            title="Entrar"
            onPress={entrar}
            containerStyle={{ marginHorizontal: 10 }}
            buttonStyle={{ backgroundColor: colores.verde, paddingVertical: 14, borderRadius: 12 }}
            titleStyle={{ fontWeight: 'bold' }}
          />
        </Animated.View>

        {MODO_DEMO && (
          <View style={{ marginTop: 20 }}>
            <Text style={{ textAlign: 'center', color: colores.gris, fontSize: 15, marginBottom: 8 }}>
              Acceso de prueba (contraseña 1234)
            </Text>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              {vm.cuentasDemo.map((u) => (
                <Button
                  key={u.email}
                  title={u.nombre}
                  type="outline"
                  size="sm"
                  onPress={() => vm.entrarComo(u)}
                  containerStyle={{ flex: 1 }}
                  buttonStyle={{ borderColor: colores.verde }}
                  titleStyle={{ color: colores.verde, fontSize: 16 }}
                />
              ))}
            </View>
          </View>
        )}

        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 20 }}>
          <Icon name="cellphone-check" type="mci" color={colores.gris} size={18} />
          <Text style={{ color: colores.gris, fontSize: 14, marginLeft: 6 }}>
            Tus datos se guardan en este teléfono y no necesitas internet.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
