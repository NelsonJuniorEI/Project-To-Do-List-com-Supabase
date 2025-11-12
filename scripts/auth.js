document.addEventListener("DOMContentLoaded", () => {
  const SUPABASE_URL = "https://avvwtenmextqyxgejujj.supabase.co";
  const SUPABASE_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2dnd0ZW5tZXh0cXl4Z2VqdWpqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1Mzc1MzMsImV4cCI6MjA3MTExMzUzM30.PT3I_pSoCit_d8n7L5cqNZg8Vujxx5RmFsX9v6it7ok";

  const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

  const toggleAuth = document.getElementById("toggle-auth");
  const form = document.getElementById("auth-form");
  const authButton = document.getElementById("auth-button");
  const nameFieldContainer = document.getElementById("name");
  const loginTitle = document.querySelector(".login-title");
  const nameInput = nameFieldContainer.querySelector('input[type="text"]');

  let isLogin = true;

  toggleAuth.addEventListener("click", (e) => {
    e.preventDefault();
    toggleAuthForm();
  });

  function toggleAuthForm() {
    isLogin = !isLogin;

    loginTitle.textContent = isLogin ? "Login" : "Cadastro";
    authButton.textContent = isLogin ? "Entrar" : "Cadastrar";
    toggleAuth.textContent = isLogin
      ? "Crie aqui!"
      : "Já tem uma conta? Faça login";

    isLogin
      ? nameFieldContainer.classList.add("d-none")
      : nameFieldContainer.classList.remove("d-none");

    form.reset();
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.querySelector('input[type="email"]').value.trim();
    const password = document
      .querySelector('input[type="password"]')
      .value.trim();

    const name = nameInput?.value?.trim();

    if (!email || !password || (!isLogin && !name)) return;

    authButton.disabled = true;

    try {
      if (!isLogin) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { name },
          },
        });

        if (error) throw error;
        alert("Cadastro realizado com sucesso! Verifique seu e-mail.");
        toggleAuthForm();
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
        localStorage.setItem("user_data", JSON.stringify(data.user));
        localStorage.setItem("session_data", JSON.stringify(data.session));
        window.location.href = "/dashboard.html";
      }
    } catch (error) {
      alert(error.message);
    } finally {
      authButton.disabled = false;
      setTimeout(() => form.reset(), 2000);
    }
  });
});
