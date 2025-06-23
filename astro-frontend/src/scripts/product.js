const token = document.cookie.split('; ').find(row => row.startsWith('token=')).split('=')[1];

document.addEventListener("DOMContentLoaded", () => {
  const addForm = document.getElementById("add-form");
  addForm?.addEventListener("submit", handleAdd);

  const editForm = document.getElementById("edit-form");
  editForm?.addEventListener("submit", handleEdit);

  const deleteForm = document.getElementById("delete-form");
  deleteForm?.addEventListener("submit", handleDelete);
});

async function handleAdd(event) {
  event.preventDefault();

  const form = event.target;
  const formData = new FormData(form);
  const body = Object.fromEntries(formData.entries());

  const response = await fetch(`http://localhost:8000/api/products/create/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Token ${token}`,
    },
    body: JSON.stringify(body),
  });

  if (response.ok) {
    window.location.reload();
  } else {
    const errorData = await response.json();
    console.error(`Add failed: ${errorData.detail}`);
  }
}

async function handleEdit(event) {
  event.preventDefault();

  const form = event.target;
  const productId = form.dataset.productId; 
  const formData = new FormData(form);
  const body = Object.fromEntries(formData.entries());

  const response = await fetch(`http://localhost:8000/api/products/update/${productId}/`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Token ${token}`,
    },
    body: JSON.stringify(body),
  });

  if (response.ok) {
    window.location.reload();
  } else {
    const errorData = await response.json();
    console.error(`Edit failed: ${errorData.detail}`);
  }
}

async function handleDelete(event) {
  event.preventDefault();

  const form = event.target;
  const productId = form.dataset.productId;

  const response = await fetch(`http://localhost:8000/api/products/delete/${productId}/`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Token ${token}`,
    },
  });

  if (response.ok) {
    window.location.reload();
  } else {
    const errorData = await response.json();
    console.error(`Delete failed: ${errorData.detail}`);
  }
}