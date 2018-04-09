const mongoose = require("mongoose");
const redis = require("redis");
const util = require("util");
const redisUrl = "redis://127.0.0.1:6379";
const client = redis.createClient(redisUrl);
client.get = util.promisify(client.get);
const exec = mongoose.Query.prototype.exec;
const stringify = data => JSON.stringify(data);

mongoose.Query.prototype.exec = async function() {
  const key = stringify({
    ...this.getQuery(),
    collection: this.mongooseCollection.name
  });
  const cacheValue = await client.get(key);
  if (cacheValue) {
    const document = JSON.parse(cacheValue);
    console.log(document);
    const result = Array.isArray(document)
      ? document.map(doc => new this.model(doc))
      : new this.model(document);
    return result;
    // return exec.apply(this, arguments);
  }

  // see if we have a value for key
  // if yes issue it

  // otherwise, store it in redis the issue it

  const result = await exec.apply(this, arguments);
  client.set(key, stringify(result));
  return result;
};
