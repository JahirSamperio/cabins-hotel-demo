const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Consulta pública de disponibilidad
export const checkAvailability = async (checkIn, checkOut, guests) => {
    try {
        const response = await fetch(
            `${API_URL}/availability/check?check_in=${checkIn}&check_out=${checkOut}&guests=${guests}`
        );
        
        if (!response.ok) {
            throw new Error('Error en la consulta');
        }
        
        return await response.json();
    } catch (error) {
        throw new Error('Error al consultar disponibilidad');
    }
};

// Servicios administrativos
export const availabilityAdminAPI = {
    // Obtener disponibilidad por rango de fechas
    getByRange: async (startDate, endDate, cabinId = null, token, page = 1, limit = 100) => {
        try {
            let url = `${API_URL}/availability/admin/range?start_date=${startDate}&end_date=${endDate}&page=${page}&limit=${limit}`;
            if (cabinId) url += `&cabin_id=${cabinId}`;
            
            const response = await fetch(url, {
                headers: {
                    'x-token': token,
                    'Content-Type': 'application/json'
                }
            });
            
            return await response.json();
        } catch (error) {
            throw new Error('Error al consultar disponibilidad');
        }
    },

    // Establecer disponibilidad para una fecha específica
    setAvailability: async (data, token) => {
        try {
            const response = await fetch(`${API_URL}/availability/admin/set`, {
                method: 'POST',
                headers: {
                    'x-token': token,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            
            return await response.json();
        } catch (error) {
            throw new Error('Error al establecer disponibilidad');
        }
    },

    // Establecer disponibilidad para múltiples fechas
    setBulkAvailability: async (data, token) => {
        try {
            const response = await fetch(`${API_URL}/availability/admin/bulk`, {
                method: 'POST',
                headers: {
                    'x-token': token,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            
            return await response.json();
        } catch (error) {
            throw new Error('Error al establecer disponibilidad masiva');
        }
    },

    // Eliminar registro de disponibilidad
    delete: async (id, token) => {
        try {
            const response = await fetch(`${API_URL}/availability/admin/${id}`, {
                method: 'DELETE',
                headers: {
                    'x-token': token,
                    'Content-Type': 'application/json'
                }
            });
            
            return await response.json();
        } catch (error) {
            throw new Error('Error al eliminar disponibilidad');
        }
    }
};