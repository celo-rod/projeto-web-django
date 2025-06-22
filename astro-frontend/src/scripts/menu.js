document.addEventListener('DOMContentLoaded', () => {
    const menuButton = document.querySelector('.fa-bars');
    const dropdownMenu = document.getElementById('dropdown-menu');

    menuButton?.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdownMenu?.classList.toggle('show');
      dropdownMenu?.classList.toggle('hidden');
    });

    const userIcon = document.querySelector('.fa-user');
    const userDropdown = document.getElementById('user-dropdown');

    userIcon?.addEventListener('click', (e) => {
      e.stopPropagation();
      userDropdown?.classList.toggle('show');
      userDropdown?.classList.toggle('hidden');
    });

    window.addEventListener('click', () => {
      dropdownMenu?.classList.remove('show');
      userDropdown?.classList.remove('show');
      dropdownMenu?.classList.add('hidden');
      userDropdown?.classList.add('hidden');
    });
});