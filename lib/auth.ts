import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { BASE_URL } from "./api";

export async function startLogin() {
  const return_to = Linking.createURL("/debug");
  const url = `${BASE_URL}/auth/github?return_to=${encodeURIComponent(return_to)}`;
  await WebBrowser.openBrowserAsync(url);
}
