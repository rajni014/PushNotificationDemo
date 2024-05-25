import messaging from '@react-native-firebase/messaging';

export const getFCMToken = async () => {
  try {
    const fcmToken = await messaging().getToken();
    if (fcmToken) {
      global.fcmToken = fcmToken;
      console.log('FCMToken:>>>', fcmToken);
    }
  } catch (error) {
    console.log('FCM error:>>>', error);
  }
};