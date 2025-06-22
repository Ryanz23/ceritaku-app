// View login
export function loginView({ onSubmit }) {
  const section = document.createElement('section');
  section.innerHTML = `
    <h2>Login</h2>
    <form id="login-form" autocomplete="off">
      <label for="email">Email</label>
      <input type="email" id="email" required aria-label="Email">
      <label for="password">Password</label>
      <input type="password" id="password" required aria-label="Password">
      <button type="submit">Login</button>
      <p>Belum punya akun? <a href="#/register">Register</a></p>
    </form>
  `;
  const form = section.querySelector('form');
  form.onsubmit = (e) => {
    e.preventDefault();
    const email = form.email.value;
    const password = form.password.value;
    onSubmit({ email, password });
  };
  return section;
}
