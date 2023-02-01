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

const Zloty = new Intl.NumberFormat('pl-PL', {
  style: 'currency',
  currency: 'PLN',
});

export const NumberToMoneyString = (num: number | undefined) => {
  if(num == undefined)
  {
    return "";
  }
  else
  {
    return Zloty.format(num)
  }
}

type PaymentResponse = {
  id: number;
  paymentMonth: string;
  createDate: string;
  contractName: string;
  summarySalary: number,
  pointsCount: number,
  contractAmountPerPoint: number,
  paydaysCount: number,
  contractBonusSalary: number,
  personalBonusSalary: number,
  contractBaseSalary: number,
  punishmentCost: number,
  punishmentExtraCost: number,
  correctionAmount: number,
  summaryNote: string
}

const Salary: React.FC = () => {

  const [paymentsList, setPaymentsList] = useState<PaymentResponse[]>([]);

  useIonViewWillEnter(() => {

    api.get("payments/driver").then((e) => {

      const data = e.data as PaymentResponse[];

      setPaymentsList(data);

    })

  })

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState<PaymentResponse>();

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
        
        {
          paymentsList.map((e) => {
            return(
              <>
                <div className="month-name capitalize">{e.paymentMonth}</div>
        <IonItem
          className="salary-item"
          onClick={() => {
            setModalData(e);
            setIsModalOpen(true);
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
              {e.contractName}
            </div>
              </IonCol>
            </IonRow>
            <IonRow className="ion-justify-content-between">
              <IonCol size="auto">
              <div style={{
                lineHeight: "38px",
                fontSize: "15px",
                opacity: "0.7"
              }}>Dodano <span>{e.createDate}</span></div>
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
              {NumberToMoneyString(e.summarySalary)}
            </div>
              </IonCol>
            </IonRow>
            
            
          </IonLabel>
          {/* <IonIcon icon={informationCircleOutline} className="item-icon" /> */}
        </IonItem>
              </>
            )
          })
        }
        
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
            <IonLabel style={{ maxWidth: "40%" }} className="wrap">Ilość stopów</IonLabel>
            <IonLabel
              className="wrap capitalize"
              style={{ textAlign: "center" }}
            >
              <div style={{ fontWeight: 700, fontSize: "20px" }}>{modalData?.pointsCount}</div>
              
            </IonLabel>
          </IonItem>

          <IonItem>
            <IonLabel style={{ maxWidth: "40%" }} className="wrap">Stawka za punkt</IonLabel>
            <IonLabel
              className="wrap"
              style={{ textAlign: "center" }}
            >
              <div style={{ fontWeight: 700, fontSize: "20px" }}>
                {NumberToMoneyString(modalData?.contractAmountPerPoint)}
              </div>
            </IonLabel>
          </IonItem>
          <IonItem>
            <IonLabel style={{ maxWidth: "40%" }} className="wrap">Dni pracujące</IonLabel>
            <IonLabel
              className="wrap capitalize"
              style={{ textAlign: "center" }}
            >
              <div style={{ fontWeight: 700, fontSize: "20px" }}>{modalData?.paydaysCount}</div>
            </IonLabel>
          </IonItem>
          <IonItem>
            <IonLabel style={{ maxWidth: "40%" }} className="wrap">Premia</IonLabel>
            <IonLabel
              className="wrap capitalize"
              style={{ textAlign: "center", color: "green" }}
            >
              <div style={{ fontWeight: 700, fontSize: "20px" }}>
                {NumberToMoneyString(modalData?.contractBonusSalary)}
              </div>
            </IonLabel>
          </IonItem>
          <IonItem>
            <IonLabel style={{ maxWidth: "40%" }} className="wrap">Dodatki</IonLabel>
            <IonLabel
              className="wrap capitalize"
              style={{ textAlign: "center" }}
            >
              <div style={{ fontWeight: 700, fontSize: "20px", color: "green" }}>
                {NumberToMoneyString(modalData?.personalBonusSalary)}
              </div>
            </IonLabel>
          </IonItem>
          <IonItem>
            <IonLabel style={{ maxWidth: "40%" }} className="wrap">Typ umowy</IonLabel>
            <IonLabel
              className="wrap capitalize"
              style={{ textAlign: "center" }}
            >
              <div style={{ fontWeight: 700, fontSize: "20px" }}>
                {modalData?.contractName}
              </div>
            </IonLabel>
          </IonItem>
          <IonItem>
            <IonLabel style={{ maxWidth: "40%" }} className="wrap">Podstawa</IonLabel>
            <IonLabel className="wrap" style={{ textAlign: "center" }}>
              <div style={{ fontWeight: 700, fontSize: "20px" }}>
                {NumberToMoneyString(modalData?.contractBaseSalary)}
              </div>
            </IonLabel>
          </IonItem>
          {
            modalData
            ?
            modalData?.punishmentCost > 0
            ?
<IonItem>
            <IonLabel style={{ maxWidth: "40%" }} className="wrap">Kary niedowozy i pomyłki</IonLabel>
            <IonLabel className="wrap" style={{ textAlign: "center" }}>
              <div style={{ fontWeight: 700, fontSize: "20px", color: "#bf0000" }}>
                {NumberToMoneyString(modalData?.punishmentCost)}
              </div>
            </IonLabel>
          </IonItem>
          :
          <></>
          :
          <></>
          }
          {
            modalData
            ?
            modalData?.punishmentExtraCost > 0
            ?
<IonItem>
            <IonLabel style={{ maxWidth: "40%" }} className="wrap">Kary dodatkowe</IonLabel>
            <IonLabel className="wrap" style={{ textAlign: "center" }}>
              <div style={{ fontWeight: 700, fontSize: "20px", color: "#bf0000" }}>
                {NumberToMoneyString(modalData?.punishmentExtraCost)}
              </div>
            </IonLabel>
          </IonItem>
          :
          <></>
          :
          <></>
          }
          {
            modalData
            ?
            modalData?.correctionAmount > 0
            ?
<IonItem>
            <IonLabel style={{ maxWidth: "40%" }} className="wrap">Korekta - biuro</IonLabel>
            <IonLabel className="wrap" style={{ textAlign: "center" }}>
              <div style={{ fontWeight: 700, fontSize: "20px" }}>
                {NumberToMoneyString(modalData?.correctionAmount)}
              </div>
            </IonLabel>
          </IonItem>
          :
          <></>
          :
          <></>
          }
          
          {
            modalData?.summaryNote
            ?
<IonItem
            lines="none"
          >
            <IonLabel
              className="wrap"
              style={{
                textAlign: "center",
              }}
            >
              {modalData.summaryNote}
            </IonLabel>
          </IonItem>
          :
          <></>
          }

          
          <IonItem style={{
              marginTop: "25px",
            }}>
            <IonLabel style={{ maxWidth: "40%" }} className="wrap">Podsumowanie</IonLabel>
            <IonLabel className="wrap" style={{ textAlign: "center" }}>
              <div style={{ fontWeight: 700, fontSize: "20px", color: "green" }}>
                {NumberToMoneyString(modalData?.summarySalary)}
              </div>
            </IonLabel>
          </IonItem>
          
          
        </IonContent>
      </IonModal>
    </IonPage>
  );
};

export default Salary;
