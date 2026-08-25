const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const source = fs.readFileSync(
  path.join(__dirname, "..", "assets", "js", "mp3-frontend.js"),
  "utf8",
);
const match = source.match(/function normalizeString\(str\) \{[\s\S]*?\n  \}/);
const requestHelpers = source.match(
  /function beginRequest\(container\) \{[\s\S]*?\n  \}\n\n  function isCurrentRequest\(container, requestId\) \{[\s\S]*?\n  \}/,
);

assert.ok(match, "normalizeString must remain available");
assert.ok(requestHelpers, "request freshness helpers must remain available");

const context = {};
vm.runInNewContext(
  `${match[0]}; ${requestHelpers[0]}; result = { normalizeString, beginRequest, isCurrentRequest };`,
  context,
);
const normalizeString = context.result.normalizeString;
const beginRequest = context.result.beginRequest;
const isCurrentRequest = context.result.isCurrentRequest;

assert.equal(
  normalizeString("Les droits de la fraternité"),
  "les droits de la fraternite",
);
assert.equal(
  normalizeString("Les droits de la fraternité (01)"),
  "les droits de la fraternite (01)",
);
assert.equal(normalizeString("L’ordre d’Allah"), "l ordre d allah");
assert.equal(
  normalizeString("Règles_vestimentaires"),
  "regles vestimentaires",
);

const values = {};
const container = {
  data(key, value) {
    if (value === undefined) {
      return values[key];
    }
    values[key] = value;
  },
};
const firstRequest = beginRequest(container);
const secondRequest = beginRequest(container);

assert.equal(firstRequest, 1);
assert.equal(secondRequest, 2);
assert.equal(isCurrentRequest(container, firstRequest), false);
assert.equal(isCurrentRequest(container, secondRequest), true);

assert.match(source, /loadMoreItems\(container, 1, true, requestId\)/);
assert.match(source, /input\.closest\("\.mp3-listing-container"\)/);
assert.match(source, /if \(!isCurrentRequest\(container, requestId\)\)/);
assert.doesNotMatch(source, /mp3_ajax_params/);

console.log("Search regression checks passed.");
