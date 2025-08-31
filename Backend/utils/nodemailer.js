const nodeMailer = require("nodemailer");

transport = nodeMailer.createTransport({
  host: process.env.MAILTRAP_HOST,
  port: 2525,
  auth: {
    user: process.env.MAILTRAP_USER,
    pass: process.env.MAILTRAP_PASS,
  },
});

exports.generateOTP = () => {
  let otp = "";

  for (let i = 0; i < 4; i++) {
    const randVal = Math.round(Math.random() * 9);
    otp += randVal;
  }
  return otp;
};

exports.sendResetEmail = (user, otp) => {
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset OTP</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                background-color: #f4f4f4;
                margin: 0;
                padding: 0;
            }
            .container {
                width: 100%;
                max-width: 600px;
                margin: 20px auto;
                background-color: #ffffff;
                border-radius: 8px;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                padding: 20px;
            }
            .header {
                background-color: #007BFF;
                color: #ffffff;
                padding: 15px;
                border-radius: 8px 8px 0 0;
                text-align: center;
            }
            .content {
                padding: 20px;
                color: #333333;
            }
            .otp {
                font-size: 24px;
                font-weight: bold;
                color: #007BFF;
            }
            .footer {
                text-align: center;
                font-size: 12px;
                color: #777777;
                margin-top: 20px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h2>Password Reset Request</h2>
            </div>
            <div class="content">
                <p>Hello <strong>${user.name}</strong>,</p>
                <p>Your OTP for password reset is:</p>
                <p class="otp">${otp}</p>
                <p>Please use this OTP to reset your password. It is valid for the next 10 minutes.</p>
                <p>If you did not request a password reset, please ignore this email.</p>
            </div>
            <div class="footer">
                <p>&copy; ${new Date().getFullYear()} FreshNest. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
  `;

  transport.sendMail({
    from: "no-reply@FreshNest.com",
    to: user.email,
    subject: "Password Reset Request",
    html: htmlContent,
  });
};

exports.sendWelcomeEmail = (user, otp) => {
  const htmlContent = `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to FreshNest!</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                background-color: #f4f4f4;
                margin: 0;
                padding: 0;
            }
            .container {
                width: 100%;
                max-width: 600px;
                margin: 20px auto;
                background-color: #ffffff;
                border-radius: 8px;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                padding: 20px;
            }
            .header {
                background-color: #28a745;
                color: #ffffff;
                padding: 15px;
                border-radius: 8px 8px 0 0;
                text-align: center;
            }
            .content {
                padding: 20px;
                color: #333333;
            }
            .welcome {
                font-size: 24px;
                font-weight: bold;
                color: #28a745;
            }
                .otp {
                font-size: 24px;
                font-weight: bold;
                color: #007BFF;
            }
            .footer {
                text-align: center;
                font-size: 12px;
                color: #777777;
                margin-top: 20px;
            }
            .button {
                display: inline-block;
                padding: 10px 20px;
                color: #ffffff;
                background-color: #28a745;
                border-radius: 5px;
                text-decoration: none;
                font-size: 16px;
                margin-top: 10px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h2>Welcome to FreshNest, ${user.name}!</h2>
            </div>
            <div class="content">
                <p>Hello <strong>${user.name}</strong>,</p>
                <p class="welcome">We're thrilled to have you join us at FreshNest!</p>
                <p>Your OTP to Verify email:</p>
                <p class="otp">${otp}</p>
                <p>If you have any questions, feel free to reach out to our support team. We're here to help you make the most of your FreshNest experience.</p>
            </div>
            <div class="footer">
                <p>&copy; ${new Date().getFullYear()} FreshNest. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    `;

  transport.sendMail({
    from: "no-reply@FreshNest.com",
    to: user.email,
    subject: `Welcome to FreshNest, ${user.name}!`,
    html: htmlContent,
  });
};

exports.sendVendorWelcomeEmail = (vendor, otp) => {
  const htmlContent = `<!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to FreshNest Vendor Portal!</title>
          <style>
              body {
                  font-family: Arial, sans-serif;
                  background-color: #f4f4f4;
                  margin: 0;
                  padding: 0;
              }
              .container {
                  width: 100%;
                  max-width: 600px;
                  margin: 20px auto;
                  background-color: #ffffff;
                  border-radius: 8px;
                  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                  padding: 20px;
              }
              .header {
                  background-color: #007BFF;
                  color: #ffffff;
                  padding: 15px;
                  border-radius: 8px 8px 0 0;
                  text-align: center;
              }
              .content {
                  padding: 20px;
                  color: #333333;
              }
              .welcome {
                  font-size: 24px;
                  font-weight: bold;
                  color: #007BFF;
              }
              .otp {
                  font-size: 24px;
                  font-weight: bold;
                  color: #28a745;
              }
              .footer {
                  text-align: center;
                  font-size: 12px;
                  color: #777777;
                  margin-top: 20px;
              }
              .button {
                  display: inline-block;
                  padding: 10px 20px;
                  color: #ffffff;
                  background-color: #007BFF;
                  border-radius: 5px;
                  text-decoration: none;
                  font-size: 16px;
                  margin-top: 10px;
              }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <h2>Welcome to FreshNest Vendor Portal, ${vendor.name}!</h2>
              </div>
              <div class="content">
                  <p>Hello <strong>${vendor.name}</strong>,</p>
                  <p class="welcome">We're excited to have you as a vendor on FreshNest!</p>
                  <p>Here's your OTP for email verification:</p>
                  <p class="otp">${otp}</p>
                  <p>As a valued vendor, you'll be able to showcase your organic products to a wide audience. Start managing your product listings and grow your business today!</p>
                  <p>If you have any questions, our support team is always ready to assist you.</p>
              </div>
              <div class="footer">
                  <p>&copy; ${new Date().getFullYear()} FreshNest. All rights reserved.</p>
              </div>
          </div>
      </body>
      </html>
      `;

  transport.sendMail({
    from: "no-reply@FreshNest.com",
    to: vendor.email,
    subject: `Welcome to FreshNest Vendor Portal, ${vendor.name}!`,
    html: htmlContent,
  });
};

exports.sendVendorEmailVerificationOTP = (vendor, otp) => {
  const htmlContent = `<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      <title>Welcome to FreshNest Vendor Portal</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f4f4f4;
          margin: 0;
          padding: 0;
        }
        .container {
          width: 100%;
          max-width: 600px;
          margin: 20px auto;
          background-color: #ffffff;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          padding: 20px;
        }
        .header {
          background-color: #28a745;
          color: #ffffff;
          padding: 15px;
          border-radius: 8px 8px 0 0;
          text-align: center;
        }
        .content {
          padding: 20px;
          color: #333333;
        }
        .otp-box {
          font-size: 24px;
          font-weight: bold;
          text-align: center;
          background-color: #f0f0f0;
          padding: 15px;
          border-radius: 8px;
          margin: 20px 0;
          letter-spacing: 4px;
          color: #28a745;
        }
        .footer {
          text-align: center;
          font-size: 12px;
          color: #777777;
          margin-top: 20px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>Welcome to FreshNest Vendor Portal</h2>
        </div>
        <div class="content">
          <p>Hello <strong>${vendor.name}</strong>,</p>
          <p>We’re excited to have you on board!</p>
          <p>Your application has been successfully submitted and you’ve been added to our waiting list.</p>
          <p>Our team will review your details, and your account will be approved within <strong>1 to 2 business days</strong>.</p>
    
          <p>In the meantime, please verify your email using the OTP below:</p>
          <div class="otp-box">${otp}</div>
    
          <p>This OTP is valid for the next 10 minutes.</p>
          <p>If you did not initiate this registration, please disregard this email.</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} FreshNest. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>`;

  transport.sendMail({
    from: "no-reply@FreshNest.com",
    to: vendor.email,
    subject: `Verify Your Email - FreshNest`,
    html: htmlContent,
  });
};

exports.sendVendorTerminationEmail = (fullName, email) => {
  const htmlContent = `<!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Account Terminated - FreshNest </title>
      <style>
          body {
              font-family: Arial, sans-serif;
              background-color: #f8f8f8;
              margin: 0;
              padding: 0;
          }
          .container {
              max-width: 600px;
              margin: 30px auto;
              background-color: #ffffff;
              border-radius: 8px;
              box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
              overflow: hidden;
          }
          .header {
              background-color: #da111c;
              color: #ffffff;
              padding: 20px;
              text-align: center;
          }
          .content {
              padding: 20px;
              color: #333333;
          }
          .footer {
              text-align: center;
              font-size: 12px;
              color: #888888;
              padding: 15px;
              background-color: #f1f1f1;
          }
      </style>
  </head>
  <body>
      <div class="container">
          <div class="header">
              <h2>Account Terminated</h2>
          </div>
          <div class="content">
              <p>Dear <strong>${fullName}</strong>,</p>
              <p>Your vendor account has been <strong>terminated</strong> as it was found to be in violation of our Terms and Policy.</p>
              <p>This decision is final and the account will <strong>not be reinstated</strong>.</p>
              <p>If you have any questions or concerns, feel free to contact our support team at <a href="mailto:support@freshnest.com">support@freshnest.com</a>.</p>
              <p>Thank you for your understanding.</p>
          </div>
          <div class="footer">
              &copy; ${new Date().getFullYear()} FreshNest. All rights reserved.
          </div>
      </div>
  </body>
  </html>`;

  transport.sendMail({
    from: "no-reply@FreshNest.com",
    to: `${email}`,
    subject: "FreshNest Account Termination Notice",
    html: htmlContent,
  });
};
