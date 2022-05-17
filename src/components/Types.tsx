import { Method } from "axios";

export type DietsProps = {
  id: string;
  category: string;
  name: string;
};
export type RoutePackagesProps = {
  id: number;
  name: string;
  scanned: boolean;
  code: string;
  image?: string;
  confirmationString: string;
};
export type RouteProps = {
  id: number;
  city: string;
  comment: string;
  commentExtra: string;
  houseNumber: string;
  lat: string;
  lng: string;
  postCode: string;
  packages: RoutePackagesProps[];
  phone: string;
  order: number;
  routeId: string;
  street: string;
  customerId: number;
  image?: string;
  packagesCompleted: boolean;
  sms: boolean;
};
export type ItemsDietProps = {
  name: string;
  scanned: boolean;
};

export type ItemsProps = {
  address: string;
  diets: ItemsDietProps[];
  photo?: boolean;
  lat: string;
  lng: string;
};
export type InnerItemProps = {
  i: number;
};
export type WarehousePackage = {
  id: number;
  name: string;
  scanned: boolean;
  code: string;
  confirmationString: string;
};
export type DietItemProps = {
  e: RouteProps;
  i?: number;
};
export type OfflineRequestProps = {
  key: string;
  url: string;
  method: Method;
  body: any;
};
export type ImageProps = {
  webPath: string | undefined;
  base64: string | undefined;
};
