// Base URL of the backend API
const BASE_URL = 'http://localhost:5000/api/v1'

// Common function for making API requests
export const fetchAPI = async (endpoint, options = {}) => {

    // Get JWT token from localStorage (if user is logged in)
    const token = localStorage.getItem("token")

    // Build request headers
    const headers = {
        'Content-Type': 'application/json',

        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers
    }

    // Send the request
    const response = await fetch(`${BASE_URL}${endpoint}`, {
        // Spread user-provided options (method, body, etc.)
        ...options,

        // Use the headers we created above
        headers
    })

    // Convert response body from JSON to JavaScript object
    const data = await response.json()

    // Check if request failed (status code not in 200-299 range)
    if (!response.ok) {

        // Throw backend error message if available
        // Otherwise throw a default error
        throw new Error(
            data.message || 'Something went wrong'
        )
    }

    // Return the parsed response data
    return data
}