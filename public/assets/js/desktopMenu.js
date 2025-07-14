document.addEventListener("DOMContentLoaded", function() {
    var dropdown = document.querySelector('.dropdown');
    dropdown.addEventListener('mouseover', function() {
        var dropdownMenu = this.querySelector('.dropdown-menu');
        dropdownMenu.classList.add('show');
    });

    dropdown.addEventListener('mouseleave', function() {
        var dropdownMenu = this.querySelector('.dropdown-menu');
        dropdownMenu.classList.remove('show');
    });
});
