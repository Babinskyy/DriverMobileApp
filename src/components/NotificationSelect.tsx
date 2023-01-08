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
  <IonList>
    <div>
      <IonSelect
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
              <IonSelectOption value={e.id.toString()}>{
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
    </div>
  </IonList>
);

export default NotificationSelect;
