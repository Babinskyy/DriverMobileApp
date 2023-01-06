import {
  IonButton,
  IonContent,
  IonFooter,
  IonHeader,
  IonIcon,
  IonImg,
  IonItem,
  IonLabel,
  IonList,
  IonMenu,
  IonRange,
  IonText,
  IonTitle,
  IonToggle,
  IonToolbar,
  useIonLoading,
} from "@ionic/react";
import {
  addCircleOutline,
  alertCircleOutline,
  calendar,
  calendarOutline,
  cardOutline,
  carOutline,
  gridOutline,
  homeOutline,
  informationCircleOutline,
  locateOutline,
  mapOutline,
  newspaperOutline,
  readerOutline,
} from "ionicons/icons";
import { useEffect, useRef, useState } from "react";
import { useHistory } from "react-router";

import auth from "./../services/auth.service";

import "./Menu.scss";

import brokulImage from "../images/brokul-athlete.png";

import { Preferences } from '@capacitor/preferences';

import { Network } from "@capacitor/network";
import { CheckOfflineRequests, useRoute } from "../services/Utility";

import { SMS } from "@awesome-cordova-plugins/sms";

import api from "./../services/api";

import {
  GlobalStateProvider,
  useGlobalState,
  GlobalStateInterface,
} from "./../GlobalStateProvider";

