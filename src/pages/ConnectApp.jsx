import React, { useState, useContext, useEffect } from "react";
import PaginationTable from "../components/List/PaginationTable.jsx";
import {
  Grid,
  Box,
  CircularProgress,
  Typography,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import Header from "../components/Header/Header.jsx";
import Graphic from "../components/Graphic/Graphic.jsx";
import { JobDataContext } from "../contexts/JobDataContext.js";

function ConnectApp() {
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const { jobData, jobDataTable } = useContext(JobDataContext);

  useEffect(() => {
    console.log("Job Data:", jobData);
  }, [jobData, jobDataTable]);

  const handleLoading = (isLoading) => {
    console.log("Loading state changed:", isLoading);
    setLoading(isLoading);
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  return (
    <Grid container justifyContent="center">
      <Header onLoadingChange={handleLoading} />
      <Grid
        sx={{
          display: "flex",
          gap: "50px",
          marginBottom: "30px",
        }}
      >
        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
            }}
          >
            <Typography style={{ color: "white" }}>Cargando...</Typography>
            <CircularProgress style={{ color: "white" }} />
          </Box>
        ) : jobData && jobData?.nodes?.length > 0 ? (
          <Grid
            container
            spacing={2}
            sx={{ padding: "20px" }}
          >
            <Grid item xs={12} md={6}>
              <Box sx={{ paddingLeft: "20px" }}>
                <Typography style={{ color: "white" }}>
                  Personas según perfil
                </Typography>
                <PaginationTable jobData={jobDataTable} />
              </Box>
            </Grid>
            <Grid item xs={12} md={6} sx={{ padding: "20px 20px 20px 20px" }}>
              <Typography style={{ color: "white" }}>
                Networking global de perfil de trabajo
              </Typography>
              <Box
                sx={{
                  width: "100%",
                  height: "400px",
                  border: "1px solid black",
                  borderRadius: "15px",
                  background: "white",
                  overflow: "hidden",
                  position: "relative",
                }}
              >
                <Graphic jobData={jobData} />
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleOpenDialog}
                  sx={{ position: "absolute", bottom: "10px", right: "10px" }}
                >
                  Expandir
                </Button>
              </Box>
            </Grid>
          </Grid>
        ) : (
          <Box
            sx={{ width: "100%", height: "400px", backgroundColor: "blue" }}
          />
        )}
      </Grid>
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>Gráfico</DialogTitle>
        <DialogContent>
          <Box
            sx={{
              width: "100%",
              height: "500px",
              border: "2px solid black",
              borderRadius: "15px",
              background: "white",
              overflow: "hidden",
            }}
          >
            <Graphic jobData={jobData} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
}

export default ConnectApp;
