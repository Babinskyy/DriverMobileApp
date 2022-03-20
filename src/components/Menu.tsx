import {
  IonContent,
  IonFooter,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonMenu,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import {
  carOutline,
  homeOutline,
  newspaperOutline,
  readerOutline,
} from "ionicons/icons";
import { useRef } from "react";
import { useHistory } from "react-router";

import auth from "./../services/auth.service";

import "./Menu.scss";

const Menu: React.FC = () => {
  const history = useHistory();

  const menuRef = useRef<HTMLIonMenuElement>(null);

  return (
    <IonMenu
      style={{ "--max-width": "250px" }}
      ref={menuRef}
      side="start"
      menuId="first"
      contentId="main"
    >
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>Example Menu</IonTitle>
        </IonToolbar>
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
            button
            className="menu-item"
            onClick={async () => {
              history.replace("/");
              if (menuRef.current) {
                menuRef.current.setOpen(false);
              }
            }}
          >
            <IonLabel>Lista dowozów</IonLabel>
            <IonIcon slot="start" icon={carOutline} />
          </IonItem>
          <IonItem
            button
            className="menu-item"
            onClick={async () => {
              history.replace("/Warehouse");
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
      <IonFooter>
        <IonItem
          button
          className="menu-item"
          color="danger"
          onClick={async () => {
            auth.logout().finally(() => {
              history.replace("/login");

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
