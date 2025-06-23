const token = document.cookie
  .split("; ")
  .find((row) => row.startsWith("token="))
  .split("=")[1];

let productData = [];

document.addEventListener("DOMContentLoaded", async () => {
  document.addEventListener("view-order", handleViewOrder);

  productData = await fetchProducts();

  if (!productData) {
    console.error("Failed to fetch product data.");
    return;
  }

  const btnAddItem = document.getElementById("btn-add-item");
  btnAddItem?.addEventListener("click", handleAddItem);

  const addForm = document.getElementById("add-form");
  addForm?.addEventListener("submit", handleAdd);

  const btnCloseOrder = document.getElementById("btn-close-order");
  btnCloseOrder?.addEventListener("click", closeOrder);
});

function handleAddItem() {
  const container = document.getElementById("order-items-container");
  container?.classList.remove("hidden");

  const itemsError = document.getElementById("items-error");
  itemsError?.classList.add("hidden");

  const itemDiv = document.createElement("div");
  itemDiv.className = "order-item";

  const select = document.createElement("select");
  select.name = "products[]";
  select.required = true;

  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = "Selecione um produto";
  select.appendChild(defaultOption);

  productData.forEach((product) => {
    const option = document.createElement("option");
    option.value = product.id;
    option.textContent = `${product.name} - R$ ${parseFloat(
      product.price
    ).toFixed(2)}`;
    select.appendChild(option);
  });

  const input = document.createElement("input");
  input.type = "number";
  input.name = "quantities[]";
  input.min = 1;
  input.placeholder = "Qtd.";
  input.required = true;
  input.value = 1;

  const removeBtn = document.createElement("button");
  removeBtn.type = "button";
  removeBtn.className = "btn-action btn-delete";
  removeBtn.innerHTML = '<i class="fas fa-trash-alt"></i>';
  removeBtn.onclick = function () {
    itemDiv.remove();
    if (container.querySelectorAll(".order-item").length === 0) {
      container.classList.add("hidden");
    }
    updateSelectOptions();
  };

  select.addEventListener("change", () => {
    updateItemsError();
    updateSelectOptions();
  });
  input.addEventListener("blur", function () {
    if (this.value === "" || parseInt(this.value) < 1) {
      this.value = 1;
    }
  });

  itemDiv.appendChild(select);
  itemDiv.appendChild(input);
  itemDiv.appendChild(removeBtn);

  container.appendChild(itemDiv);

  updateSelectOptions();
}

function updateItemsError() {
  const productSelects = document.querySelectorAll('select[name="products[]"]');
  const quantityInputs = document.querySelectorAll(
    'input[name="quantities[]"]'
  );
  const itemsError = document.getElementById("items-error");

  let hasValidItem = false;

  productSelects.forEach((select, index) => {
    const quantity = parseInt(quantityInputs[index].value);
    if (select.value !== "" && quantity > 0) {
      hasValidItem = true;
    }
  });

  if (productSelects.length === 0 || !hasValidItem) {
    itemsError.classList.remove("hidden");
  } else {
    itemsError.classList.add("hidden");
  }
}

function updateSelectOptions() {
  const allSelects = document.querySelectorAll('select[name="products[]"]');
  const selectedValues = Array.from(allSelects)
    .map((select) => select.value)
    .filter((value) => value !== "");

  allSelects.forEach((select) => {
    const currentValue = select.value;

    Array.from(select.options).forEach((option) => {
      option.hidden = false;

      if (
        selectedValues.includes(option.value) &&
        option.value !== currentValue
      ) {
        option.hidden = true;
      }
    });
  });
}

async function fetchProducts() {
  const response = await fetch("http://localhost:8000/api/products/", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
  });

  if (response.ok) {
    const data = await response.json();
    return data;
  }
}

async function handleAdd(event) {
  event.preventDefault();

  const form = event.target;
  const formData = new FormData(form);

  const body = {
    table_number: formData.get("table_number"),
    responsible_name: formData.get("responsible_name"),
    products: formData.getAll("products[]"),
    quantities: formData.getAll("quantities[]"),
  };

  const response = await fetch("http://localhost:8000/api/orders/create/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
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

async function handleViewOrder(event) {
  const orderId = event.detail.orderId;
  await fetch(`http://localhost:8000/api/orders/${orderId}/`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
  })
    .then((res) => res.json())
    .then((order) => {
      document.getElementById("view-table-number").innerText =
        order.table_number;
      document.getElementById("view-responsible-name").innerText =
        order.responsible_name;
      document.getElementById("view-opened-at").innerText = order.opened_at;
      document.getElementById("view-closed-at").innerText =
        order.closed_at || "-";
      const statusIcon = document.getElementById("order-status-icon");
      const closeButton = document.getElementById("btn-close-order");

      statusIcon.style.color = order.is_paid ? "red" : "green";
      statusIcon.title = order.is_paid ? "Fechada" : "Aberta";

      if (order.is_paid) {
        closeButton?.classList.add("hidden");
      } else {
        closeButton?.classList.remove("hidden");
        closeButton.onclick = () => closeOrder(order.id);
      }

      const itemsContainer = document.getElementById("view-order-items");
      itemsContainer.innerHTML = "";
      let total = 0;

      order.items.forEach((item) => {
        const itemText = `${item.product_name} - ${item.quantity}x R$ ${item.price}`;
        total += item.quantity * item.price;

        const li = document.createElement("li");
        li.innerText = itemText;
        itemsContainer.appendChild(li);
      });

      document.getElementById(
        "view-total-price"
      ).innerText = `R$ ${total.toFixed(2)}`;

      document.getElementById('view-dialog').dataset.orderId = order.id;
    });
}

async function closeOrder() {
  const orderId = document.getElementById('view-dialog')?.dataset.orderId;

  const response = await fetch(`http://localhost:8000/api/orders/close/${orderId}/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
  });

  if (response.ok) {
    window.location.reload();
  } else {
    const errorData = await response.json();
    console.error(`Close order failed: ${errorData.detail}`);
  }
}
