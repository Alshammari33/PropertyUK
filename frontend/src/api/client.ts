import axios from 'axios';

export interface Property {
  id: number;
  title: string;
  price: number;
  area: string;
  city: string;
  region: string;
  postcode: string;
  bedrooms: number;
  bathrooms: number;
  property_type: string;
  furnished: boolean;
  bills_included: boolean;
  parking: boolean;
  garden: boolean;
  nearest_station: string;
  station_distance_mins: number;
  description: string;
  image_url: string;
  listing_url: string;
}

export interface PropertyListResponse {
  items: Property[];
  total: number;
}

export interface PropertyFilters {
  q?: string;
  city?: string;
  area?: string;
  min_price?: number;
  max_price?: number;
  bedrooms?: number;
  property_type?: string;
  furnished?: boolean;
  bills_included?: boolean;
  parking?: boolean;
  sort?: string;
  skip?: number;
  limit?: number;
}

// ---------- AI Smart Search ----------

export interface ParsedFilter {
  keyword: string | null;
  city: string | null;
  area: string | null;
  min_price: number | null;
  max_price: number | null;
  bedrooms: number | null;
  property_type: string | null;
  furnished: boolean | null;
  bills_included: boolean | null;
  parking: boolean | null;
  near_station: boolean;
  garden: boolean | null;
  extracted_terms: string[];
}

export interface ScoredPropertyItem {
  property: Property;
  relevance: number;
}

export interface SmartSearchResponse {
  items: ScoredPropertyItem[];
  total: number;
  parsed: ParsedFilter;
}

export interface RecommendationRequest {
  budget_max: number;
  preferred_areas: string[];
  bedrooms: number;
  property_type: string;
  priorities: {
    near_station: boolean;
    furnished: boolean;
    bills_included: boolean;
    parking: boolean;
    garden: boolean;
  };
}

export interface RecommendationResult {
  property: Property;
  score: number;
  reasons: string[];
}

export interface RecommendationResponse {
  results: RecommendationResult[];
}

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export async function fetchProperties(
  filters: PropertyFilters
): Promise<PropertyListResponse> {
  const params: Record<string, string | number | boolean> = {};
  if (filters.q) params.q = filters.q;
  if (filters.city) params.city = filters.city;
  if (filters.area) params.area = filters.area;
  if (filters.min_price !== undefined) params.min_price = filters.min_price;
  if (filters.max_price !== undefined) params.max_price = filters.max_price;
  if (filters.bedrooms !== undefined) params.bedrooms = filters.bedrooms;
  if (filters.property_type) params.property_type = filters.property_type;
  if (filters.furnished !== undefined) params.furnished = filters.furnished;
  if (filters.bills_included !== undefined)
    params.bills_included = filters.bills_included;
  if (filters.parking !== undefined) params.parking = filters.parking;
  if (filters.sort) params.sort = filters.sort;
  if (filters.skip !== undefined) params.skip = filters.skip;
  if (filters.limit !== undefined) params.limit = filters.limit;

  const response = await apiClient.get<PropertyListResponse>('/properties', {
    params,
  });
  return response.data;
}

export async function smartSearch(
  q: string,
  skip = 0,
  limit = 24
): Promise<SmartSearchResponse> {
  const response = await apiClient.get<SmartSearchResponse>(
    '/properties/smart-search',
    { params: { q, skip, limit } }
  );
  return response.data;
}

export async function fetchPropertyById(id: number): Promise<Property> {
  const response = await apiClient.get<Property>(`/properties/${id}`);
  return response.data;
}

export async function fetchRecommendations(
  request: RecommendationRequest
): Promise<RecommendationResponse> {
  const response = await apiClient.post<RecommendationResponse>(
    '/recommend',
    request
  );
  return response.data;
}

export default apiClient;
