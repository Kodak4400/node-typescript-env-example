import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { mockClient } from 'aws-sdk-client-mock';
import * as fs from 'fs';
import * as path from 'path';
import { main } from './main';

// main.tsのテスト
const s3Mock = mockClient(S3Client);
beforeEach(() => {
  s3Mock.reset();
});

describe('S3のオブジェクトを取得できる', () => {
  it('成功', async () => {
    s3Mock
      .on(GetObjectCommand, {
        Bucket: 'dummyBucket',
        Key: 'dummyKey',
      })
      .resolves({
        $metadata: {
          httpStatusCode: 200,
        },
        Body: fs.createReadStream(
          path.resolve(__dirname, './main.test.s3read.txt')
        ),
      });
    const result = await main();
    expect(result).toBe('ok');
  });

  it('失敗', async () => {
    s3Mock
      .on(GetObjectCommand, {
        Bucket: 'dummyBucket',
        Key: 'dummyKey',
      })
      .resolves({
        $metadata: {
          httpStatusCode: 400,
        },
        Body: fs.createReadStream(path.resolve(__dirname, './example.txt')),
      });
    const result = await main();
    expect(result).toBe('ng');
  });
});

describe('S3のオブジェクトを取得できない', () => {
  it('成功', async () => {
    s3Mock
      .on(GetObjectCommand, {
        Bucket: 'dummyBucket',
        Key: 'dummyKey',
      })
      .rejects('S3のオブジェクトを取得できない');

    // throwのチェックは以下の書き方が良さそう...
    const error = new Error('S3のオブジェクトを取得できない');
    await expect(main()).rejects.toEqual(error);
  });
});
