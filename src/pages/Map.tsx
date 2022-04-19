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

import mapboxgl, { GeoJSONSource, GeoJSONSourceRaw } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

const Map: React.FC = () => {

  const [_lng, _setLng] = useState(20.7810167);
  const [_lat, _setLat] = useState(52.2326063);

  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [zoom, setZoom] = useState(6);

  const geojsonLines = useRef<any>({});
  const geojsonPoints = useRef<any>({});
  let canvas: HTMLElement;



  useEffect(() => {
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
              "https://broccoli.z16.web.core.windows.net/MAPBOX_TOKEN.txt?stamp=" +
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
                  "https://broccoli.z16.web.core.windows.net/markers/error.png",
                  (error, image) => {
                    if (error) throw error;

                    map.current?.addImage(
                      "error-marker",
                      image as HTMLImageElement | ImageBitmap
                    );

                    map.current?.loadImage(
                      "https://broccoli.z16.web.core.windows.net/markers/start.png",
                      (error, image) => {
                        if (error) throw error;

                        map.current?.addImage(
                          "start-marker",
                          image as HTMLImageElement | ImageBitmap
                        );

                        map.current?.loadImage(
                          "https://broccoli.z16.web.core.windows.net/markers/end.png",
                          (error, image) => {
                            if (error) throw error;

                            map.current?.addImage(
                              "end-marker",
                              image as HTMLImageElement | ImageBitmap
                            );

                            map.current?.loadImage(
                              "https://broccoli.z16.web.core.windows.net/markers/" +
                                response.data.color +
                                ".png",
                              (_error, _image) => {
                                if (_error) throw _error;

                                map.current?.addImage(
                                  response.data.color + "-marker",
                                  _image as HTMLImageElement | ImageBitmap
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
                                    "line-width": 5,
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
                                    "icon-offset": [0, -20],
                                    "icon-image":
                                      response.data.color + "-marker",
                                    // get the title name from the source's "title" property
                                    "text-field": ["get", "order"],
                                    "text-font": ["Open Sans Bold"],
                                    "text-offset": [0, -2],
                                    "text-anchor": "top",
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
                                    "icon-offset": [0, -20],
                                    "icon-image": "error-marker",
                                    // get the title name from the source's "title" property
                                    "text-font": ["Open Sans Bold"],
                                    "text-offset": [0, -2],
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
                                    "icon-offset": [0, -20],
                                    "icon-image": "start-marker",
                                    // get the title name from the source's "title" property
                                    "text-font": ["Open Sans Bold"],
                                    "text-offset": [0, -2],
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
                                    const description =
                                      "<div>" +
                                      "<div><strong>Adres</strong></div>" +
                                      "<div>" +
                                      e.features[0].properties.address1 +
                                      "</div><div class='mb-1'>" +
                                      e.features[0].properties.address2 +
                                      "</div>" +
                                      "<div><strong>Telefon</strong></div>" +
                                      "<div class='mb-1'>" + e.features[0].properties.phone + "</div>" +
                                      "<div><strong>Diety</strong></div>" +
                                      "<div>" + e.features[0].properties.diets?.split(";").join("</br>") + "</div>" +
                                      "</div>";

                                    // Ensure that if the map is zoomed out such that multiple
                                    // copies of the feature are visible, the popup appears
                                    // over the copy being pointed to.
                                    while (
                                      Math.abs(e.lngLat.lng - coordinates[0]) >
                                      180
                                    ) {
                                      coordinates[0] +=
                                        e.lngLat.lng > coordinates[0]
                                          ? 360
                                          : -360;
                                    }

                                    if (map.current) {
                                      new mapboxgl.Popup()
                                        .setOffset([0, -33])
                                        .setLngLat(coordinates)
                                        .setHTML(description)
                                        .addTo(map.current);
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
    }, 250);
  }, []);



  return (
    <IonPage className="container">
      
      <IonHeader
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
         
        </IonToolbar>
      </IonHeader>
      
      <IonContent
        fullscreen={true}
        className={"background-lightgrey"}
      >
        

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
