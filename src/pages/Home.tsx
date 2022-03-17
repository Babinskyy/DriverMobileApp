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
  searchOutline,
} from "ionicons/icons";
import React, { useEffect, useRef, useState } from "react";
import MapPopover from "../components/MapPopover";
import PhonePopover from "../components/PhonePopover";
import "./Home.scss";

import axios from "axios";
import { Storage } from "@capacitor/storage";

const Home: React.FC = () => {
  const headerRef = useRef<HTMLIonHeaderElement>(null);

  const [headerScrollTop, setHeaderScrollTop] = useState(0);
  const [headerTop, setHeaderTop] = useState(0);

  const [disabled, setDisabled] = useState(true);

  const [address, setAddress] = useState("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");

  const [showOrderInfoModal, setShowOrderInfoModal] = useState(false);

  const [searchText, setSearchText] = useState("");

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

  useIonViewWillEnter(() => {
    axios
      .get("https://broccoliapi.azurewebsites.net/RouteDriver")
      .then(async (response) => {
        const route = response.data.data.route as RouteProps[];

        await setRoute(JSON.stringify(route));
        const { value } = await Storage.get({ key: "Route" });

        if (value) {
          const routeCollection = JSON.parse(value) as RouteProps[];
        }

        setItems(route);
        setItemsStatic(route);
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
      const tempItems = itemsStatic?.filter((e) => {
        return (
          e.packages.some((_e) => {
            return _e.name.toLowerCase().includes(searchText.toLowerCase());
          }) || e.street.toLowerCase().includes(searchText.toLowerCase())
        );
      });
      setItems(tempItems);
    } else {
      setItems(itemsStatic);
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

  const startScan = async (index: number) => {
    if (items) {
      setChoosedItem(items[index]);
    }

    setTimeout(() => {
      BarcodeScanner.enableTorch();
    }, 150);

    let newScan = true;

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

              collection.map((e) => {
                if (code == e.id) {
                  console.log("if");
                  console.log(code);

                  const tempChoosedItem = items ? items[index] : undefined;

                  if (tempChoosedItem) {
                    console.log(
                      `${tempChoosedItem.street}` +
                        " " +
                        `${tempChoosedItem.houseNumber}`
                    );

                    tempChoosedItem?.packages.map((_e) => {
                      if (e.id == _e.code) {
                        _e.scanned = true;
                      }
                    });

                    setChoosedItem(tempChoosedItem);
                  }
                }
              });
            }
            if (temp) {
              temp[index].packages?.map((_e) => {
                if (_e.name == result.content) {
                  _e.scanned = true;
                }
              });

              setItems(temp);

              setChoosedItem(undefined);
              setChoosedItem(temp[index]);

              if (
                temp[index] == choosedItem ||
                temp[index].packages?.every((e) => {
                  return e.scanned == false;
                })
              ) {
                Vibration.vibrate(500);
              } else {
                new Audio(
                  "https://www.myinstants.com/media/sounds/applepay.mp3"
                ).play();
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
  const [itemsStatic, setItemsStatic] = useState<RouteProps[] | undefined>([]);

  return (
    <IonPage className="container">
      <IonModal
        className="modal1"
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
              <IonLabel>Adres</IonLabel>
              <IonLabel className="wrap capitalize">
                <div style={{ fontWeight: 700, fontSize: "21px" }}>
                  {`${itemModalInfo?.street} ${itemModalInfo?.houseNumber}`}
                </div>

                <div
                  style={{ fontWeight: 300 }}
                >{`${itemModalInfo?.postCode} ${itemModalInfo?.city}`}</div>
              </IonLabel>
            </IonItem>
            <IonItem>
              <IonLabel>Numer telefonu</IonLabel>
              <IonLabel
                color="secondary"
                onClick={(event) => {
                  setPhoneNumber(itemModalInfo ? itemModalInfo.phone : "");

                  presentPhoneNumber({
                    event: event.nativeEvent,
                  });
                }}
                style={{
                  fontWeight: 700,
                  fontSize: "21px",
                  textDecoration: "underline",
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
          <IonList>
            <IonItem>
              <IonLabel
                className="wrap"
                style={{ fontSize: "20px", fontWeight: 300 }}
              >
                <span style={{ fontWeight: 400 }}>
                  {itemModalInfo?.comment}
                </span>
                <br />
                <span>{itemModalInfo?.commentExtra}</span>
              </IonLabel>
            </IonItem>
          </IonList>
          <IonListHeader>
            <IonLabel style={{ fontWeight: 700 }}>Diety</IonLabel>
          </IonListHeader>
          <IonList>
            {itemModalInfo?.packages.map((e) => {
              return (
                <IonItem>
                  <IonLabel className="wrap">{e.name}</IonLabel>
                </IonItem>
              );
            })}
          </IonList>
          <IonListHeader>
            <IonLabel style={{ fontWeight: 700 }}>
              Numer Klienta: {`${itemModalInfo?.customerId}`}
            </IonLabel>
          </IonListHeader>
        </IonContent>
      </IonModal>

      <IonHeader
        className={scanning ? "invisible" : ""}
        ref={headerRef}
        collapse="fade"
        translucent={isPlatform("mobile")}
        mode={"md"}
      >
        <IonToolbar>
          <IonTitle>
            <IonSearchbar
              value={searchText}
              onIonChange={(e) => setSearchText(e.detail.value!)}
            ></IonSearchbar>
          </IonTitle>
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
          {items?.map((e, i) => {
            return (
              <IonItem
                className="item-container"
                disabled={e?.packages?.every((_e) => {
                  return _e.scanned;
                })}
                lines="full"
              >
                <IonLabel>
                  <IonItem lines="none">
                    <IonIcon
                      className="icon-scan"
                      color="primary"
                      slot="start"
                      icon={
                        e?.packages?.every((_e) => {
                          return _e.scanned;
                        })
                          ? cameraOutline
                          : barcodeOutline
                      }
                      onClick={(event) => {
                        if (
                          e?.packages?.every((_e) => {
                            return _e.scanned;
                          })
                        ) {
                        } else {
                          checkPermission();

                          const body = document.querySelector("body");
                          if (body) {
                            body.style.background = "transparent";
                          }
                          setScanning(true);
                          startScan(i);
                        }
                      }}
                    />

                    <IonLabel
                      className="wrap"
                      onClick={() => {
                        setShowOrderInfoModal(true);
                        setItemModalInfo(e);
                      }}
                    >
                      <h4 className="address capitalize">{`${e.street} ${e.houseNumber}`}</h4>
                      <p className="capitalize">{`${e.postCode} ${e.city}`}</p>
                    </IonLabel>
                  </IonItem>
                  {e.packages?.map((_e) => {
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
                <IonIcon
                  className="icon-navigation"
                  color="primary"
                  slot="end"
                  icon={navigateOutline}
                  onClick={(event) => {
                    setAddress(`${e.street} ${e.houseNumber}`);
                    present({
                      event: event.nativeEvent,
                    });
                  }}
                />
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
        <IonFooter>
          {choosedItem?.packages.every((e) => {
            return e.scanned;
          }) ? (
            <IonButton
              className="order-photo"
              color="success"
              onClick={async () => {
                stopScan();
                setScanning(false);

                const image = await Camera.getPhoto({
                  quality: 90,
                  allowEditing: false,
                  resultType: CameraResultType.Uri,
                  source: CameraSource.Camera,
                });

                var imageUrl = image.webPath;
                console.log(image);
              }}
            >
              <IonLabel>ZDJĘCIE DOSTAWY</IonLabel>
              <IonIcon src={cameraOutline} />
            </IonButton>
          ) : (
            <></>
          )}

          <IonItem className="scan-info-container" lines="full">
            <IonLabel style={{ marginBottom: "0" }}>
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
                        presentAlert({
                          mode: "ios",
                          cssClass: "missing-qr-alert",
                          header: "Nie możesz zeksanować kodu QR?",
                          subHeader:
                            "Wykonaj zdjęcie diety z nieczytelnym kodem QR",
                          message: _e.name,
                          buttons: [
                            "Anuluj",
                            {
                              text: "Zrób zdjęcie",
                              handler: async () => {
                                const image = await Camera.getPhoto({
                                  quality: 90,
                                  allowEditing: false,
                                  resultType: CameraResultType.Uri,
                                  source: CameraSource.Camera,
                                });
                                var imageUrl = image.webPath;
                              },
                            },
                          ],
                          onDidDismiss: (e) => console.log("did dismiss"),
                        });
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
