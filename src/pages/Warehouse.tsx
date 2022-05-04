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
  useIonToast,
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
import { WarehousePackage } from "../components/Types";

const Warehouse: React.FC = () => {
  const [presentToast, dismissToast] = useIonToast();

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
  const [allDietsCount, setAllDietsCount] = useState<number>(0);
  const [scanDietsCount, setScanDietsCount] = useState<number>(0);

  useEffect(() => {
    let siema = 0;

    dietsWithNumber.map((e) => {
      siema = siema + e.scanCount;
    });

    setScanDietsCount(siema);
    console.log(scanDietsCount);
  }, [dietsWithNumber]);

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

  const setWarehousePackages = async (value: string) => {
    await Storage.set({
      key: "WarehousePackages",
      value: value,
    });
  };

  const assignWarehousePackagesFromStorageToState = async () => {
    const { value } = await Storage.get({ key: "WarehousePackages" });

    if (value) {
      let warehousePackages = JSON.parse(value) as WarehousePackage[];

      await generateDictionary(warehousePackages);
    }
  };

  const generateDictionary = async (packages: WarehousePackage[]) => {
    setPackages(packages);

    await setWarehousePackages(JSON.stringify(packages));
    //const { value } = await Storage.get({ key: "WarehousePackages" });

    let dietsDictionary: DietsDictionary[] = [];

    packages.map((y) => {
      if (dietsDictionary.some((e) => e.name == y.name)) {
        dietsDictionary.filter((e) => e.name == y.name)[0].count =
          dietsDictionary.filter((e) => e.name == y.name)[0].count + 1;

        if (y.scanned) {
          dietsDictionary.filter((e) => e.name == y.name)[0].scanCount =
            dietsDictionary.filter((e) => e.name == y.name)[0].scanCount + 1;
        }
      } else {
        dietsDictionary.push({
          name: y.name,
          count: 1,
          scanCount: y.scanned ? 1 : 0,
        });
      }
    });

    // const arr = dietsDictionary.sort((a, b) => a.name.localeCompare(b.name));
    setDietsWithNumber(dietsDictionary);
    setDietsWithNumberStatic(dietsDictionary);

    if (packages) {
      setAllDietsCount(packages.length);
    }
  };

  const getData = async () => {
    await assignWarehousePackagesFromStorageToState();

    api.get("routes/addresses/packages").then(async (response) => {
      const packages = response.data as WarehousePackage[];

      await generateDictionary(packages);

      await setWarehousePackages(JSON.stringify(packages));
    });
  };

  useIonViewWillEnter(async () => {
    await getData();

    // api.get("routes/").then(async (response) => {
    //   const route = response.data as RouteProps[];

    //   await setRoute(JSON.stringify(route));
    //   const { value } = await Storage.get({ key: "Route" });

    //   if (value) {
    //     const routeCollection = JSON.parse(value) as RouteProps[];
    //   }

    //   setItems(route);

    //   const diets = await getDiets();

    //   let dietsDictionary: DietsDictionary[] = [];

    //   if (diets) {
    //     const dietsCollection = JSON.parse(diets) as DietsProps[];

    //     let dietsCounter = 0;
    //     route?.map((x) => {
    //       x.packages.map((y) => {
    //         if (dietsDictionary.some((e) => e.name == y.name)) {
    //           dietsDictionary.filter((e) => e.name == y.name)[0].count =
    //             dietsDictionary.filter((e) => e.name == y.name)[0].count + 1;
    //         } else {
    //           dietsDictionary.push({
    //             name: y.name,
    //             count: 1,
    //             scanCount: 0,
    //           });
    //         }
    //       });
    //     });
    //   }

    //   console.log(dietsDictionary);
    //   const arr = dietsDictionary.sort((a, b) => a.name.localeCompare(b.name));
    //   setDietsWithNumber(arr);
    //   setDietsWithNumberStatic(arr);
    // });
  });

  const setRoute = async (value: string) => {
    await Storage.set({
      key: "Route",
      value: value,
    });
  };

  // const assignRouteFromStorageToState = async () => {
  //   const { value } = await Storage.get({ key: "Route" });

  //   if (value) {
  //     const routeCollection = JSON.parse(value) as RouteProps[];
  //     setItems(routeCollection);
  //   }
  // };

  useEffect(() => {
    if (searchText.length > 0) {
      const tempItems = dietsWithNumberStatic?.filter((e) => {
        return e.name.toLowerCase().includes(searchText.toLowerCase());
      });
      setDietsWithNumber(tempItems);
    } else {
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
    await BarcodeScanner.startScanning(
      { targetedFormats: [SupportedFormat.QR_CODE] },
      async (result) => {
        if (result.hasContent) {
          try {
            const code = result.content?.split("|")[1];

            console.log("code - " + code);
            console.log(packages);

            let scannedPackage = packages.find(
              (e) => e.code == code && !e.scanned
            );

            let scannedPackageOnList = packages.find(
              (e) =>
                e.code == code &&
                e.scanned &&
                e.confirmationString == result.content &&
                Boolean(e.confirmationString)
            );

            if (scannedPackageOnList) {
              Vibration.vibrate(500);

              dismissToast();
              setTimeout(() => {
                presentToast({
                  mode: "ios",
                  header: "Dieta została wcześniej zeskanowana",
                  color: "warning",
                  cssClass: "warehouse-scanner-toast",
                  duration: 5000,
                });
              }, 500);
            } else if (scannedPackage) {
              new Audio(
                "https://www.myinstants.com/media/sounds/applepay.mp3"
              ).play();

              dismissToast();

              setTimeout(() => {
                if (scannedPackage) {
                  presentToast({
                    mode: "ios",
                    header: scannedPackage.name,
                    color: "success",
                    cssClass: "warehouse-scanner-toast",
                    duration: 5000,
                  });
                }
              }, 500);

              let tempItems = packages;

              tempItems.map((x) => {
                if (x.id == scannedPackage?.id) {
                  x.scanned = true;
                  x.confirmationString = result.content ?? "";
                }
              });

              // console.log(tempItems);

              // const diets = await getDiets();

              // let dietsDictionary: DietsDictionary[] = [];

              // if (diets) {
              //   const dietsCollection = JSON.parse(diets) as DietsProps[];

              //   let dietsCounter = 0;
              //   tempItems.map((y) => {
              //     if (dietsDictionary.some((e) => e.name == y.name)) {
              //       dietsDictionary.filter((e) => e.name == y.name)[0].count =
              //         dietsDictionary.filter((e) => e.name == y.name)[0].count +
              //         1;
              //       if (y.scanned) {
              //         dietsDictionary.filter(
              //           (e) => e.name == y.name
              //         )[0].scanCount =
              //           dietsDictionary.filter((e) => e.name == y.name)[0]
              //             .scanCount + 1;
              //       }
              //     } else {
              //       dietsDictionary.push({
              //         name: y.name,
              //         count: 1,
              //         scanCount: y.scanned ? 1 : 0,
              //       });
              //     }
              //   });
              // }

              // console.log(dietsDictionary);
              // const arr = dietsDictionary.sort((a, b) =>
              //   a.name.localeCompare(b.name)
              // );
              // setDietsWithNumber(arr);
              // setDietsWithNumberStatic(arr);

              await generateDictionary(tempItems);

              api
                .patch(
                  "routes/addresses/packages/" +
                    scannedPackage.id +
                    "/warehouse",
                  {
                    isScanned: true,
                    confirmationString: result.content,
                  }
                )
                .then(async (response) => {});
            } else {
              Vibration.vibrate(500);

              dismissToast();
              setTimeout(() => {
                presentToast({
                  mode: "ios",
                  header: "Nie znaleziono diety na liście",
                  color: "danger",
                  cssClass: "warehouse-scanner-toast",
                  duration: 5000,
                });
              }, 500);
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

  const [packages, setPackages] = useState<WarehousePackage[]>([]);

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
          <IonButtons slot="start">
            <IonButton
              onClick={() => {
                (document.querySelector("#mainMenu") as any)?.setOpen(true);
              }}
            >
              <IonIcon slot="icon-only" icon={reorderFourOutline} />
            </IonButton>
          </IonButtons>
          <IonSearchbar
            placeholder="Wyszukaj"
            style={{
              "--box-shadow": "none",
              "--background": "none",
            }}
            onIonChange={(e) => setSearchText(e.detail.value!)}
          ></IonSearchbar>
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
            console.log(e);
            return (
              <IonItem
                style={{ "--border-color": "var(--ion-color-medium)" }}
                lines="full"
                onClick={() => {
                  if (e.scanCount == e.count) {
                    presentAlert({
                      mode: "ios",
                      header: "Czy chcesz usunąć status?",
                      subHeader: "Wybrany rodzaj diety:",
                      message: e.name,
                      buttons: [
                        "Anuluj",
                        {
                          text: "Usuń",
                          handler: async () => {
                            let tempItems = packages;

                            tempItems.map((x) => {
                              if (x.name == e.name) {
                                x.scanned = false;
                                x.confirmationString = "";
                              }
                            });

                            await generateDictionary(tempItems);

                            api
                              .patch(
                                "routes/addresses/packages/warehouse-all",
                                {
                                  isScanned: false,
                                  name: e.name,
                                }
                              )
                              .finally(async () => {});
                          },
                        },
                      ],
                      onDidDismiss: (e) => console.log("did dismiss"),
                    });
                    return;
                  }

                  presentAlert({
                    mode: "ios",
                    // cssClass: "missing-qr-alert",
                    header: "Czy chcesz ustawić status na zeskanowany?",
                    subHeader: "Wybrany rodzaj diety:",
                    message: e.name,
                    buttons: [
                      "Anuluj",
                      {
                        text: "Ustaw",
                        handler: async () => {
                          let tempItems = packages;

                          tempItems.map((x) => {
                            if (x.name == e.name) {
                              x.scanned = true;
                              x.confirmationString = "-";
                            }
                          });

                          await generateDictionary(tempItems);

                          api
                            .patch("routes/addresses/packages/warehouse-all", {
                              isScanned: true,
                              name: e.name,
                            })
                            .finally(async () => {});
                        },
                      },
                    ],
                    onDidDismiss: (e) => console.log("did dismiss"),
                  });
                }}
              >
                <IonLabel
                  className="wrap"
                  style={{
                    fontWeight: e.scanCount == e.count ? 600 : 400,
                    textDecoration:
                      e.scanCount == e.count ? "line-through" : "",
                  }}
                  color={e.scanCount == e.count ? "success" : ""}
                >
                  {e.name}
                </IonLabel>
                <IonLabel
                  className="wrap"
                  slot="end"
                  color={e.scanCount == e.count ? "success" : ""}
                >
                  {e.scanCount}/{e.count}
                </IonLabel>

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
      {scanning ? (
        <></>
      ) : (
        <IonFooter>
          <IonToolbar>
            <IonIcon
              icon={barcodeOutline}
              className="icon-scan-main"
              color="primary"
              onClick={(e) => {
                checkPermission();

                const body = document.querySelector("body");
                if (body) {
                  body.style.background = "transparent";
                }

                setScanning(true);
                startScan();
              }}
            />

            <IonLabel className="all-diets-counter">
              Ilość diet: {scanDietsCount}/{allDietsCount}
            </IonLabel>
          </IonToolbar>
        </IonFooter>
      )}
    </IonPage>
  );
};

export default Warehouse;
