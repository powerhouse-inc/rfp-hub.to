export interface Publisher {
  id: string
  name: string
  url: string | null
  description: string | null
  rfpCount: number
  verified: boolean
}
