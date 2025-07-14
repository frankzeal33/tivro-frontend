$(document).ready(function() {
    // Handle form submission using AJAX
    $("#contactForm").on("submit", function(event) {
        event.preventDefault(); // Prevent the form from submitting the default way

        // Collect form data
        var formData = $(this).serialize();

        // Send the data using AJAX
        $.ajax({
            url: "send_email.php", // PHP script to handle email sending
            method: "POST", // Form data is sent via POST
            data: formData,
            success: function(response) {
                // Check if the response is a success
                if (response === "success") {
                    // Reset the form
                    $("#contactForm")[0].reset();
                    
                    // Show the success alert
                    $('#successAlert').fadeIn().delay(10000).fadeOut(); // Display for 10 seconds
                    
                } else {
                    // Show the error alert
                    $('#errorAlert').fadeIn().delay(10000).fadeOut(); // Display for 10 seconds
                }
            },
            error: function() {
                // Show the error alert if AJAX request fails
                $('#errorAlert').fadeIn().delay(3000).fadeOut(); // Display for 3 seconds
            }
        });
    });
});