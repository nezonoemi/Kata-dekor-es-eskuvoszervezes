
function toggleDropdown(event) {
    event.preventDefault();
    const dropdownMenu = event.target.nextElementSibling;
    dropdownMenu.style.display = dropdownMenu.style.display === 'block' ? 'none' : 'block';
}


document.addEventListener('click', function(event) {
    const isDropdownToggle = event.target.matches('.dropdown-toggle');
    const dropdownMenus = document.querySelectorAll('.dropdown-menu');

    if (!isDropdownToggle) {
        dropdownMenus.forEach(menu => {
            menu.style.display = 'none'; 
        });
    }
});



