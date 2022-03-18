import { Storage } from "@capacitor/storage";
import { User } from "./userProps"

class TokenService {
  async getLocalRefreshToken() {
      const { value } = await Storage.get({ key: "user" });
    const user = JSON.parse(value ? value : "");
    return user?.refreshToken;
  }
  async getLocalAccessToken() {
    const { value } = await Storage.get({ key: "user" });
    const user = JSON.parse(value ? value : "");
    return user?.accessToken;
  }
  async updateLocalAccessToken(token: string) {
    const { value } = await Storage.get({ key: "user" });
    const user = JSON.parse(value ? value : "");
    user.accessToken = token;
    await Storage.set({
        key: "user",
        value: JSON.stringify(user),
    });
  }
  async getUser() {
    const { value } = await Storage.get({ key: "user" });
    const user = JSON.parse(value ? value : "");
    return user;
  }
  async setUser(user: User) {
      console.log("user");
      console.log(user);
    console.log(JSON.stringify(user));
    await Storage.set({
        key: "user",
        value: JSON.stringify(user),
    });
  }
  async removeUser() {
    await Storage.remove({ key: 'user' });
  }
}
export default new TokenService();
