export const MANAGED_BLOCK_START = '<!-- AGENT_CONTEXT:START -->'
export const MANAGED_BLOCK_END = '<!-- AGENT_CONTEXT:END -->'

export interface UpsertBlockResult {
  content: string
  changed: boolean
}

export function wrapManagedBlock(body: string): string {
  return [MANAGED_BLOCK_START, '', body.trim(), '', MANAGED_BLOCK_END].join('\n')
}

export function upsertManagedBlock(existingContent: string, body: string): UpsertBlockResult {
  const managedBlock = wrapManagedBlock(body)
  const start = existingContent.indexOf(MANAGED_BLOCK_START)
  const end = existingContent.indexOf(MANAGED_BLOCK_END)

  if (start !== -1 && end !== -1 && end > start) {
    const tailStart = end + MANAGED_BLOCK_END.length
    const nextContent =
      existingContent.slice(0, start) +
      managedBlock +
      existingContent.slice(tailStart).replace(/^\n+/, '\n')

    return {
      content: normalizeTrailingNewline(nextContent),
      changed: nextContent !== existingContent
    }
  }

  const appended =
    existingContent.trimEnd().length > 0
      ? `${existingContent.trimEnd()}\n\n${managedBlock}\n`
      : `${managedBlock}\n`

  return {
    content: normalizeTrailingNewline(appended),
    changed: normalizeTrailingNewline(appended) !== existingContent
  }
}

function normalizeTrailingNewline(content: string): string {
  return content.endsWith('\n') ? content : `${content}\n`
}
