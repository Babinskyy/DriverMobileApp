import { SetStateAction, useEffect } from "react";
import {
  ImageProps,
  OfflineRequestProps,
  RouteProps,
} from "../components/Types";
import { Storage } from "@capacitor/storage";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
import {
  Filesystem,
  Directory,
  Encoding,
  ReadFileResult,
} from "@capacitor/filesystem";
import { isPlatform } from "@ionic/core";
import { Method } from "axios";
import api from "./../services/api";
import auth from "./../services/auth.service";
import { v4 as uuidv4 } from "uuid";

import Compressor from "compressorjs";

import {
  GlobalStateProvider,
  useGlobalState,
  GlobalStateInterface,
} from "./../GlobalStateProvider";
import { useIonLoading } from "@ionic/react";
import { Network } from "@capacitor/network";

export const GetPhoto = async (id: string = "") => {
  if (isPlatform("mobileweb") || isPlatform("desktop")) {
    const image = await Camera.getPhoto({
      quality: 75,
      allowEditing: false,
      resultType: CameraResultType.Base64,
      source: CameraSource.Camera,
    });

    return {
      webPath: "data:image/png;base64, " + image.base64String,
      base64: image.base64String,
    } as ImageProps;
  } else {
    const image = await Camera.getPhoto({
      quality: 75,
      allowEditing: false,
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
    });

    let imageBase64: ReadFileResult | undefined = undefined;

    if (image.path) {
      imageBase64 = await Filesystem.readFile({
        path: image.path,
      });

      if (imageBase64?.data) {
        const fileName =
          id == ""
            ? new Date().getTime() + ".jpg"
            : id + "--" + new Date().getTime() + ".jpg";
        const savedFile = await Filesystem.writeFile({
          path: fileName,
          data: imageBase64.data,
          directory: Directory.Data,
        });
      }
    }

    return {
      webPath: image.webPath,
      base64: imageBase64?.data,
    };
  }
};

export const RefreshRoute = async (
  route: RouteProps[],
  routeType: "undelivered" | "delivered",
  setItems: (value: React.SetStateAction<RouteProps[]>) => void,
  setItemsStatic: (value: React.SetStateAction<RouteProps[]>) => void,
  setFooterItem: (value: React.SetStateAction<RouteProps | undefined>) => void,
  footerItem: RouteProps | undefined,
  saveToStorage: boolean = false
) => {
  let _route: RouteProps[] = [];

  if (routeType == "delivered") {
    _route = route.filter((e) => {
      return e.packagesCompleted && e.image;
    });
    _route.sort((a, b) => {
      return b.order - a.order;
    });
  } else if (routeType == "undelivered") {
    _route = route.filter((e) => {
      return !(e.packagesCompleted && e.image);
    });
  }

  if (saveToStorage) {
    await Storage.set({
      key: "Route",
      value: JSON.stringify(route),
    });
    // await Storage.set({
    //     key: "RouteDelivered",
    //     value: JSON.stringify(routeDelivered),
    // });
  }

  const foundItem = route.find((x) => {
    return (
      x.packages.some((y) => {
        return y.scanned;
      }) && !x.image
    );
  });

  if (foundItem && routeType == "undelivered") {
    if (foundItem.id != footerItem?.id) {
      setFooterItem(undefined);
      setFooterItem(foundItem);
    }
  } else {
    setFooterItem(undefined);
  }

  if (routeType == "undelivered") {
    setItems(_route);
    setItemsStatic(_route);
  } else if (routeType == "delivered") {
    setItems(_route);
    setItemsStatic(_route);
  }
};

