import api from "./api";
import TokenService from "./token.service";
import { User } from "./userProps"

import { PushNotifications } from '@capacitor/push-notifications';

class AuthService {
  login(username: string, password: string) {
    return api
      .post("/accounts/authenticate", {
        username,
        password
      },)
      .then(response => {
          const data = response.data as User;
        if (response.data.jwtToken) {
          TokenService.setUser(response.data);
        }
        return response.data;
      });
  }
  logout() {
    return api.post("/accounts/revoke-token", { token: null }).finally(async () => {

      try {
                      
        await PushNotifications.register();

      } catch (error) {
        
      }

      await TokenService.removeUser();
    })
  }
  register(username: string, password: string, confirmPassword: string, acceptTerms: boolean = true) {
    return api.post("/accounts/register", {
      username,
      password,
      confirmPassword,
      acceptTerms
    });
  }
  async getCurrentUser() {
    return await TokenService.getUser();
  }
}
export default new AuthService();