import { register } from '../model/storyModel.js';
import { registerView } from '../view/registerView.js';

export function showRegister(main) {
  main.innerHTML = '';
  main.appendChild(
    registerView({
      onSubmit: async (data) => {
        try {
          await register(data);
          alert('Registrasi berhasil! Silakan login.');
          location.hash = '/login';
        } catch (e) {
          alert('Registrasi gagal: ' + e.message);
        }
      }
    })
  );
}