const Menu: React.FC = () => {
  const { setState, state } = useGlobalState();

  const [presentLoading, dismissLoading] = useIonLoading();

  const history = useHistory();

  const menuRef = useRef<HTMLIonMenuElement>(null);

  const [url, setUrl] = useState("");

  const [checked, setChecked] = useState(false);

  const { Init, InitWithServer } = useRoute();

  const [username, setUsername] = useState("");

  const [accountName, setAccountName] = useState("");

  useEffect(() => {
    setTimeout(() => {
      if (document.body.classList.contains("dark")) {
        setChecked(true);
      }
    }, 500);
  }, []);

  return (
    <IonMenu
      swipeGesture={true}
      contentId="main"
      id="mainMenu"
      style={{ "--max-width": "300px" }}
      ref={menuRef}
      side="start"
      // menuId="first"
      // contentId="main"
      type="overlay"
      onIonWillOpen={() => {

        api.get("accounts/name").then((response) => {

          const responseData = response.data as string;
  
          if(accountName != responseData)
          {
            setAccountName(responseData);
          }
  
        })

        api.get("drivers/name").then((response) => {

          const responseData = response.data as string;
  
          if(username != responseData)
          {
            setUsername(responseData);
          }
  
        })

        setUrl(history.location.pathname);
      }}
      onIonWillClose={() => {
        setTimeout(() => {
          setUrl(history.location.pathname);
        }, 500);
      }}
    >
      {/* <IonHeader>
        <IonImg src={brokulImage} className="image" />
      </IonHeader> */}
      <IonHeader>
      <IonItem lines={"none"}>
        <IonTitle style={{
          marginTop: "15px",
        }}><strong>{accountName}</strong></IonTitle>
        </IonItem>
        <IonItem lines={"none"}>
        <IonTitle>Pojazd <strong>{username}</strong></IonTitle>
        </IonItem>
        <IonItem lines={"none"}>

        <IonTitle style={{
          fontSize: "11px",
          fontWeight: 300,
          marginLeft: "auto",
          textAlign: "right",
          "--min-height": "30px",
          letterSpacing: "1px"
        }}>v20112022</IonTitle>
          </IonItem>
        
      </IonHeader>
      <IonContent
        style={{
          "--padding-start": "15px",
          "--padding-end": "15px",
          "--padding-top": "10px",
        }}
      >
        <IonList mode={"ios"} style={{ background: "none" }}>
          <IonItem
            lines="none"
            color={"/" == url ? "primary" : undefined}
            button
            className="menu-item"
            onClick={async () => {
              setTimeout(() => {
                history.push("/");
              }, 1);
              if (menuRef.current) {
                menuRef.current.setOpen(false);
              }
            }}
          >
            <IonLabel>Lista dowozów</IonLabel>
            <IonIcon slot="start" icon={carOutline} />
          </IonItem>
          <IonItem
            lines="none"
            color={"/Warehouse" == url ? "primary" : undefined}
            button
            className="menu-item"
            onClick={async () => {
              setTimeout(() => {
                history.push("/Warehouse");
              }, 1);
              if (menuRef.current) {
                menuRef.current.setOpen(false);
              }
            }}
          >
            <IonLabel>Magazyn</IonLabel>
            <IonIcon slot="start" icon={homeOutline} />
          </IonItem>
          <IonItem
            lines="none"
            color={"/Map" == url ? "primary" : undefined}
            button
            className="menu-item"
            onClick={async () => {
              setTimeout(() => {
                history.push("/Map");
              }, 1);
              if (menuRef.current) {
                menuRef.current.setOpen(false);
              }
            }}
          >
            <IonLabel>Mapa</IonLabel>
            <IonIcon slot="start" icon={mapOutline} />
          </IonItem>

          <IonItem
            lines="none"
            color={"/Reorder" == url ? "primary" : undefined}
            button
            className="menu-item"
            onClick={async () => {
              setTimeout(() => {
                history.push("/Reorder");
              }, 1);
              if (menuRef.current) {
                menuRef.current.setOpen(false);
              }
            }}
          >
            <IonLabel>Edycja kolejności</IonLabel>
            <IonIcon slot="start" icon={gridOutline} />
          </IonItem>
          <IonItem
            lines="none"
            color={"/Notifications" == url ? "primary" : undefined}
            button
            className="menu-item"
            onClick={async () => {
              setTimeout(() => {
                history.push("/Notifications");
              }, 1);
              if (menuRef.current) {
                menuRef.current.setOpen(false);
              }
            }}
          >
            <IonLabel>Zgłoszenia</IonLabel>
            <IonIcon slot="start" icon={informationCircleOutline} />
          </IonItem>

          <IonItem
            lines="none"
            color={"/Punishments" == url ? "primary" : undefined}
            button
            className="menu-item"
            onClick={async () => {
              setTimeout(() => {
                history.push("/Punishments");
              }, 1);
              if (menuRef.current) {
                menuRef.current.setOpen(false);
              }
            }}
          >
            <IonLabel>Uwagi/Kary</IonLabel>
            <IonIcon slot="start" icon={calendarOutline} />
          </IonItem>
          <IonItem
            lines="none"
            color={"/Salary" == url ? "primary" : undefined}
            button
            className="menu-item"
            onClick={async () => {
              setTimeout(() => {
                history.push("/Salary");
              }, 1);
              if (menuRef.current) {
                menuRef.current.setOpen(false);
              }
            }}
          >
            <IonLabel>Wypłata</IonLabel>
            <IonIcon slot="start" icon={cardOutline} />
          </IonItem>
          
        </IonList>
      </IonContent>
      <IonFooter style={{ padding: "10px" }}>
      <IonItem lines="none" className="menu-item">
            {state.menuFontSize ? (
              <IonRange
                onIonChange={(e) => {
                  if (!isNaN(parseInt(e.detail.value.toString()))) {
                    setState((prev) => ({
                      ...prev,
                      ...{
                        menuFontSize: e.detail.value as number,
                      },
                    }));

                    console.log(e.detail.value as number);
                  }
                }}
                min={1}
                max={4}
                step={1}
                value={state.menuFontSize}
                snaps
                color="primary"
              ></IonRange>
            ) : (
              <></>
            )}

          </IonItem>
        <IonItem lines="none" className="menu-item">
          <IonLabel>Ciemny motyw</IonLabel>
          <IonToggle
            checked={checked}
            onIonChange={async (e) => {
              setChecked(e.detail.checked);
              document.body.classList.toggle("dark", e.detail.checked);

              await Preferences.set({
                key: "theme",
                value: e.detail.checked ? "dark" : "light",
              });
            }}
          />
        </IonItem>

        <IonItem
          button
          className="menu-item"
          color="secondary"
          style={{
            marginBottom: "10px",
          }}
          onClick={async () => {
            try {
              presentLoading({
                message: "Synchronizowanie danych z serwerem",
                spinner: "crescent",
              });

              const networkStatus = await Network.getStatus();
              if (networkStatus.connected) {
                await CheckOfflineRequests();
                await InitWithServer();
              } else {
                await Init();
              }
            } catch (error) {}

            await dismissLoading();
          }}
        >
          <IonLabel
            className="wrap"
            style={{
              textAlign: "center",
              fontWeight: 600,
              letterSpacing: "1px",
            }}
          >
            Synchronizowanie danych z serwerem
          </IonLabel>
        </IonItem>

        <IonItem
          button
          className="menu-item"
          color="danger"
          onClick={async () => {
            const { value } = await Preferences.get({ key: "OfflineRequests" });
            await Preferences.clear();
            if (value) {
              await Preferences.set({
                key: "OfflineRequests",
                value: value,
              });
            }

            auth.logout().finally(() => {
              setTimeout(() => {
                history.replace("/login");
              }, 1);

              if (menuRef.current) {
                menuRef.current.setOpen(false);
              }
            });
          }}
        >
          <IonLabel
            style={{
              textAlign: "center",
              fontWeight: 600,
              letterSpacing: "1px",
            }}
          >
            Wyloguj
          </IonLabel>
        </IonItem>
      </IonFooter>
    </IonMenu>
  );
};

export default Menu;
