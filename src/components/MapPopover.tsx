import { IonItem, IonLabel, IonList, IonNote } from "@ionic/react";

const MapPopover: React.FC<{
  onHide: () => void;
  address: string;
  lat: string;
  lng: string;
}> = ({ onHide, address, lat, lng }) => (
  <IonList>
    {/* <IonListHeader>Wybierz </IonListHeader> */}
    <IonItem
      mode="ios"
      button
      onClick={() => {
        window.open(
          "https://www.google.com/maps/dir/?api=1&destination=" +
            encodeURIComponent("Gdańsk " + address),
          "_blank"
        );
        onHide();
      }}
    >
      Google Maps
    </IonItem>
    <IonItem
      mode="ios"
      lines="none"
      button
      onClick={() => {
        window.open(
          // "https://mapa.targeo.pl/" + encodeURIComponent("Gdańsk " + address + "," + lng.replace(",", ".") + "," + lat.replace(",", ".")),
          "https://mapa.targeo.pl/" + encodeURIComponent("Gdańsk " + address),
          "_blank"
        ); //https://mapa.targeo.pl/b%C4%99dzin%20jesionowa%2017,19,19.121525400000003,50.31193999999999
        onHide();
      }}
    >
      Targeo
    </IonItem>
  </IonList>
);

export default MapPopover;
