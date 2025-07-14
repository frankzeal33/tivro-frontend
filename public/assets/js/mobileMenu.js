document.addEventListener("DOMContentLoaded", function () {
    var mobileDropdown = document.getElementById("mobileDropdown");
    var mobileDropdownMenu = document.getElementById("mobileDropdownMenu");

    if (mobileDropdown) {
        mobileDropdown.addEventListener("click", function (event) {
            event.preventDefault(); // Prevent default link behavior
            
            // Toggle dropdown visibility
            var isVisible = mobileDropdownMenu.classList.contains("show");
            mobileDropdownMenu.classList.toggle("show");

            // Add or remove spacing effect
            if (isVisible) {
                mobileDropdownMenu.style.display = "none"; // Hide menu
            } else {
                mobileDropdownMenu.style.display = "block"; // Show menu
            }
        });
    }
});
