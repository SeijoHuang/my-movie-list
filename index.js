const BASE_URL = 'https://movie-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/movies/'
const POSTER_URL = BASE_URL + '/posters/'
const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const movies = []
const moviesPerPage = 12
const paginator = document.querySelector('#paginator')
const navbar = document.querySelector('.navbar')
const displayBtn = document.querySelector('.i-display')
let currentPage = 1
let filterMovie = []
// 函式 動態帶入movie list (card)
function renderMovieList(data) {  
  let rawHtml = ''
  if (dataPanel.dataset.display === "card-mode"){
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
                <button class="btn btn-success btn-add-favorite" data-id="${item.id}">+</button>
              </div>
          </div>
        </div >
      </div >
    `
      dataPanel.innerHTML = rawHtml
    })
  } else if (dataPanel.dataset.display === "list-mode"){
    rawHtml += `<table class = "mt-4 table">`
    data.forEach((item) => {
      rawHtml += `
      <tr>
      <th> ${item.title} </th>
      <td class="col-3">
        <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id=" ${item.id} "> More </button>
        <button class="btn btn-success btn-add-favorite" data-id=" ${item.id} "> + </button>
      </td>
      </tr>    
    `
    })
    rawHtml += `</table>`
    dataPanel.innerHTML = rawHtml
  }  
}
//函式 切換顯示方式
function changeDisplayMode(mode){
  if (dataPanel.dataset.display === mode) return 
  dataPanel.dataset.display = mode
}
// 函式 Modal串接API，配對id帶入Movie介紹(movie-modal-title,movie-modal-image,movie-modal-date,movie-modal-description)
function showMovieModal(id) {
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')
  //串接show API，URL帶入點擊的電影id，拿取show API中的資料，達到動態顯示movie資訊
  axios.get(INDEX_URL + id).then((res) => {
    const data = res.data.results
    modalTitle.textContent = data.title
    modalImage.innerHTML = `<img src="${POSTER_URL + data.image}" alt="Movie -Poster" class ="img-fluid">`
    modalDate.textContent = `Release date: ${data.release_date}`
    modalDescription.textContent = data.description
  })
}
// 函式加入我的最愛清單
function addFavoriteMovie(id) {
  // function addFavorite(movie){
  //   return movie.id === id
  // }
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  const movie = movies.find((movie) => movie.id === id)
  if (list.some((movie) => movie.id === id)) {
    return alert('此電影已經在收藏清單中！')
  }
  list.push(movie)
  localStorage.setItem('favoriteMovies', JSON.stringify(list))
}
// page處理
// 每頁顯示12個，獲取點擊到頁碼的電影data
function getMoviesByPage(page) {
  const data = filterMovie.length ? filterMovie : movies
  const indexStar = (page - 1) * moviesPerPage
  return data.slice(indexStar, indexStar + moviesPerPage)
}
// 處理總頁數
function renderPaginator(amount) {
  const totalPage = Math.ceil(amount / moviesPerPage)
  let pageHtml = ''
  for (let page = 1; page <= totalPage; page++) {
    pageHtml += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`
  }
  paginator.innerHTML = pageHtml
}
// 監聽器 透過匹配data-page，點擊頁碼找到當前頁面，並渲染該頁面
paginator.addEventListener('click', function onPaginatorClick(event) {
  if (event.target.tagName !== 'A') return
  const targetPage = Number(event.target.dataset.page)
  currentPage = targetPage
  renderMovieList(getMoviesByPage(currentPage))
})
// 監聽器 點擊切換display方式card / list
displayBtn.addEventListener('click', (event) => {
  if (event.target.matches('#display-card')) {
    changeDisplayMode('card-mode')
    renderMovieList(getMoviesByPage(currentPage))    
  } else if (event.target.matches('#display-list')) {
    changeDisplayMode('list-mode')
    renderMovieList(getMoviesByPage(currentPage))  
  }
})
//監聽器 點擊+按鈕加入我的最愛清單
//more按鈕設監聽器，點擊後透過i，從API中拿取資料，在modal中動態帶入電影資訊
dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches(".btn-show-movie")) {
    //透過id配對點擊到的電影id，套入showMovieModal(id)函式
    showMovieModal(Number(event.target.dataset.id))
  } else if (event.target.matches(".btn-add-favorite")) {
    addFavoriteMovie(Number(event.target.dataset.id))
  }           
})
// 監聽器 內容搜尋
searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  event.preventDefault()
  const keyWord = searchInput.value.trim().toLowerCase()
  // 方法２： array.filter() 過濾出含input.value的movie
  filterMovie = movies.filter(function (movie) {
    return movie.title.toLowerCase().includes(keyWord)
  })
    // 方法1：for...of 用迴圈搜尋、帶入input value
    // for (const movie of movies) { 
    //   if (movie.title.toLowerCase().includes(keyWord)) {
    //     filterMovie.push(movie)  
    //   } 
    // }
  if (!keyWord.length) {
    return alert('請輸入關鍵字')
  }
  if (!filterMovie.length) {
    return alert(`無含關鍵字"${keyWord}"的電影，請重新輸入`)
  }
  renderPaginator(filterMovie.length)
  renderMovieList(getMoviesByPage(1))
  })
// 串接API帶入電影清單
//預設畫面
axios.get(INDEX_URL)
  .then((response) => {
    movies.push(...response.data.results)
    renderPaginator(movies.length)
    changeDisplayMode('card-mode')
    renderMovieList(getMoviesByPage(1))
  })
  .catch((error) => console.log(err))

