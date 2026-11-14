const targets = {
  preview: {
    name: 'yoge-site-preview',
    databaseId: '8733b468-0277-477c-9991-bb56ca04a01e',
  },
  production: {
    name: 'yoge-site',
    databaseId: 'c085ce13-8452-434f-a330-e28fe04791f3',
  },
};

export function validateDeployment({ environment, marker, config, approval }) {
  const target = Object.hasOwn(targets, environment) ? targets[environment] : undefined;
  if (!target) throw new Error('Only preview or production can be deployed.');
  if (environment === 'production' && approval !== 'yes, deploy') {
    throw new Error('Production requires DEPLOY_APPROVAL to be exactly "yes, deploy".');
  }
  if (marker.environment !== environment || config.vars?.APP_ENV !== environment) {
    throw new Error(`Build environment mismatch. Run npm run build:${environment} first.`);
  }
  if (config.name !== target.name) throw new Error('Worker name does not match the target.');
  const bindings = config.d1_databases ?? [];
  if (
    bindings.length !== 1 ||
    bindings[0].binding !== 'DB' ||
    bindings[0].database_name !== target.name ||
    bindings[0].database_id !== target.databaseId
  ) {
    throw new Error('D1 binding does not match the target database.');
  }
  return target;
}
