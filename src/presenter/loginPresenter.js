import { login } from '../model/storyModel.js';
import { subscribeToPushNotification } from '../utils/push.js';
import { loginView } from '../view/loginView.js';

export function showLogin(main) {
  main.innerHTML = '';
  main.appendChild(
    loginView({
      onSubmit: async (data) => {
        try {
          // Validasi input
          if (!data.email || !data.password) {
            throw new Error('Email dan password harus diisi');
          }
          if (!data.email.includes('@')) {
            throw new Error('Format email tidak valid');
          }

          // Proses login dan simpan token
          const token = await login({ email: data.email, password: data.password });
          if (!token) throw new Error('Login gagal: token tidak ditemukan');

          localStorage.setItem('dicoding_token', token);

          // Coba subscribe push notification
          try {
            await subscribeToPushNotification();
          } catch (pushError) {
            console.warn('⚠️ Push notification gagal:', pushError);
          }

          alert('✅ Login berhasil!');
          location.hash = '#/stories';

        } catch (error) {
          console.error('❌ Login error:', error);

          let errorMessage = 'Terjadi kesalahan saat login';
          if (error.message.includes('401') || error.message.includes('Unauthorized')) {
            errorMessage = 'Email atau password salah';
          } else if (error.message) {
            errorMessage = error.message;
          }

          alert('❌ Login gagal: ' + errorMessage);
        }
      }
    })
  );
}