import Cookies from 'js-cookie';
import ApiService from './apiService.js';

class AuthenticationService {
  static isLoggedIn() {
    return Cookies.get('token') !== undefined;
  }

  static login(token) {
    Cookies.set('token', token);
  }

  static logout(cb) {
    Cookies.remove('token');
    ApiService.submitAuthorizedApiRequest('/logout', 'post', null, cb);
  }

  static getToken() {
    return Cookies.get('token');
  }
}

export default AuthenticationService;