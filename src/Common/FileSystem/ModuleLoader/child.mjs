// This file is used in the ./loader.js

import { serialize } from 'node:v8';

const moduleUrl = process.env.MODULE_URL;

try {
  const module = await import(moduleUrl);
  const result = module.default ?? module;

  if (process.send) {
    process.send({ buffer: serialize(result) });
  }
} catch (err) {
  if (process.send) {
    process.send({
      error: { message: err.message, stack: err.stack },
    });
  }
}
