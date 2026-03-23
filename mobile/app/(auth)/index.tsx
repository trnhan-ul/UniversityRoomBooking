import { Redirect } from 'expo-router';

export default function AuthIndex() {
  // Redirect to login
  return <Redirect href="/login" />;
}
