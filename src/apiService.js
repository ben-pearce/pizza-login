import Config from '../pizza.config.js';
import AuthenticationService from './authenticationService.js';

class ApiService {
  static submitApiRequest(action, method, data, cb) {
    data = new URLSearchParams(data);

    fetch(`${Config.baseUrl}${action}`, {
      method: method,
      body: data
    }).then((resp) => resp.json())
      .then(cb);   
  }

  static submitAuthorizedApiRequest(action, method, data, cb) {
    data = new URLSearchParams(data);
    if(AuthenticationService.isLoggedIn()) {
      data.append('token', AuthenticationService.getToken());
    }

    this.submitApiRequest(action, method, data, cb);
  }
}

export default ApiService;