import { Storage } from "@capacitor/storage";
import { User } from "./userProps"

class TokenService {
  async getLocalRefreshToken() {
      const { value } = await Storage.get({ key: "user" });
    const user = JSON.parse(value ? value : "") as User | undefined;
    return user?.jwtToken;
  }
  async getLocalAccessToken() {

    try {
      const { value } = await Storage.get({ key: "user" });
      const user = JSON.parse(value ? value : "") as User | undefined;
 
      return user?.jwtToken;
    } catch (error) {
      return undefined;
    }
    
  }
  async updateLocalAccessToken(token: string) {
    const { value } = await Storage.get({ key: "user" });
    const user = JSON.parse(value ? value : "")  as User | undefined;
    if(user)
    {
      user.jwtToken = token;
    }
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
