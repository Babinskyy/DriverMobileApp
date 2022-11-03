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
  IonChip,
  IonCol,
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
  IonRow,
  IonSearchbar,
  IonSpinner,
  IonTitle,
  IonToolbar,
  useIonAlert,
  useIonLoading,
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
import { Preferences } from '@capacitor/preferences';
import api from "./../services/api";
import { WarehousePackage } from "../components/Types";

import { CheckOfflineRequests } from "../services/Utility";

import { Network } from "@capacitor/network";

import {
  GlobalStateProvider,
  useGlobalState,
  GlobalStateInterface,
} from "./../GlobalStateProvider";

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

  const [updateDate, setUpdateDate] = useState("");
  const { state, setState } = useGlobalState();


  const [scannedDiets, setScannedDiets] = useState<string[]>([]);


  const [lastScanStringCount, setLastScanStringCount] = useState<string>("");


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
    routeId: string;
    owner: string;
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
    await Preferences.set({
      key: "WarehousePackages",
      value: value,
    });
  };

  const setWarehouseDate = async (value: string) => {
    await Preferences.set({
      key: "WarehouseDate",
      value: value,
    });
  };

  const assignWarehouseDateFromStorageToState = async () => {
    const { value } = await Preferences.get({ key: "WarehouseDate" });

    if (value) {
      const warehouseDate = JSON.parse(value) as string;

      setUpdateDate(warehouseDate);
    }
  };

  type WarehousePackagesToSendType = {
    Id: number;
    ConfirmationString: string;
    isScanned: boolean;
    All: boolean;
    Name: string;
    RouteId: string;
    CountString: string;
  }

  const removeWarehousePackagesToSend = async () => {
    await Preferences.remove({
      key: "WarehousePackagesToSend"
    });
  };

  const addWarehousePackagesToSend = async (item: WarehousePackagesToSendType) => {

    setLastScanStringCount(item.CountString);

    const { value } = await Preferences.get({ key: "WarehousePackagesToSend" });

    if(value)
    {

      let tempValue = JSON.parse(value) as WarehousePackagesToSendType[];

      tempValue.push(item);

      await Preferences.set({
        key: "WarehousePackagesToSend",
        value: JSON.stringify(tempValue),
      });
    }
    else
    {
      await Preferences.set({
        key: "WarehousePackagesToSend",
        value: JSON.stringify([ item ]),
      });
    }
  };

  const getWarehousePackagesToSend = async () => {
    const { value } = await Preferences.get({ key: "WarehousePackagesToSend" });

    

    if(value)
    {
      console.log(value)
      return JSON.parse(value) as WarehousePackagesToSendType[];
    }
    else
    {
      return [];
    }
  };

  const assignWarehousePackagesFromStorageToState = async () => {
    const { value } = await Preferences.get({ key: "WarehousePackages" });

    if (value) {
      let warehousePackages = JSON.parse(value) as WarehousePackage[];

      await generateDictionary(warehousePackages);
    }
  };

  const generateDictionary = async (packages: WarehousePackage[]) => {
    setPackages(packages);

    await setWarehousePackages(JSON.stringify(packages));
    //const { value } = await Preferences.get({ key: "WarehousePackages" });

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
          routeId: y.routeId,
          owner: y.owner,
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

  const [presentLoading, dismissLoading] = useIonLoading();
  
  const [isLoaderOpen, setIsLoaderOpen] = useState(false);
  const [loadingText, setLoadingText] = useState<string>("");
  

  const getData = async () => {

    const networkStatus = await Network.getStatus();
    if (!networkStatus.connected) {
      return;
    }


    const packagesToSend = await getWarehousePackagesToSend();

    const packagesToSendLength = packagesToSend.length;

    let counter = 1;
    

    setIsLoaderOpen(true);

    // await assignWarehousePackagesFromStorageToState();
    // await assignWarehouseDateFromStorageToState();

    if(packagesToSend)
    {
      for(const n of packagesToSend.filter(e => !e.All))
      {
        setLoadingText("Wysyłanie " + Math.round((counter/packagesToSendLength)*100) + "%" );
  
        const scanRequest = await api
          .patch(
            "routes/addresses/packages/" + n.Id + "/warehouse",
            {
              isScanned: n.isScanned,
              confirmationString: n.ConfirmationString,
            }
          )
        const scanRequestResult = await scanRequest.data;
        console.log("scanned = " + n.Id)

        counter++;
  
      }
      for(const n of packagesToSend.filter(e => e.All))
      {
        setLoadingText("Wysyłanie " + Math.round((counter/packagesToSendLength)*100) + "%");
  
        const scanAllRequest = await api
          .patch(
            "routes/addresses/packages/warehouse-all",
            {
              isScanned: n.isScanned,
              name: n.Name,
              routeId: n.RouteId
            }
          )
        const scanAllRequestResult = await scanAllRequest.data;
        console.log("scanned all = " + n.Name)

        counter++;

      }
    }


    setLoadingText("Synchronizacja danych");

    //await CheckOfflineRequests();
    api.get("routes/addresses/packages").then(async (response) => {
      const packages = response.data as WarehousePackage[];

      await generateDictionary(packages);

      await setWarehousePackages(JSON.stringify(packages));

      let options = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      } as any;
      let today = new Date();

      await setWarehouseDate(
        JSON.stringify(today.toLocaleTimeString("pl-PL", options))
      );
      setUpdateDate(today.toLocaleTimeString("pl-PL", options));
    }).finally(async () => {


      await removeWarehousePackagesToSend();
      setIsLoaderOpen(false);

    });
  };

  useIonViewWillEnter(async () => {

    await assignWarehousePackagesFromStorageToState();
    await assignWarehouseDateFromStorageToState();

    //await getData();

    // api.get("routes/").then(async (response) => {
    //   const route = response.data as RouteProps[];

    //   await setRoute(JSON.stringify(route));
    //   const { value } = await Preferences.get({ key: "Route" });

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
    await Preferences.set({
      key: "Route",
      value: value,
    });
  };

  // const assignRouteFromStorageToState = async () => {
  //   const { value } = await Preferences.get({ key: "Route" });

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
    BarcodeScanner.startScanning(
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

              // api
              //   .patch(
              //     "routes/addresses/packages/" +
              //       scannedPackage.id +
              //       "/warehouse",
              //     {
              //       isScanned: true,
              //       confirmationString: result.content,
              //     }
              //   )
              //   .then(async (response) => {});

                if(result.content)
                {
                  await addWarehousePackagesToSend({
                    Id: scannedPackage.id,
                    ConfirmationString: result.content,
                    isScanned: true,
                    All: false,
                    Name: "",
                    RouteId: "",
                    CountString: scannedPackage.name + " " + tempItems.filter(function(item){
                      if (item.name == scannedPackage?.name && item.scanned) {
                        return true;
                      } else {
                        return false;
                      }
                    }).length + "/" + tempItems.filter(function(item){
                      if (item.name == scannedPackage?.name) {
                        return true;
                      } else {
                        return false;
                      }
                    }).length
                  });

                  if (
                    tempItems.filter(function (item) {
                      if (item.name == scannedPackage?.name && item.scanned) {
                        return true;
                      } else {
                        return false;
                      }
                    }).length ==
                    tempItems.filter(function (item) {
                      if (item.name == scannedPackage?.name) {
                        return true;
                      } else {
                        return false;
                      }
                    }).length
                  ) {
                    stopScan();
                    setScanning(false);
                    setLastScanStringCount("");
                  }

                }

                

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

    if(state.autoFlash)
    {
      await BarcodeScanner.enableTorch();
    }

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
      <IonModal
        style={{
          "--height": "auto",
          "--width": "auto",
        }}
        isOpen={isLoaderOpen}
      >
        <IonItem>
          <IonLabel style={{ marginRight: "20px" }}>{loadingText}</IonLabel>
          <IonSpinner name="crescent"></IonSpinner>
        </IonItem>
      </IonModal>

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
        <IonToolbar
          style={{
            textAlign: "center",
          }}
        >
          <IonToolbar>
            {/* Stan magazynowy z:
            <br /> */}
            <IonRow>
              <IonCol size="6">
                <IonButton
                  onClick={async () => {
                    presentAlert({
                      mode: "ios",
                      header:
                        "Upewnij się, że masz dostęp do szybkiego internetu!",
                      buttons: [
                        "Anuluj",
                        {
                          text: "Kontynuuj",
                          handler: async () => {
                            await getData();
                          },
                        },
                      ],
                      onDidDismiss: (e) => console.log("did dismiss"),
                    });
                  }}
                >
                  Synchronizacja
                </IonButton>
              </IonCol>
              <IonCol size="6">
                <span>{updateDate}</span>
              </IonCol>
            </IonRow>

            {/* <IonRow>
              <IonCol size="12">
              <span>Pamiętaj o synchronizacji po zakończeniu skanowania</span>
              </IonCol>
              </IonRow> */}
          </IonToolbar>
        </IonToolbar>
      </IonHeader>

      {scanning ? (
        <>
          <IonFab vertical="top" horizontal="start" slot="fixed">
            <IonFabButton
              onClick={() => {
                stopScan();
                setScanning(false);
                setLastScanStringCount("");
              }}
              color="danger"
            >
              <IonIcon icon={closeOutline} />
            </IonFabButton>
          </IonFab>

          <IonFab vertical="top" horizontal="end" slot="fixed">
            <IonFabButton
              onClick={async () => {
                await BarcodeScanner.toggleTorch();

                const torchState = await BarcodeScanner.getTorchState();

                setState((prev) => ({
                  ...prev,
                  ...{
                    autoFlash: torchState.isEnabled,
                  },
                }));

              }}
            >
              <IonIcon icon={flashlightOutline} />
            </IonFabButton>
          </IonFab>
        </>
      ) : (
        <></>
      )}

      <IonContent
        id="page-warehouse"
        fullscreen={true}
        className={"background-lightgrey " + (scanning ? "hide-bg" : "")}
      >
        <IonList className="list-order">
          {dietsWithNumber?.map((e) => {
            console.log(e);
            return (
              <IonItem
                style={{
                  "--border-color": "var(--ion-color-medium)",
                  "--min-height": 0,
                }}
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

                            // api
                            //   .patch(
                            //     "routes/addresses/packages/warehouse-all",
                            //     {
                            //       isScanned: false,
                            //       name: e.name,
                            //     }
                            //   )
                            //   .finally(async () => {});

                            await addWarehousePackagesToSend({
                              Id: -1,
                              ConfirmationString: "",
                              isScanned: false,
                              All: true,
                              Name: e.name,
                              RouteId: e.routeId,
                              CountString:
                                e.name +
                                " " +
                                tempItems.filter(function (item) {
                                  if (item.name == e.name && item.scanned) {
                                    return true;
                                  } else {
                                    return false;
                                  }
                                }).length +
                                "/" +
                                tempItems.filter(function (item) {
                                  if (item.name == e.name) {
                                    return true;
                                  } else {
                                    return false;
                                  }
                                }).length,
                            });
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

                          // api
                          //   .patch("routes/addresses/packages/warehouse-all", {
                          //     isScanned: true,
                          //     name: e.name,
                          //   })
                          //   .finally(async () => {});

                          await addWarehousePackagesToSend({
                            Id: -1,
                            ConfirmationString: "",
                            isScanned: true,
                            All: true,
                            Name: e.name,
                            RouteId: e.routeId,
                            CountString:
                              e.name +
                              " " +
                              tempItems.filter(function (item) {
                                if (item.name == e.name && item.scanned) {
                                  return true;
                                } else {
                                  return false;
                                }
                              }).length +
                              "/" +
                              tempItems.filter(function (item) {
                                if (item.name == e.name) {
                                  return true;
                                } else {
                                  return false;
                                }
                              }).length,
                          });
                        },
                      },
                    ],
                    onDidDismiss: (e) => console.log("did dismiss"),
                  });
                }}
              >
                <IonLabel
                  className={"wrap font-" + state.menuFontSize}
                  style={{
                    fontWeight: e.scanCount == e.count ? 600 : 400,
                    margin: "5px 0",
                  }}
                  color={e.scanCount == e.count ? "success" : ""}
                >
                  <span
                    style={{
                      textDecoration:
                        e.scanCount == e.count ? "line-through" : "",
                    }}
                  >
                    {e.name}
                  </span>
                  <br />
                  <IonChip
                    style={{
                      "--min-height": "0px",
                      padding: "0",
                      height: "22px",
                      margin: 0,
                      marginTop: "-3px",
                      opacity: "0.65",
                      marginLeft: "0px",
                      background: "none",
                    }}
                    color="success"
                  >
                    {e.owner}
                  </IonChip>
                </IonLabel>
                <IonLabel
                  className={"wrap font-" + state.menuFontSize}
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

      <IonFooter>
        <IonToolbar>
          {scanning ? (
            <></>
          ) : (
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
                setLastScanStringCount("");
              }}
            />
          )}

          {scanning ? (
            <IonRow>
              <IonCol size="12">
                <IonLabel className="all-diets-counter">
                  {lastScanStringCount}
                </IonLabel>
              </IonCol>
            </IonRow>
          ) : (
            <></>
          )}

          <IonRow>
            <IonCol size="12">
              <IonLabel className="all-diets-counter">
                Ilość diet: {scanDietsCount}/{allDietsCount}
              </IonLabel>
            </IonCol>
          </IonRow>
        </IonToolbar>
      </IonFooter>
    </IonPage>
  );
};

export default Warehouse;
