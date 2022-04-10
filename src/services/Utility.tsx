import { SetStateAction, useEffect } from "react";
import { ImageProps, OfflineRequestProps, RouteProps } from "../components/Types"
import { Storage } from "@capacitor/storage";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
import { Filesystem, Directory, Encoding, ReadFileResult } from '@capacitor/filesystem';
import { isPlatform } from "@ionic/core";
import { Method } from "axios";
import api from "./../services/api";
import auth from "./../services/auth.service";

import Compressor from 'compressorjs';

import {
    GlobalStateProvider,
    useGlobalState,
    GlobalStateInterface,
  } from "./../GlobalStateProvider";
import { useIonLoading } from "@ionic/react";
import { Network } from "@capacitor/network";

export const GetPhoto = async () => {

    if(isPlatform("mobileweb") || isPlatform("desktop"))
    {
        const image =  await Camera.getPhoto({
            quality: 75,
            allowEditing: false,
            resultType: CameraResultType.Base64,
            source: CameraSource.Camera,
        });
    
        return {
            webPath: "data:image/png;base64, " + image.base64String,
            base64: image.base64String
        } as ImageProps
    }
    else
    {
        const image =  await Camera.getPhoto({
            quality: 75,
            allowEditing: false,
            resultType: CameraResultType.Uri,
            source: CameraSource.Camera,
        });
    
        let imageBase64: ReadFileResult | undefined = undefined;
    
        if(image.path)
        {
            imageBase64 = await Filesystem.readFile({
                path: image.path
            });
        }
    
        return {
            webPath: image.webPath,
            base64: imageBase64?.data
        }
    }

    

}

export const RefreshRoute = async (route: RouteProps[], routeType: "undelivered" | "delivered", setItems: (value: React.SetStateAction<RouteProps[]>) => void, setItemsStatic: (value: React.SetStateAction<RouteProps[]>) => void, setFooterItem: (value: React.SetStateAction<RouteProps | undefined>) => void, footerItem: RouteProps | undefined, saveToStorage: boolean = false) => {

    let _route: RouteProps[] = [];

    if(routeType == "delivered")
    {
        _route = route.filter((e) => {
            return e.packagesCompleted && e.image;
        });
        _route.sort((a, b) => {
            return b.order - a.order
        });
    }
    else if(routeType == "undelivered")
    {
        _route = route.filter((e) => {
            return !(e.packagesCompleted && e.image);
        });
    }


    

    

    if(saveToStorage)
    {
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
    }
    else
    {
        setFooterItem(undefined);
    }

    


    if(routeType == "undelivered")
    {
        setItems(_route);
        setItemsStatic(_route);
    }
    else if(routeType == "delivered")
    {
        setItems(_route);
        setItemsStatic(_route);
    }

    
}

export const UpdateRouteElement = async (route: RouteProps[] | undefined, item: RouteProps, routeType: "undelivered" | "delivered", setItems: (value: React.SetStateAction<RouteProps[]>) => void, setItemsStatic: (value: React.SetStateAction<RouteProps[]>) => void, setFooterItem: (value: React.SetStateAction<RouteProps | undefined>) => void, footerItem: RouteProps | undefined, saveToStorage: boolean = false) => {

    const { value } = await Storage.get({ key: "Route" });

    if(!value)
    {
        return;
    }

    const tempRoute = route ? [...route] : JSON.parse(value) as RouteProps[];

    const tempRouteIndex = tempRoute.findIndex((e) => {
        return e.id == item.id
    })

    tempRoute[tempRouteIndex] = {...item};

    RefreshRoute(tempRoute, routeType, setItems, setItemsStatic, setFooterItem, footerItem, saveToStorage);

}


export const AddOfflineRequest = async (url: string, method: Method, body: any) => {

    const { value } = await Storage.get({ key: "OfflineRequests" });

    let offlineRequests: OfflineRequestProps[] = [];

    try {
        
        if(value)
        {
            offlineRequests = JSON.parse(value) as OfflineRequestProps[]; 
        }        

    } catch (error) {
        
    }

    offlineRequests.push({
        url: url,
        body: body,
        method: method
    })

    await Storage.set({ key: "OfflineRequests", value: JSON.stringify(offlineRequests) });

}





