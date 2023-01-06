import {
  IonItem,
  IonLabel,
  IonList,
  IonNote,
  IonSelect,
  IonSelectOption,
} from "@ionic/react";

import "./NotificationSelect.scss";

const NotificationSelect: React.FC<{
  placeholder: string,
  onChange?: (value: string) => void,
  disabled?: boolean,
}> = ({ onChange, placeholder, disabled = false }) => (
  <IonList>
    <div>
      <IonSelect
        disabled={disabled}
        placeholder={placeholder}
        className="select-type-item"
        onIonChange={(event) => {

          if(onChange)
          {
            onChange(event.target.value);
          }

        }}
      >
        <IonSelectOption value="1">Jesionowa 17</IonSelectOption>
        <IonSelectOption value="2">Jesionowa 17</IonSelectOption>
        <IonSelectOption value="3">Jesionowa 17</IonSelectOption>
        <IonSelectOption value="4">Jesionowa 17</IonSelectOption>
        <IonSelectOption value="5">Jesionowa 17</IonSelectOption>
        <IonSelectOption value="6">Jesionowa 17</IonSelectOption>
        <IonSelectOption value="7">Jesionowa 17</IonSelectOption>
        <IonSelectOption value="8">Jesionowa 17</IonSelectOption>
        <IonSelectOption value="9">Jesionowa 17</IonSelectOption>
        
      </IonSelect>
    </div>
  </IonList>
);

export default NotificationSelect;
