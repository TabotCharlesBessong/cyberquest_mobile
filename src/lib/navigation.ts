import { useRouter } from 'expo-router';

export function useSafeBack(fallback: string = '/(tabs)'): () => void {
  const router = useRouter();
  
  return () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace(fallback);
    }
  };
}
