# AGENTS.md
## Project
Build a local-first Node/TypeScript gateway that exposes a machine-readable AI
interface for a Shopify store.

## Product goal
Allow AI systems to safely discover and call a limited set of merchant-approved
actions through a standardized manifest and safe proxy routes.

## Current MVP scope
Only implement these actions:
1. search_products
2. get_product_details
3. create_checkout_link

Do not implement any destructive or admin-only Shopify actions.

## Constraints
- This repo is a separate service, not a Shopify theme.
- Use TypeScript throughout.
- Use Express for the HTTP server.
- Use Zod for request validation.
- Use Shopify Storefront API, not Admin API, unless explicitly required later.
- Keep the code modular and easy to demo locally.
- Favor readability over premature abstraction.

## API contract
The service must expose:
- GET /.well-known/ai-interface.json
- GET /ai/search-products
- GET /ai/product-details
- POST /ai/create-checkout-link
- GET /health

## Safety rules
- Require x-ai-gateway-key on /ai/* routes.
- Validate all request inputs with Zod.
- Never expose private secrets in responses.
- Never add refund, delete, customer-account, or admin mutation endpoints.
- Log requests in a simple structured format.

## Output expectations
When making changes:
- update README if setup changes
- keep .env.example accurate
- include or update tests when practical
- prefer small, reviewable commits

## Developer experience
- Add npm scripts for dev, build, start, and test.
- Keep local setup simple.
- Add sample curl commands to README.
