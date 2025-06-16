function openAddOrEditModal(type, orderId) {
    const modal = document.getElementById('add-edit-modal');
    const title = document.getElementById('modal-title');
    const button = document.getElementById('submit-button');
    const form = document.getElementById('add-edit-form');

    const tableNumberInput = document.getElementById('table_number');
    const responsibleNameInput = document.getElementById('responsible_name');
    const orderItemsContainer = document.getElementById('order-items-container');

    switch (type) {
        case 'add':
            tableNumberInput.value = '';
            responsibleNameInput.value = '';
            orderItemsContainer.innerHTML = '';
            orderItemsContainer.classList.add('hidden');
            form && (form.action = '/orders/create/');
            title.textContent = `Nova comanda`;
            button.textContent = 'Abrir';
            break;
        case 'edit':
            form && (form.action = `/orders/update/${orderId}/`);
            title.textContent = `Editar comanda`;
            button.textContent = 'Salvar';
            fetch(`/orders/${orderId}/`)
                .then(res => res.json())
                .then(order => {
                    tableNumberInput.value = order.table_number || '';
                    responsibleNameInput.value = order.responsible_name || '';
                    orderItemsContainer.innerHTML = '';
                    orderItemsContainer.classList.remove('hidden');
                    populateOrderItems(order, orderItemsContainer);
                });
            break;
    }

    const tableNumberError = document.getElementById('table-number-error');
    const responsibleNameError = document.getElementById('responsible-name-error');
    const itemsError = document.getElementById('items-error');
    
    tableNumberError.classList.add('hidden');
    responsibleNameError.classList.add('hidden');
    itemsError.classList.add('hidden');

    form.addEventListener('submit', (e) => {
        let hasError = false;

        if (!tableNumberInput.value.trim() || isNaN(tableNumberInput.value)  || parseInt(tableNumberInput.value) < 0) {
            tableNumberError.classList.remove('hidden');
            hasError = true;
        }

        if (!responsibleNameInput.value.trim()) {
            responsibleNameError.classList.remove('hidden');
            hasError = true;
        }

        updateItemsError();
        if (!document.getElementById('items-error').classList.contains('hidden')) {
            hasError = true;
        }

        if (hasError) {
            e.preventDefault();
        }
    });

    tableNumberInput.addEventListener('input', () => {
        tableNumberError.classList.add('hidden'); 
    });

    responsibleNameInput.addEventListener('input', () => {
        responsibleNameError.classList.add('hidden');
    });

    modal?.classList.add('active');
}

function closeAddOrEditModal() {
    const modal = document.getElementById('add-edit-modal');
    modal?.classList.remove('active');
}

