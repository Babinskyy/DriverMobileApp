import { Redirect, Route, useLocation } from "react-router-dom";
import {
  IonApp,
  IonContent,
  IonHeader,
  IonItem,
  IonList,
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
import { useContext, useEffect, useRef, useState } from "react";

import api from "./services/api";
import auth from "./services/auth.service";

import { User } from "./services/userProps";
import Startup from "./components/Startup";

setupIonicReact();

const App: React.FC = () => {
  // const [present, dismiss] = useIonLoading();
  // const ref = useRef<IonReactRouter>(null);

  // const { navigate } = useContext(NavContext);

  // useEffect(() => {
  //   if (ref.current) {
  //     present({
  //       duration: 10000,
  //     });

  //     const getUser = async () => {
  //       const user = (await auth.getCurrentUser()) as User | undefined;

  //       dismiss();

  //       if (user) {
  //         if (
  //           ref.current?.history.location.pathname
  //             .toLowerCase()
  //             .startsWith("/login")
  //         ) {
  //           navigate("/home", "root", "replace");
  //         }
  //       } else {
  //         if (
  //           !ref.current?.history.location.pathname
  //             .toLowerCase()
  //             .startsWith("/login")
  //         ) {
  //           navigate("/login", "root", "replace");
  //         }
  //       }
  //     };

  //     getUser();
  //   }
  // }, []);

  return (
    <IonApp>

      <IonMenu side="start" menuId="first" contentId="main">
        {/* <IonHeader>
          <IonToolbar color="primary">
            <IonTitle>Example Menu</IonTitle>
          </IonToolbar>
        </IonHeader> */}
        <IonContent>
          <IonList>
            <IonItem button color="danger" onClick={async () => {

              auth.logout().finally(() => {
                window.location.replace("/login");
              });

            }} >Wyloguj</IonItem>
          </IonList>
        </IonContent>
      </IonMenu>

      <IonReactRouter>
        <IonRouterOutlet>
          <Route path="/login" exact={true} component={Login} />
          <Route path="/Warehouse" exact={true} component={Warehouse} />
          <Route path="/" exact={true} component={Home} />
        </IonRouterOutlet>
      </IonReactRouter>
    </IonApp>
  );
};

export default App;
