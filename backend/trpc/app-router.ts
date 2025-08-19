import { createTRPCRouter } from "./create-context";
import hiRoute from "./routes/example/hi/route";
import messagesRouter from "./routes/messages/messages";
import threadsRouter from "./routes/messages/threads";

export const appRouter = createTRPCRouter({
  example: createTRPCRouter({
    hi: hiRoute,
  }),
  messages: messagesRouter,
  threads: threadsRouter,
});

export type AppRouter = typeof appRouter;