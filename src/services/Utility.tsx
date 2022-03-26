import { SetStateAction } from "react";
import { OfflineRequestProps, RouteProps } from "../components/Types"
import { Storage } from "@capacitor/storage";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
import { Filesystem, Directory, Encoding, ReadFileResult } from '@capacitor/filesystem';
import { isPlatform } from "@ionic/core";
import { Method } from "axios";

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
            webPath: image.base64String,
            base64: image.base64String
        }
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