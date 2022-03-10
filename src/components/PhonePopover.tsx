import { IonItem, IonLabel, IonList, IonNote } from "@ionic/react";

const PhonePopover: React.FC<{
  onHide: () => void;
  address: string;
}> = ({ onHide, address }) => (
  <IonList>
    <IonItem
      button
      onClick={() => {
        window.open("tel:785234222");
        onHide();
      }}
    >
      Zadzwoń
    </IonItem>
    <IonItem
      lines="none"
      button
      onClick={() => {
        window.open("sms:785234222");
        onHide();
      }}
    >
      SMS
    </IonItem>
  </IonList>
);

export default PhonePopover;
