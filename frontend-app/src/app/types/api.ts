type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

export type RequestOptions = {
  method?: HttpMethod;
  body?: unknown;
};
