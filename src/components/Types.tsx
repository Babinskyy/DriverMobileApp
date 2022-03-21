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
