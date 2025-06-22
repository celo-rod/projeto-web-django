document.addEventListener("DOMContentLoaded", () => {
  const logoutButton = document.getElementById("logout-button");
  logoutButton?.addEventListener("click", handleLogout);
});

async function handleLogout() {
  const token = document.cookie.split('; ').find(row => row.startsWith('token=')).split('=')[1];

  const response = await fetch("http://localhost:8000/api/logout/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Token ${token}`,
    },
  });

  if (response.ok) {
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; samesite=Lax;";
    window.location.href = "/login";
  } else {
    const errorData = await response.json();
    console.error(`Logout failed: ${errorData.detail}`);
  }
}