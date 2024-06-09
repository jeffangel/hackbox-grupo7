import axios from "axios";
const API_SERVICE = process.env.REACT_APP_API_SERVICE;
const API_SERVICE_FILE = process.env.REACT_APP_API_SERVICE_FILE;

export async function enviarRol(rol) {
 
  const rolCodificado = encodeURIComponent(rol);
  const url = `${API_SERVICE}${rolCodificado}`;

  try {
    const response = await axios.get(url);
    if (response.status !== 200) {
      throw new Error(`Error en la solicitud: ${response.statusText}`);
    }
    const data = response.data;
    return data;
  } catch (error) {
   
    console.error("Hubo un problema con la solicitud:", error);
  }
}

export const uploadFile = async (fileArrayBuffer) => {
  try {
    const response = await axios.post(`${API_SERVICE_FILE}`, fileArrayBuffer, {
      headers: {
        "Content-Type": "application/pdf",
      },
    });

    const data = response.data;
    return data;
  } catch (error) {
    console.error("Error uploading file", error);
  }
};