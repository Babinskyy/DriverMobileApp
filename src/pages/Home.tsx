import {
  IonItem,
  IonLabel,
  IonInput,
  IonContent,
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonGrid,
  IonCol,
  IonRow,
  IonFooter,
  useIonViewWillEnter,
  useIonViewDidEnter,
  useIonViewWillLeave,
  IonReorderGroup,
  IonReorder,
  IonButtons,
  IonButton,
  IonIcon,
  IonRippleEffect,
  IonRouterLink,
  IonList,
  IonListHeader,
  useIonPopover,
  IonFab,
  IonFabButton,
  IonModal,
} from "@ionic/react";

import React, {
  useState,
  useCallback,
  useEffect,
  useRef,
  ChangeEvent,
  useMemo,
  RefObject,
} from "react";

import { isPlatform, ScrollDetail } from "@ionic/core";

import {
  barcodeOutline,
  cameraOutline,
  checkmarkOutline,
  closeOutline,
  flashlightOutline,
  imageOutline,
  layersOutline,
  navigateOutline,
  toggle,
} from "ionicons/icons";

import {
  BarcodeScanner,
  SupportedFormat,
} from "@capacitor-community/barcode-scanner";

import "./Home.scss";

// import { Vibration } from '@awesome-cordova-plugins/vibration';

import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";

const MapPopover: React.FC<{
  onHide: () => void;
  address: string;
  lat: string;
  lng: string;
}> = ({ onHide, address, lat, lng }) => (
  <IonList>
    {/* <IonListHeader>Wybierz </IonListHeader> */}
    <IonItem
      button
      onClick={() => {
        window.open(
          "https://www.google.com/maps/dir/?api=1&destination=" +
            encodeURIComponent("Gdańsk " + address),
          "_blank"
        );
        onHide();
      }}
    >
      Google Maps
    </IonItem>
    <IonItem
      lines="none"
      button
      onClick={() => {
        window.open(
          // "https://mapa.targeo.pl/" + encodeURIComponent("Gdańsk " + address + "," + lng.replace(",", ".") + "," + lat.replace(",", ".")),
          "https://mapa.targeo.pl/" + encodeURIComponent("Gdańsk " + address),
          "_blank"
        ); //https://mapa.targeo.pl/b%C4%99dzin%20jesionowa%2017,19,19.121525400000003,50.31193999999999
        onHide();
      }}
    >
      Targeo
    </IonItem>
  </IonList>
);

