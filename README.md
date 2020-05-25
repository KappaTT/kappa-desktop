# ktt-web &middot; [![Netlify Status](https://api.netlify.com/api/v1/badges/06850475-210a-452a-9c2c-0acf54de50df/deploy-status)](https://app.netlify.com/sites/kappa-app/deploys)

<img src="assets/icon.png#rounded" style="border-radius: 25%; overflow: hidden;" width="256" />

## Development

| command      | description                                                  |
| ------------ | ------------------------------------------------------------ |
| `expo start` | run the development server. Add the `-c` flag to clear cache |

## Deploy

1. `npm install -g netlify-cli` if you don't have netlify installed
2. `expo build:web` to build the `web-build` production directory
3. `netlify deploy --prod`, choose `web-build` as the publish directory
