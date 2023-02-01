import {
  IonItem,
  IonLabel,
  IonList,
  IonNote,
  IonSelect,
  IonSelectOption,
} from "@ionic/react";

import { Autocomplete, Box, CircularProgress, TextField } from "@mui/material";
import React, { useEffect, useState } from "react";

import api from "./../../services/api";

// import "./NotificationDietSelect.scss";


export function GenerateGUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

type Option = {
  id: number;
  value: string;
}

type RequestOption = {
  id: number;
  value: string;
  packages: Option[];
}

const AddressAutocomplete: React.FC<{
  disabled?: boolean;
  onChange?: (val: RequestOption | null) => void
}> = ({ onChange, disabled = false }) => {

  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<readonly RequestOption[]>([]);
  const loading = open && options.length === 0;

  useEffect(() => {
    let active = true;

    if (!loading) {
      return undefined;
    }

    api.get("issueDiet/autocomplete/current-route-addresses").then((response) => {
      setOptions(response.data);
    });

    return () => {
      active = false;
    };
  }, [loading]);

  useEffect(() => {
    if (!open) {
      setOptions([]);
    }
  }, [open]);

  return(
  <Autocomplete
    disabled={disabled}
      onChange={(event, value) => {
        if(onChange)
        {
          onChange(value);
        }
      }}
      noOptionsText="Nie znaleziono"
      // id={v4()}
      sx={{
        width: {
          xs: "100%",
          sm: "100%",
          md: "100%"
        },
      }}
      open={open}
      onOpen={() => {
        setOpen(true);
      }}
      onClose={() => {
        setOpen(false);
      }}
      isOptionEqualToValue={(option, value) => option.id === value.id}
      getOptionLabel={(option) => {
        return option.value;
      }}
      options={options}
      loading={loading}
      renderInput={(params) => (
        <TextField
          variant="filled"
          type={"search"}
          className="shadow-mui"
          {...params}
          id={GenerateGUID()}
          autoComplete={GenerateGUID()}
          label="Adres"
          fullWidth={true}
          InputProps={{
            ...params.InputProps,
            autoComplete: "off",
            endAdornment: (
              <React.Fragment>
                {loading ? (
                  <CircularProgress color="inherit" size={20} />
                ) : null}
                {params.InputProps.endAdornment}
              </React.Fragment>
            ),
          }}
        />
      )}
    />
  );
}

export default AddressAutocomplete;
