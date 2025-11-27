/**
 * API Client - Communicates with WebCAD backend
 */

const API_BASE = '/api'

interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  })
  
  const result: ApiResponse<T> = await response.json()
  
  if (!result.success) {
    throw new Error(result.error?.message || 'API request failed')
  }
  
  return result.data as T
}

export const api = {
  // Documents
  async getDocuments() {
    return request<{ documents: any[] }>('/documents')
  },
  
  async getDocument(id: string) {
    return request<{ document: any }>(`/documents/${id}`)
  },
  
  async createDocument(data: { name: string; description?: string }) {
    return request<{ document: any }>('/documents', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  },
  
  async updateDocument(id: string, data: Partial<{ name: string; description: string }>) {
    return request<{ document: any }>(`/documents/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  },
  
  async deleteDocument(id: string) {
    return request<{ success: boolean }>(`/documents/${id}`, {
      method: 'DELETE'
    })
  },
  
  // Part Studios
  async getPartStudio(documentId: string, partStudioId: string) {
    return request<any>(`/documents/${documentId}/partstudios/${partStudioId}`)
  },
  
  async getFeatures(documentId: string, partStudioId: string) {
    return request<{ features: any[] }>(`/documents/${documentId}/partstudios/${partStudioId}/features`)
  },
  
  async addFeature(documentId: string, partStudioId: string, feature: any) {
    return request<{ feature: any }>(`/documents/${documentId}/partstudios/${partStudioId}/features`, {
      method: 'POST',
      body: JSON.stringify({ feature })
    })
  },
  
  async updateFeature(documentId: string, partStudioId: string, featureId: string, data: any) {
    return request<{ feature: any }>(`/documents/${documentId}/partstudios/${partStudioId}/features/${featureId}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  },
  
  async deleteFeature(documentId: string, partStudioId: string, featureId: string) {
    return request<{ success: boolean }>(`/documents/${documentId}/partstudios/${partStudioId}/features/${featureId}`, {
      method: 'DELETE'
    })
  },
  
  // Sketches
  async createSketch(documentId: string, partStudioId: string, data: { plane: any; name?: string }) {
    return request<{ sketch: any }>(`/documents/${documentId}/partstudios/${partStudioId}/sketches`, {
      method: 'POST',
      body: JSON.stringify(data)
    })
  },
  
  async getSketch(documentId: string, partStudioId: string, sketchId: string) {
    return request<{ sketch: any }>(`/documents/${documentId}/partstudios/${partStudioId}/sketches/${sketchId}`)
  },
  
  async addSketchEntities(documentId: string, partStudioId: string, sketchId: string, entities: any[]) {
    return request<{ entities: any[] }>(`/documents/${documentId}/partstudios/${partStudioId}/sketches/${sketchId}/entities`, {
      method: 'POST',
      body: JSON.stringify({ entities })
    })
  },
  
  async addSketchConstraints(documentId: string, partStudioId: string, sketchId: string, constraints: any[]) {
    return request<{ constraints: any[] }>(`/documents/${documentId}/partstudios/${partStudioId}/sketches/${sketchId}/constraints`, {
      method: 'POST',
      body: JSON.stringify({ constraints })
    })
  },
  
  // Assemblies
  async getAssembly(documentId: string, assemblyId: string) {
    return request<any>(`/documents/${documentId}/assemblies/${assemblyId}`)
  },
  
  async addInstance(documentId: string, assemblyId: string, instance: any) {
    return request<{ instance: any }>(`/documents/${documentId}/assemblies/${assemblyId}/instances`, {
      method: 'POST',
      body: JSON.stringify(instance)
    })
  },
  
  async addMate(documentId: string, assemblyId: string, mate: any) {
    return request<{ mate: any }>(`/documents/${documentId}/assemblies/${assemblyId}/mates`, {
      method: 'POST',
      body: JSON.stringify(mate)
    })
  },
  
  // Export
  async exportModel(documentId: string, elementId: string, format: 'step' | 'stl' | 'obj') {
    return request<{ downloadUrl: string }>(`/export/${documentId}/${elementId}?format=${format}`)
  },
  
  // Analysis
  async getMassProperties(documentId: string, elementId: string) {
    return request<any>(`/analysis/${documentId}/${elementId}/mass-properties`)
  },
  
  async checkInterference(documentId: string, elementId: string) {
    return request<any>(`/analysis/${documentId}/${elementId}/interference`)
  }
}

