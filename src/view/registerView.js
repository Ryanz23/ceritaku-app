// View register
export function registerView({ onSubmit }) {
  const section = document.createElement('section');
  section.innerHTML = `
    <h2>Register</h2>
    <form id="register-form" autocomplete="off">
      <label for="name">Nama</label>
      <input type="text" id="name" required aria-label="Nama">
      <label for="email">Email</label>
      <input type="email" id="email" required aria-label="Email">
      <label for="password">Password</label>
      <input type="password" id="password" required aria-label="Password">
      <button type="submit">Register</button>
      <p>Sudah punya akun? <a href="#/login">Login</a></p>
    </form>
  `;
  const form = section.querySelector('form');
  form.onsubmit = (e) => {
    e.preventDefault();
    const name = form.name.value;
    const email = form.email.value;
    const password = form.password.value;
    onSubmit({ name, email, password });
  };
  return section;
}
