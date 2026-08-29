import { Stack } from 'expo-router';
import {
  useFonts, SourceSerif4_400Regular, SourceSerif4_600SemiBold,
  SourceSerif4_600SemiBold_Italic, SourceSerif4_700Bold,
} from '@expo-google-fonts/source-serif-4';
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from '@expo-google-fonts/inter';

export default function RootLayout() {
  const [loaded] = useFonts({
    SourceSerif4_400Regular, SourceSerif4_600SemiBold, SourceSerif4_600SemiBold_Italic, SourceSerif4_700Bold,
    Inter_400Regular, Inter_500Medium, Inter_600SemiBold,
  });
  if (!loaded) return null;
  return <Stack screenOptions={{ headerShown: false }} />;
}
