# Release Process

## Branch flow

feature/chore → develop  
develop → main

Feature and chore branches may be squash-merged into `develop`.

Promotions from `develop` to `main` should use **Create a merge commit**.

## Prepare a release

1. Update the package version on a branch created from `develop`.
2. Merge the version bump into `develop`.
3. Open a PR from `develop` into `main`.
4. Merge the PR using **Create a merge commit**.

## Publish

Create a GitHub Release with a tag matching the package version:

package.json:
0.1.3

GitHub Release:
v0.1.3

Publishing the release triggers `.github/workflows/publish.yml`.

The workflow:

1. Verifies the tag matches `package.json`.
2. Runs lint.
3. Builds the package.
4. Runs tests.
5. Publishes to npm using Trusted Publishing / OIDC.

No npm publish token is stored in GitHub.