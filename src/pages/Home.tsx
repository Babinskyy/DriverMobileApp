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
  IonRippleEffect,
  IonSearchbar,
  IonTitle,
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
import "./Home.scss";

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

const Home: React.FC = () => {
  const { navigate } = useContext(NavContext);

  const { state, setState } = useGlobalState();

  const headerRef = useRef<HTMLIonHeaderElement>(null);

  const [address, setAddress] = useState("");

  const [phoneNumber, setPhoneNumber] = useState<string>("");

  const [showOrderInfoModal, setShowOrderInfoModal] = useState(false);

  const [showOrderPhoto, setShowOrderPhoto] = useState(false);
  const [assignedImage, setAssignedImage] = useState<string | undefined>();

  const contentRef = useRef<HTMLIonContentElement>(null);

  const [scanning, setScanning] = useState(false);

  const [choosedItem, setChoosedItem] = useState<RouteProps | undefined>();

  const [itemModalInfo, setItemModalInfo] = useState<RouteProps | undefined>();

  const [items, setItems] = useState<RouteProps[]>([]);

  const [itemsStatic, setItemsStatic] = useState<RouteProps[]>([]);
  const [rotate, setRotate] = useState<boolean>(false);

  const [itemsCounter, setItemsCounter] = useState(0);
  const [itemsCounterScanned, setItemsCounterScanned] = useState(0);

  const [presentToast, dismissToast] = useIonToast();

  // const items = useMemo<RouteProps[]>(() => items as RouteProps[], [items]);

  const [infinityCounter, setInfinityCounter] = useState(20);

  // const memoizedItems = useMemo(() => items.slice(0, infinityCounter), [items, infinityCounter]);

  const [presentAlert] = useIonAlert();

  const [footerItem, setFooterItem] = useState<RouteProps>();

  const [itemsMode, setItemsMode] = useState<"undelivered" | "delivered">(
    "undelivered"
  );

  const [presentPhotoLoading, dismissPhotoLoading] = useIonLoading();

  const [presentLoading, dismissLoading] = useIonLoading();

  const {
    Init,
    UpdateRouteImage,
    InitWithServer,
    UpdateRoutePackageImage,
    ChangeRouteToDefault,
    ScanRoutePackage,
  } = useRoute();

  // useEffect(() => {

  //   const AssignItemsCounter = async () => {

  //     const { value } = await Storage.get({ key: "Route" });

  //     if(value)
  //     {
  //       let tempRoute = JSON.parse(value) as RouteProps[];

  //       setItemsCounter(tempRoute.length);

  //       tempRoute = tempRoute.filter((e) => {
  //         return e.packagesCompleted && e.image;
  //       });
  //       tempRoute.sort((a, b) => {
  //           return b.order - a.order
  //       });

  //       setItemsCounterScanned(tempRoute.length);

  //     }

  //   }

  //   AssignItemsCounter();

  // }, [items])

  // useEffect(() => {
  //   const foundItem = items.find((x) => {
  //     return (
  //       x.packages.some((y) => {
  //         return y.scanned;
  //       }) && !x.image
  //     );
  //   });

  //   if (foundItem) {
  //     if (foundItem.id != footerItem?.id) {
  //       setFooterItem(foundItem);
  //     }
  //   }
  // }, [items]);

  const [present, dismiss] = useIonPopover(MapPopover, {
    onHide: () => dismiss(),
    address: address,
  });

  const [presentPhoneNumber, dismissPhoneNumber] = useIonPopover(PhonePopover, {
    onHide: () => dismissPhoneNumber(),
    phoneNumber: phoneNumber,
  });
  const [presentThreeDots, dismissThreeDots] = useIonPopover(ThreeDotsPopover, {
    onHide: () => dismissThreeDots(),
    showDelivered: async () => {
      setItemsMode("delivered");
      if (itemsMode == "undelivered") {
        setInfinityCounter(20);
      }

      if (contentRef.current) {
        contentRef.current.scrollToTop();
      }

      await CheckOfflineRequests();
      await InitWithServer();

      // await assignRouteDeliveredFromStorageToState();

      // api.get("routes/").then(async (response) => {
      //   let route = response.data as RouteProps[];

      //   RefreshRoute(route, "delivered", setItems, setItemsStatic, setFooterItem, footerItem, true);
      // });
    },
    showUndelivered: async () => {
      setItemsMode("undelivered");
      if (itemsMode == "delivered") {
        setInfinityCounter(20);
      }

      if (contentRef.current) {
        contentRef.current.scrollToTop();
      }

      await CheckOfflineRequests();
      await InitWithServer();

      // await assignRouteFromStorageToState();

      // api.get("routes/").then(async (response) => {
      //   let route = response.data as RouteProps[];

      //   RefreshRoute(route, "undelivered", setItems, setItemsStatic, setFooterItem, footerItem, true);
      // });
    },
  });

  useEffect(() => {
    const getUser = async () => {
      const user = (await auth.getCurrentUser()) as User | undefined;

      if (!user) {
        navigate("/login", "root", "replace");
      }
    };

    getUser();
  }, []);

  // useIonViewDidEnter(async () => {

  //   await api.get("routes/").then(async (response) => {
  //     let route = response.data as RouteProps[];

  //     RefreshRoute(route, itemsMode, setItems, setItemsStatic, setFooterItem, footerItem, true);

  //   });

  // });

  // useEffect(() => {
  //   assignRouteFromStorageToState();
  // }, []);

  const CheckOfflineRequests = async () => {
    const networkStatus = await Network.getStatus();

    if (networkStatus.connected) {
      await _CheckOfflineRequests();
    }
  };

  // const CheckOfflineRequests = async () => {

  //   const networkStatus = await Network.getStatus();

  //   if(networkStatus.connected)
  //   {
  //     try {

  //       const { value } = await Storage.get({ key: "OfflineRequests" });
  //       await Storage.remove({ key: "OfflineRequests" });

  //       if(value)
  //       {

  //         let offlineRequests = JSON.parse(value) as OfflineRequestProps[];
  //         offlineRequests.reverse();

  //         if(offlineRequests.length > 0)
  //         {

  //           presentLoading({
  //             message: "Synchronizowanie danych z serwerem",
  //             spinner: "crescent"
  //           });

  //           for (const e of offlineRequests) {
  //             const rq = await api.request({
  //               url: e.url,
  //               method: e.method,
  //               data: e.body
  //             });
  //             const rqData = await rq;
  //           }

  //           setTimeout(async () => {

  //             Init();

  //             setTimeout(() => {
  //               dismissLoading();
  //             }, 500);

  //           }, 200);

  //           return;

  //         }

  //       }

  //     } catch (error) {

  //     }

  //   }

  // }

  useEffect(() => {
    const effectAsync = async () => {
      await App.removeAllListeners();
      // await Network.removeAllListeners();

      App.addListener("appStateChange", async ({ isActive }) => {
        if (isActive) {
          await CheckOfflineRequests();
        }
      });

      // Network.addListener("networkStatusChange", async (status) => {
      //   if (status.connected) {
      //     await CheckOfflineRequests();
      //   }
      // });

      const networkStatus = await Network.getStatus();
      if (networkStatus.connected) {
        await CheckOfflineRequests();
        await InitWithServer();
      }
    };

    effectAsync();
  }, []);

  // useIonViewDidEnter(async () => {
  //   await CheckOfflineRequests();
  // });

  // const filterItems = (searchText: string) => {
  //   if (searchText.length > 0) {
  //     const tempItems = itemsStatic?.filter((e) => {
  //       return (
  //         e.packages.some((_e) => {
  //           return _e.name.toLowerCase().includes(searchText.toLowerCase());
  //         }) || e.street.toLowerCase().includes(searchText.toLowerCase())
  //       );
  //     });
  //     if (tempItems) {
  //       setItems(tempItems);
  //     }
  //   } else {
  //     if (itemsStatic) {
  //       setItems(itemsStatic);
  //     }
  //   }

  //   if(contentRef.current)
  //   {
  //     contentRef.current.scrollToTop(500);
  //   }

  // };

  const checkPermission = async () => {
    // check or request permission
    const status = await BarcodeScanner.checkPermission({ force: true });

    if (status.granted) {
      // the user granted permission
      return true;
    }

    return false;
  };

  const startScan = async (choosedItem: RouteProps) => {
    if (choosedItem) {
      setChoosedItem(choosedItem);
    }

    // setTimeout(() => {
    //   BarcodeScanner.enableTorch();
    // }, 150);

    await BarcodeScanner.startScanning(
      { targetedFormats: [SupportedFormat.QR_CODE] },
      async (result) => {
        if (result.hasContent) {
          try {
            const code = result.content?.split("|")[1];

            if (code) {
              const tempChoosedItem = choosedItem;

              const selectedDietIndex = tempChoosedItem.packages.findIndex(
                (e) => {
                  return e.code == code && !e.scanned;
                }
              );

              const selectedDietWithSameConfirmationString =
                tempChoosedItem.packages.find((e) => {
                  return e.confirmationString == result.content;
                });

              if (
                selectedDietWithSameConfirmationString &&
                selectedDietIndex >= 0
              ) {
                dismissToast();
                setTimeout(() => {
                  presentToast({
                    mode: "ios",
                    position: "top",
                    header: "Dieta została wcześniej zeskanowana",
                    color: "warning",
                    cssClass: "home-scanner-toast",
                    duration: 5000,
                  });
                }, 500);
                Vibration.vibrate(500);
              } else if (selectedDietIndex >= 0) {
                await ScanRoutePackage(
                  tempChoosedItem.packages[selectedDietIndex].id,
                  result.content as string
                );

                // const newItem = { ...tempChoosedItem };
                // newItem.packages[selectedDietIndex].scanned = true;
                // newItem.packages[selectedDietIndex].confirmationString =
                //   result.content as string;

                // newItem.packagesCompleted = newItem.packages.every(
                //   (e) => e.scanned
                // );

                // UpdateRouteElement(
                //   undefined,
                //   newItem,
                //   "undelivered",
                //   setItems,
                //   setItemsStatic,
                //   setFooterItem,
                //   footerItem,
                //   true
                // );

                // setChoosedItem(newItem);

                // api
                //   .patch(
                //     "routes/addresses/packages/" +
                //       newItem.packages[selectedDietIndex].id,
                //     {
                //       isScanned: true,
                //       confirmationString: result.content,
                //     }
                //   )
                //   .then(async (response) => {});

                new Audio(
                  "https://www.myinstants.com/media/sounds/applepay.mp3"
                ).play();
              } else {
                Vibration.vibrate(500);
              }
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

  return (
    <IonPage className="container">
      <IonModal
        className="order-info-modal"
        isOpen={showOrderInfoModal}
        onIonModalDidDismiss={() => setShowOrderInfoModal(false)}
      >
        <IonHeader>
          <IonToolbar style={{ padding: "0 15px" }}>
            <IonButtons slot="end">
              <IonButton
                style={{
                  fontWeight: 700,
                }}
                onClick={() => setShowOrderInfoModal(false)}
              >
                Wróć
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <IonListHeader>
            <IonLabel style={{ fontWeight: 700 }}>
              Podstawowe informacje
            </IonLabel>
          </IonListHeader>
          <IonList>
            <IonItem>
              <IonLabel style={{ maxWidth: "30%" }}>Adres</IonLabel>
              <IonLabel
                className="wrap capitalize"
                style={{ textAlign: "center" }}
              >
                <div style={{ fontWeight: 700, fontSize: "20px" }}>
                  {`${itemModalInfo?.street} ${itemModalInfo?.houseNumber}`}
                </div>

                <div
                  style={{ fontWeight: 300 }}
                >{`${itemModalInfo?.postCode} ${itemModalInfo?.city}`}</div>
              </IonLabel>
            </IonItem>
            <IonItem>
              <IonLabel className="wrap" style={{ maxWidth: "30%" }}>
                Numer telefonu
              </IonLabel>
              <IonLabel
                color="secondary"
                onClick={(event) => {
                  console.log(itemModalInfo);
                  console.log(itemModalInfo?.phone);
                  setPhoneNumber(itemModalInfo ? itemModalInfo.phone : "");
                  presentPhoneNumber({
                    event: event.nativeEvent,
                  });
                }}
                style={{
                  fontWeight: 700,
                  fontSize: "21px",
                  textAlign: "center",
                }}
              >
                <IonIcon
                  src={call}
                  style={{
                    marginRight: "10px",
                    fontSize: "20px",
                    transform: "translateY(4px)",
                  }}
                />
                {`${itemModalInfo?.phone}`}
              </IonLabel>
            </IonItem>
          </IonList>

          <IonListHeader>
            <IonLabel style={{ fontWeight: 700 }}>Wiadomość</IonLabel>
          </IonListHeader>

          <IonItem>
            <IonLabel
              className="wrap"
              style={{ fontSize: "20px", fontWeight: 300 }}
            >
              <span style={{ fontWeight: 400 }}>{itemModalInfo?.comment}</span>
              {itemModalInfo?.comment ? <br /> : ""}
              <span>{itemModalInfo?.commentExtra}</span>
            </IonLabel>
          </IonItem>

          <IonListHeader>
            <IonLabel style={{ fontWeight: 700 }}>Diety</IonLabel>
          </IonListHeader>
          <IonList>
            {itemModalInfo?.packages.map((e) => {
              return (
                <IonItem>
                  <IonLabel className="wrap">{e.name}</IonLabel>
                  {e.image ? (
                    <IonButton
                      onClick={() => {
                        setAssignedImage(e.image);
                        setShowOrderPhoto(true);
                      }}
                    >
                      Pokaż zdjęcie
                    </IonButton>
                  ) : (
                    <></>
                  )}
                </IonItem>
              );
            })}
          </IonList>
          <IonListHeader>
            <IonLabel style={{ fontWeight: 700 }}>
              Numer Klienta: {`${itemModalInfo?.customerId}`}
            </IonLabel>
          </IonListHeader>
          {itemModalInfo?.image ? (
            <IonButton
              expand="full"
              style={{ margin: "0 10px", marginBottom: "40px" }}
              onClick={() => {
                setAssignedImage(itemModalInfo?.image);
                setShowOrderPhoto(true);
              }}
            >
              Pokaż zdjęcie dostawy
            </IonButton>
          ) : (
            <></>
          )}
        </IonContent>
      </IonModal>
      <IonModal
        className="modal-image"
        isOpen={showOrderPhoto}
        onIonModalDidDismiss={() => setShowOrderPhoto(false)}
      >
        <IonFab vertical="top" horizontal="end" slot="fixed">
          <IonFabButton
            onClick={() => {
              setShowOrderPhoto(false);
            }}
            color="danger"
          >
            <IonIcon icon={closeOutline} />
          </IonFabButton>
        </IonFab>
        <IonImg src={assignedImage} />
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
          <IonSearchbar
            placeholder="Wyszukaj"
            style={{
              "--box-shadow": "none",
              "--background": "none",
            }}
            // onIonChange={(e) => filterItems(e.detail.value!)}
            onIonChange={(e) => {
              const text = e.detail.value;

              // setState((prev) => ({
              //   ...prev,
              //   ...{ searchText: text.length > 1 ? text : undefined },
              // }));

              Init(undefined, text == undefined ? "" : text);
            }}
          ></IonSearchbar>
          <IonButtons slot="end">
            <IonButton
              className={rotate ? "rotated" : ""}
              onClick={async () => {
                try {
                  presentLoading({
                    message: "Synchronizowanie danych z serwerem",
                    spinner: "crescent",
                  });

                  setRotate(!rotate);

                  await CheckOfflineRequests();
                  await InitWithServer();
                } catch (error) {}

                await dismissLoading();
              }}
            >
              <IonIcon slot="icon-only" icon={refreshOutline} />
            </IonButton>
            <IonButton
              onClick={(event) => {
                presentThreeDots({
                  event: event.nativeEvent,
                });
              }}
            >
              <IonIcon slot="icon-only" icon={ellipsisVerticalOutline} />
            </IonButton>
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
        ref={contentRef}
        fullscreen={true}
        className={"background-lightgrey " + (scanning ? "hide-bg" : "")}
      >
        <>
          <IonList className="list-order">
            {(itemsMode == "undelivered" ? state.routeCurrent : state.routeEnd)
              ?.slice(0, infinityCounter)
              .map((e, i) => {
                return (
                  <div key={e.id} className="item-container">
                    {i >= 0 ? <div className="counter">{i + 1}</div> : <></>}
                    <IonLabel>
                      <div style={{ display: "flex" }}>
                        
                      <IonIcon
                          className="icon-navigation"
                          color="primary"
                          slot="start"
                          icon={navigateOutline}
                          onClick={(event) => {
                            setAddress(`${e.street} ${e.houseNumber}`);
                            present({
                              event: event.nativeEvent,
                            });
                          }}
                        />

                        <IonLabel
                          className="wrap"
                          onClick={() => {
                            if (items) {
                              setShowOrderInfoModal(true);
                              setItemModalInfo(e);
                            }
                          }}
                        >
                          <h4 className="address capitalize">{`${e.street} ${e.houseNumber}`}</h4>
                          <p className="capitalize">{`${e.postCode} ${e.city}`}</p>
                        </IonLabel>


                        <IonIcon
                          className="icon-scan"
                          color={
                            e.image
                              ? "secondary"
                              : e.packagesCompleted || state.isScanOptional
                              ? "tertiary"
                              : e.packages.some((x) => x.scanned)
                              ? "tertiary"
                              : "primary"
                          }
                          slot="end"
                          icon={
                            e.image
                              ? syncOutline
                              : e.packagesCompleted || state.isScanOptional
                              ? cameraOutline
                              : barcodeOutline
                          }
                          onClick={async (event) => {
                            if (
                              (e.packagesCompleted || state.isScanOptional) &&
                              !e.image
                            ) {
                              const image = await GetPhoto(e.id.toString());

                              await UpdateRouteImage(e.id, image);

                              // if (newItem) {
                              //   newItem.image = image.webPath;
                              //   newItem.packagesCompleted = true;

                              //   console.log(image);

                              //   UpdateRouteElement(
                              //     undefined,
                              //     newItem,
                              //     "undelivered",
                              //     setItems,
                              //     setItemsStatic,
                              //     setFooterItem,
                              //     footerItem,
                              //     true
                              //   );

                              //   presentPhotoLoading({spinner: "crescent", message: "Wysyłanie"});
                              //   api
                              //     .post("routes/addresses/" + e.id + "/image", {
                              //       image: image.base64,
                              //     })
                              //     .then((response) => {
                              //       console.log(response);
                              //     })
                              //     .finally(() => {
                              //       dismissPhotoLoading();
                              //     });
                              // }
                            } else if (e.image) {
                              presentAlert({
                                mode: "ios",
                                cssClass: "missing-qr-alert",
                                header:
                                  "Czy na pewno chcesz cofnąć dostarczenie adresu?",
                                subHeader: "Wybrany adres:",
                                message: e.street + " " + e.houseNumber,
                                buttons: [
                                  "Anuluj",
                                  {
                                    text: "Cofnij",
                                    handler: async () => {
                                      ChangeRouteToDefault(e.id);
                                    },
                                  },
                                ],
                                onDidDismiss: (e) => console.log("did dismiss"),
                              });
                            } else if (
                              state.routeCurrent?.find((x) => {
                                return (
                                  x.packages.some((y) => {
                                    return y.scanned;
                                  }) && !x.image
                                );
                              }) &&
                              e.id !=
                                state.routeCurrent?.find((x) => {
                                  return (
                                    x.packages.some((y) => {
                                      return y.scanned;
                                    }) && !x.image
                                  );
                                })?.id
                            ) {
                              console.log(e.packages);

                              let _message = "";

                              const element = state.routeCurrent?.find((x) => {
                                return (
                                  x.packages.some((y) => {
                                    return y.scanned;
                                  }) && !x.image
                                );
                              });

                              if (element) {
                                _message =
                                  element.street + " " + element.houseNumber;

                                presentAlert({
                                  mode: "ios",
                                  cssClass: "missing-qr-alert",
                                  header:
                                    "Dokończ inny rozpoczęty adres przed skanowaniem",
                                  subHeader: "Adres do zakończenia:",
                                  message: _message,
                                  buttons: [
                                    "Powrót",
                                    // {
                                    //   text: "Zobacz",
                                    //   handler: () => {
                                    //     if (contentRef.current && element) {
                                    //       const addressElement =
                                    //         document.querySelector(
                                    //           "[data-toscroll='" +
                                    //             element.id +
                                    //             "']"
                                    //         ) as Element | undefined;

                                    //       if (addressElement) {
                                    //         // const addressElementBounds = addressElement.getBoundingClientRect();
                                    //         // contentRef.current.scrollIntoView(0, addressElementBounds.top, 1000);
                                    //         addressElement.scrollIntoView({
                                    //           block: "center",
                                    //           behavior: "smooth",
                                    //           inline: "center",
                                    //         });
                                    //       }
                                    //     }
                                    //   },
                                    // },
                                  ],
                                  onDidDismiss: (e) =>
                                    console.log("did dismiss"),
                                });
                              }
                            } else {
                              const tempItems = state.routeCurrent;
                              const isCameraWaiting = tempItems?.some((x) => {
                                return x.packagesCompleted && !x.image;
                              });

                              if (isCameraWaiting) {
                              } else {
                                checkPermission();

                                const body = document.querySelector("body");
                                if (body) {
                                  body.style.background = "transparent";
                                }
                                setScanning(true);
                                startScan(e);
                              }
                            }
                          }}
                        />

                        
                      </div>
                      {e.packages.map((_e) => {
                        return (
                          <IonItem className="item-diet" lines="none">
                            <IonIcon
                              color={_e.scanned ? "success" : "danger"}
                              src={_e.scanned ? checkmarkOutline : closeOutline}
                            />
                            <IonLabel style={{ margin: "0" }} className="wrap">
                              {_e.name}
                            </IonLabel>
                          </IonItem>
                        );
                      })}
                    </IonLabel>
                  </div>
                );
              })}
          </IonList>

          <IonInfiniteScroll
            onIonInfinite={(event: any) => {
              console.log("onIonInfinite");
              setInfinityCounter(infinityCounter + 20);
              event.target.complete();
            }}
            threshold="500px"
            disabled={
              infinityCounter >=
              (itemsMode == "undelivered"
                ? state.routeCurrent
                  ? state.routeCurrent.length
                  : 0
                : state.routeEnd
                ? state.routeEnd.length
                : 0)
            }
          >
            <IonInfiniteScrollContent
              loadingSpinner="bubbles"
              loadingText="Ładowanie..."
            ></IonInfiniteScrollContent>
          </IonInfiniteScroll>
        </>
      </IonContent>
      {scanning ? (
        <></>
      ) : (
        <IonFooter>
          {state.routeCurrentItemFooter &&
          itemsMode == "undelivered" &&
          !state.routeCurrentItemFooter?.image ? (
            <IonList
              className="list-order border"
              style={{ paddingBottom: "0" }}
            >
              <div
                className="item-container"
                style={{ paddingTop: "5px", borderBottom: "none" }}
              >
                <IonLabel>
                  <div style={{ display: "flex" }}>


                  <IonIcon
                      className="icon-navigation"
                      color="primary"
                      slot="start"
                      icon={navigateOutline}
                      onClick={(event) => {
                        setAddress(
                          `${state.routeCurrentItemFooter?.street} ${state.routeCurrentItemFooter?.houseNumber}`
                        );
                        present({
                          event: event.nativeEvent,
                        });
                      }}
                    />


                    

                    <IonLabel
                      className="wrap"
                      onClick={() => {
                        if (items) {
                          setShowOrderInfoModal(true);
                          setItemModalInfo(state.routeCurrentItemFooter);
                        }
                      }}
                    >
                      <h4
                        style={{ color: "var(--ion-color-dark)" }}
                        className="address capitalize"
                      >{`${state.routeCurrentItemFooter?.street} ${state.routeCurrentItemFooter?.houseNumber}`}</h4>
                      <p className="capitalize">{`${state.routeCurrentItemFooter?.postCode} ${state.routeCurrentItemFooter?.city}`}</p>
                    </IonLabel>
                    
                    <IonIcon
                      className="icon-scan"
                      color={
                        state.routeCurrentItemFooter?.image
                          ? "secondary"
                          : state.routeCurrentItemFooter?.packagesCompleted
                          ? "tertiary"
                          : state.routeCurrentItemFooter?.packages.some(
                              (x) => x.scanned
                            )
                          ? "tertiary"
                          : "primary"
                      }
                      slot="end"
                      icon={
                        state.routeCurrentItemFooter?.image
                          ? syncOutline
                          : state.routeCurrentItemFooter?.packagesCompleted ||
                            state.isScanOptional
                          ? cameraOutline
                          : barcodeOutline
                      }
                      onClick={async (event) => {
                        if (
                          state.routeCurrentItemFooter &&
                          (state.routeCurrentItemFooter?.packages?.every(
                            (_e) => {
                              return _e.scanned;
                            }
                          ) ||
                            state.isScanOptional) &&
                          !state.routeCurrentItemFooter?.image
                        ) {
                          const image = await GetPhoto(
                            state.routeCurrentItemFooter.id.toString()
                          );

                          await UpdateRouteImage(
                            state.routeCurrentItemFooter.id,
                            image
                          );

                          // const newItem = state.routeCurrentItemFooter;

                          // if (newItem) {
                          //   newItem.image = image.webPath;

                          //   console.log(image);

                          //   UpdateRouteElement(
                          //     undefined,
                          //     newItem,
                          //     "undelivered",
                          //     setItems,
                          //     setItemsStatic,
                          //     setFooterItem,
                          //     footerItem,
                          //     true
                          //   );

                          //   presentPhotoLoading({spinner: "crescent", message: "Wysyłanie"});
                          //   api
                          //     .post("routes/addresses/" + state.routeCurrentItemFooter?.id + "/image", {
                          //       image: image.base64,
                          //     })
                          //     .then((response) => {
                          //       console.log(response);
                          //     })
                          //     .finally(() => {
                          //       dismissPhotoLoading();
                          //     });
                          // }
                        } else if (state.routeCurrentItemFooter?.image) {
                          presentAlert({
                            mode: "ios",
                            cssClass: "missing-qr-alert",
                            header:
                              "Czy na pewno chcesz cofnąć dostarczenie adresu?",
                            subHeader: "Wybrany adres:",
                            message:
                              state.routeCurrentItemFooter?.street +
                              " " +
                              state.routeCurrentItemFooter?.houseNumber,
                            buttons: [
                              "Anuluj",
                              {
                                text: "Cofnij",
                                handler: async () => {
                                  const newItem = {
                                    ...state.routeCurrentItemFooter,
                                  };

                                  newItem.packagesCompleted = false;
                                  newItem.image = undefined;
                                  newItem.packages?.map((_e) => {
                                    _e.scanned = false;
                                  });

                                  // UpdateRouteElement(
                                  //   undefined,
                                  //   newItem,
                                  //   "delivered",
                                  //   setItems,
                                  //   setItemsStatic,
                                  //   setFooterItem,
                                  //   footerItem,
                                  //   true
                                  // );
                                },
                              },
                            ],
                            onDidDismiss: (e) => console.log("did dismiss"),
                          });
                        } else if (
                          state.routeCurrent?.find((x) => {
                            return (
                              x.packages.some((y) => {
                                return y.scanned;
                              }) && !x.image
                            );
                          }) &&
                          state.routeCurrentItemFooter?.id !=
                            state.routeCurrent?.find((x) => {
                              return (
                                x.packages.some((y) => {
                                  return y.scanned;
                                }) && !x.image
                              );
                            })?.id
                        ) {
                          console.log(state.routeCurrentItemFooter?.packages);

                          let _message = "";

                          const element = state.routeCurrent?.find((x) => {
                            return (
                              x.packages.some((y) => {
                                return y.scanned;
                              }) && !x.image
                            );
                          });

                          if (element) {
                            _message =
                              element.street + " " + element.houseNumber;

                            presentAlert({
                              mode: "ios",
                              cssClass: "missing-qr-alert",
                              header:
                                "Dokończ inny rozpoczęty adres przed skanowaniem",
                              subHeader: "Adres do zakończenia:",
                              message: _message,
                              buttons: ["Powrót"],
                              onDidDismiss: (e) => console.log("did dismiss"),
                            });
                          }
                        } else {
                          const tempItems = state.routeCurrent;
                          const isCameraWaiting = tempItems?.some((e) => {
                            return e.packagesCompleted && !e.image;
                          });

                          if (isCameraWaiting) {
                          } else {
                            checkPermission();

                            const body = document.querySelector("body");
                            if (body) {
                              body.style.background = "transparent";
                            }
                            setScanning(true);
                            if (state.routeCurrentItemFooter) {
                              startScan(state.routeCurrentItemFooter);
                            }
                          }
                        }
                      }}
                    />

                  </div>
                  {state.routeCurrentItemFooter?.packages.map((_e) => {
                    return (
                      <IonItem className="item-diet" lines="none">
                        <IonIcon
                          color={_e.scanned ? "success" : "danger"}
                          src={_e.scanned ? checkmarkOutline : closeOutline}
                        />
                        <IonLabel style={{ margin: "0" }} className="wrap">
                          {_e.name}
                        </IonLabel>
                      </IonItem>
                    );
                  })}
                </IonLabel>
              </div>
            </IonList>
          ) : (
            <></>
          )}
          {state.routeCurrentItemFooter ? (
            <></>
          ) : (
            <IonItem style={{ "--min-height": "35px" }}>
              <IonLabel
                slot="end"
                style={{ marginTop: "0", marginBottom: "0" }}
              >
                {state.routeEnd?.length}/{state.route?.length}
              </IonLabel>
            </IonItem>
          )}
        </IonFooter>
      )}
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
        <IonFooter>
          {choosedItem?.packages.every((e) => {
            return e.scanned;
          }) ? (
            <IonButton
              className="order-photo"
              color="success"
              onClick={async () => {
                const image = await GetPhoto(choosedItem.id.toString());

                await UpdateRouteImage(choosedItem.id, image);

                //   const newItem = choosedItem;
                //   if (newItem) {
                //     newItem.image = image.webPath;
                //     newItem.packagesCompleted = true;

                //     console.log(image);

                //     UpdateRouteElement(
                //       undefined,
                //       newItem,
                //       "undelivered",
                //       setItems,
                //       setItemsStatic,
                //       setFooterItem,
                //       footerItem,
                //       true
                //     );
                //   }

                //   presentPhotoLoading({spinner: "crescent", message: "Wysyłanie"});
                //   api
                //     .post("routes/addresses/" + choosedItem.id + "/image", {
                //       image: image.base64,
                //     })
                //     .then((response) => {
                //       console.log(response);
                //     })
                //     .finally(() => {
                //       dismissPhotoLoading();
                //     });

                stopScan();
                setScanning(false);
              }}
            >
              <IonLabel>ZDJĘCIE DOSTAWY</IonLabel>
              <IonIcon src={cameraOutline} />
            </IonButton>
          ) : (
            <></>
          )}

          <IonItem className="scan-info-container" lines="full">
            <IonLabel style={{ marginBottom: "5px", marginTop: "0" }}>
              <IonItem lines="none">
                <IonLabel className="capitalize">
                  <h4>{`${choosedItem?.street} ${choosedItem?.houseNumber}`}</h4>
                  <p>{`${choosedItem?.postCode} ${choosedItem?.city}`}</p>
                </IonLabel>
              </IonItem>
              <div className="diets-container">
                {choosedItem?.packages?.map((_e) => {
                  return (
                    <IonItem
                      button
                      className="diet-item"
                      lines="none"
                      color={_e.scanned ? "success" : "danger"}
                      onClick={async () => {
                        if (!_e.scanned) {
                          presentAlert({
                            mode: "ios",
                            cssClass: "missing-qr-alert",
                            header: "Nie możesz zeskanować kodu QR?",
                            subHeader:
                              "Wykonaj zdjęcie diety z nieczytelnym kodem QR",
                            message: _e.name,
                            buttons: [
                              "Anuluj",
                              {
                                text: "Zrób zdjęcie",
                                handler: async (e) => {
                                  const image = await GetPhoto(
                                    _e.id.toString()
                                  );
                                  await UpdateRoutePackageImage(_e.id, image);

                                  // setChoosedItem(_e);

                                  // const newItem = items.find(
                                  //   (e) => e.id == choosedItem.id
                                  // );
                                  // if (newItem) {
                                  //   const tempPackageIndex =
                                  //     newItem.packages.findIndex(
                                  //       (x) => x.id == _e.id
                                  //     );

                                  //   newItem.packages[tempPackageIndex].scanned =
                                  //     true;
                                  //   newItem.packages[tempPackageIndex].image =
                                  //     image.webPath;

                                  //   newItem.packagesCompleted =
                                  //     newItem.packages.every((e) => e.scanned);

                                  //   console.log(newItem);

                                  //   UpdateRouteElement(
                                  //     undefined,
                                  //     newItem,
                                  //     "undelivered",
                                  //     setItems,
                                  //     setItemsStatic,
                                  //     setFooterItem,
                                  //     footerItem,
                                  //     true
                                  //   );

                                  //   setChoosedItem(newItem);
                                  // }

                                  // presentPhotoLoading({spinner: "crescent", message: "Wysyłanie"});
                                  // api
                                  //   .post(
                                  //     "routes/addresses/packages/" +
                                  //       _e.id +
                                  //       "/image",
                                  //     {
                                  //       image: image.base64,
                                  //     }
                                  //   )
                                  //   .then((response) => {
                                  //     console.log(response);
                                  //   })
                                  //   .finally(() => {
                                  //     dismissPhotoLoading();
                                  //   });

                                  // let tempItems = items;
                                  // let tempChoosedItem = choosedItem;

                                  // let scannedAddress: RouteProps | undefined =
                                  //   undefined;

                                  // tempItems.map((x) => {
                                  //   x.packages.map((_x) => {
                                  //     if (_x.id == _e.id) {
                                  //       _x.scanned = true;
                                  //       scannedAddress = x;
                                  //     }
                                  //   });
                                  // });

                                  // if (scannedAddress) {
                                  //   const _scannedAddress: RouteProps =
                                  //     scannedAddress;

                                  //   if (
                                  //     _scannedAddress.packages.every((x) => {
                                  //       return x.scanned;
                                  //     })
                                  //   ) {
                                  //     tempItems.map((x) => {
                                  //       if (x.id == _scannedAddress.id) {
                                  //         x.packagesCompleted = true;
                                  //       }
                                  //     });
                                  //   }
                                  // }

                                  // tempChoosedItem.packages.map((x) => {
                                  //   if (x.id == _e.id) {
                                  //     x.scanned = true;
                                  //   }
                                  // });

                                  // setItems(tempItems);
                                  // setChoosedItem(undefined);
                                  // setChoosedItem(tempChoosedItem);
                                },
                              },
                            ],
                            onDidDismiss: (e) => console.log("did dismiss"),
                          });
                        }
                      }}
                    >
                      <IonIcon
                        className="icon"
                        src={_e.scanned ? checkmarkOutline : closeOutline}
                      />
                      <IonLabel className="diet-type-label">{_e.name}</IonLabel>
                    </IonItem>
                  );
                })}
              </div>
            </IonLabel>

            <IonRippleEffect />
            <IonReorder slot="end" />
          </IonItem>
        </IonFooter>
      ) : (
        <></>
      )}
    </IonPage>
  );
};

export default Home;
