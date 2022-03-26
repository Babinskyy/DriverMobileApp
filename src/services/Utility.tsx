import { SetStateAction } from "react";
import { RouteProps } from "../components/Types"
import { Storage } from "@capacitor/storage";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
import { Filesystem, Directory, Encoding, ReadFileResult } from '@capacitor/filesystem';

export const GetPhoto = async () => {

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

export const RefreshRoute = async (route: RouteProps[], routeType: "undelivered" | "delivered", setItems: (value: React.SetStateAction<RouteProps[]>) => void, setItemsStatic: (value: React.SetStateAction<RouteProps[]>) => void, saveToStorage: boolean = false) => {

    if(routeType == "delivered")
    {
        route = route.filter((e) => {
            return e.packagesCompleted && e.image;
        });
    }
    else if(routeType == "undelivered")
    {
        route = route.filter((e) => {
            return !(e.packagesCompleted && e.image);
        });
    }

    

    if(saveToStorage)
    {
        await Storage.set({
            key: routeType == "undelivered" ? "Route" : "RouteDelivered",
            value: JSON.stringify(route),
        });
    }

    setItems(route);
    setItemsStatic(route);

    console.log("refresh");
    console.log(route);
}

export const UpdateRouteElement = async (route: RouteProps[], item: RouteProps, routeType: "undelivered" | "delivered", setItems: (value: React.SetStateAction<RouteProps[]>) => void, setItemsStatic: (value: React.SetStateAction<RouteProps[]>) => void, saveToStorage: boolean = false) => {


    const tempRoute = [...route];

    const tempRouteIndex = tempRoute.findIndex((e) => {
        return e.id == item.id
    })

    tempRoute[tempRouteIndex] = {...item};

    RefreshRoute(tempRoute, routeType, setItems, setItemsStatic, saveToStorage);

}