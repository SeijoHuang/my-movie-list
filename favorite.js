const BASE_URL = 'https://movie-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/movies/'
const POSTER_URL = BASE_URL + '/posters/'
const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const movies = JSON.parse(localStorage.getItem('favoriteMovies'))||[]
// 函式 動態帶入movie list
function renderMovieList(data) {
  let rawHtml = ''
  data.forEach((item) => {
    rawHtml += `
      <div class="col-sm-3">
        <div class="mb-2" >
          <div class="card">
            <img src="${POSTER_URL + item.image}" class="card-img-top"
              alt="Movie Poster">
              <div class="card-body">
                <h5 class="card-title">${item.title}</h5>
              </div>
              <div class="card-footer">
                <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal"
                  data-bs-target="#movie-modal" data-id="${item.id}">More</button>
                <button class="btn btn-danger btn-remove-favorite" data-id="${item.id}">X</button>
              </div>
          </div>
        </div >
      </div >
    `
    dataPanel.innerHTML = rawHtml
  })
}
// 函式 Modal串接API，配對id帶入Movie介紹(movie-modal-title,movie-modal-image,movie-modal-date,movie-modal-description)
function showMovieModal(id) {
  const modalTitle = document.querySelector("#movie-modal-title")
  const modalImage = document.querySelector("#movie-modal-image")
  const modalDate = document.querySelector("#movie-modal-date")
  const modalDescription = document.querySelector("#movie-modal-description")
  //串接show API，URL帶入點擊的電影id，拿取show API中的資料，達到動態顯示movie資訊
  axios.get(INDEX_URL + id).then((res) => {
    const data = res.data.results
    modalTitle.textContent = data.title
    modalImage.innerHTML = `<img src="${POSTER_URL + data.image}" alt="Movie -Poster" class ="img-fluid">`
    modalDate.textContent = `Release date: ${data.release_date}`
    modalDescription.textContent = data.description
  })
}
function removeFavoriteMovie(id) {
  if (!movies || !movies.length) return 
  const movieIndex = movies.findIndex((movie) => movie.id === id)
  if (movieIndex === -1) return
  movies.splice(movieIndex, 1)
  localStorage.setItem('favoriteMovies' , JSON.stringify(movies))
  renderMovieList(movies)
}
//more按鈕設監聽器，點擊後透過id，從API中拿取資料，在modal中動態帶入電影資訊
dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches(".btn-show-movie")) {
    //透過id配對點擊到的電影id，套入showMovieModal(id)函式
    showMovieModal(Number(event.target.dataset.id))
  } else if (event.target.matches(".btn-remove-favorite")) {
    removeFavoriteMovie(Number(event.target.dataset.id))
  }
})

searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  event.preventDefault()
  const keyWord = searchInput.value.trim().toLowerCase()
  let filterMovie = []
  // 方法２： array.filter() 過濾出含input.value的movie
  filterMovie = movies.filter(function (movie) {
    return movie.title.toLowerCase().includes(keyWord)
  })

  if (!keyWord.length) {
    return alert('請輸入關鍵字')
  }
  if (!filterMovie.length) {
    return alert(`無含關鍵字"${keyWord}"的電影，請重新輸入`)
  }

  renderMovieList(filterMovie)

})

renderMovieList(movies)