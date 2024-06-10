import React from "react";
import { Button } from '@mui/material';

function RoundedBtn({ icon, onClick, disable }) {
  return (
    <Button
      disabled={disable}
      onClick={onClick}
      size="small"
      variant="contained"
    >
      {icon}
    </Button>
  );
}

export default RoundedBtn;