export const useRoute = () => {

    const { setState, state } = useGlobalState();
    const [presentPhotoLoading, dismissPhotoLoading] = useIonLoading();
    const [presentLoading, dismissLoading] = useIonLoading();

    useEffect(() => {

      const checkOptionalScan = async () => {
        const scanOptionalRequest = await api.get("/drivers/is-scan-optional");
        const scanOptionalResult = await scanOptionalRequest.data;
  
        let isScanOptional = false;
        if(scanOptionalResult)
        {
          isScanOptional = scanOptionalResult;
        }

        setState((prev) => ({
          ...prev,
          ...{
            isScanOptional: isScanOptional
          },
        }));
      }

      checkOptionalScan();

      

        InitWithServer();

    }, [])


    const InitWithServer = async (routeParam?: RouteProps[]) => {
        
        console.log("Inicjalizacja trasy")
        await Init(routeParam);
        console.log("Ściąganie trasy z serwera")
        await AssignRouteFromServer();

        const { value } = await Storage.get({ key: "Route" });
        if(JSON.stringify(state.route) !== value)
        {
            console.log("AKTUALIZACJA trasy w pamięci aplikacji")
            await Init();
        }
    }



    const filterItems = (route: RouteProps[], searchText: string) => {
      if (searchText.length > 0) {
        const tempItems = route.filter((e) => {
          return (
            e.packages.some((_e) => {
              return _e.name.toLowerCase().includes(searchText.toLowerCase());
            }) || e.street.toLowerCase().includes(searchText.toLowerCase())
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

      if (searchText) {
        _routeDelivered = filterItems(_routeDelivered, searchText);
        _routeNotDelivered = filterItems(_routeNotDelivered, searchText);
      }

      setState((prev) => ({
        ...prev,
        ...{
          route: route,
          routeEnd: _routeDelivered,
          routeCurrent: _routeNotDelivered,
          routeCurrentItemFooter: routeCurrentItemFooter,
        },
      }));

      console.log(_routeNotDelivered);

      await Storage.set({
        key: "Route",
        value: JSON.stringify(route),
      });

      const networkStatus = await Network.getStatus();
      if (networkStatus.connected) {
        await CheckOfflineRequests();
      }
    };

    const CheckOfflineRequests = async () => {
      const { value } = await Storage.get({ key: "OfflineRequests" });
      await Storage.remove({ key: "OfflineRequests" });

      if (value) {
        let offlineRequests = JSON.parse(value) as OfflineRequestProps[];
        offlineRequests.reverse();

        if (offlineRequests.length > 0) {
          presentLoading({
            message: "Synchronizowanie danych z serwerem",
            spinner: "crescent",
          });

          for (const e of offlineRequests) {
            const rq = await api.request({
              url: e.url,
              method: e.method,
              data: e.body,
            });
            const rqData = await rq;
          }

          setTimeout(async () => {
            await dismissLoading();
          }, 500);

          //   setTimeout(async () => {

          //   await api.get("routes/").then(async (response) => {
          //     let route = response.data as RouteProps[];

          //     RefreshRoute(route, itemsMode, setItems, setItemsStatic, setFooterItem, footerItem, true);
          //   });

          //   setTimeout(() => {
          //     dismissLoading();
          //   }, 500);

          //    }, 200);
        }
      }
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
      return new Blob([byteArray], {type: 'image/jpeg'});
    };

    const UpdateRouteImage = async (id: number, image: ImageProps) => {
      const _route = state.route;

      if (_route) {
        for (const n of _route) {
          if (n.id == id) {
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
                presentPhotoLoading({
                  spinner: "crescent",
                  message: "Wysyłanie",
                });
                api
                  .post("routes/addresses/" + id + "/image", {
                    image: (reader.result as string).replace("data:image/jpeg;base64,", ""),
                  })
                  .then((response) => {
                    console.log(response);
                  })
                  .finally(() => {
                    dismissPhotoLoading();
                  });

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

    const UpdateRoutePackageImage = async (packageId: number, image: ImageProps) => {

        const _route = state.route;

        if(_route)
        {
            for (const n of _route) {
                for (const _package of n.packages) {
                    if(_package.id == packageId)
                    {
                        _package.image = image.webPath;
                        _package.scanned = true
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
                        presentPhotoLoading({ spinner: "crescent", message: "Wysyłanie" });
                        api
                          .post("routes/addresses/packages/" + packageId + "/image", {
                            image: (reader.result as string).replace("data:image/jpeg;base64,", ""),
                          })
                          .then((response) => {
                            console.log(response);
                          })
                          .finally(() => {
                            dismissPhotoLoading();
                          });
            
                        Init(_route);
                    };
                  },
                  error(err) {
                    console.log(err.message);
                  },
                });
              }


            



        }

        

    }


    const ScanRoutePackage = async (packageId: number, confirmationString: string) => {

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

        

    }


    const ChangeRouteToDefault = async (id: number) => {

        const _route = state.route;

        if(_route)
        {
            for (const n of _route) {
                if(n.id == id)
                {
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
              .finally(() => {
              });

            await Init(_route);

        }

        

    }


    return {
        UpdateRouteImage,
        InitWithServer,
        UpdateRoutePackageImage,
        ChangeRouteToDefault,
        ScanRoutePackage,
        Init
    };

    
}