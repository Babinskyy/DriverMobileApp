import { IonItem, IonLabel, IonList, IonNote } from "@ionic/react";

const PhonePopover: React.FC<{
  onHide: () => void;
  phoneNumber: string;
}> = ({ onHide, phoneNumber }) => (
  <IonList>
    <IonItem
      button
      onClick={() => {
        console.log(phoneNumber);
        window.open(`tel:${phoneNumber}`);
        onHide();
      }}
    >
      Zadzwoń
    </IonItem>
    <IonItem
      lines="none"
      button
      onClick={() => {
        window.open(`sms:${phoneNumber}`);
        onHide();
      }}
    >
      SMS
    </IonItem>
  </IonList>
);

export default PhonePopover;
