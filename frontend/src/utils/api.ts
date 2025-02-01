const BASE_URL = import.meta.env.VITE_API_URL;

interface IRequestParams<T> {
  endpoint: string;
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: BodyInit;
  onSuccess: (data: T) => void;
  onFailure: (error: string) => void;
}

export const request = async <T>({
  endpoint,
  method = "GET",
  body,
  onSuccess,
  onFailure,
}: IRequestParams<T>): Promise<void> => {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method,
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
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
