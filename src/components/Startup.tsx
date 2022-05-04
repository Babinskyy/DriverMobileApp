import { App } from "@capacitor/app";
import { Network } from "@capacitor/network";
import { BackgroundMode } from "@ionic-native/background-mode";
import {
  IonContent,
  IonFooter,
  IonHeader,
  IonIcon,
  IonImg,
  IonItem,
  IonLabel,
  IonList,
  IonMenu,
  IonTitle,
  IonToggle,
  IonToolbar,
  NavContext,
} from "@ionic/react";
import { useContext, useEffect, useState } from "react";
import { CheckOfflineRequests, useRoute } from "../services/Utility";
import auth from "./../services/auth.service";
import { User } from "../services/userProps";
import { AndroidPermissions } from "@awesome-cordova-plugins/android-permissions";
import { v4 as uuidv4 } from "uuid";

const Startup: React.FC = () => {

  const { navigate } = useContext(NavContext);

  const {
    Init,
    UpdateRouteImage,
    InitWithServer,
    UpdateRoutePackageImage,
    ChangeRouteToDefault,
    ScanRoutePackage,
  } = useRoute();

  const [ onlyOnce, setOnlyOnce ] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const user = (await auth.getCurrentUser()) as User | undefined;

      if (!user) {
        // navigate("/login", "root", "replace");
      }
    };

    getUser();
  }, []);

  useEffect(() => {

    if(onlyOnce)
    {

      setOnlyOnce(false);

      const checkPermissions = async () => {

        let list = [
          // AndroidPermissions.PERMISSION.REQUEST_IGNORE_BATTERY_OPTIMIZATIONS,
          AndroidPermissions.PERMISSION.FOREGROUND_SERVICE,
          AndroidPermissions.PERMISSION.CAMERA,
          AndroidPermissions.PERMISSION.READ_EXTERNAL_STORAGE,
          AndroidPermissions.PERMISSION.WRITE_EXTERNAL_STORAGE,
          AndroidPermissions.PERMISSION.INTERNET,
        ];

        let noPermission: string[] = [];

        for(const perm of list)
        {

          const hasPerm = await AndroidPermissions.checkPermission(perm);

          if(!hasPerm.hasPermission)
          {
            noPermission.push(perm);
          }
        }

        AndroidPermissions.requestPermissions(noPermission);

      }
      checkPermissions();

      

      const appListener = async () => {
        // BackgroundMode.on("activate").subscribe(async () => {

        //   try {
        //     const networkStatus = await Network.getStatus();
        //     if (networkStatus.connected) {
        //       await CheckOfflineRequests();
        //     }
        //   } catch (error) {}
          
          
  
        // });
  
        // BackgroundMode.on("enable").subscribe(async () => {
  
        //   try {
        //     const appState = await App.getState();

        //     if (!appState.isActive) {
        //       const networkStatus = await Network.getStatus();
        //       if (networkStatus.connected) {
        //         await CheckOfflineRequests();
        //         // await InitWithServer();
        //       }
        //     }
        //   } catch (error) {}

        //   BackgroundMode.moveToBackground();
  
  
        // });
  
        // if (!BackgroundMode.isEnabled()) {
        //   BackgroundMode.enable();
        // }
  
        App.addListener("appStateChange", async ({ isActive }) => {
  
          if(!isActive)
          {
            const eventId = uuidv4();
  
            if (!BackgroundMode.isEnabled()) {
              BackgroundMode.enable();
            }
            BackgroundMode.on(eventId).subscribe(async () => {
              await CheckOfflineRequests();
    
              if (BackgroundMode.isEnabled()) {
                BackgroundMode.disable();
              }
            });
            BackgroundMode.fireEvent(eventId);
          }
          
  
        });
      };
      appListener();      
    }

    
  }, []);

  return <></>;
};

export default Startup;