const Home: React.FC = () => {
  const headerRef = useRef<HTMLIonHeaderElement>(null);

  const [headerScrollTop, setHeaderScrollTop] = useState(0);
  const [headerTop, setHeaderTop] = useState(0);

  const [disabled, setDisabled] = useState(true);

  const [address, setAddress] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");

  const [showOrderInfoModal, setShowOrderInfoModal] = useState(false);

  const [present, dismiss] = useIonPopover(MapPopover, {
    onHide: () => dismiss(),
    address: address,
    lat: lat,
    lng: lng,
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

    // BarcodeScanner.hideBackground(); // make background of WebView transparent

    // const result = await BarcodeScanner.startScan({
    //   targetedFormats: [SupportedFormat.QR_CODE],
    // });

    setTimeout(() => {
      BarcodeScanner.enableTorch();
    }, 150);

    let newScan = true;

    await BarcodeScanner.startScanning(
      { targetedFormats: [SupportedFormat.QR_CODE] },
      (result) => {
        if (result.hasContent) {
          console.log(result.content); // log the raw scanned content
          setScanningResult(result.content ?? "");

          // stopScan();
          // setScanning(false);

          let temp = items;

          temp[index].diets?.map((_e) => {
            if (_e.name == result.content) {
              _e.scanned = true;
            }
          });

          setItems(temp);

          setChoosedItem(undefined);
          setChoosedItem(temp[index]);

          console.log("test:");
          console.log();

          if (
            temp[index] == choosedItem ||
            temp[index].diets?.every((e) => {
              return e.scanned == false;
            })
          ) {
            // Vibration.vibrate(500);
          } else {
            new Audio(
              "https://www.myinstants.com/media/sounds/applepay.mp3"
            ).play();
            //NativeAudio.play("success");
          }

          // let itemCount = ( items.filter((element) => {
          //   return (element?.diets?.every((e) => {
          //     return e.scanned
          //   }))
          // }).length - 1 );

          // setChoosedItem(undefined);

          //startScan(index);
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
    diets?: ItemsDietProps[];
    photo?: boolean;
    lat: string;
    lng: string;
  };

  const [choosedItem, setChoosedItem] = useState<ItemsProps | undefined>();

  const [items, setItems] = useState<ItemsProps[]>([
    {
      address: "Leśny Stok 4",
      lat: "54,376804",
      lng: "18,582949",
      diets: [
        {
          name: "Dieta standard 1800kcal",
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
          name: "Dieta standard 1800kcal",
          scanned: false,
        },
        {
          name: "Dieta wege 2000kcal",
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
          name: "Dieta standard 1800kcal",
          scanned: false,
        },
        {
          name: "Dieta wege 2000kcal",
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
          name: "Dieta standard 1800kcal",
          scanned: false,
        },
      ],
    },
    // {
    //   address: "Batorego 32b/6",
    //   lat: "54,377743",
    //   lng: "18,598196",
    // },
    // {
    //   address: "Partyzantów 63b/9",
    //   lat: "54,37935",
    //   lng: "18,592789",
    // },
    // {
    //   address: "De Gaullea 1a/7",
    //   lat: "54,379936",
    //   lng: "18,60149",
    // },
  ]);

  useEffect(() => {
    // NativeAudio.preloadSimple( 'success', 'applepay.mp3');

    if (items.length > 0) {
      if (!items[0].diets) {
        let temp = items;

        const randomInt = (max: number, min: number) => {
          return Math.floor(Math.random() * (max - min)) + min;
        };

        temp.map((e) => {
          let rand = randomInt(1, 4);

          switch (rand) {
            case 1:
              e.diets = [
                {
                  name: "Dieta standard 1800kcal",
                  scanned: false,
                },
                {
                  name: "Dieta wege 2000kcal",
                  scanned: false,
                },
              ];
              break;
            case 2:
              e.diets = [
                {
                  name: "Dieta standard 1800kcal",
                  scanned: false,
                },
              ];
              break;
            case 3:
              e.diets = [
                {
                  name: "Dieta wege 2000kcal",
                  scanned: false,
                },
              ];
          }
        });

        setItems(temp);

        console.log(temp);
      }
    }
  }, []);

  return (
    <IonPage className="container">
      <IonModal isOpen={showOrderInfoModal}>
        <IonContent>Modal Content</IonContent>
      </IonModal>

      {/* {scanning ? (
        <div style={{ visibility: "hidden" }}>
          <CustomHeaderFade
            extended={false}
            headerRef={headerRef}
            title="Testowa aplikacja"
            extraButtons={
              <>
                <IonButtons slot="start">
                  <IonButton
                    onClick={() => {
                      stopScan();
                      setScanning(false);
                    }}
                  >
                    <IonIcon slot="icon-only" icon={closeOutline} />
                  </IonButton>
                </IonButtons>
              </>
            }
          />
        </div>
      ) : (
        <CustomHeaderFade
          extended={false}
          headerRef={headerRef}
          title="Testowa aplikacja"
          extraButtons={
            <>
              <IonButtons slot="end">
                <IonButton
                  onClick={() => {
                    setDisabled(!disabled);
                  }}
                >
                  <IonIcon slot="icon-only" icon={layersOutline} />
                </IonButton>
              </IonButtons>
            </>
          }
        />
      )} */}

      <IonHeader
        className={scanning ? "invisible" : ""}
        ref={headerRef}
        collapse="fade"
        translucent={isPlatform("mobile")}
        mode={"md"}
      >
        <IonToolbar>
          <IonTitle>
            <div className={"fade-header "}>siema</div>
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
                        <IonLabel style={{ margin: "0" }}>{_e.name}</IonLabel>
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
                    setLat(e.lat);
                    setLng(e.lng);
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
          {true ? (
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

                // image.webPath will contain a path that can be set as an image src.
                // You can access the original file using image.path, which can be
                // passed to the Filesystem API to read the raw data of the image,
                // if desired (or pass resultType: CameraResultType.Base64 to getPhoto)
                var imageUrl = image.webPath;

                // Can be set to the src of an image now
                // imageElement.src = imageUrl;
              }}
            >
              <IonLabel>ZDJĘCIE DOSTAWY</IonLabel>
              <IonIcon src={cameraOutline} />
            </IonButton>
          ) : (
            <></>
          )}

          <IonItem className="scan-info-container" lines="full">
            <IonLabel>
              <IonItem lines="none">
                <IonLabel>
                  <h4>{choosedItem?.address}</h4>
                  <p>Gdańsk 42-500</p>
                </IonLabel>
              </IonItem>
              {choosedItem?.diets?.map((_e) => {
                return (
                  <IonItem
                    button
                    className="diet-item"
                    lines="none"
                    color={_e.scanned ? "success" : "danger"}
                  >
                    <IonIcon
                      className="icon"
                      src={_e.scanned ? checkmarkOutline : closeOutline}
                    />
                    <IonLabel className="diet-type-label">{_e.name}</IonLabel>
                  </IonItem>
                );
              })}
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
