import { fileURLToPath } from "node:url";
import { join, resolve } from "node:path";
import {
  config,
} from "dotenv";

import createFetchMock from "vitest-fetch-mock";
import { vi } from "vitest";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

const root = resolve(__dirname, "../../..");

config({
  path: join(root, ".env"),
});

const fetchMocker = createFetchMock(vi);

fetchMocker.enableMocks();
fetchMocker.dontMock();
