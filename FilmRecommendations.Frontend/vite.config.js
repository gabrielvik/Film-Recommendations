export default {
  server: {
    proxy: {
      '/FilmRecomendations': {
        target: 'https://api:7103',
        changeOrigin: true,
        secure: false
      }
    }
  }
}