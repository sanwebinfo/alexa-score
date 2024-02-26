import { parse } from "https://deno.land/std/flags/mod.ts";
import { green, red, yellow } from "https://deno.land/std/fmt/colors.ts";
import { wait } from "https://deno.land/x/wait/mod.ts";

async function getToken(apiKey: string, apiUrl: string): Promise<string> {
  const response = await fetch(apiUrl + "/token", {
    method: "GET",
    headers: {
      "x-api-key": apiKey,
    },
  });

  if (!response.ok) {
    throw new Error(red("❌ Failed to Generate token"));
  }

  const data = await response.json();
  console.log(green(" 🔑 Token Generated Successfully \n"));
  return data.token;
}

async function sendMessage(
  jwtToken: string,
  apiUrl: string,
  message: string,
): Promise<void> {
  const response = await fetch(apiUrl + "/alexa", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "authorization": jwtToken,
    },
    body: JSON.stringify({ alexamessage: message }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(red("❌ Failed to send message: " + data.errors[0].msg));
  }

  console.log(green(" ✅ " + data.alexamessage + " 🚀 \n"));
}

const { message, config } = parse(Deno.args);

if (!config || typeof config !== "string") {
  console.error(
    yellow(
      "⚠️ Usage: deno run --allow-net --allow-read cli.ts --config=config.json",
    ),
  );
  Deno.exit(1);
}

try {
  await Deno.stat(config);
} catch (error) {
  if (error instanceof Deno.errors.NotFound) {
    console.error(red("❌ Config file not found."));
    Deno.exit(1);
  } else {
    console.error(red("❌ Error accessing config file:"), error.message);
    Deno.exit(1);
  }
}

try {
  const configFile = await Deno.readTextFile(config);
  const { apiKey, apiUrl } = JSON.parse(configFile);

  if (!apiKey || !apiUrl || !message) {
    console.error(
      yellow(
        "⚠️ Usage: deno run --allow-net --allow-read cli.ts --config=config.json --message=<Your Message>",
      ),
    );
    Deno.exit(1);
  }
  
  console.log('\n');
  const spinner = wait("Generating token...").start();
  await sleep(2000);
  spinner.stop();
  const jwtToken = await getToken(apiKey, apiUrl);
  await sleep(2000);
  const sendingdata = wait("Sending Message...").start();
  await sleep(2000);
  sendingdata.stop();
  await sendMessage(jwtToken, apiUrl, message);
} catch (error) {
  console.error(red("❌ Error:"), error.message);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