export const UpdateRouteElement = async (
  route: RouteProps[] | undefined,
  item: RouteProps,
  routeType: "undelivered" | "delivered",
  setItems: (value: React.SetStateAction<RouteProps[]>) => void,
  setItemsStatic: (value: React.SetStateAction<RouteProps[]>) => void,
  setFooterItem: (value: React.SetStateAction<RouteProps | undefined>) => void,
  footerItem: RouteProps | undefined,
  saveToStorage: boolean = false
) => {
  const { value } = await Storage.get({ key: "Route" });

  if (!value) {
    return;
  }

  const tempRoute = route ? [...route] : (JSON.parse(value) as RouteProps[]);

  const tempRouteIndex = tempRoute.findIndex((e) => {
    return e.id == item.id;
  });

  tempRoute[tempRouteIndex] = { ...item };

  RefreshRoute(
    tempRoute,
    routeType,
    setItems,
    setItemsStatic,
    setFooterItem,
    footerItem,
    saveToStorage
  );
};

export const AddOfflineRequest = async (
  url: string,
  method: Method,
  body: any
) => {
  const { value } = await Storage.get({ key: "OfflineRequests" });

  let offlineRequests: OfflineRequestProps[] = [];

  try {
    if (value) {
      offlineRequests = JSON.parse(value) as OfflineRequestProps[];
    }
  } catch (error) {}

  offlineRequests.push({
    key: uuidv4(),
    url: url,
    body: body,
    method: method,
  });

  await Storage.set({
    key: "OfflineRequests",
    value: JSON.stringify(offlineRequests),
  });
};

export const CheckOfflineRequests = async () => {
  const value1 = await Storage.get({ key: "OfflineRequests" });
  // await Storage.remove({ key: "OfflineRequests" });

  if (value1.value) {
    const offlineRequests = JSON.parse(value1.value) as OfflineRequestProps[];

    if (offlineRequests.length > 0) {
      // presentLoading({
      //   message: "Synchronizowanie danych z serwerem",
      //   spinner: "crescent",
      // });

      for (const e of offlineRequests) {
        try {
          const rq = await api.request({
            url: e.url,
            method: e.method,
            data: e.body,
          });
          const rqData = await rq;

          const value2 = await Storage.get({ key: "OfflineRequests" });
          if (value2.value) {
            const offlineRequests2 = JSON.parse(
              value2.value
            ) as OfflineRequestProps[];
            const valueToSave = offlineRequests2.filter((s) => s.key != e.key);

            await Storage.set({
              key: "OfflineRequests",
              value: JSON.stringify(valueToSave),
            });
          }
        } catch (error: any) {
          if (error.code === "ECONNABORTED") {
            console.log("timeout");
          }
          break;
        }
      }

      // setTimeout(async () => {
      //   await dismissLoading();
      // }, 500);
    }
  }
};

