const fs = require('fs')

const parseCSV = (filePath) => {
  const fileContent = fs.readFileSync(filePath, 'utf-8')

  const lines = fileContent
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)

  if (lines.length === 0) return []

  const headerLine = lines[0]
  let delimiter = ','
  if (headerLine.includes('\t'))
    delimiter = '\t' // Add versatility to support Excel pasted data (\t)
  else if (headerLine.includes(';')) delimiter = ';' // To support CSVs (;)

  const headers = headerLine.split(delimiter).map((head) => head.trim())

  const data = lines.slice(1).map((line) => {
    const values = line.split(delimiter).map((val) => val.trim())
    const rowObject = {}

    headers.forEach((header, index) => {
      rowObject[header] = values[index] !== undefined ? values[index] : '' // For each header, create a key with that name and assign its matching value
    })

    return rowObject // Returns, for example, { Nom: "Joan", Edat: "25" }, { Nom: "Maria", Edat: "30" }, { Nom: "Pere", Edat: "40" } and pushes it into the "new" array built by .map()
  })

  return data
}

module.exports = parseCSV
