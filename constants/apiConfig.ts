// export const BACKEND_URL = "https://early-bobcats-double.loca.lt";
// export const BACKEND_URL = "http://10.55.24.66:5000";

// export const BACKEND_URL =
//   "https://dermiamobile21--dermia-backend-api.modal.run";
//export const BACKEND_URL = "http://192.168.10.8:5000";

const CLOUD_URL = "https://dermiamobile21--dermia-backend-api.modal.run";

// export const LOCAL_URL = "http://192.168.10.8:5000";

export const LOCAL_URL = "http://192.168.10.12:5000";

export const getActiveBackendUrl = async () => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 2000);

  try {
    const response = await fetch(`${LOCAL_URL}/`, {
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      console.log("Local server found! Routing to Local.");
      return LOCAL_URL;
    }
  } catch (error) {
    // console.log("Local Server Error Details:", error.message);
    console.log("Local server unreachable. Routing to Modal Cloud.");
  }

  clearTimeout(timeoutId);
  return CLOUD_URL;
};