function addOrderItem() {
    const container = document.getElementById('order-items-container');
    container?.classList.remove('hidden');
    const productData = JSON.parse(document.getElementById('product-data').textContent || '[]');

    const itemsError = document.getElementById('items-error');
    itemsError.classList.add('hidden');

    const itemDiv = document.createElement('div');
    itemDiv.className = 'order-item';

    const select = document.createElement('select');
    select.name = 'products[]';
    select.required = true;

    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Selecione um produto';
    select.appendChild(defaultOption);

    productData.forEach(product => {
        const option = document.createElement('option');
        option.value = product.id;
        option.textContent = `${product.name} - R$ ${parseFloat(product.price).toFixed(2)}`;
        select.appendChild(option);
    });

    const input = document.createElement('input');
    input.type = 'number';
    input.name = 'quantities[]';
    input.min = 1;
    input.placeholder = 'Qtd.';
    input.required = true;
    input.value = 1;

    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'btn-action btn-delete';
    removeBtn.innerHTML = '<i class="fas fa-trash-alt"></i>';
    removeBtn.onclick = function() {
        itemDiv.remove();
        if (container.querySelectorAll('.order-item').length === 0) {
            container.classList.add('hidden');
        }
        updateSelectOptions();
    };

    select.addEventListener('change', () => {
        updateItemsError();
        updateSelectOptions();
    });
    input.addEventListener('blur', function() {
        if (this.value === '' || parseInt(this.value) < 1) {
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
    const quantityInputs = document.querySelectorAll('input[name="quantities[]"]');
    const itemsError = document.getElementById('items-error');
    
    let hasValidItem = false;

    productSelects.forEach((select, index) => {
        const quantity = parseInt(quantityInputs[index].value);
        if (select.value !== '' && quantity > 0) {
            hasValidItem = true;
        }
    });
    
    if (productSelects.length === 0 || !hasValidItem) {
        itemsError.classList.remove('hidden');
    } else {
        itemsError.classList.add('hidden');
    }
}

function updateSelectOptions() {
    const allSelects = document.querySelectorAll('select[name="products[]"]');
    const selectedValues = Array.from(allSelects)
        .map(select => select.value)
        .filter(value => value !== '');

    allSelects.forEach(select => {
        const currentValue = select.value;

        Array.from(select.options).forEach(option => {
            option.hidden = false;

            if (selectedValues.includes(option.value) && option.value !== currentValue) {
                option.hidden = true;
            }
        });
    });
}

function openViewOrderModal(orderId) {
  fetch(`/orders/${orderId}/`)
    .then(res => res.json())
    .then(order => {
      document.getElementById('view-table-number').innerText = order.table_number;
      document.getElementById('view-responsible-name').innerText = order.responsible_name;
      document.getElementById('view-opened-at').innerText = order.opened_at;
      document.getElementById('view-closed-at').innerText = order.closed_at || '-';
      const statusIcon = document.getElementById('order-status-icon');
      const closeButton = document.getElementById('btn-close-order');

      statusIcon.style.color = order.is_paid ? 'red' : 'green';
      statusIcon.title = order.is_paid ? 'Fechada' : 'Aberta';

      if (order.is_paid) {
        closeButton.classList.add('hidden');
      } else {
        closeButton.classList.remove('hidden');
        closeButton.onclick = () => closeOrder(order.id);
      }

      const itemsContainer = document.getElementById('view-order-items');
      itemsContainer.innerHTML = '';
      let total = 0;

      order.items.forEach(item => {
        const itemText = `${item.product_name} - ${item.quantity}x R$ ${item.price}`;
        total += item.quantity * item.price;

        const li = document.createElement('li');
        li.innerText = itemText;
        itemsContainer.appendChild(li);
      });

      document.getElementById('view-total-price').innerText = `R$ ${total.toFixed(2)}`;
      document.getElementById('view-order-modal').classList.add('active');

      document.getElementById('view-order-modal').dataset.orderId = order.id;
    });
}

function closeViewOrderModal() {
  document.getElementById('view-order-modal').classList.remove('active');
}

function closeOrder() {
  const modal = document.getElementById('view-order-modal');
  const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;
  const orderId = modal.dataset.orderId;

  fetch(`/orders/close/${orderId}/`, {
    method: 'POST',
    headers: {
      'X-CSRFToken': csrfToken,
    }
  }).then(() => {
    modal.classList.remove('active');
    location.reload();
  });
}

function populateOrderItems(order, orderItemsContainer) {
  order.items.forEach((item) => {
    const itemDiv = document.createElement("div");
    itemDiv.className = "order-item";

    const select = document.createElement("select");
    select.name = "products[]";
    select.required = true;

    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "Selecione um produto";
    select.appendChild(defaultOption);

    const productData = JSON.parse(
      document.getElementById("product-data").textContent || "[]"
    );
    productData.forEach((product) => {
      const option = document.createElement("option");
      option.value = product.id;
      option.textContent = `${product.name} - R$ ${parseFloat(
        product.price
      ).toFixed(2)}`;
      if (product.id === item.product_id) {
        option.selected = true;
      }
      select.appendChild(option);
    });

    const input = document.createElement("input");
    input.type = "number";
    input.name = "quantities[]";
    input.min = 1;
    input.placeholder = "Qtd.";
    input.required = true;
    input.value = item.quantity || 1;

    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.className = "btn-action btn-delete";
    removeBtn.innerHTML = '<i class="fas fa-trash-alt"></i>';
    removeBtn.onclick = function () {
      itemDiv.remove();
      if (orderItemsContainer.querySelectorAll(".order-item").length === 0) {
        orderItemsContainer.classList.add("hidden");
      }
      updateSelectOptions();
    };

    select.addEventListener("change", updateItemsError);
    input.addEventListener("blur", function () {
      if (this.value === "" || parseInt(this.value) < 1) {
        this.value = 1;
      }
    });

    itemDiv.appendChild(select);
    itemDiv.appendChild(input);
    itemDiv.appendChild(removeBtn);

    orderItemsContainer.appendChild(itemDiv);

    updateSelectOptions();
  });
}