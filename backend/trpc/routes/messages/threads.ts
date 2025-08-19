import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../../create-context";
import { threads } from "./data";
import { ThreadSchema } from "./types";

export default createTRPCRouter({
  list: publicProcedure.query(() => {
    return threads.sort((a, b) => b.timestamp - a.timestamp).map((t) => ThreadSchema.parse(t));
  }),
});
