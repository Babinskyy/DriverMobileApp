import { SetStateAction } from "react";
import { RouteProps } from "../components/Types"
import { Storage } from "@capacitor/storage";

export const UpdateCollection = () => {



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
            key: "Route",
            value: JSON.stringify(route),
        });
    }

    setItems(route);
    setItemsStatic(route);

}

export const UpdateRouteElement = async (route: RouteProps[], item: RouteProps, routeType: "undelivered" | "delivered", setItems: (value: React.SetStateAction<RouteProps[]>) => void, setItemsStatic: (value: React.SetStateAction<RouteProps[]>) => void, saveToStorage: boolean = false) => {


    const tempRoute = [...route];

    const tempRouteIndex = tempRoute.findIndex((e) => {
        return e.id == item.id
    })

    tempRoute[tempRouteIndex] = {...item};

    RefreshRoute(tempRoute, routeType, setItems, setItemsStatic, saveToStorage);

}