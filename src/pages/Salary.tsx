import { Vibration } from "@awesome-cordova-plugins/vibration";
import {
  BarcodeScanner,
  SupportedFormat,
} from "@capacitor-community/barcode-scanner";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
import { isPlatform } from "@ionic/core";
import {
  IonAlert,
  IonButton,
  IonButtons,
  IonCol,
  IonContent,
  IonFab,
  IonFabButton,
  IonFooter,
  IonHeader,
  IonIcon,
  IonImg,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonLoading,
  IonMenuToggle,
  IonModal,
  IonPage,
  IonReorder,
  IonReorderGroup,
  IonRippleEffect,
  IonRow,
  IonSearchbar,
  IonSelect,
  IonSelectOption,
  IonTitle,
  IonToggle,
  IonToolbar,
  NavContext,
  useIonAlert,
  useIonLoading,
  useIonPopover,
  useIonToast,
  useIonViewDidEnter,
  useIonViewDidLeave,
  useIonViewWillEnter,
  useIonViewWillLeave,
} from "@ionic/react";
import {
  alert,
  alertOutline,
  barcodeOutline,
  call,
  cameraOutline,
  checkmarkOutline,
  closeOutline,
  ellipsisVerticalOutline,
  flashlightOutline,
  informationCircleOutline,
  navigateOutline,
  refresh,
  refreshOutline,
  reorderFourOutline,
  searchOutline,
  swapHorizontalOutline,
  swapVerticalOutline,
  syncOutline,
} from "ionicons/icons";
import React, {
  FunctionComponent,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import MapPopover from "../components/MapPopover";
import PhonePopover from "../components/PhonePopover";
import "./Salary.scss";

import axios from "axios";
import { Preferences } from "@capacitor/preferences";
import { Virtuoso } from "react-virtuoso";

import api from "./../services/api";
import auth from "./../services/auth.service";
import { User } from "../services/userProps";
import {
  DietsProps,
  RoutePackagesProps,
  RouteProps,
  ItemsDietProps,
  ItemsProps,
  InnerItemProps,
  DietItemProps,
  OfflineRequestProps,
} from "../components/Types";
import ThreeDotsPopover from "../components/ThreeDotsPopover";
import { RouterProps } from "react-router";
import {
  GetPhoto,
  useRoute,
  CheckOfflineRequests as _CheckOfflineRequests,
} from "../services/Utility";
import { Network } from "@capacitor/network";

import { App } from "@capacitor/app";

import {
  GlobalStateProvider,
  useGlobalState,
  GlobalStateInterface,
} from "./../GlobalStateProvider";

import { BackgroundMode } from "@ionic-native/background-mode";

import { v4 as uuidv4 } from "uuid";

const Salary: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <IonPage className="salary-list-container">
      <IonHeader collapse="fade" translucent={isPlatform("mobile")} mode={"md"}>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton
              slot="start"
              onClick={() =>
                (
                  document.querySelector("#mainMenu") as
                    | HTMLIonMenuElement
                    | undefined
                )?.setOpen(true)
              }
            >
              <IonIcon slot="icon-only" icon={reorderFourOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonList className="punishment-list">
        <div>
          <div className="month-name">Grudzień</div>
          <IonItem
            className="salary-item"
            onClick={() => {
              setIsModalOpen(true);
            }}
          >
            <IonLabel style={{ overflow: "visible" }}>
              <div
                style={{
                  fontSize: "22px",
                  fontWeight: "550",
                  paddingBottom: "5px",
                }}
              >
                Umowa zlecenie
              </div>
              <div
                style={{
                  fontSize: "15px",
                  opacity: "0.7",
                }}
              >
                Dodano <span>09 listopad 2021</span>
              </div>
            </IonLabel>
            <IonLabel>
              <div
                style={{
                  textAlign: "right",
                  fontSize: "25px",
                  fontWeight: "700",
                  color: "green",
                }}
              >
                7549,33
              </div>
            </IonLabel>
            {/* <IonIcon icon={informationCircleOutline} className="item-icon" /> */}
          </IonItem>
        </div>
        <div>
          <div className="month-name">Listopad</div>
          <IonItem
            className="salary-item"
            onClick={() => {
              setIsModalOpen(true);
            }}
          >
            <IonLabel style={{ overflow: "visible" }}>
              <div
                style={{
                  fontSize: "22px",
                  fontWeight: "550",
                  paddingBottom: "5px",
                }}
              >
                Umowa zlecenie
              </div>
              <div
                style={{
                  fontSize: "15px",
                  opacity: "0.7",
                }}
              >
                Dodano <span>09 listopad 2021</span>
              </div>
            </IonLabel>
            <IonLabel>
              <div
                style={{
                  textAlign: "right",
                  fontSize: "25px",
                  fontWeight: "700",
                  color: "green",
                }}
              >
                8243,32
              </div>
            </IonLabel>
            {/* <IonIcon icon={informationCircleOutline} className="item-icon" /> */}
          </IonItem>
        </div>
        <div>
          <div className="month-name">Październik</div>
          <IonItem
            className="salary-item"
            onClick={() => {
              setIsModalOpen(true);
            }}
          >
            <IonLabel style={{ overflow: "visible" }}>
              <div
                style={{
                  fontSize: "22px",
                  fontWeight: "550",
                  paddingBottom: "5px",
                }}
              >
                Umowa zlecenie
              </div>
              <div
                style={{
                  fontSize: "15px",
                  opacity: "0.7",
                }}
              >
                Dodano <span>09 listopad 2021</span>
              </div>
            </IonLabel>
            <IonLabel>
              <div
                style={{
                  textAlign: "right",
                  fontSize: "25px",
                  fontWeight: "700",
                  color: "green",
                }}
              >
                7412,02
              </div>
            </IonLabel>
            {/* <IonIcon icon={informationCircleOutline} className="item-icon" /> */}
          </IonItem>
        </div>
      </IonList>
      <IonModal
        isOpen={isModalOpen}
        onWillDismiss={() => setIsModalOpen(false)}
      >
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="end">
              <IonButton onClick={() => setIsModalOpen(false)}>Wyjdź</IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <IonItem>
            <IonLabel style={{ maxWidth: "40%" }} className="wrap">
              Ilość stopów
            </IonLabel>
            <IonLabel
              className="wrap capitalize"
              style={{ textAlign: "center" }}
            >
              <div style={{ fontWeight: 700, fontSize: "20px" }}>1892</div>
            </IonLabel>
          </IonItem>

          <IonItem>
            <IonLabel style={{ maxWidth: "40%" }} className="wrap">
              Stawka
            </IonLabel>
            <IonLabel
              className="wrap capitalize"
              style={{ textAlign: "center" }}
            >
              <div style={{ fontWeight: 700, fontSize: "20px" }}>1.80zł</div>
            </IonLabel>
          </IonItem>
          <IonItem>
            <IonLabel style={{ maxWidth: "40%" }} className="wrap">
              Dni pracujące
            </IonLabel>
            <IonLabel
              className="wrap capitalize"
              style={{ textAlign: "center" }}
            >
              <div style={{ fontWeight: 700, fontSize: "20px" }}>21</div>
            </IonLabel>
          </IonItem>
          <IonItem>
            <IonLabel style={{ maxWidth: "40%" }} className="wrap">
              Premia - stanowisko
            </IonLabel>
            <IonLabel
              className="wrap capitalize"
              style={{ textAlign: "center", color: "green" }}
            >
              <div style={{ fontWeight: 700, fontSize: "20px" }}>500.00zł</div>
            </IonLabel>
          </IonItem>
          <IonItem>
            <IonLabel style={{ maxWidth: "40%" }} className="wrap">
              Premia - osobista
            </IonLabel>
            <IonLabel
              className="wrap capitalize"
              style={{ textAlign: "center" }}
            >
              <div
                style={{ fontWeight: 700, fontSize: "20px", color: "green" }}
              >
                300.00zł
              </div>
            </IonLabel>
          </IonItem>
          <IonItem>
            <IonLabel style={{ maxWidth: "40%" }} className="wrap">
              Kontrakt
            </IonLabel>
            <IonLabel
              className="wrap capitalize"
              style={{ textAlign: "center" }}
            >
              <div style={{ fontWeight: 700, fontSize: "20px" }}>
                Działalność gospodarcza
              </div>
            </IonLabel>
          </IonItem>
          <IonItem>
            <IonLabel style={{ maxWidth: "40%" }} className="wrap">
              Podstawa
            </IonLabel>
            <IonLabel className="wrap" style={{ textAlign: "center" }}>
              <div style={{ fontWeight: 700, fontSize: "20px" }}>
                2000,00 zł
              </div>
            </IonLabel>
          </IonItem>
          <IonItem>
            <IonLabel style={{ maxWidth: "40%" }} className="wrap">
              Kary
            </IonLabel>
            <IonLabel className="wrap" style={{ textAlign: "center" }}>
              <div
                style={{ fontWeight: 700, fontSize: "20px", color: "#bf0000" }}
              >
                -200,00 zł
              </div>
            </IonLabel>
          </IonItem>
          <IonItem>
            <IonLabel style={{ maxWidth: "40%" }} className="wrap">
              Korekta - biuro
            </IonLabel>
            <IonLabel className="wrap" style={{ textAlign: "center" }}>
              <div
                style={{ fontWeight: 700, fontSize: "20px", color: "#bf0000" }}
              >
                -100,00 zł
              </div>
            </IonLabel>
          </IonItem>
          <IonItem
            lines="none"
            style={{
              marginBottom: "35px",
            }}
          >
            <IonLabel
              className="wrap"
              style={{
                textAlign: "center",
              }}
            >
              {" "}
              Notatka
            </IonLabel>
          </IonItem>
          <IonItem>
            <IonLabel style={{ maxWidth: "40%" }} className="wrap">
              Podsumowanie
            </IonLabel>
            <IonLabel className="wrap" style={{ textAlign: "center" }}>
              <div
                style={{ fontWeight: 700, fontSize: "20px", color: "green" }}
              >
                8243,32 zł
              </div>
            </IonLabel>
          </IonItem>
        </IonContent>
      </IonModal>
    </IonPage>
  );
};

export default Salary;
