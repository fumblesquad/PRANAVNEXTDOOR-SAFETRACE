import { useState, useCallback } from 'react'
import { MODE_CHECKS, MODE_COLORS } from '../data/config'

/**
 * Generates a detoured polyline that visually avoids danger zones.
 *
 * In production, swap this with a real weighted-graph router:
 *   - OSRM  → https://project-osrm.org/
 *   - Valhalla → https://valhalla.github.io/valhalla/
 *   - GraphHopper → https://www.graphhopper.com/
 * Pass custom edge weights for: crime density, lighting, crowd levels.
 */
function buildSafeWaypoints(from, to, mode) {
  const midLat = (from[0] + to[0]) / 2
  const midLng = (from[1] + to[1]) / 2

  const offsets = {
    safe:    [  0.008, -0.008 ],
    crowd:   [  0.006, -0.005 ],
    lit:     [ -0.004,  0.007 ],
    fastest: [  0.000,  0.002 ],
  }
  const [dLat, dLng] = offsets[mode]
  const detourLat = midLat + dLat
  const detourLng = midLng + dLng

  const q1 = [(from[0] + detourLat) / 2 + 0.002, (from[1] + detourLng) / 2 - 0.002]
  const q2 = [(detourLat + to[0]) / 2 - 0.002,   (detourLng + to[1]) / 2 + 0.003]

  return [from, q1, [detourLat, detourLng], q2, to]
}

export function useRouting(userLocation) {
  const [activeDestId, setActiveDestId] = useState(null)
  const [mode, setMode]                 = useState('safe')
  const [routeData, setRouteData]       = useState(null) // { safeWaypoints, riskyWaypoints, color, score, dest }

  const routeTo = useCallback((dest) => {
    if (!userLocation) return

    const from = userLocation
    const to   = [dest.lat, dest.lng]

    const safeWaypoints  = buildSafeWaypoints(from, to, mode)
    const riskyWaypoints = [from, to]                        // straight-line shortcut
    const score          = dest.scores[mode]
    const color          = MODE_COLORS[mode]
    const checks         = [...MODE_CHECKS[mode], ...dest.checks.slice(0, 2)]

    setActiveDestId(dest.id)
    setRouteData({ safeWaypoints, riskyWaypoints, color, score, dest, checks })
  }, [userLocation, mode])

  const changeMode = useCallback((newMode) => {
    setMode(newMode)
  }, [])

  // Re-route when mode changes while a destination is active
  const rerouteIfActive = useCallback((dest) => {
    if (dest) routeTo(dest)
  }, [routeTo])

  return { activeDestId, mode, setMode: changeMode, routeData, routeTo, rerouteIfActive }
}
