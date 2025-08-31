const vendorAppServiceAccount = require("../config/freshnestseller-firebase-adminsdk-fbsvc-9be197e7b6.json");
const admin = require("firebase-admin");

const adminApp = admin.initializeApp(
  {
    credential: admin.credential.cert(vendorAppServiceAccount),
  },
  "adminApp",
);

const sendNotificationToAdminApp = async (deviceToken, title, body) => {
  if (!deviceToken) {
    console.warn("No device token provided for notification.");
    return;
  }
  try {
    const message = {
      token: deviceToken,
      notification: { title, body },
      data: {
        click_action: "FLUTTER_NOTIFICATION_CLICK",
        type: "admin_notification",
      },
    };

    const response = await adminApp.messaging().send(message);
    console.log("Notification sent to admin app:", response);
  } catch (error) {
    console.error("Error sending admin notification:", error);
  }
};

module.exports = {
  sendNotificationToAdminApp,
};
