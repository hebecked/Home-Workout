# Private release configuration

The provider postal address is not part of the tracked source or tests. Supply `HW_LEGAL_ADDRESS` as pipe-separated street, postal code/city, and country in `.env.production.local` (ignored by Git) or the release environment. Never paste the value into GitHub issues, workflow files, logs, test expectations or build artifacts uploaded to GitHub.

Use `npm run deploy:cloudflare` for releases: it typechecks, validates the private configuration, builds and publishes to the existing Cloudflare project. CI uses no private address. Its development build displays an explicit missing-address notice and is not a public release.

The address remains public in the deployed Impressum and its downloaded JavaScript, including offline copies. This separation prevents new source commits containing it; it does not remove earlier commits, forks, clones or caches. History cleanup requires separate authorization.
