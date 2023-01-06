import {
  IonItem,
  IonLabel,
  IonList,
  IonNote,
  IonSelect,
  IonSelectOption,
} from "@ionic/react";

import "./NotificationDietSelect.scss";

const NotificationDietSelect: React.FC<{
  disabled?: boolean
}> = ({ disabled = false }) => (
  <IonList>
    <div>
      <IonSelect
        disabled={disabled}
        placeholder="Wybierz dietę"
        className="select-type-item"
      >
        <IonSelectOption value="apples">Apple</IonSelectOption>
        <IonSelectOption value="apples">Apple</IonSelectOption>
        <IonSelectOption value="apples">Apple</IonSelectOption>
        <IonSelectOption value="apples">Apple</IonSelectOption>
        <IonSelectOption value="apples">Apple</IonSelectOption>
        <IonSelectOption value="apples">Apple</IonSelectOption>
        <IonSelectOption value="apples">Apple</IonSelectOption>
        <IonSelectOption value="apples">Apple</IonSelectOption>
        <IonSelectOption value="apples">Apple</IonSelectOption>
        <IonSelectOption value="apples">Apple</IonSelectOption>
        <IonSelectOption value="apples">Apple</IonSelectOption>
        <IonSelectOption value="apples">Apple</IonSelectOption>
        <IonSelectOption value="apples">Apple</IonSelectOption>
        <IonSelectOption value="apples">Apple</IonSelectOption> 
        
      </IonSelect>
    </div>
  </IonList>
);

export default NotificationDietSelect;
