import { nanoid } from "nanoid";
import "react-native-get-random-values";

function createLobbyCode() {
  const randomCode = nanoid(6).toUpperCase(); // Secure, URL-safe
  return `${randomCode}`.toUpperCase();
}

export {createLobbyCode };
