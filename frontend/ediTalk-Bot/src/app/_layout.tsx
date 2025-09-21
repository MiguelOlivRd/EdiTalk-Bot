import React, { useEffect, useState } from "react";
import { Stack } from "expo-router";
import { useFonts } from "expo-font";
import { SafeAreaView, StyleSheet } from "react-native";
import * as SplashScreen from "expo-splash-screen";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  
  const [appIsReady, setAppIsReady] = useState(false);
  
  const [fontsLoaded, fontError] = useFonts({
    "PlusJakartaSans-Bold": require("../../assets/fonts/PlusJakartaSans-Bold.ttf"),
    "PlusJakartaSans-Medium": require("../../assets/fonts/PlusJakartaSans-Medium.ttf"),
  });  

  useEffect(() => {
    async function prepare() {
      try {
        // Aguarda as fontes carregarem com timeout
        if (fontsLoaded || fontError) {
          setAppIsReady(true);
          await SplashScreen.hideAsync();
        }
      } catch (e) {
        console.warn('Erro ao carregar fontes:', e);
        setAppIsReady(true);
        await SplashScreen.hideAsync();
      }
    }

    // Timeout de segurança para evitar travamento
    const timeoutId = setTimeout(() => {
      if (!appIsReady) {
        console.warn('Timeout no carregamento de fontes, continuando sem elas');
        setAppIsReady(true);
        SplashScreen.hideAsync();
      }
    }, 2000);

    prepare();

    return () => clearTimeout(timeoutId);
  }, [fontsLoaded, fontError, appIsReady]);  

  if (!appIsReady) {
    return null;
  }  


  return (
      <SafeAreaView style={styles.safeArea}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="pages/Chat" options={{ headerShown: false }} />
        </Stack>
      </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f7fbfa", 
  },
});
