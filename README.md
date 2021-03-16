# sonar-deploy-action

A Github action to deploy applications to SONAR.

## Release

```
git tag v1.0.1
git push --tags
```

A generalized major version tag (ex. `v1`) is automatically synced to point to any released minor and patch versions through the [update-semver workflow](https://github.com/TakeScoop/sonar-deploy-action/blob/master/.github/workflows/update-semver.yml)
