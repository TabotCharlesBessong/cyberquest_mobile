import { Stack } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { BottomTabs } from '@/components/BottomTabs';

export default function TabsLayout() {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: '#F4F7FF' },
            animation: 'fade',
          }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="profile" />
        </Stack>
      </View>
      <BottomTabs />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F7FF' },
  content: { flex: 1 },
});
