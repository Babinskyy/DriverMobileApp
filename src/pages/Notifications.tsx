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
  IonTextarea,
  IonTitle,
  IonToggle,
  IonToolbar,
  NavContext,
  useIonActionSheet,
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
import "./Notifications.scss";

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

import NotificationTypeSelect from "../components/NotificationTypeSelect";
import NotificationDietSelect from "../components/NotificationDietSelect";
import NotificationSelect from "../components/NotificationSelect";
import { AddressDietList, AddressList } from "../components/NotificationData";

type NotificationRequest = {
  addressId?: number;
  addressDietId?: number;
  addressDietCustom?: string;

  addressPackageIssue?: "damaged" | "missing";
  addressPackageDietType?: "whole" | "part";

  addressPackageDietId?: number;
  addressPackageDietCustom?: string;
  addressPackagePartList?: string[];
};

const Salary: React.FC = () => {
  const [notificationRequest, setNotificationRequest] =
    useState<NotificationRequest>({});

  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [present] = useIonActionSheet();
  const [notificationButtonType, setNotificationButtonType] = useState<
    "" | "missing" | "damaged"
  >("");
  const [damageButtonType, setDamageButtonType] = useState<
    "" | "whole" | "part"
  >("");
  const [partDamageActionButton, setPartDamageActionButton] = useState<
    "" | "swap" | "info"
  >("");

  const [textareaValue, setTextareaValue] = useState("");

  function canDismiss() {
    return new Promise<boolean>((resolve, reject) => {
      present({
        header: "Zgłoszenie nie zostało ukończone. Jesteś pewny?",
        buttons: [
          {
            text: "Wyjdź",
            role: "confirm",
          },
          {
            text: "Zostań",
            role: "cancel",
          },
        ],
        onWillDismiss: (ev) => {
          if (ev.detail.role === "confirm") {
            setIsNotificationModalOpen(false);
            setNotificationButtonType("");
            setNotificationRequest({});
            setDamageButtonType("");
            setPartDamageActionButton("");
            setTextareaValue("");
          } else {
            reject();
          }
        },
      });
    });
  }

  const DamageTypeFunction = () => {
    return (
      <div>
        {notificationButtonType == "damaged" &&
        notificationRequest?.addressDietId ? (
          <div style={{ textAlign: "center", marginBottom: "10px" }}>
            <span style={{ letterSpacing: "1px" }}>
              WYBIERZ TYP USZKODZENIA:
            </span>
            <IonRow>
              <IonCol size="6">
                <IonButton
                  fill={damageButtonType == "whole" ? "solid" : "outline"}
                  className="choose-type-button"
                  color={damageButtonType == "whole" ? "" : "medium"}
                  onClick={() => {
                    setDamageButtonType("whole");
                  }}
                >
                  cała dieta
                </IonButton>
              </IonCol>
              <IonCol size="6">
                <IonButton
                  fill={damageButtonType == "part" ? "solid" : "outline"}
                  className="choose-type-button"
                  color={damageButtonType == "part" ? "" : "medium"}
                  onClick={() => {
                    setDamageButtonType("part");
                  }}
                >
                  tacki
                </IonButton>
              </IonCol>
            </IonRow>
          </div>
        ) : (
          <div>no</div>
        )}
      </div>
    );
  };

  function partDamageFunction() {
    return (
      <div>
        {damageButtonType == "part" ? (
          <div style={{ marginBottom: "20px" }}>
            <NotificationSelect
              multiple
              disabled={!notificationRequest?.addressId}
              data={[
                { id: "1/1", value: "1/1" },
                { id: "1/2", value: "1/2" },
                { id: "2/2", value: "2/2" },
                { id: "1/3", value: "1/3" },
                { id: "2/3", value: "2/3" },
                { id: "3/3", value: "3/3" },
                { id: "1/4", value: "1/4" },
                { id: "2/4", value: "2/4" },
                { id: "3/4", value: "3/4" },
                { id: "4/4", value: "4/4" },
                { id: "1/5", value: "1/5" },
                { id: "2/5", value: "2/5" },
                { id: "3/5", value: "3/5" },
                { id: "4/5", value: "4/5" },
                { id: "5/5", value: "5/5" },
              ]}
              placeholder="Numery tacek"
              onChange={(val: string[]) => {
                setNotificationRequest({
                  ...notificationRequest,
                  addressPackagePartList: val,
                });
              }}
            />
          </div>
        ) : (
          <div>no</div>
        )}
      </div>
    );
  }

  const PartSelectFunction = () => {
    return (
      <div>
        {notificationButtonType == "damaged" &&
        notificationRequest?.addressId ? (
          <div style={{ textAlign: "center", marginBottom: "10px" }}>
            <span style={{ letterSpacing: "1px" }}>WYBIERZ DZIAŁANIE:</span>
            <IonRow>
              <IonCol size="6">
                <IonButton
                  fill={partDamageActionButton == "swap" ? "solid" : "outline"}
                  className="choose-type-button"
                  color={partDamageActionButton == "swap" ? "" : "medium"}
                  onClick={() => {
                    setPartDamageActionButton("swap");
                  }}
                >
                  Wymiana
                </IonButton>
              </IonCol>
              <IonCol size="6">
                <IonButton
                  fill={partDamageActionButton == "info" ? "solid" : "outline"}
                  className="choose-type-button"
                  color={partDamageActionButton == "info" ? "" : "medium"}
                  onClick={() => {
                    setPartDamageActionButton("info");
                  }}
                >
                  Informacja
                </IonButton>
              </IonCol>
            </IonRow>
          </div>
        ) : (
          <div>no</div>
        )}
      </div>
    );
  };

  const PartSelectInfoFunction = () => {
    return (
      <div>
        {partDamageActionButton == "swap" ? (
          <div style={{ textAlign: "center", marginBottom: "10px" }}>
            <span style={{ letterSpacing: "1px" }}>OPISZ SYTUACJĘ1:</span>
          </div>
        ) : partDamageActionButton == "info" ? (
          <div style={{ textAlign: "center" }}>
            <span style={{ letterSpacing: "1px" }}>OPISZ SYTUACJĘ:</span>

            <IonTextarea
              onIonChange={(e) => {
                if (e.detail.value) {
                  setTextareaValue(e.detail.value);
                } else {
                  setTextareaValue("");
                }
              }}
              value={textareaValue}
              className="damaged-textarea"
              placeholder="Opisz sytuację"
            ></IonTextarea>
            <IonButton
              style={{ marginTop: "10px" }}
              disabled={!textareaValue}
              onClick={() => {
                setIsSummaryModalOpen(true);
              }}
            >
              Potwierdź
            </IonButton>
          </div>
        ) : (
          <div>no</div>
        )}
      </div>
    );
  };

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
            <IonSelect
              value={"dasdasd"}
              interface="popover"
              placeholder="Wybierz miesiąc"
            >
              <IonSelectOption defaultChecked value="dasdasd">
                Ostatnie 4 miesiące
              </IonSelectOption>
              <IonSelectOption value="apples">Styczeń</IonSelectOption>
              <IonSelectOption value="oranges">Luteń</IonSelectOption>
              <IonSelectOption value="bananas">Marzeń</IonSelectOption>
              <IonSelectOption value="asdasd">Październik</IonSelectOption>
            </IonSelect>
          </div>
        </IonToolbar>
      </IonHeader>

      <IonButton
        className="make-notifaction-button"
        onClick={() => {
          setIsNotificationModalOpen(true);
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
            Zgłoś informację
          </div>
        </IonLabel>

        {/* <IonIcon icon={informationCircleOutline} className="item-icon" /> */}
      </IonButton>
      <IonItem>Twoje zgłoszenia:</IonItem>

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
                Uszkodzenie diety
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
                Brak diety
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
            {/* <IonLabel>
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
            
          </IonLabel> */}
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
                Uszkodzenie diety
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
              <div style={{ fontWeight: 700, fontSize: "20px" }}>2.70zł</div>
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
      <IonModal
        isOpen={isSummaryModalOpen}
        onWillDismiss={() => setIsSummaryModalOpen(false)}
      >
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="end">
              <IonButton onClick={() => setIsSummaryModalOpen(false)}>Wyjdź</IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <IonItem>
            <IonLabel style={{ maxWidth: "40%" }} className="wrap">
              Typ zgłoszenia
            </IonLabel>
            <IonLabel
              className="wrap capitalize"
              style={{ textAlign: "center" }}
            >
              <div style={{ fontWeight: 700, fontSize: "20px" }}>{notificationButtonType == "missing" ? "Brak" : notificationButtonType == "damaged" ? "Uszkodzenie" : "Error"}</div>
            </IonLabel>
          </IonItem>

          <IonItem>
            <IonLabel style={{ maxWidth: "40%" }} className="wrap">
              Adres
            </IonLabel>
            <IonLabel
              className="wrap capitalize"
              style={{ textAlign: "center" }}
            >
              <div style={{ fontWeight: 700, fontSize: "20px" }}>{
                notificationRequest?.addressId
                ?
                AddressList.filter(e => e.id == notificationRequest.addressId)[0].value
                :
                <></>
              }</div>
            </IonLabel>
          </IonItem>
          <IonItem>
            <IonLabel style={{ maxWidth: "40%" }} className="wrap">
              Dieta
            </IonLabel>
            <IonLabel
              className="wrap capitalize"
              style={{ textAlign: "center" }}
            >
              <div style={{ fontWeight: 700, fontSize: "20px" }}>{
                notificationRequest?.addressDietId
                ?
                AddressDietList.filter(e => e.id == notificationRequest.addressDietId)[0].value
                :
                <></>
              }</div>
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
      <IonModal isOpen={isNotificationModalOpen} onWillDismiss={canDismiss}>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="end">
              <IonButton onClick={canDismiss}>Wyjdź</IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <div style={{ textAlign: "center", marginBottom: "10px" }}>
            <span style={{ letterSpacing: "1px" }}>
              WYBIERZ TYP ZGŁOSZENIA:
            </span>
            <IonRow>
              <IonCol size="6">
                <IonButton
                  fill={
                    notificationButtonType == "missing" ? "solid" : "outline"
                  }
                  className="choose-type-button"
                  color={notificationButtonType == "damaged" ? "medium" : ""}
                  onClick={() => {
                    setNotificationButtonType("missing");
                  }}
                >
                  Brak
                </IonButton>
              </IonCol>
              <IonCol size="6">
                <IonButton
                  fill={
                    notificationButtonType == "damaged" ? "solid" : "outline"
                  }
                  className="choose-type-button"
                  color={notificationButtonType == "missing" ? "medium" : ""}
                  onClick={() => {
                    setNotificationButtonType("damaged");
                  }}
                >
                  Uszkodzenie
                </IonButton>
              </IonCol>
            </IonRow>
          </div>

          <div style={{ marginBottom: "20px" }}>
            <NotificationSelect
              disabled={!notificationButtonType}
              placeholder="Adres"
              data={AddressList}
              onChange={(val: string) => {
                setNotificationRequest({
                  ...notificationRequest,
                  addressId: Number.parseInt(val),
                });
              }}
            />
          </div>
          <div style={{ marginBottom: "20px" }}>
            <NotificationSelect
              disabled={!notificationRequest?.addressId}
              placeholder="Dieta"
              data={AddressDietList}
              onChange={(val: string) => {
                setNotificationRequest({
                  ...notificationRequest,
                  addressDietId: Number.parseInt(val),
                });
              }}
            />
          </div>

          <DamageTypeFunction />

          {partDamageFunction()}

          {notificationRequest.addressPackageDietId ||
          notificationRequest.addressPackagePartList ? (
            <PartSelectFunction />
          ) : (
            <></>
          )}

          {PartSelectInfoFunction()}
        </IonContent>
      </IonModal>
    </IonPage>
  );
};

export default Salary;
