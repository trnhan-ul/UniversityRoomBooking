import { Redirect } from 'expo-router';

export default function IndexScreen() {
  // Redirect to (auth) or (app) based on auth state
  // This is handled by root layout
  return <Redirect href={'/(auth)/login' as any} />;
}
