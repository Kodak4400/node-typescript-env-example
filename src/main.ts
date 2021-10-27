import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { sub } from './sub'

function hello(name: string) {
  console.log(`Hello, ${name}!`)
}

export async function main() {
  hello('test')
  sub()

  try {
    const s3 = new S3Client({ region: 'ap-northeast-1' })
    const obj = await s3.send(
      new GetObjectCommand({
        Bucket: 'dummyBucket',
        Key: 'dummyKey',
      }),
    )
    if (obj.$metadata.httpStatusCode && obj.$metadata.httpStatusCode >= 400) {
      return 'ng'
    }
    return 'ok'
  } catch (error) {
    console.log(error)
    throw error
  }
}
