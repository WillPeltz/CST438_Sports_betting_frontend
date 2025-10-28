import { Pressable, Text } from "react-native";
import { startLogin } from "../lib/auth";

export default function LoginButton() {
  return (
    <Pressable onPress={startLogin} style={{ padding:12, borderWidth:1, borderRadius:8 }}>
      <Text>Login with GitHub</Text>
    </Pressable>
  );
}
