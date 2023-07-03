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
import "./Punishments.scss";

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

const Punishments: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <IonPage className="list-container">
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
          <div style={{ width: "200px" }}>
            {/* <IonSelect value={"dasdasd"} interface="popover" placeholder="Wybierz miesiąc">
          <IonSelectOption defaultChecked value="dasdasd">Ostatnie 4 miesiące</IonSelectOption>
          <IonSelectOption value="apples">Styczeń</IonSelectOption>
          <IonSelectOption value="oranges">Luteń</IonSelectOption>
          <IonSelectOption value="bananas">Marzeń</IonSelectOption>
          <IonSelectOption value="asdasd">Październik</IonSelectOption>
        </IonSelect> */}
          </div>
        </IonToolbar>
      </IonHeader>
      {/* <IonItem style={{}}>
        <IonLabel>Podsumowanie</IonLabel>
        <IonLabel><IonSelect interface="popover" placeholder="Wybierz miesiąc">
          <IonSelectOption value="apples">Styczeń</IonSelectOption>
          <IonSelectOption value="oranges">Luteń</IonSelectOption>
          <IonSelectOption value="bananas">Marzeń</IonSelectOption>
        </IonSelect></IonLabel>
      </IonItem> */}
      <IonList className="punishment-list">
        <IonItem
          className="punish-item"
          onClick={() => {
            setIsModalOpen(true);
          }}
        >
          <IonLabel>
            <div
              style={{
                fontSize: "24px",
                fontWeight: "550",
                paddingBottom: "5px",
              }}
            >
              Niedowóz
            </div>
            <div style={{ opacity: "0.7" }}>24.11.2021</div>
          </IonLabel>
          <IonLabel>
            <div
              style={{
                textAlign: "right",
                fontSize: "25px",
              }}
            >
              -500
            </div>
          </IonLabel>
          {/* <IonIcon icon={informationCircleOutline} className="item-icon" /> */}
        </IonItem>
        <IonItem
          className="punish-item"
          onClick={() => {
            setIsModalOpen(true);
          }}
        >
          <IonLabel>
            <div
              style={{
                fontSize: "24px",
                fontWeight: "550",
                paddingBottom: "5px",
              }}
            >
              Uszkodzenie
            </div>
            <div style={{ opacity: "0.7" }}>24.11.2021</div>
          </IonLabel>
          <IonLabel>
            <div
              style={{
                textAlign: "right",
                fontSize: "25px",
              }}
            >
              -500
            </div>
          </IonLabel>
          {/* <IonIcon icon={informationCircleOutline} className="item-icon" /> */}
        </IonItem>
        <IonItem
          className="punish-item"
          onClick={() => {
            setIsModalOpen(true);
          }}
        >
          <IonLabel>
            <div
              style={{
                fontSize: "24px",
                fontWeight: "550",
                paddingBottom: "5px",
              }}
            >
              Niedowóz
            </div>
            <div style={{ opacity: "0.7" }}>24.11.2021</div>
          </IonLabel>
          <IonLabel>
            <div
              style={{
                textAlign: "right",
                fontSize: "25px",
              }}
            >
              -600
            </div>
          </IonLabel>
          {/* <IonIcon icon={informationCircleOutline} className="item-icon" /> */}
        </IonItem>
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
            <IonLabel style={{ maxWidth: "30%" }}>Uwaga</IonLabel>
            <IonLabel
              className="wrap capitalize"
              style={{ textAlign: "center" }}
            >
              <div style={{ fontWeight: 700, fontSize: "20px" }}>Niedowóz</div>
              <div style={{ fontWeight: 300 }}>26 maj, 2022 22:59</div>
            </IonLabel>
          </IonItem>

          <IonItem>
            <IonLabel style={{ maxWidth: "30%" }}>Adres</IonLabel>
            <IonLabel
              className="wrap capitalize"
              style={{ textAlign: "center" }}
            >
              <div style={{ fontWeight: 700, fontSize: "20px" }}>
                Jesionowa 17
              </div>

              <div style={{ fontWeight: 300 }}>00-250 Górnicza Dolina</div>
            </IonLabel>
          </IonItem>
          <IonItem>
            <IonLabel style={{ maxWidth: "30%" }}>Tytuł</IonLabel>
            <IonLabel
              className="wrap capitalize"
              style={{ textAlign: "center" }}
            >
              <div style={{ fontWeight: 700, fontSize: "20px" }}>Niedowóz</div>
            </IonLabel>
          </IonItem>
          <IonItem>
            <IonLabel style={{ maxWidth: "30%" }}>Numer trasy</IonLabel>
            <IonLabel
              className="wrap capitalize"
              style={{ textAlign: "center" }}
            >
              <div style={{ fontWeight: 700, fontSize: "20px" }}>
                pojazd 125
              </div>
            </IonLabel>
          </IonItem>
          <IonItem>
            <IonLabel style={{ maxWidth: "30%" }}>Zdjęcie</IonLabel>
            <IonLabel
              className="wrap capitalize"
              style={{ textAlign: "center" }}
            >
              <div style={{ fontWeight: 700, fontSize: "20px" }}>Przesłane</div>
            </IonLabel>
          </IonItem>
          <IonItem>
            <IonLabel style={{ maxWidth: "30%" }}>Kwota</IonLabel>
            <IonLabel className="wrap" style={{ textAlign: "center" }}>
              <div style={{ fontWeight: 700, fontSize: "20px" }}>500,00 zł</div>
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
              Niedowóz zupa 1 Xl uszkodzone Niedowóz zupa 1 Xl uszkodzone
              Niedowóz zupa 1 Xl uszkodzone
            </IonLabel>
          </IonItem>
          {/* <IonItem lines="none" style={{marginTop: "30px", marginBottom: "30px"}}>
              Niedowóz zupa 1 Xl uszkodzone
              
            </IonItem> */}
          <IonImg src="https://broccolihot.z16.web.core.windows.net/packages/fc4ce2a5-f87e-4b6d-886c-fc3bdb83fcbe.jpg" />
        </IonContent>
      </IonModal>
    </IonPage>
  );
};

export default Punishments;
