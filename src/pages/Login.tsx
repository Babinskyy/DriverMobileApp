import { Vibration } from "@awesome-cordova-plugins/vibration";
import {
  BarcodeScanner,
  SupportedFormat,
} from "@capacitor-community/barcode-scanner";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
import { isPlatform } from "@ionic/core";
import {
  IonButton,
  IonButtons,
  IonContent,
  IonFab,
  IonFabButton,
  IonFooter,
  IonGrid,
  IonHeader,
  IonIcon,
  IonImg,
  IonInput,
  IonItem,
  IonItemDivider,
  IonLabel,
  IonList,
  IonListHeader,
  IonModal,
  IonPage,
  IonReorder,
  IonRippleEffect,
  IonRow,
  IonSearchbar,
  IonTitle,
  IonToolbar,
  NavContext,
  useIonAlert,
  useIonLoading,
  useIonPopover,
  useIonViewWillEnter,
  useIonViewWillLeave,
} from "@ionic/react";
import {
  barcodeOutline,
  call,
  cameraOutline,
  checkmarkOutline,
  closeOutline,
  flashlightOutline,
  navigateOutline,
  searchOutline,
} from "ionicons/icons";
import React, { useContext, useEffect, useRef, useState } from "react";
import MapPopover from "../components/MapPopover";
import PhonePopover from "../components/PhonePopover";
import "./Login.scss";

import axios from "axios";
import { Storage } from "@capacitor/storage";

import brokulImage from "../images/brokul-athlete.png";

import api from "./../services/api";
import auth from "./../services/auth.service";

import { User } from "./../services/userProps";

import { PushNotifications } from '@capacitor/push-notifications';

const Login: React.FC = () => {

  const { navigate } = useContext(NavContext);

  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const [present] = useIonAlert();
  const [presentLoading, dismissLoading] = useIonLoading();


  // const [presentPageLoading, dismissPageLoading] = useIonLoading();
  // useEffect(() => {

  //   presentPageLoading({
  //     duration: 10000,
  //   });

  //   const getUser = async () => {
  //     const user = (await auth.getCurrentUser()) as User | undefined;

  //     dismissPageLoading();

  //     if (user) {
  //       navigate("/home", "root", "replace");
  //     }
  //   };

  //   getUser();
  // }, []);

  return (
    <IonPage>
      <IonContent fullscreen={true} className={"background-lightgrey "}>
        <IonGrid style={{ height: "100%" }} >
          <IonRow className="ion-justify-content-center ion-align-items-center" style={{ height: "100%" }} >
          <div style={{ marginBottom: "100px" }} >
          <IonImg src={brokulImage} className="image" />
          <IonLabel className="header">Zaloguj się do aplikacji</IonLabel>
          <IonItem style={{ marginBottom: "5px" }}>
            <IonInput
              value={username}
              placeholder="Login"
              onIonChange={(e) => setUsername(e.detail.value!)}
            ></IonInput>
          </IonItem>

          <IonItem style={{}}>
            <IonInput
              value={password}
              placeholder="Hasło"
              onIonChange={(e) => setPassword(e.detail.value!)}
              type="password"
            ></IonInput>
          </IonItem>
          <IonButton
            onClick={async () => {
              presentLoading({
                spinner: "crescent",
                message: "Logowanie...",
                duration: 10000,
              });

              // navigate("/Home", "forward", "replace")

              await auth
                .login(username, password)
                .then(async (response) => {
                  console.log(auth);

                  const data = response as User;

                  dismissLoading();

                  if (data.jwtToken) {

                    try {
                      
                      await PushNotifications.register();

                    } catch (error) {
                      
                    }

                    navigate("/", "forward", "replace");
                  } else {
                    present("Niepoprawne dane logowanie", [
                      { text: "Zamknij" },
                    ]);
                  }
                })
                .catch((exception) => {
                  dismissLoading();
                  present("Niepoprawne dane logowanie", [{ text: "Zamknij" }]);
                });
            }}
            expand="block"
            color="primary"
            style={{ marginTop: "50px" }}
          >
            ZALOGUJ
          </IonButton>
          </div>
          </IonRow>
        </IonGrid>
        {/* <div className="container center">
          
        </div> */}
      </IonContent>
    </IonPage>
  );
};

export default Login;
