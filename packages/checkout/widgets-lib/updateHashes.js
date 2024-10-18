// @ts-check
import { readFileSync, writeFileSync } from "fs"
import { createHash } from "crypto"

const filesToHash = ["dist/widgets.js", "dist/index.js"]

filesToHash.forEach(file => {
  try { 
    readFileSync(file)
  } catch (e) {
    console.error(`File ${file} not found`)
    console.error('Please build the Checkout Widgets package')
    process.exit(1)
  }
})

const hashes = filesToHash.reduce((acc, file) => {
  const hash = `sha512-${createHash("sha512").update(readFileSync(file
  )).digest("base64")}`
  acc[file] = hash
  return acc
}, {})

writeFileSync("hashes.json", JSON.stringify(hashes, null, 2))