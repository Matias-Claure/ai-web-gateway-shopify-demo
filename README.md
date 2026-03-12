# AI Web Gateway Shopify Demo

## What this project is

A local-first Node/TypeScript gateway that exposes a machine-readable AI interface for a Shopify store. It sits between an AI agent and Shopify, publishes a manifest, validates requests, and only exposes the actions you choose to allow.

## Why it exists

This prototype lets AI systems safely discover and invoke merchant-approved actions without modifying Shopify theme code. The current implementation is focused on product discovery and checkout-link creation.

## Demo architecture

Shopify Storefront API -> local Express gateway -> AI-safe manifest and proxy routes

## Setup

1. Copy `.env.example` to `.env`.
2. Fill in your Shopify store domain, Storefront API token, and `AI_GATEWAY_API_KEY`.
3. Install dependencies with `npm install`.
4. Start the app with `npm run dev`.
5. Open `http://localhost:3000/dashboard` to review which actions are enabled.

## Required Shopify configuration

You need a Shopify Storefront API access token and your store domain, for example `your-store.myshopify.com`.

## Environment variables

- `PORT`: local server port. Defaults to `3000`.
- `SHOPIFY_STORE_DOMAIN`: Shopify store domain.
- `SHOPIFY_STOREFRONT_ACCESS_TOKEN`: Storefront API token.
- `AI_GATEWAY_API_KEY`: shared secret required on `/ai/*` routes.
- `ACTION_SETTINGS_FILE`: optional path for saved dashboard action settings. Defaults to `./data/action-settings.json`.
- `NODE_ENV`: environment name, usually `development`.

## Local run instructions

- `npm run dev`: start the local dev server.
- `npm run build`: compile TypeScript to `dist/`.
- `npm start`: run the compiled server.
- `npm test`: run the Vitest suite.

## Endpoint reference

- `GET /health`
- `GET /.well-known/ai-interface.json`
- `GET /dashboard`
- `GET /ai/search-products?q=hoodie`
- `GET /ai/product-details?handle=black-hoodie`
- `POST /ai/add-product-to-cart-by-search`
- `POST /ai/create-checkout-link`

## Current AI actions

The dashboard currently manages these implemented actions:

- `search_products`: search the Shopify catalog by query text
- `get_product_details`: retrieve a structured product record by handle
- `create_checkout_link`: create a cart and checkout URL from a variant ID
- `add_product_to_cart_by_search`: fuzzy-match a product name, select an available variant, and create a checkout URL

`add_product_to_cart_by_search` is the simplest entry point for an AI agent when the user gives a partial or slightly misspelled product name.

## Dashboard

Open `http://localhost:3000/dashboard` and sign in with your current `AI_GATEWAY_API_KEY`.

From there you can:

- see every AI API call currently supported by the gateway
- enable or disable each call
- update the live manifest immediately
- block disabled routes at runtime

Settings persist in `data/action-settings.json` by default. You can override that path with `ACTION_SETTINGS_FILE`.

## Recommended test flow

1. Start the server with `npm run dev`.
2. Check `http://localhost:3000/health`.
3. Open `http://localhost:3000/dashboard` and confirm the actions you want are enabled.
4. Open `http://localhost:3000/.well-known/ai-interface.json` and confirm the manifest only includes enabled actions.
5. Run one of the sample `curl` commands below.

## Sample curl requests

Manifest:

```bash
curl http://localhost:3000/.well-known/ai-interface.json
```

Search products:

```bash
curl -H "x-ai-gateway-key: replace_with_random_secret" \
  "http://localhost:3000/ai/search-products?q=hoodie"
```

Product details:

```bash
curl -H "x-ai-gateway-key: replace_with_random_secret" \
  "http://localhost:3000/ai/product-details?handle=black-hoodie"
```

Create checkout link:

```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -H "x-ai-gateway-key: replace_with_random_secret" \
  -d '{"variantId":"gid://shopify/ProductVariant/1234567890","quantity":1}' \
  http://localhost:3000/ai/create-checkout-link
```

Add product to cart by search:

```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -H "x-ai-gateway-key: replace_with_random_secret" \
  -d '{"query":"doen juliene top","quantity":1}' \
  http://localhost:3000/ai/add-product-to-cart-by-search
```

## Make localhost public with ngrok

If you want an external AI agent to reach your local gateway, expose it through ngrok.

1. Make sure the app is running locally:

```bash
npm run dev
```

2. In a second terminal, start ngrok on port `3000`:

```bash
ngrok http 3000
```

3. Copy the public HTTPS URL that ngrok prints, for example:

```text
https://your-subdomain.ngrok-free.dev
```

4. Verify the public tunnel:

```bash
curl https://your-subdomain.ngrok-free.dev/health
```

5. Use these public URLs with your AI agent:

- base URL: `https://your-subdomain.ngrok-free.dev`
- manifest: `https://your-subdomain.ngrok-free.dev/.well-known/ai-interface.json`
- dashboard: `https://your-subdomain.ngrok-free.dev/dashboard`

6. Include the gateway header on all `/ai/*` requests:

```text
x-ai-gateway-key: YOUR_AI_GATEWAY_KEY
```

Notes:

- The tunnel only stays live while both your local app and ngrok are running.
- The dashboard is also publicly reachable while the tunnel is active.
- Right now the dashboard login uses the same key as the gateway itself, so treat that key as sensitive.

## Add this project to GitHub

This folder is not currently a Git repository, so start there.

1. Initialize Git locally:

```bash
git init
```

2. Stage the project:

```bash
git add .
```

3. Create your first commit:

```bash
git commit -m "Initial AI web gateway Shopify demo"
```

4. Create a new empty GitHub repository in the GitHub UI.

Suggested name:

```text
ai-web-gateway-shopify-demo
```

Do not add a README, `.gitignore`, or license from GitHub if you are pushing this folder as-is.

5. Connect your local repo to GitHub:

```bash
git remote add origin https://github.com/YOUR_USERNAME/ai-web-gateway-shopify-demo.git
```

6. Rename the default branch to `main`:

```bash
git branch -M main
```

7. Push the project:

```bash
git push -u origin main
```

If GitHub prompts for authentication, sign in with GitHub CLI, a browser flow, or a personal access token depending on your local Git setup.

After that, your code will be live on GitHub and you can keep updating it with:

```bash
git add .
git commit -m "Describe your change"
git push
```

## Future roadmap

- Add richer observability and request tracing.
- Support stronger authentication patterns.
- Expand beyond Shopify once the manifest format is proven.
