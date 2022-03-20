import { NavContext, useIonLoading } from "@ionic/react";
import { useContext, useEffect } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { RouteComponentProps } from "react-router";

import api from "./../services/api";
import auth from "./../services/auth.service";

import { User } from "./../services/userProps";

const Startup: React.FC<RouteComponentProps> = ({ match }) => {
  const [present, dismiss] = useIonLoading();

  const { navigate } = useContext(NavContext);

  useEffect(() => {

    console.log("match");
    console.log(match);

    present({
      duration: 10000,
    });

    const getUser = async () => {
      const user = (await auth.getCurrentUser()) as User | undefined;

      dismiss();

      if (user) {
        navigate("/home", "root", "replace");
      } else {
        // navigate("/login", "root", "replace");
      }
    };

    getUser();
  }, []);

  return <></>;
};

export default Startup;
