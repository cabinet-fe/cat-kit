export class ExcelError extends Error {
  public readonly code: string
  public readonly path?: string

  constructor(message: string, code: string, path?: string) {
    super(message)
    this.name = 'ExcelError'
    this.code = code
    this.path = path
  }
}

export class ExcelParseError extends ExcelError {
  constructor(message: string, code = 'EXCEL_PARSE_ERROR', path?: string) {
    super(message, code, path)
    this.name = 'ExcelParseError'
  }
}

export class ExcelWriteError extends ExcelError {
  constructor(message: string, code = 'EXCEL_WRITE_ERROR', path?: string) {
    super(message, code, path)
    this.name = 'ExcelWriteError'
  }
}

export class ExcelSchemaError extends ExcelError {
  constructor(message: string, code = 'EXCEL_SCHEMA_ERROR', path?: string) {
    super(message, code, path)
    this.name = 'ExcelSchemaError'
  }
}

export class ExcelValueError extends ExcelError {
  constructor(message: string, code = 'EXCEL_VALUE_ERROR', path?: string) {
    super(message, code, path)
    this.name = 'ExcelValueError'
  }
}
