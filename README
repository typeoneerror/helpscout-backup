# HelpScout Docs Backup

Quick and dirty script to back up a HelpScout docs site.
Collections are saved to `data/collections/` and Articles are saved to `data/articles/`.
The name of each file will be `<slug>-<id>.json` and the contents is just a dump
of the JSON returned by the API. Your actual article content is in the `text` property as HTML.

1. Set up a [HelpScout API Token](https://developer.helpscout.com/docs-api/#your-api-key)
2. `npm install`
3. Create `.env` file by duplicating `.env.example` and add your API Token
4. Run `node index.js` to backup your data to the `data` folder as described
