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
import {
  AddressDietList,
  AddressList,
  DietParts,
} from "../components/NotificationData";

type NotificationRequest = {
  addressId?: number;
  addressDietId?: number;
  addressDietCustom?: string;

  addressPackageIssue?: "damaged" | "missing";
  addressPackageDietType?: "whole" | "part";

  addressPackagePartList?: string[];

  replacedPackageDietId?: number;
  replacedPackageDietCustom?: string;
  replacedPackagePartList?: string[];
};

const Notifications: React.FC = () => {
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
  const [replacedTypeButton, setReplacedTypeButton] = useState<
    "" | "whole" | "part"
  >("");
  const [isInformationChecked, setIsInformationChecked] =
    useState<boolean>(false);
  const [areInformationsConfirmed, setAreInformationsConfirmed] =
    useState<boolean>(false);

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
            setIsInformationChecked(false);
            setReplacedTypeButton("");
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
            <span style={{ letterSpacing: "1px" }}>TYP USZKODZENIA</span>
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
        ) : notificationButtonType == "missing" &&
          notificationRequest?.addressDietId ? (
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
          <></>
        )}
      </div>
    );
  };

  function partDamageFunction() {
    return (
      <div>
        {damageButtonType == "part" && notificationButtonType == "damaged" ? (
          <div style={{ marginBottom: "20px" }}>
            <NotificationSelect
              multiple
              disabled={!notificationRequest?.addressId}
              data={DietParts}
              placeholder="Numery tacek"
              onChange={(val: string[]) => {
                setNotificationRequest({
                  ...notificationRequest,
                  addressPackagePartList: val,
                });
              }}
            />
          </div>
        ) : damageButtonType == "whole" &&
          notificationButtonType == "damaged" ? (
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
          <></>
        )}
      </div>
    );
  }

  const PartSelectFunction = () => {
    return (
      <div>
        {damageButtonType == "part" &&
        notificationButtonType == "damaged" &&
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
          <></>
        )}
      </div>
    );
  };

  const PartSelectInfoFunction = () => {
    return (
      <div>
        {partDamageActionButton == "swap" ? (
          <div>
            <div style={{ textAlign: "center", marginBottom: "10px" }}>
              <span style={{ letterSpacing: "1px" }}>NA CO WYMIENIASZ?</span>
              <IonRow>
                <IonCol size="6">
                  <IonButton
                    fill={replacedTypeButton == "whole" ? "solid" : "outline"}
                    className="choose-type-button"
                    color={replacedTypeButton == "whole" ? "" : "medium"}
                    onClick={() => {
                      setReplacedTypeButton("whole");
                    }}
                  >
                    cała dieta
                  </IonButton>
                </IonCol>
                <IonCol size="6">
                  <IonButton
                    fill={replacedTypeButton == "part" ? "solid" : "outline"}
                    className="choose-type-button"
                    color={replacedTypeButton == "part" ? "" : "medium"}
                    onClick={() => {
                      setReplacedTypeButton("part");
                    }}
                  >
                    tacki
                  </IonButton>
                </IonCol>
              </IonRow>
            </div>
            {replacedTypeButton ? (
              <>
                <div style={{ textAlign: "center", marginBottom: "10px" }}>
                  {/* select ze wszystkimi dietami */}
                  <NotificationSelect
                    placeholder="Dietaaa"
                    data={AddressDietList}
                    onChange={(val: string) => {
                      setNotificationRequest({
                        ...notificationRequest,
                        replacedPackageDietId: Number.parseInt(val),
                      });
                    }}
                  />
                </div>
                {replacedTypeButton == "part" ? (
                  <div style={{ textAlign: "center", marginBottom: "10px" }}>
                    <NotificationSelect
                      multiple
                      disabled={!notificationRequest?.replacedPackageDietId}
                      data={DietParts}
                      placeholder="Numery tacek"
                      onChange={(val: string[]) => {
                        setNotificationRequest({
                          ...notificationRequest,
                          replacedPackagePartList: val,
                        });
                      }}
                    />
                  </div>
                ) : (
                  <></>
                )}
              </>
            ) : (
              <></>
            )}

            {/* {damageButtonType == "part" && replacedTypeButton == "part" ?(
              <div style={{ textAlign: "center", marginBottom: "10px" }}>
                <NotificationSelect
                  multiple
                  disabled={!notificationRequest?.replacedPackageDietId}
                  data={DietParts}
                  placeholder="Numery tacekk"
                  onChange={(val: string[]) => {
                    setNotificationRequest({
                      ...notificationRequest,
                      replacedPackagePartList: val,
                    });
                  }}
                />
              </div>
            ) : (
              <></>
            )} */}
            {replacedTypeButton == "whole" ||
            notificationRequest.replacedPackagePartList ? (
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    textAlign: "center",
                    display: "inline-flex",
                    verticalAlign: "top",
                  }}
                >
                  {" "}
                  Czy chcesz dołączyć informację?
                </div>
                <IonToggle
                  onIonChange={(e) => setIsInformationChecked(e.detail.checked)}
                  checked={isInformationChecked}
                  style={{ margin: "auto", paddingTop: "4px" }}
                ></IonToggle>
                {isInformationChecked ? (
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
                ) : (
                  <></>
                )}
              </div>
            ) : (
              <></>
            )}
          </div>
        ) : partDamageActionButton == "info" && notificationButtonType ? (
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
          </div>
        ) : (
          <></>
        )}

        <div style={{ textAlign: "center" }}>
          <IonButton
            style={{ marginTop: "10px" }}
            disabled={
              !(
                (replacedTypeButton == "whole" &&
                  notificationRequest.replacedPackageDietId) ||
                (partDamageActionButton == "info" && textareaValue) ||
                (replacedTypeButton == "part" &&
                  notificationRequest.replacedPackagePartList) ||
                (replacedTypeButton == "part" && textareaValue)
              )
            }
            onClick={() => {
              setIsSummaryModalOpen(true);
            }}
          >
            Potwierdź
          </IonButton>
        </div>
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
              <IonButton
                onClick={() => {
                  setIsModalOpen(false);
                }}
              >
                Wyjdź
              </IonButton>
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
              <IonButton
                onClick={() => {
                  setIsSummaryModalOpen(false);
                  setAreInformationsConfirmed(false);
                }}
              >
                Wróć
              </IonButton>
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
              <div style={{ fontWeight: 700, fontSize: "20px" }}>
                {notificationButtonType == "missing"
                  ? "Brak"
                  : notificationButtonType == "damaged"
                  ? "Uszkodzenie"
                  : "Error"}
              </div>
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
              <div style={{ fontWeight: 700, fontSize: "20px" }}>
                {notificationRequest?.addressId ? (
                  AddressList.filter(
                    (e) => e.id == notificationRequest.addressId
                  )[0].value
                ) : (
                  <></>
                )}
              </div>
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
              <div style={{ fontWeight: 700, fontSize: "20px" }}>
                {notificationRequest?.addressDietId ? (
                  AddressDietList.filter(
                    (e) => e.id == notificationRequest.addressDietId
                  )[0].value
                ) : (
                  <></>
                )}
              </div>
            </IonLabel>
          </IonItem>
          {notificationButtonType == "damaged" ? (
            <IonItem>
              <IonLabel style={{ maxWidth: "40%" }} className="wrap">
                Typ uszkodzenia
              </IonLabel>
              <IonLabel
                className="wrap capitalize"
                style={{ textAlign: "center" }}
              >
                <div style={{ fontWeight: 700, fontSize: "20px" }}>
                  {damageButtonType == "whole"
                    ? "Cała dieta"
                    : damageButtonType == "part"
                    ? "Tacki"
                    : "Error"}
                </div>
              </IonLabel>
            </IonItem>
          ) : (
            <></>
          )}

          {damageButtonType == "part" ? (
            <IonItem>
              <IonLabel style={{ maxWidth: "40%" }} className="wrap">
                Numery tacek
              </IonLabel>
              <IonLabel
                className="wrap capitalize"
                style={{ textAlign: "center" }}
              >
                <div style={{ fontWeight: 700, fontSize: "20px" }}>
                  {notificationRequest.addressPackagePartList?.map((e) => {
                    return e + ", ";
                  })}
                </div>
              </IonLabel>
            </IonItem>
          ) : (
            <></>
          )}

          <IonItem style={{}}>
            <IonLabel style={{ maxWidth: "40%" }} className="wrap">
              Działanie
            </IonLabel>
            <IonLabel
              className="wrap capitalize"
              style={{ textAlign: "center" }}
            >
              <div style={{ fontWeight: 700, fontSize: "20px" }}>
                {partDamageActionButton == "swap"
                  ? "Wymiana"
                  : partDamageActionButton == "info"
                  ? "Niemożliwość wymiany"
                  : ""}
              </div>
            </IonLabel>
          </IonItem>
          {partDamageActionButton == "swap" ? (
            <div style={{ marginTop: "25px" }}>
              <span>Wymieniasz na:</span>
              <IonItem style={{ marginTop: "10px" }}>
                <IonLabel style={{ maxWidth: "40%" }} className="wrap">
                  Dieta
                </IonLabel>
                <IonLabel className="wrap" style={{ textAlign: "center" }}>
                  <div style={{ fontWeight: 700, fontSize: "20px" }}>
                    {notificationRequest?.replacedPackageDietId ? (
                      AddressDietList.filter(
                        (e) => e.id == notificationRequest.replacedPackageDietId
                      )[0].value
                    ) : (
                      <></>
                    )}
                  </div>
                </IonLabel>
              </IonItem>
              <IonItem style={{}}>
                <IonLabel style={{ maxWidth: "40%" }} className="wrap">
                  Tacki
                </IonLabel>
                <IonLabel className="wrap" style={{ textAlign: "center" }}>
                  <div style={{ fontWeight: 700, fontSize: "20px" }}>
                    {notificationRequest.addressPackagePartList?.map((e) => {
                      return e + ", ";
                    })}
                  </div>
                </IonLabel>
              </IonItem>
            </div>
          ) : (
            <></>
          )}
          <IonItem style={{ marginTop: "20px" }}>
            <IonLabel style={{ maxWidth: "40%" }} className="wrap">
              Notatka
            </IonLabel>
            <IonLabel className="wrap" style={{ textAlign: "center" }}>
              <div style={{ fontWeight: 700, fontSize: "20px" }}>
                {textareaValue ? textareaValue : "brak"}
              </div>
            </IonLabel>
          </IonItem>
          <div style={{ marginTop: "10px", textAlign: "center" }}>
            <div
              style={{
                border: "1px solid #ff4961",
                padding: "5px",
                borderRadius: "10px",
              }}
            >
              Czy na pewno potwierdzasz powyższe informacje i chcesz wysłać
              raport do biura?
            </div>
            <IonButton
              style={{ marginTop: "10px", width: "90vw" }}
              disabled={areInformationsConfirmed}
              color={areInformationsConfirmed ? "" : "danger"}
              onClick={() => {
                setAreInformationsConfirmed(true);
              }}
            >
              {areInformationsConfirmed ? "potwierdzono" : "potwierdź"}
            </IonButton>
            <IonButton
              style={{ marginTop: "10px", width: "90vw" }}
              fill={areInformationsConfirmed ? "solid" : "outline"}
              color={areInformationsConfirmed ? "tertiary" : "medium"}
              disabled={!areInformationsConfirmed}
              onClick={() => {}}
            >
              Wyślij
            </IonButton>
          </div>
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
            <span style={{ letterSpacing: "1px" }}>TYP ZGŁOSZENIA</span>
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

          {notificationRequest.replacedPackageDietId ||
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

export default Notifications;
