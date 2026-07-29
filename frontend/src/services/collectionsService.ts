import axios from 'axios'
import type { Collection } from '../types/collections'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

export async function getCollections(): Promise<Collection[]> {
  const response = await axios.get<{ collections: Collection[]; total: number }>(`${API_BASE}/collections`)
  return response.data.collections
}
