export interface Character {
  id: number
  name: string
  ki: string
  maxKi: string
  race: string
  gender: string
  description: string
  image: string
  affiliation: string
}

export interface Planet {
  id: number
  name: string
  isDestroyed: boolean
  description: string
  image: string
}

export interface Transformation {
  id: number
  name: string
  image: string
  ki: string
}

export interface CharacterDetail extends Character {
  originPlanet: Planet | null
  transformations: Transformation[]
}
