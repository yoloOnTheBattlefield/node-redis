const mongoose = require("mongoose");
const redis = require("redis");
const util = require("util");
const redisUrl = "redis://127.0.0.1:6379";
const client = redis.createClient(redisUrl);
client.hget = util.promisify(client.hget);
const exec = mongoose.Query.prototype.exec;
const stringify = data => JSON.stringify(data);

mongoose.Query.prototype.cache = function(options = {}) {
  this.useCache = true;
  this.hashKey = stringify(options.key || "");
  return this;
};

mongoose.Query.prototype.exec = async function() {
  if (!this.useCache) {
    return exec.apply(this, arguments);
  }
  const key = stringify({
    ...this.getQuery(),
    collection: this.mongooseCollection.name
  });
  const cacheValue = await client.hget(this.hashKey, key);
  if (cacheValue) {
    const document = JSON.parse(cacheValue);
    const result = Array.isArray(document)
      ? document.map(doc => new this.model(doc))
      : new this.model(document);
    return result;
  }
  const result = await exec.apply(this, arguments);
  await client.hset(this.hashKey, key, stringify(result), "EX", 10);
  return result;
};

module.exports = {
  clearHash(hashKey) {
    client.del(stringify(hashKey));
  }
};
