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
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonMenuToggle,
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
  reorderFourOutline,
  searchOutline,
} from "ionicons/icons";
import React, { useEffect, useRef, useState } from "react";
import MapPopover from "../components/MapPopover";
import PhonePopover from "../components/PhonePopover";
import "./Warehouse.scss";

import axios from "axios";
import { Storage } from "@capacitor/storage";
import api from "./../services/api";

const Warehouse: React.FC = () => {
  const headerRef = useRef<HTMLIonHeaderElement>(null);

  const [headerScrollTop, setHeaderScrollTop] = useState(0);
  const [headerTop, setHeaderTop] = useState(0);

  const [disabled, setDisabled] = useState(true);

  const [address, setAddress] = useState("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");

  const [showOrderInfoModal, setShowOrderInfoModal] = useState(false);

  const [searchText, setSearchText] = useState("");

  const [dietsWithNumber, setDietsWithNumber] = useState<DietsDictionary[]>([]);
  const [dietsWithNumberStatic, setDietsWithNumberStatic] = useState<
    DietsDictionary[]
  >([]);

  type DietsDictionary = {
    name: string;
    count: number;
    scanCount: number;
  };
  type DietsProps = {
    id: string;
    category: string;
    name: string;
  };
  type RoutePackagesProps = {
    name: string;
    scanned: boolean;
    code: string;
  };
  type RouteProps = {
    city: string;
    comment: string;
    commentExtra: string;
    houseNumber: string;
    lat: string;
    lng: string;
    postCode: string;
    packages: RoutePackagesProps[];
    phone: string;
    order: number;
    routeId: string;
    street: string;
    customerId: number;
  };

  useIonViewWillEnter(() => {
    axios
      .get("https://broccoliapi.azurewebsites.net/Diets")
      .then(async (response) => {
        const diets = response.data.data.diets as DietsProps[];
        await setDiets(JSON.stringify(diets));
      });
  });

  const setDiets = async (value: string) => {
    await Storage.set({
      key: "Diets",
      value: value,
    });
  };

  const getDiets = async () => {
    const { value } = await Storage.get({ key: "Diets" });
    return value;
  };

  useIonViewWillEnter(async () => {
    api.get("routes/").then(async (response) => {
      const route = response.data as RouteProps[];

      await setRoute(JSON.stringify(route));
      const { value } = await Storage.get({ key: "Route" });

      if (value) {
        const routeCollection = JSON.parse(value) as RouteProps[];
      }

      setItems(route);

      const diets = await getDiets();

      let dietsDictionary: DietsDictionary[] = [];

      if (diets) {
        const dietsCollection = JSON.parse(diets) as DietsProps[];

        let dietsCounter = 0;
        route?.map((x) => {
          x.packages.map((y) => {
            if (dietsDictionary.some((e) => e.name == y.name)) {
              dietsDictionary.filter((e) => e.name == y.name)[0].count =
                dietsDictionary.filter((e) => e.name == y.name)[0].count + 1;
            } else {
              dietsDictionary.push({
                name: y.name,
                count: 1,
                scanCount: 0,
              });
            }
          });
        });
      }

      console.log(dietsDictionary);
      const arr = dietsDictionary.sort((a, b) => a.name.localeCompare(b.name));
      setDietsWithNumber(arr);
      setDietsWithNumberStatic(arr);
    });
  });

  const setRoute = async (value: string) => {
    await Storage.set({
      key: "Route",
      value: value,
    });
  };

  const assignRouteFromStorageToState = async () => {
    const { value } = await Storage.get({ key: "Route" });

    if (value) {
      const routeCollection = JSON.parse(value) as RouteProps[];
      setItems(routeCollection);
    }
  };

  useEffect(() => {
    if (searchText.length > 0) {
      const tempItems = dietsWithNumberStatic?.filter((e) => {
        return e.name.toLowerCase().includes(searchText.toLowerCase());
      });
      setDietsWithNumber(tempItems);
    } else {
      console.log(dietsWithNumberStatic);
      setDietsWithNumber(dietsWithNumberStatic);
    }
  }, [searchText]);

  const [presentAlert] = useIonAlert();

  const [present, dismiss] = useIonPopover(MapPopover, {
    onHide: () => dismiss(),
    address: address,
  });

  const [presentPhoneNumber, dismissPhoneNumber] = useIonPopover(PhonePopover, {
    onHide: () => dismiss(),
    address: address,
  });

  const [scanning, setScanning] = useState(false);

  const [scanningResult, setScanningResult] = useState("");

  const checkPermission = async () => {
    // check or request permission
    const status = await BarcodeScanner.checkPermission({ force: true });

    if (status.granted) {
      // the user granted permission
      return true;
    }

    return false;
  };

  const startScan = async () => {
    setTimeout(() => {
      BarcodeScanner.enableTorch();
    }, 150);

    await BarcodeScanner.startScanning(
      { targetedFormats: [SupportedFormat.QR_CODE] },
      async (result) => {
        if (result.hasContent) {
          try {
            const codes = result.content?.split("|")[1];

            setScanningResult(result.content ?? "");

            let temp = items;

            const { value } = await Storage.get({ key: "Diets" });
            const val = value;

            if (val && codes) {
              const collection = JSON.parse(val) as DietsProps[];

              const code = codes.split("/")[0];
            }
          } catch (error) {
            console.log(error);
          }
        }
      }
    );
  };

  const stopScan = () => {
    const body = document.querySelector("body");
    if (body) {
      body.style.background = "";
    }
    BarcodeScanner.showBackground();
    BarcodeScanner.stopScan();
  };

  useEffect(() => {
    if (headerRef.current) {
      headerRef.current.style.willChange = "transform";
      headerRef.current.style.transition = "transform ease-in-out 150ms";
    }
  }, []);

  useIonViewWillLeave(() => {
    if (headerRef.current) {
      headerRef.current.style.transform = "translate3d(0, 0, 0)";
    }
    setHeaderTop(0);
  });

  type ItemsDietProps = {
    name: string;
    scanned: boolean;
  };

  type ItemsProps = {
    address: string;
    diets: ItemsDietProps[];
    photo?: boolean;
    lat: string;
    lng: string;
  };

  const [choosedItem, setChoosedItem] = useState<RouteProps | undefined>();
  const [itemModalInfo, setItemModalInfo] = useState<RouteProps | undefined>();

  const [items, setItems] = useState<RouteProps[] | undefined>([]);
  const [dietCounter, setDietCounter] = useState<number>(0);

  return (
    <IonPage className="container">
      <IonHeader
        className={scanning ? "invisible" : ""}
        ref={headerRef}
        collapse="fade"
        translucent={isPlatform("mobile")}
        mode={"md"}
      >
        <IonToolbar>
          <IonSearchbar
            placeholder="Wyszukaj"
            style={{
              "--box-shadow": "none",
              "--background": "none",
            }}
            onIonChange={(e) => setSearchText(e.detail.value!)}
          ></IonSearchbar>
          <IonButtons slot="end">
            {/* <IonButton onClick={() => console.log("")}>
              <IonIcon slot="icon-only" icon={reorderFourOutline} />
            </IonButton> */}
            <IonMenuToggle style={{ display: "block" }}>
              <IonButton>
                <IonIcon slot="icon-only" icon={reorderFourOutline} />
              </IonButton>
            </IonMenuToggle>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      {scanning ? (
        <>
          <IonFab vertical="top" horizontal="start" slot="fixed">
            <IonFabButton
              onClick={() => {
                stopScan();
                setScanning(false);
              }}
              color="danger"
            >
              <IonIcon icon={closeOutline} />
            </IonFabButton>
          </IonFab>

          <IonFab vertical="top" horizontal="end" slot="fixed">
            <IonFabButton onClick={() => BarcodeScanner.toggleTorch()}>
              <IonIcon icon={flashlightOutline} />
            </IonFabButton>
          </IonFab>
        </>
      ) : (
        <></>
      )}

      <IonContent
        fullscreen={true}
        className={"background-lightgrey " + (scanning ? "hide-bg" : "")}
      >
        <IonList className="list-order">
          {dietsWithNumber?.map((e) => {
            return (
              <IonItem
                style={{ "--border-color": "var(--ion-color-medium)" }}
                lines="full"
              >
                <IonLabel>{e.name}</IonLabel>
                <IonLabel slot="end">
                  {e.scanCount}/{e.count}
                </IonLabel>

                {/* <IonIcon
                  className="icon-scan"
                  color="primary"
                  slot="start"
                  icon={barcodeOutline}
                  onClick={(event) => {
                    setScanning(true);
                    startScan(i);
                  }}
                /> */}

                <IonRippleEffect />
                <IonReorder slot="end" />
              </IonItem>
            );
          })}
        </IonList>
      </IonContent>

      {scanning ? (
        <>
          <div className="scan-square">
            <svg viewBox="0 0 100 100">
              <path
                d="M25,2 L2,2 L2,25"
                fill="none"
                stroke="var(--ion-color-primary)"
                stroke-width="3"
              />
              <path
                d="M2,75 L2,98 L25,98"
                fill="none"
                stroke="var(--ion-color-primary)"
                stroke-width="3"
              />
              <path
                d="M75,98 L98,98 L98,75"
                fill="none"
                stroke="var(--ion-color-primary)"
                stroke-width="3"
              />
              <path
                d="M98,25 L98,2 L75,2"
                fill="none"
                stroke="var(--ion-color-primary)"
                stroke-width="3"
              />
            </svg>
          </div>
        </>
      ) : (
        <></>
      )}
      <IonFooter>
        <IonToolbar>
          <IonIcon
            icon={barcodeOutline}
            className="icon-scan-main"
            color="primary"
            onClick={(e) => {
              setScanning(true);
              startScan();
            }}
          />
        </IonToolbar>
      </IonFooter>
    </IonPage>
  );
};

export default Warehouse;
