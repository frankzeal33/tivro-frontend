<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Message from Tivro </title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }

        .email-container {
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }

        .header {
            background-color: #FF5722;
            color: white;
            text-align: center;
            padding: 20px;
        }
        p {
            margin: 10px 0;
            font-size: 18px;
            font-weight: 600;
            text-align: center;
        }
        h5 {
            margin: 10px 0;
            font-size: 12px;
            font-weight: 600;
            text-align: left;
        }

        .content {
            padding: 30px;
            background-color: #f4f4f4;
        }

        .form-details {
            background-color: white;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 20px;
            border: 1px solid #e0e0e0;
        }

        .detail-row {
            margin-bottom: 15px;
            padding-bottom: 15px;
            border-bottom: 1px solid #f0f0f0;
        }

        .detail-row:last-child {
            border-bottom: none;
        }

        .detail-label {
            font-weight: bold;
            color: #666;
            margin-right: 10px;
        }

        .footer {
            text-align: center;
            background-color: #333;
            color: white;
            padding: 15px;
            font-size: 12px;
        }
    </style>
</head>

<body>
    <table style="width: 100%; height: 100%; border: none;">
        <tr>
            <td style="text-align: center; vertical-align: middle;">
                <img src="https://tivro.africa/images/logo-black.svg" alt="Tivro Logo" width="140">
            </td>
        </tr>
    </table>

    <table width="100%" cellspacing="0" cellpadding="0">
        <tr>
            <td align="center">
                <table class="email-container" width="600" cellspacing="0" cellpadding="0">
                    <tr>
                        <td class="header">
                            <h1 style="margin: 0; font-size: 24px; font-weight: 500;">New Message from Tivro</h1>
                        </td>
                    </tr>
                    <tr>
                        <td class="content">
                            <p>Hello, Admin</p>
                            <p style="font-size: 16px; font-weight: 400;">New message received from the contact form. Here are the details of the submission:</p>

                            <div class="form-details">
                                <div class="detail-row">
                                    <span class="detail-label">First Name:</span>
                                    <span> {{first_name}} </span>
                                </div>
                                <div class="detail-row">
                                    <span class="detail-label">Last Name:</span>
                                    <span> {{last_name}} </span>
                                </div>
                                <div class="detail-row">
                                    <span class="detail-label">Email:</span>
                                    <span> {{email}} </span>
                                </div>
                                <div class="detail-row">
                                    <span class="detail-label">Phone Number:</span>
                                    <span> {{phone_number}} </span>
                                </div>
                                <div class="detail-row" style="border-bottom: none;">
                                    <span class="detail-label">Message:</span>
                                    <p style="text-align: left; font-weight: 400;"> {{message}} </p>
                                </div>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td class="footer">
                            <h4 style="margin: 0;">
                                © <?php echo date('Y'); ?> Tivro Africa. All rights reserved.<br>
                                Urello Technologies Limited
                            </h4>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>

</html>