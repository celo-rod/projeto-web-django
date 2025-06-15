function openAddOrEditModal(type, edit_button = null) {
    const modal = document.getElementById('add-edit-modal');
    const title = document.getElementById('modal-title');
    const button = document.getElementById('submit-button');
    const form = document.getElementById('add-edit-form');

    const nameInput = document.getElementById('name');
    const priceInput = document.getElementById('price');
    const descriptionInput = document.getElementById('description');

    switch (type) {
        case 'add':
            nameInput.value = '';
            priceInput.value = '';
            descriptionInput.value = '';
            form && (form.action = '/products/create/');
            title.textContent = `Adicionar produto`;
            button.textContent = 'Adicionar';
            break;
        case 'edit':
            nameInput.value = edit_button.dataset.name;
            priceInput.value = edit_button.dataset.price;
            descriptionInput.value = edit_button.dataset.description;
            const productId = edit_button.dataset.id;
            form && (form.action = `/products/update/${productId}/`);
            title.textContent = `Editar produto`;
            button.textContent = 'Salvar';
            break;
    }

    const nameError = document.getElementById('name-error');
    const priceError = document.getElementById('price-error');

    form.addEventListener('submit', (e) => {
        if (!nameInput.value.trim()) {
            nameError.classList.remove('hidden');
            e.preventDefault();
        }

        if (!priceInput.value.trim() || isNaN(priceInput.value) || parseFloat(priceInput.value) < 0) {
            priceError.classList.remove('hidden');
            e.preventDefault();
        }

        if (e.defaultPrevented) {
            return;
        }
    });

    nameInput.addEventListener('input', () => {
        nameError.classList.add('hidden'); 
    });

    priceInput.addEventListener('input', () => {
        priceError.classList.add('hidden');
    });

    modal?.classList.add('active');
}

function closeAddOrEditModal() {
    const modal = document.getElementById('add-edit-modal');
    modal?.classList.remove('active');
}

function openDeleteModal(productId) {
    const modal = document.getElementById('delete-modal');
    const form = document.getElementById("delete-form");
    form && (form.action = `/products/delete/${productId}/`);
    modal?.classList.add('active');
}

function closeDeleteModal() {
    const modal = document.getElementById('delete-modal');
    modal?.classList.remove('active');
}