import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export type Post = {
  id: number;
  title: string;
  body?: string;
  excerpt: string;
  author: string;
  tags: string;
  tags_list: string[];
  created_at: string;
  updated_at: string;
  reading_time: string;
}

export type PostsResponse = {
  count: number;
  results: Post[];
}

export type ChatResponse = {
  message: string;
  reply: string;
  source: string;
}

export type RecommendationsResponse = {
  recommendations: Post[];
  source: string;
}

export type SearchResponse = {
  query: string;
  count: number;
  results: Post[];
}

export const postsApi = {
  getAll: (): Promise<PostsResponse> =>
    api.get('/posts/').then((r) => r.data),

  getById: (id: number): Promise<Post> =>
    api.get(`/posts/${id}/`).then((r) => r.data),

  getRecommendations: (id: number): Promise<RecommendationsResponse> =>
    api.get(`/posts/${id}/recommendations/`).then((r) => r.data),

  autoTag: (id: number) =>
    api.post(`/posts/${id}/autotag/`).then((r) => r.data),

  search: (query: string): Promise<SearchResponse> =>
    api.get(`/search/?q=${encodeURIComponent(query)}`).then((r) => r.data),

  chat: (message: string): Promise<ChatResponse> =>
    api.post('/chat/', { message }).then((r) => r.data),
};

export default api;
