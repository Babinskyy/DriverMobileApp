import api from "./api";
import TokenService from "./token.service";
import { User } from "./userProps"

class AuthService {
  login(username: string, password: string) {
    return api
      .post("/Accounts/authenticate", {
        username,
        password
      })
      .then(response => {
          const data = response.data as User;
        if (response.data.jwtToken) {
          TokenService.setUser(response.data);
        }
        return response.data;
      });
  }
  logout() {
    TokenService.removeUser();
  }
  register(username: string, email: string, password: string) {
    return api.post("/auth/signup", {
      username,
      email,
      password
    });
  }
  getCurrentUser() {
    return TokenService.getUser();
  }
}
export default new AuthService();