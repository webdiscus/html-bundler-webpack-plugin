const moduleUrl = process.env.MODULE_URL;

const send = (data) => {
  if (process.send) process.send(data);
};

try {
  const mod = await import(moduleUrl);
  send({ result: mod.default ?? mod });
} catch (err) {
  send({ error: { message: err.message, stack: err.stack } });
}
