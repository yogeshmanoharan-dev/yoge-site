import assert from 'node:assert/strict';
import { test } from 'node:test';
import { validateDeployment } from './deployment-guard.mjs';

function fixture(environment = 'preview') {
  const production = environment === 'production';
  const name = production ? 'yoge-site' : 'yoge-site-preview';
  return {
    environment,
    marker: { environment },
    approval: undefined,
    config: {
      name,
      vars: { APP_ENV: environment },
      d1_databases: [
        {
          binding: 'DB',
          database_name: name,
          database_id: production
            ? 'c085ce13-8452-434f-a330-e28fe04791f3'
            : '8733b468-0277-477c-9991-bb56ca04a01e',
        },
      ],
    },
  };
}

test('preview accepts only its own Worker and D1 binding', () => {
  assert.equal(validateDeployment(fixture()).name, 'yoge-site-preview');
  const mixed = fixture();
  mixed.config.d1_databases = fixture('production').config.d1_databases;
  assert.throws(() => validateDeployment(mixed), /D1 binding/);
});

test('production requires the exact explicit approval', () => {
  for (const approval of [undefined, '', 'yes', 'Yes, deploy', 'yes, deploy ']) {
    assert.throws(() => validateDeployment({ ...fixture('production'), approval }), /Production/);
  }
  assert.equal(
    validateDeployment({ ...fixture('production'), approval: 'yes, deploy' }).name,
    'yoge-site',
  );
});

test('stale build markers, wrong Worker names, and extra bindings are rejected', () => {
  const stale = fixture();
  stale.marker.environment = 'local';
  assert.throws(() => validateDeployment(stale), /mismatch/);
  const wrongName = fixture();
  wrongName.config.name = 'yoge-site';
  assert.throws(() => validateDeployment(wrongName), /Worker name/);
  const extra = fixture();
  extra.config.d1_databases.push(fixture('production').config.d1_databases[0]);
  assert.throws(() => validateDeployment(extra), /D1 binding/);
});

test('local and unknown targets cannot be deployed', () => {
  for (const environment of ['local', 'staging', 'constructor', undefined]) {
    assert.throws(
      () => validateDeployment({ ...fixture(), environment }),
      /Only preview or production/,
    );
  }
});
