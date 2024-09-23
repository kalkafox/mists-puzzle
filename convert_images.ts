import { $, Glob } from 'bun'

const glob = new Glob('*')

for await (const file of glob.scan('.')) {
  if (!file.endsWith('.tga')) {
    continue
  }
  await $`magick ${file} ${file.replace('.tga', '.png')}`

  console.log(`Converted ${file}`)
}
