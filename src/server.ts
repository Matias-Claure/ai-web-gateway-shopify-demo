import { createApp } from "./app";
import { getEnv } from "./config/env";

const app = createApp();
const env = getEnv();

app.listen(env.PORT, () => {
  console.log(`AI web gateway listening on http://localhost:${env.PORT}`);
});
