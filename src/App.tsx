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
  NavContext,
  setupIonicReact,
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

setupIonicReact();

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
