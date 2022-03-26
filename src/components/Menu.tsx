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
} from "@ionic/react";
import {
  carOutline,
  homeOutline,
  newspaperOutline,
  readerOutline,
} from "ionicons/icons";
import { useEffect, useRef, useState } from "react";
import { useHistory } from "react-router";

import auth from "./../services/auth.service";

import "./Menu.scss";

import brokulImage from "../images/brokul-athlete.png";

import { Storage } from "@capacitor/storage";

const Menu: React.FC = () => {
  const history = useHistory();

  const menuRef = useRef<HTMLIonMenuElement>(null);

  const [url, setUrl] = useState("");

  const [checked, setChecked] = useState(false);

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
        setUrl(history.location.pathname);
      }}
      onIonWillClose={() => {
        setTimeout(() => {
          setUrl(history.location.pathname);
        }, 500);
      }}
    >
      <IonHeader>
        <IonImg
          style={{
            animationName: "athlete-animation",
            animationDuration: "1500ms",
            animationIterationCount: "infinite",
          }}
          src={brokulImage}
          className="image"
        />
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
        </IonList>
      </IonContent>
      <IonFooter style={{ padding: "10px" }}>
        <IonItem>
          <IonLabel>Ciemny motyw</IonLabel>
          <IonToggle
            checked={checked}
            onIonChange={async (e) => {
              setChecked(e.detail.checked);
              document.body.classList.toggle("dark", e.detail.checked);

              await Storage.set({
                key: "theme",
                value: e.detail.checked ? "dark" : "light",
              });
            }}
          />
        </IonItem>

        <IonItem
          button
          className="menu-item"
          color="danger"
          onClick={async () => {
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
