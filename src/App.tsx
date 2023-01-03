import { Redirect, Route, useLocation } from "react-router-dom";
import {
  IonApp,
  IonContent,
  IonHeader,
  IonItem,
  IonList,
  IonLoading,
  IonMenu,
  IonRouterOutlet,
  IonTitle,
  IonToolbar,
  isPlatform,
  NavContext,
  setupIonicReact,
  useIonAlert,
  useIonLoading,
  useIonViewWillEnter,
} from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";

/* Core CSS required for Ionic components to work properly */
import "@ionic/react/css/core.css";

/* Basic CSS for apps built with Ionic */
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";

/* Optional CSS utils that can be commented out */
import "@ionic/react/css/padding.css";
import "@ionic/react/css/float-elements.css";
import "@ionic/react/css/text-alignment.css";
import "@ionic/react/css/text-transformation.css";
import "@ionic/react/css/flex-utils.css";
import "@ionic/react/css/display.css";

/* Theme variables */
import "./theme/variables.css";
import "./theme/fonts.css";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Warehouse from "./pages/Warehouse";
import Map from "./pages/Map";

import { useContext, useEffect, useRef, useState } from "react";

import auth from "./services/auth.service";

import { User } from "./services/userProps";
import Menu from "./components/Menu";

import { Preferences } from '@capacitor/preferences';
import { Network } from "@capacitor/network";

import "./theme/Global.scss";

import api from "./services/api";
import { OfflineRequestProps } from "./components/Types";
import Startup from "./components/Startup";
import Kafelki from "./pages/Kafelki";

import { PushNotifications } from '@capacitor/push-notifications';
import Punishments from "./pages/Punishments";
import Salary from "./pages/Salary";

// import LogRocket from 'logrocket';
// import setupLogRocketReact from 'logrocket-react';

// import { App as _App } from "@capacitor/app";

setupIonicReact();

export const themeCheck = async () => {
  const { value } = await Preferences.get({ key: "theme" });

  if (value) {
    if (value == "dark") {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
  } else {
    // Use matchMedia to check the user preference
    // const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");

    // if(prefersDark)
    // {
    //   document.body.classList.add("dark");
    // }

    document.body.classList.add("dark");
  }
};

const addListeners = async () => {
  await PushNotifications.addListener('registration', async token => {

    if(token.value)
    {
      api.patch("fcm", {
        token: token.value
      }).then((response) => {

        

      })
    }

    console.info('Registration token: ', token.value);
  });

  await PushNotifications.addListener('registrationError', err => {
    console.error('Registration error: ', err.error);
  });

  await PushNotifications.addListener('pushNotificationReceived', notification => {
    console.log('Push notification received: ', notification);
  });

  await PushNotifications.addListener('pushNotificationActionPerformed', notification => {
    console.log('Push notification action performed', notification.actionId, notification.inputValue);
  });
}

const registerNotifications = async () => {
  let permStatus = await PushNotifications.checkPermissions();

  if (permStatus.receive === 'prompt') {
    permStatus = await PushNotifications.requestPermissions();
  }

  if (permStatus.receive !== 'granted') {
    throw new Error('User denied permissions!');
  }

  await PushNotifications.register();
}


const initPushNotifiactions = async () => {

  await addListeners();

  await registerNotifications();

}


const App: React.FC = () => {
  const [presentLoading, dismissLoading] = useIonLoading();


  // function OneSignalInit(): void {

  //   // NOTE: Update the setAppId value below with your OneSignal AppId.
  //   OneSignal.setAppId("bbb01c9c-8681-48c3-9a1d-64ca15b7b4b8");
  //   OneSignal.setNotificationOpenedHandler(function(jsonData) {
  //       console.log('notificationOpenedCallback: ' + JSON.stringify(jsonData));
  
  //       OneSignal.clearOneSignalNotifications();

  //   });
  
  //   OneSignal.setNotificationWillShowInForegroundHandler(function(jsonData) {
  //     console.log('otrzymano: ' + JSON.stringify(jsonData));
  
  //     OneSignal.clearOneSignalNotifications();
  
  //   });
  // }

  // useEffect(() => {

  //   if(isPlatform("mobile") && !isPlatform("mobileweb"))
  //   {
  //     OneSignalInit();
  //   }

  // }, [])

  // useEffect(() => {

  //   _App.addListener("appStateChange", async (e) => {
  //     if (e.isActive) {
  //       LogRocket.init('jw1lal/broccoliappcourier');
  //       setupLogRocketReact(LogRocket);
  //     }
  //   });


  // }, [])



  
  useEffect(() => {
    
    initPushNotifiactions();

  }, []);

  useEffect(() => {
    themeCheck();
  }, []);

  return (
    <IonApp>
      <IonReactRouter>
        <Menu />

        <IonRouterOutlet animated={false}>
          <Route path="/login" exact={true} component={Login} />
          <Route path="/Warehouse" exact={true} component={Warehouse} />
          <Route path="/" exact={true} component={Home} />
          <Route path="/Map" exact={true} component={Map} />
          <Route path="/Reorder" exact={true} component={Kafelki} />
          <Route path="/Punishments" exact={true} component={Punishments} />
          <Route path="/Salary" exact={true} component={Salary} />
        </IonRouterOutlet>
      </IonReactRouter>

      <Startup />
    </IonApp>
  );
};

export default App;
