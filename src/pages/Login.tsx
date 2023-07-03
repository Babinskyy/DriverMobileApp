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
  IonSelect,
  IonSelectOption,
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
import { Preferences } from "@capacitor/preferences";

import brokulImage from "../images/brokul-athlete.png";
import logoImage from "../images/mark1_png.png";

import api from "./../services/api";
import auth from "./../services/auth.service";

import { User } from "./../services/userProps";

import { PushNotifications } from "@capacitor/push-notifications";

const Login: React.FC = () => {
  const { navigate } = useContext(NavContext);

  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const [driverUsername, setDriverUsername] = useState<string>("");
  const [driverPassword, setDriverPassword] = useState<string>("");

  const [present] = useIonAlert();
  const [presentLoading, dismissLoading] = useIonLoading();

  const [drivers, setDrivers] = useState<string[]>([]);

  useEffect(() => {
    if (drivers.length <= 0) {
      api.get("autocomplete/drivers-visible").then((e) => {
        const data = e.data;

        setDrivers(data);
      });
    }
  }, []);

  const [step, setStep] = useState(1);

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
        <IonGrid style={{ height: "100%" }}>
          <IonRow
            className="ion-justify-content-center ion-align-items-center"
            style={{ height: "100%" }}
          >
            <div style={{ marginBottom: "100px" }}>
              <IonImg src={logoImage} className="image" />
              {step == 1 ? (
                <>
                  <IonLabel className="header">
                    Zaloguj się do aplikacji
                  </IonLabel>
                  <IonItem style={{ marginBottom: "5px" }}>
                    <IonInput
                      value={username}
                      placeholder="Nazwa użytkownika"
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
                      // presentLoading({
                      //   spinner: "crescent",
                      //   message: "Logowanie...",
                      //   duration: 10000,
                      // });

                      setStep(2);

                      // api
                      //   .post("/accounts/authenticate-check", {
                      //     username,
                      //     password,
                      //   })
                      //   .then(async (response) => {
                      //     const data = response.data as boolean;

                      //     await dismissLoading();

                      //     if (data) {
                      //       setStep(2);
                      //     } else {
                      //       present("Niepoprawne dane logowanie", [
                      //         { text: "Zamknij" },
                      //       ]);
                      //     }
                      //   })
                      //   .catch(() => {
                      //     dismissLoading();
                      //   });
                    }}
                    expand="block"
                    color="primary"
                    style={{ marginTop: "30px" }}
                  >
                    WYBIERZ POJAZD
                  </IonButton>
                </>
              ) : (
                <>
                  <>
                    <IonLabel className="header">Pojazd</IonLabel>
                    {/* <IonItem style={{ marginBottom: "5px" }}>
            <IonInput
              value={username}
              placeholder="Nazwa trasy"
              onIonChange={(e) => setUsername(e.detail.value!)}
            ></IonInput>
          </IonItem> */}
                    <IonList style={{ marginBottom: "10px" }}>
                      <IonItem>
                        <IonSelect
                          onIonChange={(ev) =>
                            setDriverUsername(ev.detail.value)
                          }
                          cancelText="Anuluj"
                          okText="Wybierz"
                          placeholder="Nazwa trasy"
                        >
                          {drivers.map((e) => {
                            return (
                              <IonSelectOption key={e} value={e}>
                                {e.toUpperCase()}
                              </IonSelectOption>
                            );
                          })}
                        </IonSelect>
                      </IonItem>
                    </IonList>

                    <IonItem style={{}}>
                      <IonInput
                        value={driverPassword}
                        placeholder="Hasło"
                        onIonChange={(e) => setDriverPassword(e.detail.value!)}
                        type="password"
                      ></IonInput>
                    </IonItem>
                    <IonButton
                      onClick={async () => {
                        setStep(1);
                      }}
                      expand="block"
                      color="secondary"
                      style={{ marginTop: "30px" }}
                    >
                      Cofnij
                    </IonButton>
                    <IonButton
                      onClick={async () => {
                        // presentLoading({
                        //   spinner: "crescent",
                        //   message: "Logowanie...",
                        //   duration: 10000,
                        // });

                        // navigate("/Home", "forward", "replace")
                        navigate("/", "forward", "replace");

                        // await auth
                        //   .login(
                        //     username,
                        //     password,
                        //     driverUsername,
                        //     driverPassword
                        //   )
                        //   .then(async (response) => {
                        //     console.log(auth);

                        //     const data = response as User;

                        //     dismissLoading();

                        //     if (data.jwtToken) {
                        //       try {
                        //         await PushNotifications.register();
                        //       } catch (error) {}

                        //       navigate("/", "forward", "replace");
                        //     } else {
                        //       present("Niepoprawne dane logowanie", [
                        //         { text: "Zamknij" },
                        //       ]);
                        //     }
                        //   })
                        //   .catch((exception) => {
                        //     dismissLoading();
                        //     present("Niepoprawne dane logowanie", [
                        //       { text: "Zamknij" },
                        //     ]);
                        //   });
                      }}
                      expand="block"
                      color="primary"
                      style={{ marginTop: "15px" }}
                    >
                      ZALOGUJ
                    </IonButton>
                  </>
                </>
              )}
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
