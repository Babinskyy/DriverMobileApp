import { IonIcon, IonItem, IonLabel, IonList, IonNote } from "@ionic/react";
import { carOutline, syncOutline } from "ionicons/icons";

const ThreeDotsPopover: React.FC<{
  onHide: () => void;
  showDelivered: () => void;
  showUndelivered: () => void;
}> = ({ onHide, showDelivered, showUndelivered }) => (
  <IonList>
    <IonItem
      mode="ios"
      lines="none"
      button
      onClick={async () => {
        onHide();
        await showUndelivered();
      }}
    >
      <IonLabel>
        Aktualne
      </IonLabel>
      <IonIcon slot="start" src={carOutline} />

    </IonItem>
    <IonItem
      mode="ios"
      lines="none"
      button
      onClick={async () => {
        onHide();
        await showDelivered();
      }}
    >
      <IonLabel>
        Zakończone
      </IonLabel>
      <IonIcon slot="start" src={syncOutline} />
    </IonItem>
  </IonList>
);

export default ThreeDotsPopover;
