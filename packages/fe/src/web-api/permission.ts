export type WebPermissionName =
  | PermissionName
  | 'clipboard-read'
  | 'clipboard-write'

export async function queryPermission(
  name: WebPermissionName
): Promise<boolean> {
  const result = await navigator.permissions
    .query({
      // @ts-ignore
      name
    })
    .catch(() => {
      return {
        state: 'granted'
      }
    })

  return result.state !== 'denied'
}
