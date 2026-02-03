import axios from 'axios';

const testAPI = async () => {
    try {
        console.log("Testing API...");
        const response = await axios.get('http://localhost:3000/api/movie/all');
        if (response.data.success) {
            console.log(`✅ API Success! Found ${response.data.movies.length} movies.`);
            console.log("First movie:", response.data.movies[0].title);
        } else {
            console.log("❌ API Returned Error:", response.data);
        }
    } catch (error) {
        console.error("❌ API Request Failed:", error.message);
        if (error.response) {
            console.error("Status:", error.response.status);
            console.error("Data:", error.response.data);
        }
    }
};

testAPI();
