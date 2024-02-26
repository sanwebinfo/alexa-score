# DENO CLI

Deno CLI to Send Messages to Clients.

- Create `config.json` file for store your `x-api-key` and Site URL

```json
{
  "apiUrl": "https://api.example.com/api",
  "apiKey": "<YOUR_API_KEY>"
}
```

- Send Messages to Clients

```sh
deno run --allow-net --allow-read cli.ts --config=config.json --message="HI"

or 

deno task send --message="HI"

```
