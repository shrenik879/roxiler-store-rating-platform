function ok(res, { data = null, message = 'OK', meta = undefined, status = 200 } = {}) {
  const body = { success: true, message, data };
  if (meta) body.meta = meta;
  return res.status(status).json(body);
}

function created(res, { data = null, message = 'Created', meta = undefined } = {}) {
  return ok(res, { data, message, meta, status: 201 });
}

module.exports = { ok, created };
