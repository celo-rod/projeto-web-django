function openAddOrEditModal(type, edit_button = null) {
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
            title.textContent = `Editar comanda`;
            button.textContent = 'Salvar';
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
    };

    select.addEventListener('change', updateItemsError);
    input.addEventListener('blur', function() {
        if (this.value === '' || parseInt(this.value) < 1) {
            this.value = 1;
        }
    });

    itemDiv.appendChild(select);
    itemDiv.appendChild(input);
    itemDiv.appendChild(removeBtn);

    container.appendChild(itemDiv);
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
