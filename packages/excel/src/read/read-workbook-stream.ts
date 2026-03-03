import type {
  CellValue,
  DateSystem,
  ReadStreamOptions,
  StreamEvent,
  WorkbookInput
} from '../types'
import { getZipTextEntry, readZipEntries } from '../zip/zip-reader'
import {
  parseSharedStrings,
  parseStyles,
  parseWorkbookSheets,
  parseWorksheet
} from './xml-reader'

const DEFAULT_DATE_SYSTEM: DateSystem = 1900

export async function* readWorkbookStream(
  input: WorkbookInput,
  options: ReadStreamOptions = {}
): AsyncIterable<StreamEvent> {
  const entries = await readZipEntries(input)
  const workbookXml = getZipTextEntry(entries, 'xl/workbook.xml')
  const workbookRelsXml = getZipTextEntry(entries, 'xl/_rels/workbook.xml.rels')
  const sharedStringsXml = getZipTextEntry(entries, 'xl/sharedStrings.xml', false)
  const stylesXml = getZipTextEntry(entries, 'xl/styles.xml', false)

  const sheets = parseWorkbookSheets(workbookXml, workbookRelsXml)
  const sharedStrings = parseSharedStrings(sharedStringsXml)
  const styleLookup = parseStyles(stylesXml)
  const dateSystem = options.dateSystem ?? DEFAULT_DATE_SYSTEM
  const selected = options.sheets ? new Set(options.sheets) : undefined

  for (const sheetEntry of sheets) {
    if (selected && !selected.has(sheetEntry.sheetName)) {
      continue
    }
    const sheetXml = getZipTextEntry(entries, sheetEntry.sheetPath)
    const parsed = parseWorksheet(sheetXml, sharedStrings, styleLookup, dateSystem)
    const rows = toRowValues(parsed.cells)
    yield {
      type: 'sheetStart',
      sheetName: sheetEntry.sheetName,
      sheetIndex: sheetEntry.sheetIndex
    }

    let currentRow = 1
    for (const [rowIndex, values] of rows) {
      if (options.includeEmptyRows) {
        while (currentRow < rowIndex) {
          yield {
            type: 'row',
            sheetName: sheetEntry.sheetName,
            sheetIndex: sheetEntry.sheetIndex,
            rowIndex: currentRow,
            values: []
          }
          currentRow += 1
        }
      }

      yield {
        type: 'row',
        sheetName: sheetEntry.sheetName,
        sheetIndex: sheetEntry.sheetIndex,
        rowIndex,
        values
      }
      currentRow = rowIndex + 1
    }

    yield {
      type: 'sheetEnd',
      sheetName: sheetEntry.sheetName,
      sheetIndex: sheetEntry.sheetIndex
    }
  }
}

function toRowValues(
  cells: Array<{ row: number; col: number; value: unknown }>
): Array<[row: number, values: CellValue[]]> {
  const rowMap = new Map<number, Map<number, CellValue>>()
  for (const cell of cells) {
    let colMap = rowMap.get(cell.row)
    if (!colMap) {
      colMap = new Map<number, CellValue>()
      rowMap.set(cell.row, colMap)
    }
    colMap.set(cell.col, cell.value as CellValue)
  }

  const rows = [...rowMap.entries()].sort((a, b) => a[0] - b[0])
  return rows.map(([row, colMap]) => {
    const maxCol = Math.max(...colMap.keys())
    const values: CellValue[] = new Array(maxCol).fill(null)
    for (const [col, value] of colMap) {
      values[col - 1] = value
    }
    return [row, values]
  })
}
