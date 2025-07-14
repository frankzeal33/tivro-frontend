    document.addEventListener("DOMContentLoaded", function () {
        const banner = document.getElementById("cookieBanner");
        const acceptBtn = document.getElementById("acceptCookies");
        const closeBtn = document.getElementById("closeBanner");

        // Check if cookies were accepted in the last 7 days
        const cookieConsent = localStorage.getItem("cookieConsent");
        if (!cookieConsent) {
            banner.style.display = "block"; // Show the banner if no consent exists
        }

        // Accept button: Store consent in localStorage for 7 days
        acceptBtn.addEventListener("click", function () {
            const expiryDate = new Date();
            expiryDate.setDate(expiryDate.getDate() + 7); // Set expiry to 7 days
            localStorage.setItem("cookieConsent", expiryDate.getTime()); 
            banner.style.display = "none"; // Hide banner
        });

        // Close button: Just hide the banner temporarily (doesn't store consent)
        closeBtn.addEventListener("click", function () {
            banner.style.display = "none";
        });
    });
