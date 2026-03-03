import { ExcelWriteError } from '../errors'
import { SharedStringPool } from '../model/shared-string'
import { StylePool } from '../model/style'
import { Workbook } from '../model/workbook'
import type { DateSystem, WriteOptions } from '../types'
import { writeZipEntries } from '../zip/zip-writer'
import {
  buildAppPropsXml,
  buildContentTypesXml,
  buildCorePropsXml,
  buildRootRelsXml,
  buildSharedStringsXml,
  buildStylesXml,
  buildWorkbookRelsXml,
  buildWorkbookXml,
  buildWorksheetXml,
  type WorkbookSheetRef
} from './xml-writer'

const DEFAULT_DATE_SYSTEM: DateSystem = 1900

export function writeWorkbook(workbook: Workbook, options: WriteOptions = {}): Uint8Array {
  if (!(workbook instanceof Workbook)) {
    throw new ExcelWriteError(
      'writeWorkbook only accepts Workbook instances',
      'INVALID_WORKBOOK_INSTANCE'
    )
  }
  if (workbook.worksheets.length === 0) {
    throw new ExcelWriteError('Workbook must contain at least one worksheet', 'EMPTY_WORKBOOK')
  }

  const dateSystem = options.dateSystem ?? DEFAULT_DATE_SYSTEM
  const useSharedStrings = options.useSharedStrings ?? true
  const stylePool = new StylePool()
  const sharedStrings = new SharedStringPool()
  const defaultDateStyleId = stylePool.register({ numberFormat: 'yyyy-mm-dd hh:mm:ss' })
  const sheets = workbook.worksheets

  const sheetRefs: WorkbookSheetRef[] = sheets.map((sheet, index) => ({
    id: index + 1,
    name: sheet.name,
    rid: `rId${index + 1}`,
    path: `xl/worksheets/sheet${index + 1}.xml`
  }))

  const entries = new Map<string, string | Uint8Array>()
  for (let i = 0; i < sheets.length; i += 1) {
    const sheet = sheets[i]
    const sheetRef = sheetRefs[i]
    if (!sheet || !sheetRef) continue
    const xml = buildWorksheetXml(sheet, {
      stylePool,
      sharedStrings,
      useSharedStrings,
      dateSystem,
      defaultDateStyleId
    })
    entries.set(sheetRef.path, xml)
  }

  const hasSharedStrings = useSharedStrings && sharedStrings.size() > 0
  entries.set('[Content_Types].xml', buildContentTypesXml(sheets.length, hasSharedStrings))
  entries.set('_rels/.rels', buildRootRelsXml())
  entries.set('xl/workbook.xml', buildWorkbookXml(sheetRefs))
  entries.set('xl/_rels/workbook.xml.rels', buildWorkbookRelsXml(sheetRefs, hasSharedStrings))
  entries.set('xl/styles.xml', buildStylesXml(stylePool.snapshot()))
  entries.set('docProps/core.xml', buildCorePropsXml(workbook))
  entries.set('docProps/app.xml', buildAppPropsXml(workbook))
  if (hasSharedStrings) {
    entries.set('xl/sharedStrings.xml', buildSharedStringsXml(sharedStrings))
  }

  return writeZipEntries(entries, { compressionLevel: options.compressionLevel })
}
