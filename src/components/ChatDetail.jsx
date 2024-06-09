import React, { useState, useRef } from "react";
import RoundedBtn from "./Common/RoundedBtn";
import SendIcon from "@mui/icons-material/Send";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import KeyboardVoiceIcon from "@mui/icons-material/KeyboardVoice";
import { TextField, Grid, Box } from "@mui/material";
import { ReactMic } from "react-mic";

function ChatDetail() {
  const [typing, setTyping] = useState(false);
  const [recording, setRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState(null);

  const inputRef = useRef(null);

  const handleImgUpload = () => {};

  const handleInputChange = (event) => {
    setTyping(event.target.value.length > 0);
  };

  const handleInputSubmit = () => {
    if (inputRef.current.value.length > 0) {
      inputRef.current.value = "";
      inputRef.current.focus();
      setTyping(false);
    }
  };

  const handleMicClick = () => {
    setRecording(true);
    setTimeout(() => {
      setRecording(false);
    }, 10000);
  };

  const onStop = (recordedBlob) => {
    setRecordedBlob(recordedBlob);
    console.log("Recorded Blob: ", recordedBlob);
  };

  return (
    <Grid container justifyContent="center" sx={{ marginTop: "10px" }}>
      <Box>
        <span>
          <RoundedBtn icon={<AttachFileIcon />} onClick={handleImgUpload} />
        </span>
        <TextField
          sx={{ margin: "0px 10px 0px 10px" }}
          size="small"
          type="text"
          placeholder="Type a message"
          onChange={handleInputChange}
          inputRef={inputRef}
        />
        <span>
          {typing ? (
            <RoundedBtn icon={<SendIcon />} onClick={handleInputSubmit} />
          ) : (
            <RoundedBtn icon={<KeyboardVoiceIcon />} onClick={handleMicClick} />
          )}
        </span>
        {recording && (
          <ReactMic
            record={recording}
            className="sound-wave"
            onStop={onStop}
            strokeColor="#000000"
            backgroundColor="#FF4081"
          />
        )}
      </Box>
    </Grid>
  );
}

export default ChatDetail;
