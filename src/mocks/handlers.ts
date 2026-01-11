import { http, HttpResponse } from "msw";

export const handlers = [
  // Example handler
  http.get("/api/user", () => {
    return HttpResponse.json({
      id: "c7b3d8e0-5e0b-4b0f-8b3a-3b9b9b9b9b9b",
      firstName: "John",
      lastName: "Maverick",
    });
  }),
];
