import 'react-native-gesture-handler';
import {Alert, StyleSheet, Text, View} from 'react-native';
import React, {useEffect} from 'react';
import messaging from '@react-native-firebase/messaging';
import notifee, {EventType} from '@notifee/react-native';
import {createStackNavigator} from '@react-navigation/stack';
import {NavigationContainer} from '@react-navigation/native';
import Home from './src/screens/Home';
import Profile from './src/screens/Profile';
import Setting from './src/screens/Setting';
import {getFCMToken} from './src/utils/FcmServices';

export const navigationRef = React.createRef();

export function navigate(name, params) {
  navigationRef.current?.navigate(name, params);
}

const Stack = createStackNavigator();

const App = () => {
  useEffect(() => {
    notifee.requestPermission();
    getFCMToken();
    // for forground mode push notification
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      console.log(
        'A new FCM message arrived!',
        JSON.stringify(remoteMessage, 0, 2),
      );
      // Create a channel (required for Android)
      const channelId = await notifee.createChannel({
        id: 'default',
        name: 'Default Channel',
      });

      // Display a notification
      await notifee.displayNotification({
        title: remoteMessage?.notification?.title,
        body: remoteMessage?.notification?.body,
        android: {
          channelId,
          // pressAction is needed if you want the notification to open the app when pressed
          pressAction: {
            id: 'default',
          },
        },
      });

      // if app is in forground state and opened from notification
      notifee.onForegroundEvent(({type, detail}) => {
        switch (type) {
          case EventType.PRESS:
            if (remoteMessage?.data?.redirectTo == 'profile') {
              navigationRef.current?.navigate('Profile');
            } else if (remoteMessage?.data?.redirectTo == 'setting') {
              navigationRef.current?.navigate('Setting');
            }
            break;
        }
      });
    });

    // if app is in background state and opened from notification
    messaging().onNotificationOpenedApp(remoteMessage => {
      if (remoteMessage) {
        if (remoteMessage?.data?.redirectTo == 'profile') {
          navigationRef.current?.navigate('Profile');
        } else if (remoteMessage?.data?.redirectTo == 'setting') {
          navigationRef.current?.navigate('Setting');
        }
      }
    });

    // if app is in quite state and opened from notification
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        setTimeout(() => {
          if (remoteMessage) {
            if (remoteMessage?.data?.redirectTo == 'profile') {
              navigationRef.current?.navigate('Profile');
            } else if (remoteMessage?.data?.redirectTo == 'setting') {
              navigationRef.current?.navigate('Setting');
            }
          }
        }, 500);
      });

    return unsubscribe;
  }, []);

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="Profile" component={Profile} />
        <Stack.Screen name="Setting" component={Setting} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;

const styles = StyleSheet.create({
  container: {flex: 1, alignItems: 'center', justifyContent: 'center'},
});
