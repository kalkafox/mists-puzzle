import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const parseItem = (item: string) => {
  const parts = item.split('_')
  return {
    circle: parts[0] === 'circle',
    type: parts[1], // 'leaf' or 'lotus'
    fill: parts[2] === 'fill',
  }
}

export const findOddOneOut = (selections: Array<[string, string]>) => {
  const characteristics = selections.map(([key, value]) => ({
    key,
    ...parseItem(value),
  }))

  // Group by multiple characteristics
  const groupByCharacteristics = (
    property: keyof (typeof characteristics)[0],
  ) => {
    const groups = new Map()
    for (const item of characteristics) {
      const prop = item[property]
      groups.set(prop, [...(groups.get(prop) || []), item])
    }
    return groups
  }

  // Check combinations of characteristics for "odd" grouping
  const circleGroups = groupByCharacteristics('circle')
  const fillGroups = groupByCharacteristics('fill')
  const typeGroups = groupByCharacteristics('type')

  // If any group has only one member, that member is the odd one out
  const findOddFromGroups = (groups: Map<any, any[]>) => {
    for (const [_, items] of groups) {
      if (items.length === 1) {
        return items[0].key
      }
    }
    return null
  }

  // Check for an odd one out across different characteristics
  const oddCircle = findOddFromGroups(circleGroups)
  if (oddCircle) return oddCircle

  const oddFill = findOddFromGroups(fillGroups)
  if (oddFill) return oddFill

  const oddType = findOddFromGroups(typeGroups)
  if (oddType) return oddType

  // If all checks fail, return null (shouldn't happen if game is set up correctly)
  return null
}
