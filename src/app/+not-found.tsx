import { Redirect } from 'expo-router';

/** Any unknown address (an old deep link, or a host serving the app under another path) goes to the start. */
export default function NotFound() {
  return <Redirect href="/" />;
}
