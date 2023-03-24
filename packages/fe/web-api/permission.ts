type PermissionName =
  | 'geolocation'
  | 'notifications'
  | 'persistent-storage'
  | 'push'
  | 'screen-wake-lock'
  | 'xr-spatial-tracking'
  | 'clipboard-read'
  | 'clipboard-write'

export async function queryPermission(name: PermissionName) {
  return navigator.permissions.query({
    // @ts-ignore
    name
  })
}
