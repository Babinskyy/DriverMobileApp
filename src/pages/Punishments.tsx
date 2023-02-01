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
import { NumberToMoneyString } from "./Salary";

type PunishmentResponse = {
  id: number;
  title: string;
  created: string;
  punishmentCost: number;
  routeAddressPostcode: string;
  routeAddressCity: string;
  routeAddressStreet: string;
  routeAddressHouseNumber: string;
  driverName: string;
  photo: string;
  description: string;
};

const Punishments: React.FC = () => {
  const [punishments, setPunishments] = useState<PunishmentResponse[]>([]);

  useIonViewWillEnter(() => {
    api.get("punishments").then((e) => {
      const data = e.data as PunishmentResponse[];

      setPunishments(data);
    });
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState<PunishmentResponse>();

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
        {punishments.map((e) => {
          return (
        <IonItem
            style={{
              marginTop: "15px"
            }}
          className="salary-item"
          onClick={() => {
            setIsModalOpen(true);
            setModalData(e);
          }}
        >
          <IonLabel style={{overflow: "visible"}}>
            <IonRow>
              <IonCol size="12">
              <div
              style={{
                fontSize: "22px",
                fontWeight: "550",
              }}
            >
              {e.title}
            </div>
              </IonCol>
            </IonRow>
            <IonRow className="ion-justify-content-between">
              <IonCol size="auto">
              <div style={{
                lineHeight: "38px",
                fontSize: "15px",
                opacity: "0.7"
              }}>Dodano <span>{e.created}</span></div>
              </IonCol>
              <IonCol size="auto">
              <div
              style={{
                textAlign: "right",
                fontSize: "25px",
                fontWeight: "700",
                color: "green",
              }}
            >
              {NumberToMoneyString(e.punishmentCost)}
            </div>
              </IonCol>
            </IonRow>
            
            
          </IonLabel>
        </IonItem>
          );
        })}
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
              <div style={{ fontWeight: 700, fontSize: "20px" }}>
                {modalData?.title}
              </div>
              <div style={{ fontWeight: 300 }}>{modalData?.created}</div>
            </IonLabel>
          </IonItem>

          {
            modalData?.routeAddressStreet && modalData?.routeAddressHouseNumber && modalData?.routeAddressPostcode && modalData?.routeAddressCity
            ?
<IonItem>
            <IonLabel style={{ maxWidth: "30%" }}>Adres</IonLabel>
            <IonLabel
              className="wrap capitalize"
              style={{ textAlign: "center" }}
            >
              <div style={{ fontWeight: 700, fontSize: "20px" }}>
                {modalData?.routeAddressStreet}{" "}
                {modalData?.routeAddressHouseNumber}
              </div>

              <div style={{ fontWeight: 300 }}>
                {modalData?.routeAddressPostcode} {modalData?.routeAddressCity}
              </div>
            </IonLabel>
          </IonItem>
          :
          <></>
          }

          {
            modalData?.driverName
            ?
<IonItem>
            <IonLabel style={{ maxWidth: "30%" }}>Numer trasy</IonLabel>
            <IonLabel
              className="wrap capitalize"
              style={{ textAlign: "center" }}
            >
              <div style={{ fontWeight: 700, fontSize: "20px" }}>
                pojazd {modalData?.driverName}
              </div>
            </IonLabel>
          </IonItem>
          :
          <></>
          }

          
          {/* <IonItem>
            <IonLabel style={{ maxWidth: "30%" }}>Tytuł</IonLabel>
            <IonLabel
              className="wrap capitalize"
              style={{ textAlign: "center" }}
            >
              <div style={{ fontWeight: 700, fontSize: "20px" }}>
                Niedowóz
              </div>

              
            </IonLabel>
          </IonItem> */}
          
          <IonItem>
            <IonLabel style={{ maxWidth: "30%" }}>Zdjęcie</IonLabel>
            <IonLabel
              className="wrap capitalize"
              style={{ textAlign: "center" }}
            >
              <div style={{ fontWeight: 700, fontSize: "20px" }}>
                {modalData?.photo ? "Przesłano" : "Brak"}
              </div>
            </IonLabel>
          </IonItem>
          <IonItem>
            <IonLabel style={{ maxWidth: "30%" }}>Kwota</IonLabel>
            <IonLabel className="wrap" style={{ textAlign: "center" }}>
              <div style={{ fontWeight: 700, fontSize: "20px" }}>
                {NumberToMoneyString(modalData?.punishmentCost)}
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
              {modalData?.description}
            </IonLabel>
          </IonItem>
          {/* <IonItem lines="none" style={{marginTop: "30px", marginBottom: "30px"}}>
              Niedowóz zupa 1 Xl uszkodzone
              
            </IonItem> */}
          {modalData?.photo ? <IonImg src={modalData.photo} /> : <></>}
        </IonContent>
      </IonModal>
    </IonPage>
  );
};

export default Punishments;
