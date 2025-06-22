document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("login-form");
  loginForm?.addEventListener("submit", handleSubmit);
});

async function handleSubmit(event) {
  event.preventDefault();
  const form = event.target;
  const formData = new FormData(form);
  const body = Object.fromEntries(formData.entries());

  const response = await fetch("http://localhost:8000/api/login/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
     },
    body: JSON.stringify(body),
  });

  if (response.ok) {
    const data = await response.json();
    document.cookie = `token=${data.token}; path=/; samesite=Lax;`;
    location.href = "/";
  } else {
    const errorData = await response.json();
    console.error(`Login failed: ${errorData.detail}`);
  }
};
