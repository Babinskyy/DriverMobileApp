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
  useIonAlert,
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
import React, { useEffect, useRef, useState } from "react";
import MapPopover from "../components/MapPopover";
import PhonePopover from "../components/PhonePopover";
import "./Login.scss";

import axios from "axios";
import { Storage } from "@capacitor/storage";

import brokulImage from "../images/brokul-athlete.png";

const Login: React.FC = () => {
  const [text, setText] = useState<string>();

  return (
    <IonPage>
      <IonContent fullscreen={true} className={"background-lightgrey "}>
        <IonImg src={brokulImage} className="image" />
        <IonLabel className="header">Zaloguj się do aplikacji</IonLabel>
        <div className="container center">
          <IonItem style={{ marginBottom: "5px" }}>
            <IonInput
              value={text}
              placeholder="Login"
              onIonChange={(e) => setText(e.detail.value!)}
            ></IonInput>
          </IonItem>

          <IonItem style={{}}>
            <IonInput
              value={text}
              placeholder="Hasło"
              onIonChange={(e) => setText(e.detail.value!)}
              type="password"
            ></IonInput>
          </IonItem>
          <IonButton
            routerLink="/home"
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
