export const apiKey = process.env.TMDB_API_KEY;
export const baseUrl = process.env.TMDB_BASE_URL || 'https://api.themoviedb.org/3';
export const imageBaseUrl = process.env.TMDB_IMAGE_BASE_URL || 'https://image.tmdb.org/t/p';

if (!apiKey) {
  console.warn('⚠️ TMDB API KEY is missing in .env file!');
}