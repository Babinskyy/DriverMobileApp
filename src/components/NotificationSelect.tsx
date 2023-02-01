import {
  IonItem,
  IonLabel,
  IonList,
  IonNote,
  IonSelect,
  IonSelectOption,
} from "@ionic/react";

import "./NotificationSelect.scss";

type Dictionary = {
  id: string | number;
  value: string;
}

const NotificationSelect: React.FC<{
  placeholder: string,
  data: Dictionary[],
  onChange?: (value: any) => void,
  disabled?: boolean,
  multiple?: boolean;
}> = ({ onChange, data, placeholder, disabled = false, multiple = false }) => (
      <IonItem>
        <IonSelect
          interface="alert"
          interfaceOptions={{
            className: "ion-alert-notification-address-diets"
          }}
          style={{
            margin: "auto"
          }}
        multiple={multiple}
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
        {
          data.map((e) => {
            return(
              <IonSelectOption key={e.id.toString()} value={e.id.toString()}>{
                e.value.split(";").map(e => {
                  return(
                    <div>{e}</div>
                  )
                })
              }</IonSelectOption>
            )
          })
        }
        
      </IonSelect>
      </IonItem>
);

export default NotificationSelect;
