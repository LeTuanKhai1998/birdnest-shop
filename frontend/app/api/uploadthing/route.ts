import { createRouteHandler } from "uploadthing/next";
import { ourFileRouter } from "./core";

// Set SSL bypass for development
if (process.env.NODE_ENV === 'development') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,
}); 