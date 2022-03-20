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

import api from './../services/api';
import auth from './../services/auth.service';

import { User } from "./../services/userProps";

const Login: React.FC = () => {


  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const {navigate} = useContext(NavContext);

  const [present] = useIonAlert();
  const [presentLoading, dismissLoading] = useIonLoading();


  return (
    <IonPage>
      <IonContent fullscreen={true} className={"background-lightgrey "}>
        <IonImg src={brokulImage} className="image" />
        <IonLabel className="header">Zaloguj się do aplikacji</IonLabel>
        <div className="container center">
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
                message: 'Logowanie...',
                duration: 10000
              })

              // navigate("/Home", "forward", "replace")

              

              await auth.login(username, password).then((response) => {

                console.log(auth);

                const data = response as User;

                dismissLoading();

                if(data.jwtToken)
                {
                  navigate("/Home", "forward", "replace")
                }
                else
                {
                  present('Niepoprawne dane logowanie', [{ text: 'Zamknij' }])
                }

              }).catch((exception) => {
                dismissLoading();
                present('Niepoprawne dane logowanie', [{ text: 'Zamknij' }])
              });

            }}
            expand="block"
            color="primary"
            style={{ marginTop: "50px" }}
          >
            ZALOGUJ
          </IonButton>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Login;
