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
  IonInfiniteScroll,
  IonInfiniteScrollContent,
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
  IonSearchbar,
  IonTitle,
  IonToggle,
  IonToolbar,
  NavContext,
  useIonAlert,
  useIonLoading,
  useIonPopover,
  useIonToast,
  useIonViewDidEnter,
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
import "./Kafelki.scss";

import axios from "axios";
import { Storage } from "@capacitor/storage";
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

// const move = (input: any[], from: number, to: number) => {
//   let numberOfDeletedElm = 1;

//   const elm = input.splice(from, numberOfDeletedElm)[0];

//   numberOfDeletedElm = 0;

//   input.splice(to, numberOfDeletedElm, elm);
// };

type ReorderAddressRequest = {
  id: number;
  order: number;
};

type ReorderAddress = {
  id: number;
  order: number;
  postcode: string;
  city: string;
  street: string;
  houseNumber: string;
};

type ReorderResponse = {
  addresses: ReorderAddress[];
  deliveryDate: string;
};

const Kafelki: React.FC = () => {
  const [addresses, setAddresses] = useState<ReorderAddress[]>();

  const [reorderDisabled, setReorderDisabled] = useState(true);

  const [presentLoading, dismissLoading] = useIonLoading();


  const DownloadData = () => {
    api.get("routes/reorder").then(async (response) => {
      const data = response.data as ReorderResponse;

      setAddresses(undefined);
      setAddresses(data.addresses);
    });
  }


  useEffect(() => {
    DownloadData();
  }, []);

  return (
    <IonPage className="container">
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
          <IonButtons
            slot="end"
            style={{
              marginRight: "10px",
            }}
          >
            {reorderDisabled ? (
              <IonButton
                onClick={() => setReorderDisabled(false)}
                color="secondary"
                fill="outline"
              >
                Edytuj
              </IonButton>
            ) : (
              <IonButton
                onClick={() => {

                  presentLoading({spinner: "crescent", message: "Wysyłanie danych..."});

                  if (addresses) {
                    let addressesRequest: ReorderAddressRequest[] = [];

                    for (let i = 1; i <= addresses.length; i++) {
                      addressesRequest.push({
                        id: addresses[i - 1].id,
                        order: i,
                      });
                    }

                    api
                      .patch("/routes/reorder", {
                        addresses: addressesRequest,
                      })
                      .then(async (response) => {
                        console.log(response);
                      }).finally(() => {
                        setReorderDisabled(true);
                        DownloadData();
                        dismissLoading();
                      });
                  }
                  else
                  {
                    dismissLoading();
                  }
                }}
                color="success"
                fill="solid"
              >
                Zapisz zmiany
              </IonButton>
            )}
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen={true} className={"background-lightgrey "}>
        <IonReorderGroup
          disabled={reorderDisabled}
          onIonItemReorder={(e) => {
            e.detail.complete(true);

            if (addresses) {
              let tempAddresses = addresses;

              const tempAddressFrom = tempAddresses[e.detail.from];

              tempAddresses.splice(e.detail.from, 1);

              tempAddresses.splice(e.detail.to, 0, tempAddressFrom);

              // move(tempAddresses, e.detail.from, e.detail.to);

              console.log(tempAddresses)
              
              setAddresses(tempAddresses);
            }
          }}
        >
          {addresses?.map((e, i) => {
            return (
              <IonItem>
                <IonLabel
                  style={{
                    textTransform: "capitalize",
                  }}
                >
                  <strong
                    style={{
                      width: "40px",
                      display: "inline-block",
                    }}
                  >
                    {i + 1}
                    {". "}
                  </strong>
                  {e.street} {e.houseNumber}
                </IonLabel>

                <IonReorder slot="end" />
              </IonItem>
            );
          })}
        </IonReorderGroup>
      </IonContent>
    </IonPage>
  );
};

export default Kafelki;
