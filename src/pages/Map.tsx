import { Vibration } from "@awesome-cordova-plugins/vibration";
import {
  BarcodeScanner,
  SupportedFormat,
} from "@capacitor-community/barcode-scanner";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
import { isPlatform } from "@ionic/core";
import {
  IonAvatar,
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
  IonRow,
  IonSearchbar,
  IonTitle,
  IonToolbar,
  NavContext,
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
  chevronDownOutline,
  closeCircle,
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
import "./Map.scss";

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
import { RouterProps, useHistory, useLocation } from "react-router";
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

import mapboxgl, { GeoJSONSource, GeoJSONSourceRaw } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import MapMarker from "../components/MapMarker";

type PopupAddressType = {
  address1: string;
  address2: string;
  order: number;
}

const Map: React.FC = () => {

  const [isModalOpen, setIsModalOpen] = useState(false);
  const modal = useRef<HTMLIonModalElement>(null);
  const [popupAddress, setPopupAddress] = useState<PopupAddressType>();

  useEffect(() => {

    console.log(popupAddress)

  }, [popupAddress])

  const [_lng, _setLng] = useState(20.7810167);
  const [_lat, _setLat] = useState(52.2326063);

  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [zoom, setZoom] = useState(6);

  const geojsonLines = useRef<any>({});
  const geojsonPoints = useRef<any>({});
  let canvas: HTMLElement;

  useIonViewDidLeave(() => {

    setTimeout(() => {
      map.current?.remove();
      map.current = null;
      if(mapContainer.current)
      {
        mapContainer.current.innerHTML = "";
      }
    }, 500);

  })

  useIonViewDidEnter(() => {
    setTimeout(() => {
      if (map.current == null) {
        api
          .get("routes/0/geojson")
          .then(async (response) => {
            await Storage.set({
              key: "geojsonPointsStatic",
              value: response.data.geoJSONStops,
            });

            geojsonLines.current = JSON.parse(response.data.geoJSONMain);
            geojsonPoints.current = JSON.parse(response.data.geoJSONStops);

            const accessTokenRequest = await axios.get(
              "https://broccolihot.z16.web.core.windows.net/MAPBOX_TOKEN.txt?stamp=" +
                new Date().getTime()
            );
            const accessToken = await accessTokenRequest.data;

            if (!map.current && mapContainer.current) {
              map.current = new mapboxgl.Map({
                accessToken: accessToken,
                fadeDuration: 0,
                container: mapContainer.current,
                style: "mapbox://styles/mapbox/streets-v11",
                attributionControl: false,
                bounds: [[response.data.points.sw.lng, response.data.points.sw.lat], [response.data.points.ne.lng, response.data.points.ne.lat]],
                zoom: zoom,
              });

              canvas = map.current.getCanvasContainer();

              map.current.on("load", () => {
                map.current?.loadImage(
                  "https://broccolihot.z16.web.core.windows.net/markers/error.png",
                  (error, image) => {
                    if (error) throw error;

                    map.current?.addImage(
                      "error-marker",
                      image as HTMLImageElement | ImageBitmap,
                      {
                        pixelRatio: 1.2
                      }
                    );

                    map.current?.loadImage(
                      "https://broccolihot.z16.web.core.windows.net/markers/start.png",
                      (error, image) => {
                        if (error) throw error;

                        map.current?.addImage(
                          "start-marker",
                          image as HTMLImageElement | ImageBitmap,
                          {
                            pixelRatio: 1.2
                          }
                        );

                        map.current?.loadImage(
                          "https://broccolihot.z16.web.core.windows.net/markers/end.png",
                          (error, image) => {
                            if (error) throw error;

                            map.current?.addImage(
                              "end-marker",
                              image as HTMLImageElement | ImageBitmap,
                              {
                                pixelRatio: 1.2
                              }
                            );

                            map.current?.loadImage(
                              "https://broccolihot.z16.web.core.windows.net/markers/" +
                                response.data.color +
                                ".png",
                              (_error, _image) => {
                                if (_error) throw _error;

                                map.current?.addImage(
                                  response.data.color + "-marker",
                                  _image as HTMLImageElement | ImageBitmap,
                                  {
                                    pixelRatio: 2
                                  }
                                );

                                map.current?.addLayer({
                                  id: "route",
                                  type: "line",
                                  source: "lines",
                                  layout: {
                                    "line-join": "round",
                                    "line-cap": "round",
                                  },
                                  paint: {
                                    "line-color": "#" + response.data.color,
                                    "line-width": 1,
                                  },
                                  filter: ["==", "$type", "LineString"],
                                });

                                // Add a symbol layer
                                map.current?.addLayer({
                                  id: "points",
                                  type: "symbol",
                                  source: "points",
                                  layout: {
                                    "icon-allow-overlap": true,
                                    "icon-ignore-placement": true,
                                    "icon-offset": [0, -11],
                                    "icon-image":
                                      response.data.color + "-marker",
                                    // get the title name from the source's "title" property
                                    "text-field": ["get", "order"],
                                    "text-font": ["Open Sans Bold"],
                                    "text-offset": [0, -1.8],
                                    "text-anchor": "top",
                                    "text-size": 10
                                  },
                                  filter: ["==", "t", "N"],
                                  paint: {
                                    "text-color": "rgb(255, 255, 255)",
                                  },
                                });

                                map.current?.addLayer({
                                  id: "pointsError",
                                  type: "symbol",
                                  source: "points",
                                  layout: {
                                    "icon-allow-overlap": true,
                                    "icon-ignore-placement": true,
                                    "icon-offset": [0, -11],
                                    "icon-image": "error-marker",
                                    // get the title name from the source's "title" property
                                    "text-font": ["Open Sans Bold"],
                                    "text-offset": [0, -1.8],
                                    "text-anchor": "top",
                                  },
                                  filter: ["==", "t", "E"],
                                  paint: {
                                    "text-color": "rgb(255, 255, 255)",
                                  },
                                });

                                map.current?.addLayer({
                                  id: "start",
                                  type: "symbol",
                                  source: "points",
                                  layout: {
                                    "icon-allow-overlap": true,
                                    "icon-ignore-placement": true,
                                    "icon-offset": [0, -11],
                                    "icon-image": "start-marker",
                                    // get the title name from the source's "title" property
                                    "text-font": ["Open Sans Bold"],
                                    "text-offset": [0, -1.8],
                                    "text-anchor": "top",
                                  },
                                  filter: ["==", "t", "S"],
                                  paint: {
                                    "text-color": "rgb(255, 255, 255)",
                                  },
                                });

                                map.current?.addLayer({
                                  id: "end",
                                  type: "symbol",
                                  source: "points",
                                  layout: {
                                    "icon-allow-overlap": true,
                                    "icon-ignore-placement": true,
                                    "icon-offset": [0, -20],
                                    "icon-image": "end-marker",
                                    // get the title name from the source's "title" property
                                    "text-font": ["Open Sans Bold"],
                                    "text-offset": [0, -2],
                                    "text-anchor": "top",
                                  },
                                  filter: ["==", "t", "L"],
                                  paint: {
                                    "text-color": "rgb(255, 255, 255)",
                                  },
                                });

                                map.current?.on(
                                  "click",
                                  ["points", "pointsError", "start", "end"],
                                  (e: any) => {

                                    console.log(e.features[0].properties)

                                    // Copy coordinates array.
                                    const coordinates =
                                      e.features[0].geometry.coordinates.slice();
                                    // const description =
                                    //   "<div>" +
                                    //   "<div><strong>Adres</strong></div>" +
                                    //   "<div>" +
                                    //   e.features[0].properties.address1 +
                                    //   "</div><div class='mb-1'>" +
                                    //   e.features[0].properties.address2 +
                                    //   "</div>" +
                                    //   "<div><strong>Telefon</strong></div>" +
                                    //   "<div class='mb-1'>" + e.features[0].properties.phone + "</div>" +
                                    //   "<div><strong>Diety</strong></div>" +
                                    //   "<div>" + e.features[0].properties.diets?.split(";").join("</br>") + "</div>" +
                                    //   "</div>";

                                    // const description =
                                    //   "<div>" +
                                    //   "<div><strong>Adres</strong></div>" +
                                    //   "<div>" +
                                    //   e.features[0].properties.address1 +
                                    //   "</div>" +
                                    //   "</div>";

                                    // Ensure that if the map is zoomed out such that multiple
                                    // copies of the feature are visible, the popup appears
                                    // over the copy being pointed to.
                                    // while (
                                    //   Math.abs(e.lngLat.lng - coordinates[0]) >
                                    //   180
                                    // ) {
                                    //   coordinates[0] +=
                                    //     e.lngLat.lng > coordinates[0]
                                    //       ? 360
                                    //       : -360;
                                    // }

                                    if (map.current) {

                                      let timoutValue = 0;

                                      console.log(modal)

                                      if(!modal.current?.isOpen)
                                      {
                                        // setIsModalOpen(false);
                                        // modal.current?.dismiss();
                                        // timoutValue = 400;
                                        setIsModalOpen(true);
                                        openModal();
                                      }
                                      // else
                                      // {
                                        
                                      // }

                                      

                                      if (map.current) {

                                        setPopupAddress({
                                          address1: e.features[0].properties.address1,
                                          address2: e.features[0].properties.address2,
                                          order: e.features[0].properties.order,
                                        });
  
                                        if(state.route)
                                        {


                                          const itemModalIndex = state.route.findIndex(k => k.street + " " + k.houseNumber == e.features[0].properties.address1 && k.postCode + " " + k.city == e.features[0].properties.address2);
  
                                          if(itemModalIndex >= 0)
                                          {
                                            setItemModalInfo(state.route[itemModalIndex]);
  
                                            
  
                                          }
  
                                        }

                                      }

                                      // if(!modal.current?.isOpen)
                                      // {
                                      //   setTimeout(() => {
                                        
                                      //     if (map.current) {
      
                                      //       setIsModalOpen(true);
                                      //       openModal();
  
                                      //     }
  
                                      //   }, timoutValue);
  
                                      // }
                                     

                                      // new mapboxgl.Popup()
                                      //   .setOffset([0, -16])
                                      //   .setLngLat(coordinates)
                                      //   .setHTML(description)
                                      //   .addTo(map.current);
                                    }
                                  }
                                );

                              

                       
                              }
                            );

                            map.current?.addSource("lines", {
                              type: "geojson",
                              data: JSON.parse(response.data.geoJSONMain),
                            });

                            map.current?.addSource("points", {
                              type: "geojson",
                              data: JSON.parse(response.data.geoJSONStops),
                            });

                          }
                        );
                      }
                    );
                  }
                );
              });
            }
          })
          .finally(() => {});
      }
    }, 50);
  }, []);

  const { state, setState } = useGlobalState();

  const [itemModalInfo, setItemModalInfo] = useState<RouteProps | undefined>();
  const [phoneNumber, setPhoneNumber] = useState<string>("");

  const [presentPhoneNumber, dismissPhoneNumber] = useIonPopover(PhonePopover, {
    onHide: () => dismissPhoneNumber(),
    phoneNumber: phoneNumber,
  });

  const [assignedImage, setAssignedImage] = useState<string | undefined>();

  const [showOrderPhoto, setShowOrderPhoto] = useState(false);
  const [presentLoading, dismissLoading] = useIonLoading();

  const [archivedImages, setArchivedImages] = useState<string[]>([]);

  const [presentAlert] = useIonAlert();

  const location = useLocation();
  const nav = useHistory();

  useEffect(() => {
    if (!location.search.includes("modalOpened=true")) {
      setIsModalOpen(false);
    }
  }, [location]);

  const openModal = () => {
    if (!document.location.href.includes("modalOpened=true")) {
      nav.push(nav.location.pathname + "?modalOpened=true");
    }
  };

  useIonViewWillLeave(() => {



    setIsModalOpen(false);

    if(modal.current)
    {
      modal.current.dismiss();
    }

  })

  return (
    <IonPage className="container">
      <IonHeader collapse="fade" translucent={isPlatform("mobile")} mode={"md"}>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton
              slot="start"
              onClick={() =>
                {

                  if(modal.current)
                  {
                    setIsModalOpen(false);
                    modal.current.dismiss();
                  }

                  (
                    document.querySelector("#mainMenu") as
                      | HTMLIonMenuElement
                      | undefined
                  )?.setOpen(true)

                }
              }
            >
              <IonIcon slot="icon-only" icon={reorderFourOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

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

      <IonModal
        className="map-modal"
        mode="md"
        ref={modal}
        trigger="open-modal"
        isOpen={isModalOpen}
        initialBreakpoint={0.12}
        breakpoints={[0.12, 0.4, 1]}
        backdropDismiss={false}
        //showBackdrop={false}
        backdropBreakpoint={0.12}
        onIonModalDidDismiss={() => {
          setIsModalOpen(false);
        }}
      >
        <IonContent className="ion-padding" style={{
          "--padding-start": "5px",
          "--padding-end": "5px",
          "--padding-top": "10px"
        }} >
        <IonRow>
                <IonCol size="2">
                  <MapMarker width={55} number={popupAddress?.order} />
                </IonCol>
                <IonCol size="10">
                  <IonRow>
                    <IonCol
                      size="12"
                      style={{
                        paddingBottom: "0px",
                        textTransform: "capitalize",
                      }}
                    >
                      {popupAddress?.address1}
                    </IonCol>
                    <IonCol
                      size="12"
                      style={{
                        textTransform: "capitalize",
                      }}
                    >
                      {popupAddress?.address2}
                    </IonCol>
                  </IonRow>
                </IonCol>
              </IonRow>

          {/* <IonRow
            style={{
              marginTop: "20px",
            }}
          > */}
            {/* <IonCol size="12">
              <IonButton
                color="primary"
                expand="full"
                onClick={() => {
                  presentAlert({
                    backdropDismiss: false,
                    header: "Wybierz powód",
                    cssClass: "alert-width-95",
                    buttons: [
                      {
                        text: "Anuluj",
                        role: "cancel",
                      },
                      {
                        text: "Wyślij",
                      },
                    ],
                    inputs: [
                      {
                        label: "Błędna geolokalizacja",
                        type: "radio",
                        value: "1",
                      },
                      {
                        label: "Literówka w adresie",
                        type: "radio",
                        value: "2",
                      },
                      {
                        label: "Zła ulica",
                        type: "radio",
                        value: "3",
                      },
                      {
                        label: "Zły kod pocztowy",
                        type: "radio",
                        value: "4",
                      },
                    ],
                  });
                }}
              >
                Prośba o edycję punktu
              </IonButton>
            </IonCol> */}
            {/* <IonCol size="12">
              <IonButton
                color="primary"
                expand="full"
                onClick={() => {
                  presentAlert({
                    backdropDismiss: false,
                    cssClass: "alert-width-95",
                    buttons: [
                      {
                        text: "Anuluj",
                        role: "cancel",
                      },
                      {
                        text: "Wyślij",
                        handler(value) {
                          
                          if(value[0])
                          {

                            presentLoading();

                            api.post("ticket/description", {
                              description: value[0],
                              addressId: itemModalInfo?.id
                            }).catch(() => {

                              setTimeout(() => {
                                presentAlert({
                                  message: "Nie udało się przesłać zapytania",
                                  header: "Wystąpił błąd",
                                  buttons: ["Zamknij"]
                                });
                              }, 500);

                            }).finally(() => {

                              dismissLoading();

                            })

                          }
                          else
                          {

                            setTimeout(() => {
                              presentAlert({
                                message: "Nie wprowadzono opisu",
                                header: "Wystąpił błąd",
                                buttons: ["Zamknij"]
                              });
                            }, 500);

                          }

                          

                        },
                      },
                    ],
                    inputs: [
                      {
                        placeholder: "Wpisz co należy poprawić w opisie",
                        type: "textarea",
                      },
                    ],
                  });
                }}
              >
                Prośba o poprawę opisu
              </IonButton>
            </IonCol>
          </IonRow> */}

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
              <div
                style={{
                  fontWeight: 500,
                  textAlign: "center",
                  letterSpacing: "1px",
                  marginTop: "5px",
                  marginBottom: "5px",
                }}
              >
                {itemModalInfo?.comment}
              </div>
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

          {/* <IonListHeader style={{ fontWeight: 700 }}>SMS</IonListHeader>
          <IonItem lines="none">
            <IonButton
              style={{
                width: "100%",
                height: "45px",
                "font-size": "16px",
                margin: "15px 0",
              }}
              expand="block"
              onClick={async (e) => {
                presentAlert({
                  mode: "ios",

                  cssClass: "missing-qr-alert",
                  header: "Czy wysłać sms o dostarczonej dostawie do klienta?",
                  message: `Adres: ${itemModalInfo?.street} ${itemModalInfo?.houseNumber}\nNumer: ${itemModalInfo?.phone}`,
                  buttons: [
                    "Anuluj",
                    {
                      text: "Wyślij",
                      handler: async () => {

                        if(itemModalInfo?.phone)
                        {
                          
                          try {
                          
                            
  
                            
  
                          } catch (error) {
                            
                          }

                        }

                        

                        

                      },
                    },
                  ],
                  onDidDismiss: (e) => console.log("did dismiss"),
                });
              }}
            >
              Wyślij sms do klienta
            </IonButton>
          </IonItem> */}

          {itemModalInfo?.image ? (
            <IonButton
              expand="full"
              style={{ margin: "15px 10px 10px" }}
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

          <IonButton
            fill="clear"
            expand="full"
            style={{ margin: "15px 10px 10px" }}
            onClick={() => {
              presentLoading("Pobieranie zdjęć");

              api
                .get("routes/" + itemModalInfo?.id + "/archived-images")
                .then((response) => {
                  const data = response.data as string[];

                  if (data.length > 0) {
                    setArchivedImages(data);
                  }
                })
                .finally(() => {
                  dismissLoading();
                });
            }}
          >
            archiwum zdjęć
            <IonIcon slot="end" icon={chevronDownOutline} />
          </IonButton>
          <IonRow>
            {archivedImages.map((_image) => {
              return (
                <IonCol size="6">
                  <IonImg
                    src={_image}
                    onClick={() => {
                      setAssignedImage(_image);
                      setShowOrderPhoto(true);
                    }}
                  />
                </IonCol>
              );
            })}
          </IonRow>
        </IonContent>
      </IonModal>

      <IonContent fullscreen={true} className={"background-lightgrey"}>
        <div
          ref={mapContainer}
          className="map-container"
          style={{ height: "calc( 100vh - 56px )", width: "100vw" }}
        />
      </IonContent>
    </IonPage>
  );
};

export default Map;
