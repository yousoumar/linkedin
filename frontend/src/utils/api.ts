const BASE_URL = import.meta.env.VITE_API_URL;

interface IRequestParams<T> {
  endpoint: string;
  method?: "GET" | "POST" | "PUT" | "DELETE";
  contentType?: "application/json" | "multipart/form-data";
  body?: BodyInit | FormData;
  onSuccess: (data: T) => void;
  onFailure: (error: string) => void;
}

interface IHeaders extends Record<string, string> {
  Authorization: string;
}

export const request = async <T>({
  endpoint,
  method = "GET",
  body,
  contentType = "application/json",
  onSuccess,
  onFailure,
}: IRequestParams<T>): Promise<void> => {
  const headers: IHeaders = {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  };

  if (contentType === "application/json") {
    headers["Content-Type"] = "application/json";
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method,
      headers,
      body,
    });

    if (!response.ok) {
      if (response.status === 401 && !window.location.pathname.includes("authentication")) {
        window.location.href = "/authentication/login";
        return;
      }

      const { message } = await response.json();
      throw new Error(message);
    }

    const data: T = await response.json();
    onSuccess(data);
  } catch (error) {
    if (error instanceof Error) {
      onFailure(error.message);
    } else {
      onFailure("An error occurred. Please try again later.");
    }
  }
};
