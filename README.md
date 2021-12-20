# dev-to-wxr
Small (fragile) script for migrating comments from dev.to posts to Wordpress format (WXR/XML). Useful for importing in tools like disqus.

## Usage
0. Install `git`, `node`(14+), `yarn`
1. Clone this repo
  ```bash
  git clone https://github.com/fa7ad/dev-to-wxr
  ```
2. Install dependencies
  ```bash
  yarn
  ```
3. Set environment variable and run script
  ```bash
export DEV_USERNAME=fa7ad # your username here
node index.js
  ```
4. You should get a `devto-{YOUR USERNAME}.wxr.xml` file

## LICENSE
MIT
