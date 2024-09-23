export type Item = {
  id: string // Identifier for the item
  attributes: string[] // Attributes of the item
}

export interface Round {
  entrance: Item
  choices: Item[]
  correctChoice: Item
  tries: number
}
