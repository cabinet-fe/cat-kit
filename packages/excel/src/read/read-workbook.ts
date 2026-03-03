import { Workbook } from '../model/workbook'
import type { DateSystem, ReadOptions, WorkbookInput } from '../types'
import { getZipTextEntry, readZipEntries } from '../zip/zip-reader'
import {
  parseSharedStrings,
  parseStyles,
  parseWorkbookSheets,
  parseWorksheet
} from './xml-reader'

const DEFAULT_DATE_SYSTEM: DateSystem = 1900

export async function readWorkbook(
  input: WorkbookInput,
  options: ReadOptions = {}
): Promise<Workbook> {
  const entries = await readZipEntries(input)
  const workbookXml = getZipTextEntry(entries, 'xl/workbook.xml')
  const workbookRelsXml = getZipTextEntry(entries, 'xl/_rels/workbook.xml.rels')
  const sharedStringsXml = getZipTextEntry(entries, 'xl/sharedStrings.xml', false)
  const stylesXml = getZipTextEntry(entries, 'xl/styles.xml', false)

  const sheets = parseWorkbookSheets(workbookXml, workbookRelsXml)
  const sharedStrings = parseSharedStrings(sharedStringsXml)
  const styleLookup = parseStyles(stylesXml)
  const dateSystem = options.dateSystem ?? DEFAULT_DATE_SYSTEM

  const workbook = new Workbook()
  for (const sheetEntry of sheets) {
    const sheetXml = getZipTextEntry(entries, sheetEntry.sheetPath)
    const parsedSheet = parseWorksheet(sheetXml, sharedStrings, styleLookup, dateSystem)
    const worksheet = workbook.addWorksheet(sheetEntry.sheetName, parsedSheet.options)
    for (const [colIndex, col] of parsedSheet.columns) {
      worksheet.setColumn(colIndex, col)
    }
    for (const cell of parsedSheet.cells) {
      worksheet.row(cell.row).setCell(cell.col, cell.value as any, cell.style)
    }
  }
  return workbook
}
