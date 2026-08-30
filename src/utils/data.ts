import { getCollection } from 'astro:content'
import { SITE } from '../config'

import type { CollectionEntry, CollectionKey } from 'astro:content'
import type { GitHubView } from '~/types'

type CollectionEntryList<K extends CollectionKey = CollectionKey> =
  CollectionEntry<K>[]

/**
 * Ensures that a value is a positive integer.
 */
function ensurePositiveInteger(value: number, name: string) {
  if (Number.isInteger(value) && value > 0) return value
  throw new Error(
    `'${name}' must be a positive integer. Please check 'src/config.ts' for the correct configuration.`
  )
}

/**
 * Parses a tuple of boolean and number.
 */
export function parseTuple(
  tuple: boolean | [boolean, number] | undefined,
  name: string
) {
  if (!tuple || !Array.isArray(tuple) || !tuple[0]) return undefined
  return ensurePositiveInteger(tuple[1], name)
}

/**
 * Retrieves the minutes read for a post.
 */
export function getMinutesRead(
  minutesRead: number | boolean,
  computedMinutesRead: number
) {
  return minutesRead === false
    ? 0
    : typeof minutesRead === 'number' && minutesRead > 0
      ? minutesRead
      : computedMinutesRead
}

/**
 * Retrieves filtered posts from the specified content collection.
 * In production, it filters out draft posts.
 */
export async function getFilteredPosts(
  collection: 'blog' | 'changelog' | 'shorts'
) {
  return await getCollection(collection, ({ data }) => {
    return import.meta.env.PROD ? !data.draft : true
  })
}

/**
 * Sorts an array of posts by their publication date in descending order.
 */
export function getSortedPosts(
  posts: CollectionEntryList<'blog' | 'changelog' | 'shorts'>
) {
  return posts.sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf()
  )
}

export function sortPostsByField(
  posts: CollectionEntryList<'blog' | 'changelog' | 'shorts'>,
  field: 'pubDate' | 'lastModDate' | 'title'
) {
  return posts.sort((a, b) => {
    if (field === 'title') {
      return a.data.title.localeCompare(b.data.title, SITE.lang, {
        sensitivity: 'base',
      })
    }

    if (field === 'pubDate' || field === 'lastModDate') {
      const aTime = (a.data[field] as Date).getTime()
      const bTime = (b.data[field] as Date).getTime()
      return bTime - aTime
    }

    return 0
  })
}

/**
 * Matches the input string against the rules in `UI.githubView.mainLogoOverrides`
 * or `UI.githubView.subLogoMatches`, and returns the matching URL/Icon.
 */
export function matchLogo(
  input: string,
  logos: GitHubView['mainLogoOverrides'] | GitHubView['subLogoMatches']
) {
  for (const [pattern, logo] of logos) {
    if (typeof pattern === 'string') {
      if (input === pattern) {
        return logo
      }
    } else if (pattern instanceof RegExp) {
      if (pattern.test(input)) {
        return logo
      }
    }
  }
  return undefined
}

/**
 * Extracts the package name (before the `@` version part) from a `tagName`.
 */
export function extractPackageName(tagName: string) {
  const match = tagName.match(/(^@?[^@]+?)(?:@)/)
  if (match) return match[1]
  return tagName
}

/**
 * Extracts the version number from a `tagName`.
 */
export function extractVersionNum(tagName: string) {
  const match = tagName.match(/.+(\d+\.\d+\.\d+(?:-[\w.]+)?)(?:\s|$)/)
  if (match) return match[1]
  return tagName
}

/**
 * Processes the version number and return the highlighted and non-highlighted parts.
 */
export function processVersion(
  versionNum: string
): ['major' | 'minor' | 'patch' | 'pre', string, string] {
  const parts = versionNum.split(/(\.)/g)
  let highlightedIndex = -1
  let versionType: 'major' | 'minor' | 'patch' | 'pre'

  for (let i = parts.length - 1; i >= 0; i--) {
    if (parts[i] !== '.') {
      const num = +parts[i]
      if (!Number.isNaN(num) && num > 0) {
        highlightedIndex = i
        break
      }
    }
  }

  if (highlightedIndex === 0) {
    versionType = 'major'
  } else if (highlightedIndex === 2) {
    versionType = 'minor'
  } else if (highlightedIndex === 4) {
    versionType = 'patch'
  } else {
    versionType = 'pre'
  }

  const nonHighlightedPart = parts.slice(0, highlightedIndex).join('')
  const highlightedPart = parts.slice(highlightedIndex).join('')

  return [versionType, nonHighlightedPart, highlightedPart]
}

/**
 * Build tag relations from input shapes.
 */
export function buildTagRelations(
  input: string[][] | string[] | Record<string, string[]>
): { unique: string[]; relations: Record<string, string[]> } {
  // use Map+Set to store de-duplicated relations
  const relMap = new Map<string, Set<string>>()

  // ensure a key exists in relMap and return its Set
  const ensure = (k: string): Set<string> => {
    let set = relMap.get(k)
    if (!set) {
      set = new Set<string>()
      relMap.set(k, set)
    }
    return set
  }

  // type guard: check if an array is string[][]
  const isString2DArray = (arr: unknown[]): arr is string[][] =>
    arr.length > 0 && Array.isArray(arr[0])

  if (Array.isArray(input)) {
    if (isString2DArray(input)) {
      // string[][]: each is a post's tags
      for (const group of input) {
        const clean = Array.from(
          new Set(group.map((t) => t.trim()).filter(Boolean))
        )

        for (const a of clean) {
          const setA = ensure(a)
          for (const b of clean) {
            if (a !== b) setA.add(b)
          }
        }
      }
    } else {
      // string[] unique only
      for (const t of input) {
        ensure(String(t))
      }
    }
  } else {
    // mapping provided: each key is a tag, value is its related tags
    for (const [k, v] of Object.entries(input)) {
      const set = ensure(k)
      for (const t of v) {
        if (t && t !== k) set.add(t)
      }
    }
  }

  // collect all unique tags and sort them alphabetically
  const unique = Array.from(relMap.keys()).sort((a, b) => a.localeCompare(b))

  // convert Map<string, Set<string>> into Record<string, string[]>
  const relations: Record<string, string[]> = {}
  for (const key of unique) {
    const set = relMap.get(key)
    relations[key] = set ? Array.from(set) : []
  }

  return { unique, relations }
}
