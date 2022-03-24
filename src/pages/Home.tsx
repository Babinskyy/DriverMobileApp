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
import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
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
} from "../components/Types";
import ThreeDotsPopover from "../components/ThreeDotsPopover";
import { RouterProps } from "react-router";

const Home: React.FC = () => {
  const { navigate } = useContext(NavContext);

  const headerRef = useRef<HTMLIonHeaderElement>(null);

  const [headerScrollTop, setHeaderScrollTop] = useState(0);

  const [headerTop, setHeaderTop] = useState(0);

  const [disabled, setDisabled] = useState(true);

  const [address, setAddress] = useState("");

  const [phoneNumber, setPhoneNumber] = useState<string>("");

  const [showOrderInfoModal, setShowOrderInfoModal] = useState(false);

  const [showOrderPhoto, setShowOrderPhoto] = useState(false);
  const [assignedImage, setAssignedImage] = useState<string | undefined>();

  const contentRef = useRef<HTMLIonContentElement>(null);

  const [loadingList, setLoadingList] = useState(false);

  const [scanning, setScanning] = useState(false);

  const [choosedItem, setChoosedItem] = useState<RouteProps | undefined>();

  const [itemModalInfo, setItemModalInfo] = useState<RouteProps | undefined>();

  const [items, setItems] = useState<RouteProps[]>([]);

  const [itemsStatic, setItemsStatic] = useState<RouteProps[] | undefined>([]);
  const [rotate, setRotate] = useState<boolean>(false);

  // const items = useMemo<RouteProps[]>(() => items as RouteProps[], [items]);

  const [isScrolling, setIsScrolling] = useState(false);

  const [presentAlert] = useIonAlert();

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
      //await assignRouteFromStorageToState();

      api.get("routes/").then(async (response) => {
        let route = response.data as RouteProps[];

        route = route.filter((e) => {
          return e.packagesCompleted && e.image;
        });

        setItems(route);
        setItemsStatic(route);

        // setLoadingList(false);
      });
    },
    showUndelivered: async () => {
      //await assignRouteFromStorageToState();

      api.get("routes/").then(async (response) => {
        let route = response.data as RouteProps[];

        route = route.filter((e) => {
          return !(e.packagesCompleted && e.image);
        });

        await setRoute(JSON.stringify(route));
        const { value } = await Storage.get({ key: "Route" });

        if (value) {
          const routeCollection = JSON.parse(value) as RouteProps[];
        }

        setItems(route);
        setItemsStatic(route);

        // setLoadingList(false);
      });
    },
  });

  useEffect(() => {
    if (headerRef.current) {
      headerRef.current.style.willChange = "transform";
      headerRef.current.style.transition = "transform ease-in-out 150ms";
    }
  }, []);

  useEffect(() => {
    const getUser = async () => {
      const user = (await auth.getCurrentUser()) as User | undefined;

      if (!user) {
        navigate("/login", "root", "replace");
      }
    };

    getUser();
  }, []);

  useIonViewWillEnter(() => {
    api.get("diets").then(async (response) => {
      const diets = response.data as DietsProps[];
      await setDiets(JSON.stringify(diets));
    });
  });

  useIonViewDidEnter(async () => {
    api.get("routes/").then(async (response) => {
      let route = response.data as RouteProps[];

      route = route.filter((e) => {
        return !(e.packagesCompleted && e.image);
      });

      await setRoute(JSON.stringify(route));
      const { value } = await Storage.get({ key: "Route" });

      if (value) {
        const routeCollection = JSON.parse(value) as RouteProps[];
      }

      setItems(route);
      setItemsStatic(route);

      // setLoadingList(false);
    });
  });

  useIonViewWillEnter(async () => {
    await assignRouteFromStorageToState();
  });

  useIonViewWillLeave(() => {
    if (headerRef.current) {
      headerRef.current.style.transform = "translate3d(0, 0, 0)";
    }
    setHeaderTop(0);
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
  const setRoute = async (value: string) => {
    await Storage.set({
      key: "Route",
      value: value,
    });
  };

  const assignRouteFromStorageToState = async () => {
    const { value } = await Storage.get({ key: "Route" });

    if (value) {
      let routeCollection = JSON.parse(value) as RouteProps[];

      // routeCollection = routeCollection.filter((e) => {
      //   return e.packagesCompleted && e.image;
      // });

      setItems(routeCollection);
      setItemsStatic(routeCollection);
      // setLoadingList(false);
    }
  };

  const filterItems = (searchText: string) => {
    if (searchText.length > 0) {
      const tempItems = itemsStatic?.filter((e) => {
        return (
          e.packages.some((_e) => {
            return _e.name.toLowerCase().includes(searchText.toLowerCase());
          }) || e.street.toLowerCase().includes(searchText.toLowerCase())
        );
      });
      if (tempItems) {
        setItems(tempItems);
      }
    } else {
      if (itemsStatic) {
        setItems(itemsStatic);
      }
    }
  };

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

    await BarcodeScanner.startScanning(
      { targetedFormats: [SupportedFormat.QR_CODE] },
      async (result) => {
        if (result.hasContent) {
          try {
            const codes = result.content?.split("|")[1];

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

                    const tempChoosedItemRet = tempChoosedItem?.packages.find(
                      (_e) => e.id == _e.code && !_e.scanned
                    );

                    if (tempChoosedItemRet) {
                      tempChoosedItem.packages.map((_e) => {
                        if (_e.id == tempChoosedItemRet.id) {
                          _e.scanned = true;
                        }
                      });

                      api
                        .patch(
                          "routes/addresses/packages/" + tempChoosedItemRet.id,
                          {
                            isScanned: true,
                            confirmationString: result.content,
                          }
                        )
                        .then(async (response) => {});
                    }

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

  // Item contents are cached properly with React.memo
  const InnerItem = React.memo<InnerItemProps>(({ i }) => {
    React.useEffect(() => {
      console.log("inner mounting", i);
      return () => {
        console.log("inner unmounting", i);
      };
    }, [i]);
    return (
      <div
        key={i}
        // style={{ height: "114px" }}
        className="item-container"
        // disabled={e?.packages?.every((_e) => {
        //   return _e.scanned;
        // })}
        // lines="full"
      >
        <div className="counter">
          {i + 1}/{items.length}
        </div>
        <IonLabel>
          <div style={{ display: "flex" }}>
            <IonIcon
              className="icon-scan"
              color="primary"
              slot="start"
              icon={items[i].image ? cameraOutline : barcodeOutline}
              onClick={(event) => {
                if (
                  items[i].packages?.every((_e) => {
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
                if (items) {
                  setShowOrderInfoModal(true);
                  setItemModalInfo(items[i]);
                }
              }}
            >
              <h4 className="address capitalize">{`${items[i].street} ${items[i].houseNumber}`}</h4>
              <p className="capitalize">{`${items[i].postCode} ${items[i].city}`}</p>
            </IonLabel>
            <IonIcon
              className="icon-navigation"
              color="primary"
              slot="end"
              icon={navigateOutline}
              onClick={(event) => {
                setAddress(`${items[i].street} ${items[i].houseNumber}`);
                present({
                  event: event.nativeEvent,
                  reference: "event",
                });
              }}
            />
          </div>
          {items[i].packages.map((_e) => {
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
  });

  const itemContent = (index: number) => {
    console.log("providing content", index);
    return <InnerItem i={index} />;
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

          <IonItem>
            <IonLabel
              className="wrap"
              style={{ fontSize: "20px", fontWeight: 300 }}
            >
              <span style={{ fontWeight: 400 }}>{itemModalInfo?.comment}</span>
              <br />
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
              style={{ margin: "0 10px" }}
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
            onIonChange={(e) => filterItems(e.detail.value!)}
          ></IonSearchbar>
          <IonButtons slot="end">
            <IonButton
              className={rotate ? "rotated" : ""}
              onClick={() => {
                setRotate(!rotate);
                window.location.reload();
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
        <div>
          {/* <IonList className="list-order">
          {items?.slice(0, loadItemsCount).map((e, i) => {
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
              </IonItem>
            );
          })}
        </IonList>
        <IonInfiniteScroll
          onIonInfinite={loadData}
          threshold="200px"
          disabled={isInfiniteDisabled}
        >
          <IonInfiniteScrollContent
            loadingSpinner="bubbles"
            loadingText="Loading more data..."
          ></IonInfiniteScrollContent>
        </IonInfiniteScroll> */}
        </div>

        {loadingList ? (
          <IonLoading isOpen={loadingList} />
        ) : (
          <IonList className="list-order">
            {items.map((e, i) => {
              return (
                <div key={e.id} className="item-container" data-toscroll={e.id}>
                  <div className="counter">
                    {i + 1}/{items.length}
                  </div>
                  <IonLabel>
                    <div style={{ display: "flex" }}>
                      <IonIcon
                        className="icon-scan"
                        color={
                          items[i].image
                            ? "secondary"
                            : items[i].packagesCompleted
                            ? "tertiary"
                            : "primary"
                        }
                        slot="start"
                        icon={
                          items[i].image
                            ? syncOutline
                            : items[i].packagesCompleted
                            ? cameraOutline
                            : barcodeOutline
                        }
                        onClick={async (event) => {
                          if (
                            items[i].packages?.every((_e) => {
                              return _e.scanned;
                            }) &&
                            !items[i].image
                          ) {
                            const image = await Camera.getPhoto({
                              quality: 75,
                              allowEditing: false,
                              resultType: CameraResultType.Base64,
                              source: CameraSource.Camera,
                            });

                            let imageUrl = image.base64String;

                            api
                              .post(
                                "routes/addresses/" + items[i].id + "/image",
                                {
                                  image: imageUrl,
                                }
                              )
                              .then((response) => {
                                console.log(response);
                              });
                          } else if (items[i].image) {
                            presentAlert({
                              mode: "ios",
                              cssClass: "missing-qr-alert",
                              header:
                                "Czy na pewno chcesz cofnąć dostarczenie adresu?",
                              subHeader: "Wybrany adres:",
                              message:
                                items[i].street + " " + items[i].houseNumber,
                              buttons: [
                                "Anuluj",
                                {
                                  text: "Cofnij",
                                  handler: async () => {
                                    let tempItems = items;

                                    tempItems[i].packagesCompleted = false;
                                    tempItems[i].image = undefined;
                                    tempItems[i].packages.map((e) => {
                                      e.scanned = false;
                                    });

                                    await setRoute(JSON.stringify(tempItems));

                                    let newItems: RouteProps[] = [];

                                    tempItems.map((e) => {
                                      if (e.id !== items[i].id) {
                                        newItems.push(e);
                                      }
                                    });

                                    setItems([]);
                                    setItemsStatic([]);

                                    setItems(newItems);
                                    setItemsStatic(newItems);
                                  },
                                },
                              ],
                              onDidDismiss: (e) => console.log("did dismiss"),
                            });
                          } else if (
                            !items[i].packages?.every((_e) => {
                              return _e.scanned;
                            }) &&
                            !items[i].image
                          ) {
                            let _message = "";

                            const element = items.find((x) => {
                              return (
                                x.packages.some((y) => {
                                  return y.scanned;
                                }) && !x.image
                              );
                            });

                            if (element) {
                              _message =
                                element.street + " " + element.houseNumber;
                            }

                            presentAlert({
                              mode: "ios",
                              cssClass: "missing-qr-alert",
                              header:
                                "Dokończ inny rozpoczęty adres przed skanowaniem",
                              subHeader: "Adres do zakończenia:",
                              message: _message,
                              buttons: [
                                "Anuluj",
                                {
                                  text: "Zobacz",
                                  handler: () => {
                                    if (contentRef.current && element) {
                                      const addressElement =
                                        document.querySelector(
                                          "[data-toscroll='" + element.id + "']"
                                        ) as Element | undefined;

                                      if (addressElement) {
                                        // const addressElementBounds = addressElement.getBoundingClientRect();
                                        // contentRef.current.scrollIntoView(0, addressElementBounds.top, 1000);
                                        addressElement.scrollIntoView({
                                          block: "center",
                                          behavior: "smooth",
                                          inline: "center",
                                        });
                                      }
                                    }
                                  },
                                },
                              ],
                              onDidDismiss: (e) => console.log("did dismiss"),
                            });
                          } else {
                            const tempItems = items;
                            const isCameraWaiting = tempItems.some((e) => {
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
                              startScan(i);
                            }
                          }
                        }}
                      />

                      <IonLabel
                        className="wrap"
                        onClick={() => {
                          if (items) {
                            setShowOrderInfoModal(true);
                            setItemModalInfo(items[i]);
                          }
                        }}
                      >
                        <h4 className="address capitalize">{`${items[i].street} ${items[i].houseNumber}`}</h4>
                        <p className="capitalize">{`${items[i].postCode} ${items[i].city}`}</p>
                      </IonLabel>
                      <IonIcon
                        className="icon-navigation"
                        color="primary"
                        slot="end"
                        icon={navigateOutline}
                        onClick={(event) => {
                          setAddress(
                            `${items[i].street} ${items[i].houseNumber}`
                          );
                          present({
                            event: event.nativeEvent,
                          });
                        }}
                      />
                    </div>
                    {items[i].packages.map((_e) => {
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
        )}
      </IonContent>
      {scanning ? (
        <></>
      ) : (
        <IonFooter>
          <IonItem>
            <IonLabel slot="end">
              {
                items?.filter((e) => {
                  return e.packages?.every((_e) => {
                    return _e.scanned;
                  });
                }).length
              }
              /{items?.length}
            </IonLabel>
          </IonItem>
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
                stopScan();
                setScanning(false);

                const image = await Camera.getPhoto({
                  quality: 75,
                  allowEditing: false,
                  resultType: CameraResultType.Base64,
                  source: CameraSource.Camera,
                });

                let imageUrl = image.base64String;

                api
                  .post("routes/addresses/" + choosedItem.id + "/image", {
                    image: imageUrl,
                  })
                  .then((response) => {
                    console.log(response);
                  });
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
                              handler: async (e) => {
                                const image = await Camera.getPhoto({
                                  quality: 75,
                                  allowEditing: false,
                                  resultType: CameraResultType.Base64,
                                  source: CameraSource.Camera,
                                });

                                let imageUrl = image.base64String;

                                api
                                  .post(
                                    "routes/addresses/packages/" +
                                      _e.id +
                                      "/image",
                                    {
                                      image: imageUrl,
                                    }
                                  )
                                  .then((response) => {
                                    console.log(response);
                                  });

                                let tempItems = items;
                                let tempChoosedItem = choosedItem;

                                let scannedAddress: RouteProps | undefined =
                                  undefined;

                                tempItems.map((x) => {
                                  x.packages.map((_x) => {
                                    if (_x.id == _e.id) {
                                      _x.scanned = true;
                                      scannedAddress = x;
                                    }
                                  });
                                });

                                if (scannedAddress) {
                                  const _scannedAddress: RouteProps =
                                    scannedAddress;

                                  if (
                                    _scannedAddress.packages.every((x) => {
                                      return x.scanned;
                                    })
                                  ) {
                                    tempItems.map((x) => {
                                      if (x.id == _scannedAddress.id) {
                                        x.packagesCompleted = true;
                                      }
                                    });
                                  }
                                }

                                tempChoosedItem.packages.map((x) => {
                                  if (x.id == _e.id) {
                                    x.scanned = true;
                                  }
                                });

                                setItems(tempItems);
                                setChoosedItem(undefined);
                                setChoosedItem(tempChoosedItem);
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
