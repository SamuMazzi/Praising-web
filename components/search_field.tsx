import React, { useState } from "react";
import TextField from "@mui/material/TextField";

/* const useStyles = makeStyles(() => {
  return createStyles({
    search: {
      margin: "0"
    }
  });
}); */
/**
 * <TextField
          size="small"
          variant="outlined"
          
          onChange={handleChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment
                position="end"
                style={{ display: showClearIcon }}
                onClick={handleClick}
              >
                <ClearIcon />
              </InputAdornment>
            )
          }}
        />
 * @returns 
 */

interface PropsTypeSearch {
    query: string
    setQuery: (arg0: string) => void
}

export default function TypeSearch(props: PropsTypeSearch) {
  const [showClearIcon, setShowClearIcon] = useState("none");

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setShowClearIcon(event.target.value === "" ? "none" : "flex");
  };

  const handleClick = (): void => {
    //* Clear the search input
    console.log("clicked the clear icon...");
  };

  return (
    <TextField label="Cerca" type="search" value={props.query} onChange={(e) => props.setQuery(e.currentTarget.value)}/>
  );
};