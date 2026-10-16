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

## Homepage photo storage

Homepage photographs use the existing MongoDB `DATABASE_URL` for persistent
storage when `BLOB_READ_WRITE_TOKEN` is empty. No additional account or API key is
required. The `HomepageImage` collection stores processed WebP bytes independently
of Hostinger's build directories. Uploads accept JPG, PNG, WebP or AVIF up to 8 MiB,
resize to a maximum of 2200px, and cap the processed result at 4 MiB.

Image URLs use `/media/chulimaar/<sha256>.webp`, with immutable browser caching.
Uploading the same processed image reuses its URL and database record. Saving the
homepage publishes the selected image; uploading alone prepares its preview.
Replacing/removing a photo from the homepage does not delete its original stored
record, so existing public URLs remain valid. Images count toward Atlas storage.

The collection has only its standard MongoDB primary-key index and is created on
the first upload. Deployment's existing `prisma generate` step includes the new
model; no reset, seed, or destructive schema migration is needed.

Setting `BLOB_READ_WRITE_TOKEN` optionally uses Vercel Blob for new uploads instead.
Previously stored Atlas images remain available through the media route. Legacy
catalogue/video/payment-proof uploads still use the separate storage adapter and
need Vercel Blob before relying on them across deployments. Do not use a build's
`public/uploads` directory as durable production storage.

## Verification

The Atlas-backed homepage photo implementation was checked in production mode
against a disposable local replica set on 16 October 2026. Verified real image
decoding/WebP conversion, upload permissions and origin validation, invalid/large
image rejection, binary database storage, duplicate-content reuse, public image
delivery, cache headers/304 responses, saved homepage rendering and persistence
after stopping/restarting the application. Tests used no Blob token.

After deployment, check the public page, static assets, `/admin/login`, `/privacy`
and the pre-launch shopping redirects. After connecting MongoDB, verify a real
signup, owner login and an admin save. Confirm uploaded images survive redeployment
after any storage-provider changes.

Hostinger setup reference:
https://www.hostinger.com/support/how-to-deploy-a-nodejs-website-in-hostinger/
