import {
  IonItem,
  IonLabel,
  IonList,
  IonNote,
  IonSelect,
  IonSelectOption,
} from "@ionic/react";

import "./NotificationTypeSelect.scss";

const NotificationTypeSelect: React.FC<{
  disabled?: boolean
}> = ({ disabled = false }) => (
  <IonList>
    <div>
      <IonSelect
        disabled={disabled}
        placeholder="Wybierz typ złoszenia"
        className="select-type-item"
      >
        <IonSelectOption value="apples">Uszkodzenie</IonSelectOption>
        <IonSelectOption value="oranges">Brak diety</IonSelectOption>
      
        
      </IonSelect>
    </div>
  </IonList>
);

export default NotificationTypeSelect;