export const useRoute = () => {
  const { setState, state } = useGlobalState();
  const [presentPhotoLoading, dismissPhotoLoading] = useIonLoading();
  const [presentLoading, dismissLoading] = useIonLoading();

  useEffect(() => {
    const checkOptionalScan = async () => {
      let isScanOptional = false;

      const { value } = await Storage.get({
        key: "isScanOptional",
      });

      if (value) {
        const valueBoolean = JSON.parse(value);
        if (valueBoolean) {
          isScanOptional = true;

          setState((prev) => ({
            ...prev,
            ...{
              isScanOptional: isScanOptional,
            },
          }));
        }
      }

      try {
        const scanOptionalRequest = await api.get("/drivers/is-scan-optional");
        const scanOptionalResult = await scanOptionalRequest.data;

        if (scanOptionalResult) {
          isScanOptional = await scanOptionalResult;
        }
      } catch (error) {}

      await Storage.set({
        key: "isScanOptional",
        value: JSON.stringify(isScanOptional),
      });

      setState((prev) => ({
        ...prev,
        ...{
          isScanOptional: isScanOptional,
        },
      }));
    };

    checkOptionalScan();

    // InitWithServer();
  }, []);

  const InitWithServer = async (routeParam?: RouteProps[]) => {
    console.log("Inicjalizacja trasy");
    await Init(routeParam);
    console.log("Ściąganie trasy z serwera");
    await AssignRouteFromServer();

    const { value } = await Storage.get({ key: "Route" });
    if (JSON.stringify(state.route) !== value) {
      console.log("AKTUALIZACJA trasy w pamięci aplikacji");
      await Init();
    }
  };

  const ReplacePolishLetters = (napis: string) => {
    napis = napis.replace("ę", "e");
    napis = napis.replace("ó", "o");
    napis = napis.replace("ą", "a");
    napis = napis.replace("ś", "s");
    napis = napis.replace("ł", "l");
    napis = napis.replace("ż", "z");
    napis = napis.replace("ź", "z");
    napis = napis.replace("ć", "c");
    napis = napis.replace("ń", "n");
    return napis;
  };

  const filterItems = (route: RouteProps[], searchText: string) => {
    if (searchText.length > 0) {

      searchText = ReplacePolishLetters(searchText.toLowerCase().replaceAll(" ", ""));

      const tempItems = route.filter((e) => {
        return (
          e.packages.some((_e) => {
            return ReplacePolishLetters(_e.name.toLowerCase().replaceAll(" ", "")).includes(searchText);
          }) || ReplacePolishLetters(e.city.toLowerCase() + e.street.toLowerCase() + e.houseNumber.toLowerCase()).replaceAll(" ", "").includes(searchText)
        );
      });
      if (tempItems) {
        return tempItems;
      }
    }
    return [];
  };

  const Init = async (routeParam?: RouteProps[], searchText?: string) => {
    let route: RouteProps[] = [];

    if (routeParam) {
      route = routeParam;
    } else {
      const { value } = await Storage.get({ key: "Route" });

      if (!value) {
        return;
      }

      route = JSON.parse(value) as RouteProps[];
    }

    for (const n of route) {
      if (n.packages.every((e) => e.scanned)) {
        n.packagesCompleted = true;
      }
    }

    let _routeDelivered = route.filter((e) => {
      return (e.packagesCompleted || state.isScanOptional) && e.image;
    });
    _routeDelivered.sort((a, b) => {
      return b.order - a.order;
    });

    let _routeNotDelivered = route.filter((e) => {
      return !((e.packagesCompleted || state.isScanOptional) && e.image);
    });

    const routeCurrentItemFooter = _routeNotDelivered.find((x) => {
      return (
        x.packages.some((y) => {
          return y.scanned;
        }) && !x.image
      );
    });

    let _searchText = "";

    if(searchText == undefined && state.searchText != undefined)
    {
      _searchText = state.searchText;
    }
    else if(searchText || searchText == "")
    {
      _searchText = searchText;
    }

    if (searchText) {
      _routeDelivered = filterItems(_routeDelivered, searchText);
      _routeNotDelivered = filterItems(_routeNotDelivered, searchText);
    }
    else
    {
      if (state.searchText && !(searchText || searchText == "")) {
        _routeDelivered = filterItems(_routeDelivered, state.searchText);
        _routeNotDelivered = filterItems(_routeNotDelivered, state.searchText);
      }
    }

    



    setState((prev) => ({
      ...prev,
      ...{
        route: route,
        routeEnd: _routeDelivered,
        routeCurrent: _routeNotDelivered,
        routeCurrentItemFooter: routeCurrentItemFooter,
        searchText: _searchText
      },
    }));

    console.log(_routeNotDelivered);

    await Storage.set({
      key: "Route",
      value: JSON.stringify(route),
    });

    // const networkStatus = await Network.getStatus();
    // if (networkStatus.connected) {
    //   await CheckOfflineRequests();
    // }
  };

  const GetRouteFromServer = async () => {
    const result = await api.get("routes/");
    return (await result.data) as RouteProps[];
  };

  const SaveRouteToStorage = async (route: RouteProps[]) => {
    await Storage.set({
      key: "Route",
      value: JSON.stringify(route),
    });
  };

  const AssignRouteFromServer = async () => {
    const result = await GetRouteFromServer();
    await SaveRouteToStorage(result);
  };

  const GetBlobFromBase64 = (imageBase64: string) => {
    const byteCharacters = atob(imageBase64);

    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: "image/jpeg" });
  };

  const UpdateRouteImage = async (id: number, image: ImageProps) => {
    presentPhotoLoading({
      spinner: "crescent",
      message: "Zapisywanie...",
    });

    const _route = state.route;

    if (_route) {
      for (const n of _route) {
        if (n.id == id) {
          for (const k of n.packages) {
            k.scanned = true;
            k.confirmationString = "-" + uuidv4();
          }

          n.image = image.webPath;
        }
      }

      if (image.base64) {
        new Compressor(GetBlobFromBase64(image.base64), {
          quality: 0.7,
          maxWidth: 1080,
          // The compression process is asynchronous,
          // which means you have to access the `result` in the `success` hook function.
          success(result) {
            let reader = new FileReader();
            reader.readAsDataURL(result);
            reader.onloadend = function () {
              dismissPhotoLoading();

              AddOfflineRequest("routes/addresses/" + id + "/image", "post", {
                image: (reader.result as string).replace(
                  "data:image/jpeg;base64,",
                  ""
                ),
                date: (new Date()).toJSON()
              });

              // api
              //   .post("routes/addresses/" + id + "/image", {
              //     image: (reader.result as string).replace("data:image/jpeg;base64,", ""),
              //   })
              //   .then((response) => {
              //     console.log(response);
              //   })

              Init(_route);
            };
          },
          error(err) {
            console.log(err.message);
          },
        });
      }
    }
  };

  const UpdateRoutePackageImage = async (
    packageId: number,
    image: ImageProps
  ) => {
    const _route = state.route;

    if (_route) {
      for (const n of _route) {
        for (const _package of n.packages) {
          if (_package.id == packageId) {
            _package.image = image.webPath;
            _package.scanned = true;
            // n.flag = !n.flag;
          }
        }
      }

      if (image.base64) {
        new Compressor(GetBlobFromBase64(image.base64), {
          quality: 0.7,
          maxWidth: 1080,
          // The compression process is asynchronous,
          // which means you have to access the `result` in the `success` hook function.
          success(result) {
            let reader = new FileReader();
            reader.readAsDataURL(result);
            reader.onloadend = function () {
              AddOfflineRequest(
                "routes/addresses/packages/" + packageId + "/image",
                "post",
                {
                  image: (reader.result as string).replace(
                    "data:image/jpeg;base64,",
                    ""
                  ),
                  date: (new Date()).toJSON()
                }
              );

              Init(_route);
            };
          },
          error(err) {
            console.log(err.message);
          },
        });
      }
    }
  };

  const ScanRoutePackage = async (
    packageId: number,
    confirmationString: string
  ) => {
    const _route = state.route;

    if (_route) {
      for (const n of _route) {
        for (const _package of n.packages) {
          if (_package.id == packageId) {
            _package.scanned = true;
          }
        }
      }

      console.log(_route);

      api
        .patch("routes/addresses/packages/" + packageId, {
          isScanned: true,
          confirmationString: confirmationString,
        })
        .then(async (response) => {});

      await Init(_route);
    }
  };

  const ChangeRouteToDefault = async (id: number) => {
    const _route = state.route;

    if (_route) {
      for (const n of _route) {
        if (n.id == id) {
          n.packagesCompleted = false;
          n.image = undefined;
          n.packages.map((_e) => {
            _e.scanned = false;
          });
        }
      }

      api
        .patch("routes/address/" + id + "/default")
        .then((response) => {
          console.log(response);
        })
        .finally(() => {});

      await Init(_route);
    }
  };

  return {
    UpdateRouteImage,
    InitWithServer,
    UpdateRoutePackageImage,
    ChangeRouteToDefault,
    ScanRoutePackage,
    Init,
  };
};
