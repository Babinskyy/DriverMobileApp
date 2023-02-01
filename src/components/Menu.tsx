import {
  IonButton,
  IonContent,
  IonFooter,
  IonHeader,
  IonIcon,
  IonImg,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonMenu,
  IonModal,
  IonRange,
  IonSelect,
  IonSelectOption,
  IonText,
  IonTitle,
  IonToggle,
  IonToolbar,
  NavContext,
  useIonAlert,
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
import { useContext, useEffect, useRef, useState } from "react";
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
import { User } from "../services/userProps";

import { PushNotifications } from "@capacitor/push-notifications";


const Menu: React.FC = () => {
  const { setState, state } = useGlobalState();

  const [presentLoading, dismissLoading] = useIonLoading();
  const [present] = useIonAlert();

  const history = useHistory();

  const menuRef = useRef<HTMLIonMenuElement>(null);

  const [url, setUrl] = useState("");

  const [checked, setChecked] = useState(false);

  const { Init, InitWithServer } = useRoute();

  const [username, setUsername] = useState("");

  const [accountName, setAccountName] = useState("");

  const [driverUsername, setDriverUsername] = useState<string>("");
  const [driverPassword, setDriverPassword] = useState<string>("");

  const [drivers, setDrivers] = useState<string[]>([]);

  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    if (drivers.length <= 0) {
      api.get("autocomplete/drivers-visible").then((e) => {
        const data = e.data;

        setDrivers(data);
      });
    }
  }, []);

  useEffect(() => {
    setTimeout(() => {
      if (document.body.classList.contains("dark")) {
        setChecked(true);
      }
    }, 500);
  }, []);

  const { navigate } = useContext(NavContext);

  const LogoutData = async () => {
    const { value } = await Preferences.get({ key: "OfflineRequests" });
            await Preferences.clear();
            if (value) {
              await Preferences.set({
                key: "OfflineRequests",
                value: value,
              });
            }
  }

  const Logout = async () => {
    await LogoutData();

            auth.logout().finally(() => {
              setTimeout(() => {
                history.replace("/login");
              }, 1);

              if (menuRef.current) {
                menuRef.current.setOpen(false);
              }
            });
  }

  const onIonWillOpen = () => {
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

    api.get("autocomplete/drivers-visible").then((e) => {
      const data = e.data;

      setDrivers(data);
    });
  }

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
      onIonWillOpen={() => onIonWillOpen()}
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
        <IonTitle>Pojazd <strong>{username}</strong></IonTitle><IonButton onClick={() => setIsModalVisible(true)} >Zmień pojazd</IonButton>
        </IonItem>
        

        <IonModal style={{
          "--width": "85%",
          "--height": "auto"
        }} isOpen={isModalVisible} onDidDismiss={() => setIsModalVisible(false)}>
        <div style={{
          margin: "15px 20px"
        }}>
                    <IonLabel className="header">Pojazd</IonLabel>
                    {/* <IonItem style={{ marginBottom: "5px" }}>
            <IonInput
              value={username}
              placeholder="Nazwa trasy"
              onIonChange={(e) => setUsername(e.detail.value!)}
            ></IonInput>
          </IonItem> */}
                    <IonList style={{ marginBottom: "10px" }}>
                      <IonItem>
                        <IonSelect
                          onIonChange={(ev) =>
                            setDriverUsername(ev.detail.value)
                          }
                          cancelText="Anuluj"
                          okText="Wybierz"
                          placeholder="Nazwa trasy"
                        >
                          {drivers.map((e) => {
                            return (
                              <IonSelectOption key={e} value={e}>
                                {e.toUpperCase()}
                              </IonSelectOption>
                            );
                          })}
                        </IonSelect>
                      </IonItem>
                    </IonList>

                    <IonItem style={{}}>
                      <IonInput
                        value={driverPassword}
                        placeholder="Hasło"
                        onIonChange={(e) => setDriverPassword(e.detail.value!)}
                        type="password"
                      ></IonInput>
                    </IonItem>
                    <IonButton
                      onClick={async () => {
                        await presentLoading({
                          spinner: "crescent",
                          message: "Logowanie...",
                          duration: 10000,
                        });

                        // navigate("/Home", "forward", "replace")

                        await auth
                          .login(
                            "",
                            "",
                            driverUsername,
                            driverPassword
                          )
                          .then(async (response) => {
                            console.log(auth);

                            const data = response as User;

                            await dismissLoading();

                            if (data.jwtToken) {

                              try {
                                await PushNotifications.register();
                              } catch (error) {}

                              setIsModalVisible(false);

                              onIonWillOpen();

                              await Preferences.remove({
                                key: "WarehousePackages"
                              });

                              navigate("/", "forward", "replace");
                              window.location.reload();
                            } else {
                              present("Niepoprawne dane logowanie", [
                                { text: "Zamknij" },
                              ]);
                            }



                          })
                          .catch(async (exception) => {
                            await dismissLoading();
                            present("Niepoprawne dane logowanie", [
                              { text: "Zamknij" },
                            ]);
                          });
                      }}
                      expand="block"
                      color="primary"
                      style={{ marginTop: "15px" }}
                    >
                      ZALOGUJ
                    </IonButton>
                  </div>
        </IonModal>

        <IonItem lines={"none"}>

        <IonTitle style={{
          fontSize: "11px",
          fontWeight: 300,
          marginLeft: "auto",
          textAlign: "right",
          "--min-height": "30px",
          letterSpacing: "1px"
        }}>v30012023</IonTitle>
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
            await Logout();
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
