# Hostinger deployment

## Source and build

- Repository: `https://github.com/abeealia33-stack/Taazo`
- Deployment branch: `main`
- Temporary address: `https://deepskyblue-dove-264491.hostingersite.com`
- Framework: Next.js (server application)
- Node.js: 22.x
- Root directory: `./`
- Package manager: npm
- Build command: `npm run build`
- Output directory: `.next`
- Production start command in the repository: `npm start` (`next start`).

The Hostinger GitHub integration deploys pushes to the connected branch. A local
commit must be pushed with `git push origin main` before Hostinger can deploy it.
Check the website's Deployments screen for the commit and build result. A failed
build does not publish that commit. Do not use ZIP uploads for this workflow.

## Configuration

Set these in Hostinger's environment variable editor:

- `CHULIMAAR_SITE_URL=https://deepskyblue-dove-264491.hostingersite.com`
- `NEXT_PUBLIC_SITE_URL=https://deepskyblue-dove-264491.hostingersite.com`

Update both values when connecting the final domain, then redeploy.

## Database and admin

The public homepage can render default content without a database. Signup storage,
owner login and homepage editing require a reachable MongoDB replica set, such as
MongoDB Atlas, configured through `DATABASE_URL`. The developer computer's
`localhost` database is not available to the Hostinger server.

Configure a production `AUTH_SECRET` before using admin sessions. Preserve or
securely migrate the existing owner account and any saved homepage content; do not
run the legacy catalogue seed to initialise production. Review the schema changes
and run `npm run prelaunch:setup` against the intended database from an authorised
environment. Never commit connection strings, secrets or `.env` files.

MongoDB Atlas and the production session secret were configured on 16 October
2026. The `chulimaar` database has its schema, signup expiry index and an approved
owner account. Live owner sign-in, the signup dashboard, website editor access
and saving existing homepage content were verified. Credentials are kept outside Git.

Hostinger's runtime could not resolve the Atlas SRV address. Its `DATABASE_URL`
therefore uses the equivalent standard `mongodb://` seed list with TLS enabled,
the cluster's replica set and `authSource=admin`. Keep the full seed list when
updating this value; it uses the same database credentials and permissions.

## Photo storage still required

Uploaded photographs also need persistent storage before using the admin image
editor. The existing adapter supports Vercel Blob through `BLOB_READ_WRITE_TOKEN`.
Uploads written into a deployment's `public/uploads` directory are not a durable
store across redeployments. Keep credentials in Hostinger's environment settings.
The production homepage editor and its upload endpoint keep uploads disabled
until the persistent storage token is configured; existing image descriptions,
captions, crop controls and public placeholders remain available.

## Verification

After deployment, check the public page, static assets, `/admin/login`, `/privacy`
and the pre-launch shopping redirects. After connecting MongoDB, verify a real
signup, owner login and an admin save. Confirm uploaded images survive redeployment
after persistent storage is configured.

Hostinger setup reference:
https://www.hostinger.com/support/how-to-deploy-a-nodejs-website-in-hostinger/
