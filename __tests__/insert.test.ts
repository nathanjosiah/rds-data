/**
 * basic insert tests
 *
 * @group pg
 * @group mysql
 */

// eslint-disable-next-line import/no-extraneous-dependencies
import { v4 as uuid } from 'uuid';
import { setupRDSDatabase } from './db';

beforeAll(async () => {
  const rds = setupRDSDatabase().getInstance();
  await rds.query(`DROP TABLE IF EXISTS TestList${process.env.JEST_WORKER_ID};`);
  await rds.query(`
    CREATE TABLE TestList${process.env.JEST_WORKER_ID} (
      id VARCHAR(36) PRIMARY KEY NOT NULL,
      data text DEFAULT NULL
    );`);
});

test('Insert data', async () => {
  const pk = uuid();
  const data = 'some data';

  const rds = setupRDSDatabase().getInstance();
  let results = await rds.query(`INSERT INTO TestList${process.env.JEST_WORKER_ID} (id,data) VALUES(:pk,:data)`, { pk, data });

  expect(results.numberOfRecordsUpdated).toBe(1);

  results = await rds.query(`SELECT id, data FROM TestList${process.env.JEST_WORKER_ID} WHERE id = :pk`, { pk });

  expect(results.data.length).toBe(1);
  expect(results.columns.length).toBe(2);
  expect(results.numberOfRecordsUpdated).toBe(0);
  expect(results.data[0].id.string).toBe(pk);
  expect(results.data[0].data.string).toBe(data);
});

test('Insert null value', async () => {
  const pk = uuid();
  const data = null;

  const rds = setupRDSDatabase().getInstance();
  let results = await rds.query(`INSERT INTO TestList${process.env.JEST_WORKER_ID} (id,data) VALUES(:pk,:data)`, { pk, data });

  expect(results.numberOfRecordsUpdated).toBe(1);

  results = await rds.query(`SELECT id, data FROM TestList${process.env.JEST_WORKER_ID} WHERE id = :pk`, { pk });

  expect(results.data.length).toBe(1);
  expect(results.columns.length).toBe(2);
  expect(results.numberOfRecordsUpdated).toBe(0);
  expect(results.data[0].id.string).toBe(pk);
  expect(results.data[0].data.isNull).toBe(true);
});
