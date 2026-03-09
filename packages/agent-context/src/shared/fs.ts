import { dirname } from 'node:path'
import { existsSync } from 'node:fs'
import { mkdir, readFile, writeFile } from 'node:fs/promises'

import type { ApplyMutationResult, FileMutation } from '../domain/types'

export async function applyManagedMutations(
  mutations: FileMutation[],
  check: boolean
): Promise<ApplyMutationResult> {
  const result: ApplyMutationResult = {
    created: [],
    updated: [],
    unchanged: [],
    changed: []
  }

  for (const mutation of mutations) {
    const fileExists = existsSync(mutation.path)
    const nextContent = await resolveNextContent(mutation, fileExists)

    if (!nextContent.changed) {
      result.unchanged.push(mutation.path)
      continue
    }

    if (!check) {
      await mkdir(dirname(mutation.path), { recursive: true })
      await writeFile(mutation.path, nextContent.content, 'utf-8')
    }

    result.changed.push(mutation.path)

    if (fileExists) {
      result.updated.push(mutation.path)
    } else {
      result.created.push(mutation.path)
    }
  }

  return result
}

async function resolveNextContent(
  mutation: FileMutation,
  fileExists: boolean
): Promise<{ content: string; changed: boolean }> {
  const nextContent = normalizeTrailingNewline(mutation.body)

  if (!fileExists) {
    return {
      content: nextContent,
      changed: true
    }
  }

  const currentContent = await readFile(mutation.path, 'utf-8')
  return {
    content: nextContent,
    changed: currentContent !== nextContent
  }
}

function normalizeTrailingNewline(content: string): string {
  return content.endsWith('\n') ? content : `${content}\n`
}
