/**
 * Calculate distance between two GPS coordinates using Haversine formula
 * @returns distance in meters
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3 // Earth's radius in meters
  const toRad = (deg: number) => (deg * Math.PI) / 180

  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c
}

/**
 * Check if a user's position is within any office branch radius
 * @returns { isWithinRadius: boolean, branchName?: string, distance?: number }
 */
export function checkBranchProximity(
  userLat: number,
  userLng: number,
  branches: Array<{ name: string; latitude: number; longitude: number; radius: number; isActive: boolean }>
): { isWithinRadius: boolean; branchName?: string; distance?: number } {
  const activeBranches = branches.filter((b) => b.isActive)

  if (activeBranches.length === 0) {
    return { isWithinRadius: true } // No branches configured = allow check-in
  }

  for (const branch of activeBranches) {
    const distance = calculateDistance(userLat, userLng, branch.latitude, branch.longitude)
    if (distance <= branch.radius) {
      return { isWithinRadius: true, branchName: branch.name, distance: Math.round(distance) }
    }
  }

  // Find nearest branch
  let minDistance = Infinity
  let nearestBranch = ""
  for (const branch of activeBranches) {
    const distance = calculateDistance(userLat, userLng, branch.latitude, branch.longitude)
    if (distance < minDistance) {
      minDistance = distance
      nearestBranch = branch.name
    }
  }

  return { isWithinRadius: false, branchName: nearestBranch, distance: Math.round(minDistance) }
}

/**
 * Format distance for display
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) return `${meters}m`
  return `${(meters / 1000).toFixed(1)}km`
}
