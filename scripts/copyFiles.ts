import { copyFile } from 'fs'
import { resolve } from 'path'
import { promisify } from 'util'

const files = ['package.json', 'README.md']

async function run() {
  for (const file of files) {
    await promisify(copyFile)(
      resolve(__dirname, `../${file}`),
      resolve(__dirname, `../build/${file}`)
    )
  }
}

run()
