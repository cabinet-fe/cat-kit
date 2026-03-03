import { ExcelSchemaError } from '../errors'
import type { WorkbookMetadata, WorksheetOptions } from '../types'
import { Worksheet } from './worksheet'

export class Workbook {
  public metadata: WorkbookMetadata = {}
  private readonly sheetList: Worksheet[] = []
  private readonly sheetNameSet = new Set<string>()

  constructor(metadata: WorkbookMetadata = {}) {
    this.metadata = metadata
  }

  addWorksheet(name: string, options: WorksheetOptions = {}): Worksheet {
    const normalizedName = name.trim()
    if (!normalizedName) {
      throw new ExcelSchemaError('Worksheet name must not be empty', 'INVALID_SHEET_NAME')
    }
    if (this.sheetNameSet.has(normalizedName)) {
      throw new ExcelSchemaError(
        `Duplicate worksheet name: "${normalizedName}"`,
        'DUPLICATE_SHEET_NAME'
      )
    }

    const sheet = new Worksheet(normalizedName, options)
    this.sheetList.push(sheet)
    this.sheetNameSet.add(normalizedName)
    return sheet
  }

  getWorksheet(nameOrIndex: string | number): Worksheet | undefined {
    if (typeof nameOrIndex === 'number') {
      return this.sheetList[nameOrIndex]
    }
    return this.sheetList.find(sheet => sheet.name === nameOrIndex)
  }

  get worksheets(): Worksheet[] {
    return [...this.sheetList]
  }

  removeWorksheet(name: string): boolean {
    const index = this.sheetList.findIndex(sheet => sheet.name === name)
    if (index === -1) return false
    const [sheet] = this.sheetList.splice(index, 1)
    if (sheet) this.sheetNameSet.delete(sheet.name)
    return true
  }
}
