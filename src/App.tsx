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

import { Storage } from "@capacitor/storage";
import { Network } from "@capacitor/network";

import "./theme/Global.scss";

import api from "./services/api";
import { OfflineRequestProps } from "./components/Types";
import Startup from "./components/Startup";
import Kafelki from "./pages/Kafelki";

import OneSignal from 'onesignal-cordova-plugin';
// import LogRocket from 'logrocket';
// import setupLogRocketReact from 'logrocket-react';

// import { App as _App } from "@capacitor/app";

import * as Sentry from '@sentry/capacitor';
// The example is using Angular, Import '@sentry/vue' or '@sentry/react' when using a Sibling different than Angular.
import * as SentrySibling from '@sentry/react';
// For automatic instrumentation (highly recommended)
import { BrowserTracing } from '@sentry/tracing';

setupIonicReact();

Sentry.init(
  {
    dsn: 'https://423e900640a14e33be03bfd94e98f2c9@o1303144.ingest.sentry.io/6541732',
    // To set your release and dist versions
    release: 'my-project-name@' + process.env.npm_package_version,
    dist: '1',
    // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring.
    // We recommend adjusting this value in production.
    tracesSampleRate: 1.0,
    integrations: [
      new BrowserTracing({
        tracingOrigins: ['localhost', 'https://yourserver.io/api'],
      }),
    ]
  },
  // Forward the init method to the sibling Framework.
  SentrySibling.init
);

export const themeCheck = async () => {
  const { value } = await Storage.get({ key: "theme" });

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
        </IonRouterOutlet>
      </IonReactRouter>

      <Startup />
    </IonApp>
  );
};

export default App;
