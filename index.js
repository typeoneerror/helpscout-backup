const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const { default: axios } = require('axios');
const { RateLimit } = require('async-sema');

dotenv.config();

const auth = {
  username: process.env.HELPSCOUT_API_TOKEN,
  password: 'X',
};

const hs = axios.create({
  baseURL: 'https://docsapi.helpscout.net/v1/',
  auth,
});

// SEE: https://developer.helpscout.com/docs-api/#rate-limiting
const limit = RateLimit(2000, {
  timeUnit: 10 * 60 * 1000,
});

const dataDir = path.join(__dirname, 'data');

async function fetchCollections() {
  console.log('Fetching collections...');

  const {
    data: {
      collections: { items: collections },
    },
  } = await hs.get('collections');

  return collections;
}

async function fetchAllArticles(collections) {
  console.log('Fetching articles...');

  return (
    await Promise.all(
      collections.map(async (collection) => {
        const articles = await fetchArticles(collection);

        await limit();

        return articles;
      })
    )
  ).flat();
}

async function fetchArticles(collection) {
  const {
    data: {
      articles: { items: articles },
    },
  } = await hs.get(`collections/${collection.id}/articles`);

  return articles;
}

async function writeBackup(fileName, data, dirName = 'articles') {
  const backupPath = path.join(dataDir, dirName, fileName);

  fs.writeFileSync(backupPath, JSON.stringify(data, null, 2), 'utf-8');

  console.log(`Wrote ${fileName} to disk...`);
}

async function backupArticles(articles) {
  console.log('Backing up articles...');

  for (const article of articles) {
    const { article: data } = await fetchArticle(article);
    const { id, slug } = data;
    const fileName = `${slug}-${id}.json`;

    writeBackup(fileName, data);

    await limit();
  }
}

async function backupCollections(collections) {
  console.log('Backing up collections...');

  for (const collection of collections) {
    const { id, slug } = collection;
    const fileName = `${slug}-${id}.json`;

    writeBackup(fileName, collection, 'collections');
  }
}

async function fetchArticle({ id: articleId }) {
  const { data: article } = await hs.get(`articles/${articleId}`);

  return article;
}

(async () => {
  const collections = await fetchCollections();
  const articles = await fetchAllArticles(collections);

  await backupCollections(collections);
  await backupArticles(articles);

  console.log('Done.');
})();
