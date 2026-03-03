import { XMLParser } from 'fast-xml-parser'
import { ExcelParseError } from '../errors'

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  preserveOrder: false,
  parseTagValue: false,
  parseAttributeValue: false,
  trimValues: false
})

export function parseXml<T>(xml: string): T {
  try {
    return parser.parse(xml) as T
  } catch (error) {
    throw new ExcelParseError(
      `Failed to parse XML: ${error instanceof Error ? error.message : String(error)}`,
      'INVALID_XML'
    )
  }
}

export function escapeXml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')
}

export function xmlAttr(name: string, value: string | number | boolean | undefined): string {
  if (value === undefined) return ''
  return ` ${name}="${escapeXml(String(value))}"`
}

export function xmlNode(name: string, content: string, attrs = ''): string {
  return `<${name}${attrs}>${content}</${name}>`
}

export function xmlLeaf(name: string, attrs = ''): string {
  return `<${name}${attrs}/>`
}
