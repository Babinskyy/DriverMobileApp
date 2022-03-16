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
  const [phoneNumber, setPhoneNumber] = useState("");

  const [showOrderInfoModal, setShowOrderInfoModal] = useState(false);

  const [searchText, setSearchText] = useState("");

  type DietsProps = {
    id: string;
    category: string;
    name: string;
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

  useEffect(() => {
    if (searchText.length > 0) {
      const tempItems = items.filter((e) => {
        return (
          e.diets.some((_e) => {
            return _e.name.toLowerCase().includes(searchText.toLowerCase());
          }) || e.address.toLowerCase().includes(searchText.toLowerCase())
        );
      });

      setItems(tempItems);
    } else {
      setItems(ItemsStatic);
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
    setChoosedItem(items[index]);

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
                  const tempChoosedItem = items[index];

                  console.log("choosedItem " + tempChoosedItem.address);
                  console.log(tempChoosedItem.address);

                  tempChoosedItem?.diets.map((_e) => {
                    if (e.name == _e.name) {
                      _e.scanned = true;
                    }
                  });

                  setChoosedItem(tempChoosedItem);
                }
              });
            }

            temp[index].diets?.map((_e) => {
              if (_e.name == result.content) {
                _e.scanned = true;
              }
            });

            setItems(temp);

            setChoosedItem(undefined);
            setChoosedItem(temp[index]);

            if (
              temp[index] == choosedItem ||
              temp[index].diets?.every((e) => {
                return e.scanned == false;
              })
            ) {
              Vibration.vibrate(500);
            } else {
              new Audio(
                "https://www.myinstants.com/media/sounds/applepay.mp3"
              ).play();
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

  const [choosedItem, setChoosedItem] = useState<ItemsProps | undefined>();
  const ItemsStatic: ItemsProps[] = [
    {
      address: "Leśny Stok 4",
      lat: "54,376804",
      lng: "18,582949",
      diets: [
        {
          name: "Dieta standard 1500kcal",
          scanned: false,
        },
      ],
    },
    {
      address: "Rodzinna 15",
      lat: "54,376377",
      lng: "18,58399",
      diets: [
        {
          name: "Slim-1500 KCAL-Standard",
          scanned: false,
        },
        {
          name: "Slim-2000 KCAL-Wege",
          scanned: false,
        },
      ],
    },
    {
      address: "Reymonta 34/26",
      lat: "54,37737",
      lng: "18,583952",
      diets: [
        {
          name: "Dieta wege 2000kcal",
          scanned: false,
        },
      ],
    },
    {
      address: "Dekerta 7/4",
      lat: "54,38073",
      lng: "18,598017",
      diets: [
        {
          name: "Dieta wege 2000kcal",
          scanned: false,
        },
      ],
    },
    {
      address: "Kołłątaja 7/47",
      lat: "54,380356",
      lng: "18,597185",
      diets: [
        {
          name: "Sport-2000 KCAL",
          scanned: false,
        },
        {
          name: "Sport-2500 KCAL",
          scanned: false,
        },
        {
          name: "Slim-2500 KCAL-Wege + Fish",
          scanned: false,
        },
        {
          name: "Slim-2500 KCAL-diet o bardzo niskiej zawartości glutenu i laktozy",
          scanned: false,
        },
      ],
    },
    {
      address: "Sosnowa 7/31",
      lat: "54,377438",
      lng: "18,601013",
      diets: [
        {
          name: "Dieta standard 1500kcal",
          scanned: false,
        },
      ],
    },
  ];

  const [items, setItems] = useState<ItemsProps[]>(ItemsStatic);

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
                Podstawowe informacje
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <IonList>
            <IonItem>
              <IonLabel>Adres</IonLabel>
              <IonLabel className="wrap">
                <div style={{ fontWeight: 700, fontSize: "21px" }}>
                  Rodzinna 15/2
                </div>

                <div style={{ fontWeight: 300 }}>Gdańsk 80-243</div>
              </IonLabel>
            </IonItem>
            <IonItem>
              <IonLabel>Numer telefonu</IonLabel>
              <IonLabel
                color="secondary"
                onClick={(event) => {
                  setPhoneNumber("785 234 222");
                  console.log("loggg");
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
                785 234 222
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
                Lorem ipsum dolor sit, amet consectetur adipisicing elit.
                Officia nam eum explicabo temporibus ab eius recusandae rem
                aspernatur molestiae fuga? Lorem ipsum dolor sit, amet
                consectetudae rem aspernatur molestiae fuga?Lorem ipsum dur
                molestiae fuga?
              </IonLabel>
            </IonItem>
          </IonList>
          <IonListHeader>
            <IonLabel style={{ fontWeight: 700 }}>Diety</IonLabel>
          </IonListHeader>
          <IonList>
            <IonItem>
              <IonLabel>Standard 1500</IonLabel>
            </IonItem>

            <IonItem>
              <IonLabel>Wege 2000</IonLabel>
            </IonItem>
          </IonList>
          <IonListHeader>
            <IonLabel style={{ fontWeight: 700 }}>
              Numer klienta: 03353
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
          {items.map((e, i) => {
            return (
              <IonItem
                className="item-container"
                disabled={
                  e?.diets?.every((_e) => {
                    return _e.scanned;
                  }) && !e.photo
                }
                lines="full"
              >
                <IonLabel>
                  <IonItem lines="none">
                    <IonIcon
                      className="icon-scan"
                      color="primary"
                      slot="start"
                      icon={
                        e?.diets?.every((_e) => {
                          return _e.scanned;
                        })
                          ? cameraOutline
                          : barcodeOutline
                      }
                      onClick={(event) => {
                        if (
                          e?.diets?.every((_e) => {
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
                      }}
                    >
                      <h4 className="address">{e.address}</h4>
                      <p>Gdańsk 42-500</p>
                    </IonLabel>
                  </IonItem>
                  {e.diets?.map((_e) => {
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
                    setAddress(e.address);
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
          {choosedItem?.diets.every((e) => {
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
                <IonLabel>
                  <h4>{choosedItem?.address}</h4>
                  <p>Gdańsk 42-500</p>
                </IonLabel>
              </IonItem>
              <div className="diets-container">
                {choosedItem?.diets?.map((_e) => {
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
