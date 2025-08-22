const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

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