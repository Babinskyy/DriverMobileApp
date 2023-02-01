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
  IonModal,
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

import { BackgroundUpload } from "@ionic-native/background-upload";

import { useGlobalState } from "./../GlobalStateProvider";
import { isPlatform } from "@ionic/core";

import api from "./../services/api";

const Startup: React.FC = () => {
  const { setState, state } = useGlobalState();
  const { navigate } = useContext(NavContext);

  const {
    Init,
    UpdateRouteImage,
    InitWithServer,
    UpdateRoutePackageImage,
    ChangeRouteToDefault,
    ScanRoutePackage,
  } = useRoute();

  const [onlyOnce, setOnlyOnce] = useState(true);

  const [showVersionModal, setShowVersionModal] = useState(false);

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
    if (onlyOnce) {

      api.get("version", {
        params: {
          Version: "v30012023"
        }
      }).then((e) => {

        const data = e.data;

        if(!data)
        {
          setShowVersionModal(true);
        }

      })

      setState((prev) => ({
        ...prev,
        ...{
          menuFontSize: 3,
          autoFlash: false
        },
      }));

      if (!state.uploader && isPlatform("mobile") && !isPlatform("mobileweb")) {
        setState((prev) => ({
          ...prev,
          ...{
            uploader: BackgroundUpload.init({
              callBack: (e) => {
                console.log(e);
              },
            }),
          },
        }));
      }

      setOnlyOnce(false);

      const checkPermissions = async () => {
        let list = [
          //AndroidPermissions.PERMISSION.REQUEST_IGNORE_BATTERY_OPTIMIZATIONS,
          AndroidPermissions.PERMISSION.FOREGROUND_SERVICE,
          AndroidPermissions.PERMISSION.CAMERA,
          AndroidPermissions.PERMISSION.READ_EXTERNAL_STORAGE,
          AndroidPermissions.PERMISSION.WRITE_EXTERNAL_STORAGE,
          AndroidPermissions.PERMISSION.INTERNET,
          AndroidPermissions.PERMISSION.READ_PHONE_STATE,
          AndroidPermissions.PERMISSION.SEND_SMS,
          AndroidPermissions.PERMISSION.FLASHLIGHT
        ];

        let noPermission: string[] = [];

        for (const perm of list) {
          const hasPerm = await AndroidPermissions.checkPermission(perm);

          if (!hasPerm.hasPermission) {
            noPermission.push(perm);
          }
        }

        AndroidPermissions.requestPermissions(noPermission);
      };
      checkPermissions();

      // const appListener = async () => {
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

      // App.addListener("appStateChange", async ({ isActive }) => {
      //   if (!isActive) {
      //     const eventId = uuidv4();

      //     if (!BackgroundMode.isEnabled()) {
      //       BackgroundMode.enable();
      //     }
      //     BackgroundMode.on(eventId).subscribe(async () => {
      //       await CheckOfflineRequests();

      //       if (BackgroundMode.isEnabled()) {
      //         BackgroundMode.disable();
      //       }
      //     });
      //     BackgroundMode.fireEvent(eventId);
      //   }
      // });
      // };
      // appListener();

      const asyncUseEffect = async () => {
        const networkStatus = await Network.getStatus();
        if (networkStatus.connected) {
          await Init();
          await CheckOfflineRequests();
          await InitWithServer();
        } else {
          await Init();
        }
      };
      asyncUseEffect();
    }
  }, []);

  return(
    <IonModal isOpen={showVersionModal} canDismiss={false} style={{
      "--height": "100px",
      "--width": "200px",
      textAlign: "center"
    }}>
      <div style={{ margin: "auto 20px", fontSize: "20px" }}>
        Posiadasz starą wersję aplikacji
      </div>
    </IonModal>
  ) ;
};

export default Startup;
