<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Collect form data
    $firstName = $_POST['first_name'];
    $lastName = $_POST['last_name'];
    $email = $_POST['email'];
    $phoneNumber = $_POST['phone_number'];
    $message = $_POST['message'];

    // Include the email template
    ob_start();  // Start output buffering
    include("email-template.php");  // Include the email template
    $emailContent = ob_get_clean();  // Get the template content into the variable

    // Replace placeholders with actual data
    $emailContent = str_replace("{{first_name}}", $firstName, $emailContent);
    $emailContent = str_replace("{{last_name}}", $lastName, $emailContent);
    $emailContent = str_replace("{{email}}", $email, $emailContent);
    $emailContent = str_replace("{{phone_number}}", $phoneNumber, $emailContent);
    $emailContent = str_replace("{{message}}", $message, $emailContent);

    // Set up the email
    $to = "support@tivro.africa"; // Replace with your email
    $subject = "New Message from Contact Form";
    
    // Set content-type header for HTML email
    $headers = "MIME-Version: 1.0" . "\r\n";
    $headers .= "Content-Type: text/html; charset=UTF-8" . "\r\n";
    
    // Additional headers
    $headers .= "From: $email" . "\r\n";

    // Send the email
    if (mail($to, $subject, $emailContent, $headers)) {
        echo "success"; // Send success response
    } else {
        echo "error"; // Send error response
    }
}
?>
