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
import { GenerateGUID } from "./AddressAutocomplete";

// import "./NotificationDietSelect.scss";


type Option = {
  id: number;
  value: string;
}

type RequestOption = {
  id: number;
  value: string;
  packages: Option[];
}

const DietsAutocomplete: React.FC<{
  disabled?: boolean;
  onChange?: (val: Option | null) => void
}> = ({ onChange, disabled = false }) => {

  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<readonly Option[]>([]);
  const loading = open && options.length === 0;

  useEffect(() => {
    let active = true;

    if (!loading) {
      return undefined;
    }

    api.get("issueDiet/autocomplete/all-diets").then((response) => {
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
      loadingText="Pobieranie danych..."
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
          label="Dieta"
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

export default DietsAutocomplete;
