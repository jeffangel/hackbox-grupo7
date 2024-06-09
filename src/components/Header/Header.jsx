import React, { useState, useRef, useContext } from "react";
import { JobDataContext } from "../../contexts/JobDataContext.js";
import RoundedBtn from "../Common/RoundedBtn.jsx";
import SendIcon from "@mui/icons-material/Send";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import { TextField, Grid, Box, Autocomplete } from "@mui/material";
import { enviarRol, uploadFile } from "../../api/apiService.js";
import ClearIcon from "@mui/icons-material/Clear";
import "./Header.css";

const jobOptions = [
  "Cybersecurity Analyst",
  "Cloud Engineer",
  "Devops Engineer",
  "Data Engineering Specialist",
  "Frontend Developer",
  "Blockchain Developer",
  "Software Developer",
  "Artificial Intelligence Specialist",
  "Mobile App Developer",
  "Web Developer",
  "UI/UX Designer",
  "Cybersecurity Consultant",
  "Data Scientist",
  "Network Administrator",
  "Full stack Engineer",
  "Artificial Intelligence Researcher",
  "Game Developer",
  "Robotics Specialist",
  "Cloud Infrastructure Engineer",
  "Serverless Architect",
  "Machine Learning Engineer",
  "Penetration Tester",
  "Network Architect",
  "Systems Analyst",
  "Data Governance Specialist",
  "Front-end Developer",
  "Data Governance Analyst",
  "Quantum Computing Researcher",
  "IoT Developer",
  "Big Data Engineer",
  "Quantum Computing Specialist",
  "Embedded Systems Specialist",
  "Business Intelligence Analyst",
  "IoT Solutions Architect",
  "Product Owner",
  "Database Administrator",
  "Robotics Engineer",
  "Serverless Solutions Architect",
  "Product Manager",
  "Cloud Architect",
  "Front-end Engineer",
  "Machine Learning Scientist",
  "Artificial Intelligence Engineer",
  "Blockchain Security Analyst",
  "Embedded Systems Engineer",
];


function Header({ onLoadingChange }) {
  const [typing, setTyping] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showClearButton, setShowClearButton] = useState(false);
  const { setJobData, setJobDataTable } = useContext(JobDataContext);

  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const inputContainerRef = useRef(null);

  const handleImgUpload = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type === "application/pdf") {
      readAndUploadFile(file);
    } else {
      alert("Please select a PDF file");
    }
  };

  const readAndUploadFile = (file) => {
    const reader = new FileReader();
    reader.onload = async () => {
      onLoadingChange(true);
      const arrayBuffer = reader.result;
      const data = await uploadFile(arrayBuffer);

      setJobDataTable(data?.table);
      setJobData(data?.graph);
      setShowClearButton(true);
      
      onLoadingChange(false);
    };
    reader.readAsArrayBuffer(file);
  };

  const handleSelectChange = (event, newValue) => {
    setSelectedJob(newValue);

    if (newValue === null) {
      clearData();
    }
  };

  const handleSelectSubmit = async () => {
    if (selectedJob) {
      onLoadingChange(true);
      const dataGraphic = await enviarRol(selectedJob);

      setJobDataTable(dataGraphic?.table);
      setJobData(dataGraphic?.graph);
      setShowClearButton(true);
      onLoadingChange(false);
      inputRef.current.focus();
      setTyping(false);
    }
  };

  const clearData = () => {
    setJobDataTable(null);
    setJobData(null);
    setShowClearButton(false);
    setSelectedJob(null);
  };

  return (
    <div className="header">
      <div className="header-top">
        <div className="header-logo">Connect+</div>
      </div>
      <div className="header-content">
        <h1>Women in Cloud</h1>
        <p className="header-description">
          Women in Cloud busca amplificar el poder de su red global de 100,000
          mujeres fundadoras, ejecutivas, profesionales y aliadas de la
          tecnología en 67 países, comienza ahora.
        </p>
        <Grid container justifyContent="center" sx={{ marginTop: "20px" }}>
          <Box
            className="header-search-container"
            ref={inputContainerRef}
            sx={{ display: "flex", alignItems: "center" }}
          >
            <RoundedBtn
              disable={showClearButton}
              icon={<AttachFileIcon />}
              onClick={handleImgUpload}
            />
            <input
              type="file"
              disabled={showClearButton}
              accept="application/pdf"
              ref={fileInputRef}
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
            <Autocomplete
              options={jobOptions}
              value={selectedJob}
              onChange={handleSelectChange}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Buscar en todos los recursos"
                  size="small"
                  inputRef={inputRef}
                />
              )}
              sx={{ minWidth: 400 }}
            />
            <RoundedBtn
              disable={!selectedJob}
              icon={<SendIcon />}
              onClick={handleSelectSubmit}
            />
            {showClearButton && (
              <RoundedBtn
                icon={<ClearIcon />} // Asegúrate de importar y usar el icono correcto para limpiar
                onClick={clearData}
              />
            )}
          </Box>
        </Grid>
      </div>
    </div>
  );
}

export default Header;