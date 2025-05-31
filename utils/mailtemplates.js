const signUpTemplate = (link, firstName) => {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>Verify your CampusTrade account</title>
    <style>
      body {
        background: #ffffff;
        font-family: 'Segoe UI', sans-serif;
        color: #2d2d2d;
        margin: 0;
        padding: 0;
      }
      .container {
        max-width: 600px;
        margin: 0 auto;
        padding: 30px 20px;
        border: 1px solid #eaeaea;
        border-radius: 12px;
      }
      h1 {
        color: #4c00b4;
        text-align: center;
      }
      p {
        font-size: 16px;
        line-height: 1.6;
        text-align: center;
      }
      .button-container {
        text-align: center;
        margin-top: 30px;
      }
      a.button {
        background-color: #4c00b4;
        color: #ffffff;
        padding: 12px 24px;
        font-size: 16px;
        font-weight: bold;
        text-decoration: none;
        border-radius: 8px;
        display: inline-block;
        transition: background-color 0.3s ease;
      }
      a.button:hover {
        background-color: #3a0091;
      }
      .footer {
        text-align: center;
        font-size: 13px;
        color: #666;
        margin-top: 40px;
      }
      .orange-bar {
        background-color: #ff6d00;
        color: #fff;
        padding: 10px;
        font-size: 14px;
        text-align: center;
        border-radius: 6px;
        margin-top: 30px;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>Verify Your Email</h1>
      <p>Hi ${firstName},</p>
      <p>Welcome to CampusTrade – your student-powered marketplace! Click the button below to verify your email and activate your account.</p>
      <div class="button-container">
        <a href="${link}" class="button">Verify My Account</a>
      </div>
      <p>If the button doesn’t work, copy and paste this link into your browser:</p>
      <p><a href="${link}">${link}</a></p>
      <div class="orange-bar">
        CampusTrade is for students. Please meet in secure locations when trading.
      </div>
      <div class="footer">
        &copy; ${new Date().getFullYear()} CampusTrade. All rights reserved.
      </div>
    </div>
  </body>
  </html>
  `;
};

const passwordResetTemplate = (link, firstName) => {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>Reset Your Password - CampusTrade</title>
    <style>
      body {
        background: #ffffff;
        font-family: 'Segoe UI', sans-serif;
        color: #2d2d2d;
        margin: 0;
        padding: 0;
      }
      .container {
        max-width: 600px;
        margin: 0 auto;
        padding: 30px 20px;
        border: 1px solid #eaeaea;
        border-radius: 12px;
      }
      h1 {
        color: #4c00b4;
        text-align: center;
      }
      p {
        font-size: 16px;
        line-height: 1.6;
        text-align: center;
      }
      .button-container {
        text-align: center;
        margin-top: 30px;
      }
      a.button {
        background-color: #4c00b4;
        color: #ffffff;
        padding: 12px 24px;
        font-size: 16px;
        font-weight: bold;
        text-decoration: none;
        border-radius: 8px;
        display: inline-block;
        transition: background-color 0.3s ease;
      }
      a.button:hover {
        background-color: #3a0091;
      }
      .footer {
        text-align: center;
        font-size: 13px;
        color: #666;
        margin-top: 40px;
      }
      .orange-bar {
        background-color: #ff6d00;
        color: #fff;
        padding: 10px;
        font-size: 14px;
        text-align: center;
        border-radius: 6px;
        margin-top: 30px;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>Reset Your Password</h1>
      <p>Hi ${firstName},</p>
      <p>We received a request to reset your CampusTrade password. Click the button below to set a new password.</p>
      <div class="button-container">
        <a href="${link}" class="button">Reset Password</a>
      </div>
      <p>If you didn't request this, you can safely ignore this email.</p>
      <p>Alternatively, you can copy and paste this link into your browser:</p>
      <p><a href="${link}">${link}</a></p>
      <div class="orange-bar">
        CampusTrade is for students. Always prioritize safe meeting locations.
      </div>
      <div class="footer">
        &copy; ${new Date().getFullYear()} CampusTrade. All rights reserved.
      </div>
    </div>
  </body>
  </html>
  `;
};

module.exports = {
  signUpTemplate,
  passwordResetTemplate
};
