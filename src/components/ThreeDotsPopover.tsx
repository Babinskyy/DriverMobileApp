import { IonItem, IonLabel, IonList, IonNote } from "@ionic/react";

const ThreeDotsPopover: React.FC<{
  onHide: () => void;
  showDelivered: () => void;
  showUndelivered: () => void;
}> = ({ onHide, showDelivered, showUndelivered }) => (
  <IonList>
    <IonItem
      button
      onClick={async () => {
        onHide();
        await showDelivered();
      }}
    >
      Dostarczone
    </IonItem>
    <IonItem
      lines="none"
      button
      onClick={async () => {
        onHide();
        await showUndelivered();
      }}
    >
      Niedostarczone
    </IonItem>
  </IonList>
);

export default ThreeDotsPopover;
