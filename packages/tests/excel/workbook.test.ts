import { Workbook, ExcelSchemaError } from '@cat-kit/excel/src'
import { describe, expect, it } from 'vitest'

describe('Workbook', () => {
  it('应保存 metadata 并允许新增工作表', () => {
    const createdAt = new Date('2024-01-01T00:00:00.000Z')
    const workbook = new Workbook({ creator: 'tester', createdAt, lastModifiedBy: 'tester' })

    const sheet = workbook.addWorksheet('Sheet1')

    expect(workbook.metadata.creator).toBe('tester')
    expect(workbook.getWorksheet('Sheet1')).toBe(sheet)
    expect(workbook.getWorksheet(0)).toBe(sheet)
  })

  it('addWorksheet 应 trim 名称并拒绝重复', () => {
    const workbook = new Workbook()

    workbook.addWorksheet('  Data  ')
    expect(() => workbook.addWorksheet('Data')).toThrowError(ExcelSchemaError)
    expect(() => workbook.addWorksheet('   ')).toThrow('Worksheet name must not be empty')
  })

  it('worksheets getter 应返回副本，避免外部篡改内部数组', () => {
    const workbook = new Workbook()
    workbook.addWorksheet('S1')
    workbook.addWorksheet('S2')

    const snapshot = workbook.worksheets
    snapshot.pop()

    expect(snapshot).toHaveLength(1)
    expect(workbook.worksheets).toHaveLength(2)
  })

  it('removeWorksheet 应返回删除结果并允许同名重新添加', () => {
    const workbook = new Workbook()
    workbook.addWorksheet('A')
    workbook.addWorksheet('B')

    expect(workbook.removeWorksheet('A')).toBe(true)
    expect(workbook.removeWorksheet('A')).toBe(false)

    const recreated = workbook.addWorksheet('A')
    expect(workbook.getWorksheet('A')).toBe(recreated)
    expect(workbook.worksheets.map((sheet) => sheet.name)).toEqual(['B', 'A'])
  })
})
