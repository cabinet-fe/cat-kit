import { describe, it, expect } from 'vitest'
import { Workbook, Worksheet } from '@cat-kit/excel/src'
import type { WorkbookMetadata } from '@cat-kit/excel/src'
import { unzipSync } from 'fflate'

describe('Workbook', () => {
  describe('构造函数', () => {
    it('应该创建空工作簿', () => {
      const workbook = new Workbook()
      expect(workbook.name).toBe('工作簿')
      expect(workbook.sheetCount).toBe(0)
      expect(workbook.sheets).toHaveLength(0)
    })

    it('应该创建带名称的工作簿', () => {
      const workbook = new Workbook('MyWorkbook')
      expect(workbook.name).toBe('MyWorkbook')
    })

    it('应该创建包含工作表的工作簿', () => {
      const sheet1 = new Worksheet('Sheet1')
      const sheet2 = new Worksheet('Sheet2')

      const workbook = new Workbook('MyWorkbook', {
        sheets: [sheet1, sheet2]
      })

      expect(workbook.sheetCount).toBe(2)
      expect(workbook.sheets[0]).toBe(sheet1)
      expect(workbook.sheets[1]).toBe(sheet2)
    })

    it('应该创建包含元数据的工作簿', () => {
      const metadata: WorkbookMetadata = {
        creator: 'Test User',
        created: new Date('2024-01-01')
      }

      const workbook = new Workbook('MyWorkbook', { metadata })
      expect(workbook.metadata).toEqual(metadata)
    })
  })

  describe('addSheet', () => {
    it('应该添加工作表', () => {
      const workbook1 = new Workbook()
      const sheet = new Worksheet('Sheet1')
      const workbook2 = workbook1.addSheet(sheet)

      expect(workbook1.sheetCount).toBe(0)
      expect(workbook2.sheetCount).toBe(1)
      expect(workbook2.getSheet(0)).toBe(sheet)
      expect(workbook1).not.toBe(workbook2)
    })

    it('应该拒绝重复的工作表名称', () => {
      const workbook = new Workbook()
        .addSheet(new Worksheet('Sheet1'))

      expect(() => {
        workbook.addSheet(new Worksheet('Sheet1'))
      }).toThrow('工作表名称 "Sheet1" 已存在')
    })

    it('应该保留元数据', () => {
      const metadata: WorkbookMetadata = {
        creator: 'Test User'
      }
      const workbook1 = new Workbook('MyWorkbook', { metadata })
      const workbook2 = workbook1.addSheet(new Worksheet('Sheet1'))

      expect(workbook2.metadata).toEqual(metadata)
    })
  })

  describe('addSheets', () => {
    it('应该添加多个工作表', () => {
      const workbook1 = new Workbook()
      const workbook2 = workbook1.addSheets([
        new Worksheet('Sheet1'),
        new Worksheet('Sheet2'),
        new Worksheet('Sheet3')
      ])

      expect(workbook2.sheetCount).toBe(3)
      expect(workbook2.getSheet(0)?.name).toBe('Sheet1')
      expect(workbook2.getSheet(1)?.name).toBe('Sheet2')
      expect(workbook2.getSheet(2)?.name).toBe('Sheet3')
    })

    it('应该在遇到重复名称时抛出错误', () => {
      const workbook = new Workbook()

      expect(() => {
        workbook.addSheets([
          new Worksheet('Sheet1'),
          new Worksheet('Sheet1')
        ])
      }).toThrow('工作表名称 "Sheet1" 已存在')
    })

    it('空数组不应该报错', () => {
      const workbook1 = new Workbook()
      const workbook2 = workbook1.addSheets([])

      expect(workbook2.sheetCount).toBe(0)
    })
  })

  describe('getSheet', () => {
    it('应该通过索引获取工作表', () => {
      const sheet1 = new Worksheet('Sheet1')
      const sheet2 = new Worksheet('Sheet2')
      const workbook = new Workbook('MyWorkbook', {
        sheets: [sheet1, sheet2]
      })

      expect(workbook.getSheet(0)).toBe(sheet1)
      expect(workbook.getSheet(1)).toBe(sheet2)
    })

    it('应该通过名称获取工作表', () => {
      const sheet1 = new Worksheet('Sheet1')
      const sheet2 = new Worksheet('Sheet2')
      const workbook = new Workbook('MyWorkbook', {
        sheets: [sheet1, sheet2]
      })

      expect(workbook.getSheet('Sheet1')).toBe(sheet1)
      expect(workbook.getSheet('Sheet2')).toBe(sheet2)
    })

    it('索引超出范围应该返回 undefined', () => {
      const workbook = new Workbook()
      expect(workbook.getSheet(0)).toBeUndefined()
      expect(workbook.getSheet(10)).toBeUndefined()
    })

    it('不存在的名称应该返回 undefined', () => {
      const workbook = new Workbook()
      expect(workbook.getSheet('NonExistent')).toBeUndefined()
    })
  })

  describe('removeSheet', () => {
    it('应该通过索引删除工作表', () => {
      const workbook1 = new Workbook('MyWorkbook', {
        sheets: [
          new Worksheet('Sheet1'),
          new Worksheet('Sheet2'),
          new Worksheet('Sheet3')
        ]
      })

      const workbook2 = workbook1.removeSheet(1)

      expect(workbook1.sheetCount).toBe(3)
      expect(workbook2.sheetCount).toBe(2)
      expect(workbook2.getSheet(0)?.name).toBe('Sheet1')
      expect(workbook2.getSheet(1)?.name).toBe('Sheet3')
    })

    it('应该通过名称删除工作表', () => {
      const workbook1 = new Workbook('MyWorkbook', {
        sheets: [
          new Worksheet('Sheet1'),
          new Worksheet('Sheet2')
        ]
      })

      const workbook2 = workbook1.removeSheet('Sheet1')

      expect(workbook2.sheetCount).toBe(1)
      expect(workbook2.getSheet(0)?.name).toBe('Sheet2')
    })

    it('删除不存在的工作表应该抛出错误', () => {
      const workbook = new Workbook()

      expect(() => {
        workbook.removeSheet('NonExistent')
      }).toThrow('工作表 "NonExistent" 不存在')
    })

    it('应该保留其他工作表和元数据', () => {
      const metadata: WorkbookMetadata = {
        creator: 'Test User'
      }
      const workbook1 = new Workbook('MyWorkbook', {
        sheets: [
          new Worksheet('Sheet1', { rows: [['A1']] }),
          new Worksheet('Sheet2', { rows: [['B1']] })
        ],
        metadata
      })

      const workbook2 = workbook1.removeSheet(0)

      expect(workbook2.sheetCount).toBe(1)
      expect(workbook2.getSheet(0)?.getCell(0, 0)?.value).toBe('B1')
      expect(workbook2.metadata).toEqual(metadata)
    })
  })

  describe('withMetadata', () => {
    it('应该设置元数据', () => {
      const workbook1 = new Workbook()
      const metadata: WorkbookMetadata = {
        creator: 'Test User',
        created: new Date('2024-01-01')
      }
      const workbook2 = workbook1.withMetadata(metadata)

      expect(workbook1.metadata).toBeUndefined()
      expect(workbook2.metadata).toEqual(metadata)
      expect(workbook1).not.toBe(workbook2)
    })

    it('应该合并现有元数据', () => {
      const workbook1 = new Workbook('MyWorkbook', {
        metadata: {
          creator: 'User1',
          created: new Date('2024-01-01')
        }
      })

      const workbook2 = workbook1.withMetadata({
        lastModifiedBy: 'User2',
        modified: new Date('2024-01-02')
      })

      expect(workbook2.metadata).toEqual({
        creator: 'User1',
        created: new Date('2024-01-01'),
        lastModifiedBy: 'User2',
        modified: new Date('2024-01-02')
      })
    })

    it('应该保留工作表', () => {
      const workbook1 = new Workbook('MyWorkbook', {
        sheets: [new Worksheet('Sheet1')]
      })
      const workbook2 = workbook1.withMetadata({ creator: 'Test User' })

      expect(workbook2.sheetCount).toBe(1)
      expect(workbook2.getSheet(0)?.name).toBe('Sheet1')
    })
  })

  describe('withName', () => {
    it('应该重命名工作簿', () => {
      const workbook1 = new Workbook('OldName')
      const workbook2 = workbook1.withName('NewName')

      expect(workbook1.name).toBe('OldName')
      expect(workbook2.name).toBe('NewName')
      expect(workbook1).not.toBe(workbook2)
    })

    it('应该保留工作表和元数据', () => {
      const metadata: WorkbookMetadata = { creator: 'Test User' }
      const workbook1 = new Workbook('OldName', {
        sheets: [new Worksheet('Sheet1')],
        metadata
      })
      const workbook2 = workbook1.withName('NewName')

      expect(workbook2.sheetCount).toBe(1)
      expect(workbook2.metadata).toEqual(metadata)
    })
  })

  describe('sheetCount', () => {
    it('空工作簿应该返回 0', () => {
      const workbook = new Workbook()
      expect(workbook.sheetCount).toBe(0)
    })

    it('应该返回正确的工作表数量', () => {
      const workbook = new Workbook('MyWorkbook', {
        sheets: [
          new Worksheet('Sheet1'),
          new Worksheet('Sheet2'),
          new Worksheet('Sheet3')
        ]
      })

      expect(workbook.sheetCount).toBe(3)
    })
  })

  describe('迭代器', () => {
    it('应该支持 for...of 循环', () => {
      const workbook = new Workbook('MyWorkbook', {
        sheets: [
          new Worksheet('Sheet1'),
          new Worksheet('Sheet2')
        ]
      })

      const names: string[] = []
      for (const sheet of workbook) {
        names.push(sheet.name)
      }

      expect(names).toEqual(['Sheet1', 'Sheet2'])
    })

    it('应该支持展开运算符', () => {
      const workbook = new Workbook('MyWorkbook', {
        sheets: [
          new Worksheet('Sheet1'),
          new Worksheet('Sheet2')
        ]
      })

      const sheets = [...workbook]
      expect(sheets).toHaveLength(2)
      expect(sheets[0].name).toBe('Sheet1')
      expect(sheets[1].name).toBe('Sheet2')
    })
  })

  describe('write', () => {
    it('应该返回 Promise<Blob>', async () => {
      const workbook = new Workbook('MyWorkbook', {
        sheets: [new Worksheet('Sheet1', { rows: [['A1']] })]
      })

      const blob = await workbook.write()
      expect(blob).toBeInstanceOf(Blob)
      expect(blob.type).toBe('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    })

    it('空工作簿也应该可以写入', async () => {
      const workbook = new Workbook()
      const blob = await workbook.write()

      expect(blob).toBeInstanceOf(Blob)
      expect(blob.size).toBeGreaterThan(0)
    })

    it('没有 metadata 也应输出完整 docProps 部件', async () => {
      const workbook = new Workbook('MyWorkbook', {
        sheets: [new Worksheet('Sheet1', { rows: [['A1']] })]
      })

      const blob = await workbook.write()
      const buffer = new Uint8Array(await blob.arrayBuffer())
      const files = unzipSync(buffer)

      expect(files['docProps/core.xml']).toBeDefined()
      expect(files['docProps/app.xml']).toBeDefined()

      const rels = new TextDecoder().decode(files['_rels/.rels'])
      expect(rels).toContain('docProps/core.xml')
      expect(rels).toContain('docProps/app.xml')
    })
  })
})

