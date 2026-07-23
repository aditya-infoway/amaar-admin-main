import axios from "axios";
import { toast } from "sonner";
// import { decryptData } from "./reusable";

//Toast massage
export function toasterrormsg(message: any) {
  toast.error(message);
}

export function toastsuccessmsg(message: any) {
  toast.success(message);
}

//url
export const URL = {
  uaturl: "",
  productionurl: "",
  localurl: "http://192.168.1.35:8001/",
};

//get the x-token if store in session
function getToken() {
  return sessionStorage.getItem("authToken") || "";
}

// API HEADER
// headers for api
function Header(useHeader: any) {
  const xToken = getToken();
  return useHeader
    ? {
        headers: {
          "x-token": xToken,
          apitoken: "2ed1b72407c91c22dc7bd2b729f67145",
          "Content-Type": "multipart/form-data",
          "elevel": 0,
        },
      }
    : {
        headers: {
          "x-token": xToken,
          apitoken: "2ed1b72407c91c22dc7bd2b729f67145",
          "Content-Type": "application/json",

            
          "elevel": 0,
        },
      };
}
//header for delete method
function Header_delete(useHeader: any) {
  const xToken = getToken();
  return useHeader
    ? {
        "x-token": xToken,
        apitoken: "2ed1b72407c91c22dc7bd2b729f67145",
        "Content-Type": "multipart/form-data",
        "elevel": 0,
      }
    : {
        "x-token": xToken,
        apitoken: "2ed1b72407c91c22dc7bd2b729f67145",
        "Content-Type": "application/json",
        "elevel": 0,
      };
}

//Logout


const Logout=()=> {
    sessionStorage.clear()
    location.reload()
}

export const Post = async (fileName: string, data: any, useHeader: any) => {
    try {
      const url = `${URL.localurl}${fileName}`;
      const response = await axios.post(url, data, Header(useHeader));
  
      if (response.data.status == 403) {
        console.log("hshshsh");
        
        Logout();
      }
  
      return response;
    } catch (error) {
      console.log("Error fetching data: ", error);
      if (axios.isAxiosError(error) && error.response?.status === 403) {
        Logout();
      }
      throw error;
    }
  };
  
  // API CALL for DELETE method
  export const Delete = async (fileName: string, data: any, useHeader: any) => {
    try {
      const header = Header_delete(useHeader);
      const url = `${URL.localurl}${fileName}`;
      const response = await axios.delete(url, { data: data, headers: header });
  
      if (response.data.status === 403) {
        Logout();
      }
  
      return response;
    } catch (error) {
      console.error("There was an error deleting the data:", error);
      if (axios.isAxiosError(error) && error.response?.status === 403) {
        Logout();
      }
      throw error;
    }
  };
  
  // API CALL for PATCH method
  export const Patch = async (fileName: string, data: any, useHeader: any) => {
    try {
      const url = `${URL.localurl}${fileName}`;
      const response = await axios.patch(url, data, Header(useHeader));
      console.log(response, "ppppsssss");
  
      if (response.data.status === 403) {
        Logout();
      }
  
      return response;
    } catch (error) {
      console.log("Error fetching data: ", error);
      if (axios.isAxiosError(error) && error.response?.status === 403) {
        Logout();
      }
      throw error;
    }
  };
  
  // API CALL for GET method
  export const Get = async (fileName: string, data: any, useHeader: any) => {
    try {
      const url = `${URL.localurl}${fileName}`;
      const response = await axios.get(url, { params: data, ...Header(useHeader) });
  
      if (response.data.status === 403) {
        Logout();
      }
  
      return response;
    } catch (error) {
      console.error("Error fetching data: ", error);
      if (axios.isAxiosError(error) && error.response?.status === 403) {
        Logout();
      }
      throw error;
    }
  };
  
  // API CALL for PUT method
  export const Put = async (fileName: string, data: any, useHeader: any) => {
    try {
      const url = `${URL.localurl}${fileName}`;
      const response = await axios.put(url, data, Header(useHeader));
      console.log(response, "ppppsssss");
  
      if (response.data.status === 403) {
        Logout();
      }
  
      return response;
    } catch (error) {
      console.log("Error fetching data: ", error);
      if (axios.isAxiosError(error) && error.response?.status === 403) {
        Logout();
      }
      throw error;
    }
  };
