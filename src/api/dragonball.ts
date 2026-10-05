import axios from 'axios'
import type { Character, CharacterDetail } from '../types'

const client = axios.create({
  baseURL: 'https://dragonball-api.com/api',
  timeout: 10000,
})

interface CharacterPage {
  items: Character[]
}

let charactersRequest: Promise<Character[]> | null = null
const detailRequests = new Map<number, Promise<CharacterDetail>>()

function clean<T extends Character>(character: T): T {
  return {
    ...character,
    name: character.name.trim(),
    ki: character.ki.trim(),
    maxKi: character.maxKi.trim(),
  }
}

export function fetchCharacters(): Promise<Character[]> {
  // The API pages 10 items by default; 100 covers all 58 characters in one request.
  charactersRequest ??= client
    .get<CharacterPage>('/characters', { params: { limit: 100 } })
    .then(({ data }) => data.items.map(clean))
    .catch((error: unknown) => {
      charactersRequest = null
      throw error
    })
  return charactersRequest
}

export function fetchCharacter(id: number): Promise<CharacterDetail> {
  let request = detailRequests.get(id)
  if (!request) {
    request = client.get<CharacterDetail>(`/characters/${id}`).then(({ data }) => clean(data))
    request.catch(() => detailRequests.delete(id))
    detailRequests.set(id, request)
  }
  return request
}

export function isNotFound(error: unknown): boolean {
  return (
    axios.isAxiosError(error) &&
    (error.response?.status === 400 || error.response?.status === 404)
  )
}

export function describeError(error: unknown): string {
  if (isNotFound(error)) return 'That character does not exist.'
  if (axios.isAxiosError(error)) {
    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      return 'The Dragon Ball API took too long to respond.'
    }
    if (!error.response) return 'Could not reach the Dragon Ball API. Check your connection.'
    return `The Dragon Ball API returned an error (${error.response.status}).`
  }
  return 'Something went wrong.'
}
