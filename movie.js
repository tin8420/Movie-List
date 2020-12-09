const INDEX_URL = 'https://movie-list.alphacamp.io/api/v1/movies/'
const POSTER_URL = 'https://movie-list.alphacamp.io/posters/'
const dataPanel = document.querySelector('#data-panel')
const search = document.querySelector('#movie-search')
const searchInput = document.querySelector('#search-input')
const navControl = document.querySelector('#navControl')
const paginator = document.querySelector('#paginator')
const ListControl = document.querySelector('#control-panel')
const list = JSON.parse(localStorage.getItem('favoriteMoives')) || []
let filteredMovies = []
const MODE_CARD = 0
const MODE_LIST = 1
let displayMode = MODE_CARD
const TYPE_NORMAL = 0
const TYPE_FAVORITE = 1
let displayType = TYPE_NORMAL
const AllMovies = []
const MOVIE_PER_PAGE = 12

axios.get(INDEX_URL).then((response) => {
  //將抓回來的資料重新傳進一個新的陣列中
  AllMovies.push(...response.data.results)
  render(AllMovies, 1)
}).catch((err) => console.log(err))

// Main render fuction  
function render(data, page) {
  renderPagination(data.length)
  const moviesInCurrentPage = getMoivesByPage(data, page)
  if (displayMode === MODE_CARD) {
    renderMoivesAsCard(moviesInCurrentPage)
  }
  if (displayMode === MODE_LIST) {
    renderMoivesAsList(moviesInCurrentPage)
  }
}

//Card Mode
function renderMoivesAsCard(data) {
  let rawHTML = ''
  for (let movie of data) {
    rawHTML += `
        <div class="col-sm-3">
           <div class="mb-2">
             <div class="card">
                <img src="${POSTER_URL + movie.image}" class="card-img-top" alt="Movie Poster" />
                <div class="card-body">
                  <h5 class="card-title">${movie.title}</h5>
                </div>
                <div class="card-footer">
                  <button class="btn btn-primary btn-show-movie" data-toggle="modal" data-target="#movie-modal" data-id="${movie.id}">More
                  </button>
                  <button class="btn btn-info btn-add-favorite" data-id='${movie.id}'>+</button>
                </div>
              </div>
            </div>
        </div>
        `
  }
  dataPanel.innerHTML = rawHTML
}
// List Mode
function renderMoivesAsList(data) {
  let rawHTML = ''
  for (let movie of data) {
    rawHTML += `
    <li class="list-group-item w-100 border-right-0 border-left-0">
      <div class="row">
        <p class="col-8">${movie.title}</p>
        <div class="button-groups">
          <button type="button" class="btn btn-primary btn-show-movie" data-toggle="modal" data-target="#movie-modal" data-id="${movie.id}">More</button>
          <button type="button" class="btn btn-info btn-add-favorite" data-id="${movie.id}">+</button>        
        </div>
      </div>
    </li>
  `
  }
  dataPanel.innerHTML = rawHTML
}

//Modal
function showMovieModal(id) {
  const Modaltitle = document.querySelector('#movie-modal-title')
  const ModalImg = document.querySelector('#movie-modal-img')
  const Modaldate = document.querySelector('#date')
  const Description = document.querySelector('#description')
  axios.get(INDEX_URL + '/' + id).then((response) => {
    let data = response.data.results
    Modaltitle.innerHTML = data.title
    Modaldate.innerHTML = 'Release_date：' + data.release_date
    Description.innerHTML = data.description
    ModalImg.innerHTML =
      `<img src="${POSTER_URL + data.image}" alt="123">`
  })

}

// Pagination
function getMoivesByPage(data, page) {
  const start = (page - 1) * MOVIE_PER_PAGE
  return data.slice(start, start + MOVIE_PER_PAGE)
}

function renderPagination(amount) {
  const num = Math.ceil(amount / MOVIE_PER_PAGE)
  let rawHTML = ''
  for (let page = 1; page <= num; page++) {
    rawHTML += `
    <li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>
    `
  }
  paginator.innerHTML = rawHTML
}

// Favorite
function addToFavorite(id) {
  const movie = AllMovies.find((movie) => movie.id === id)
  if (list.some((movie) => movie.id === id)) {
    alert('This movie has already been added to favorite')
  } else {
    alert(`${movie.title} has been added to favorite`)
    list.push(movie)
  }
  localStorage.setItem('favoriteMoives', JSON.stringify(list))
}

paginator.addEventListener('click', function paginator(e) {
  const datas = filteredMovies.length ? filteredMovies : AllMovies
  const pageNum = Number(e.target.dataset.page)
  render(datas, pageNum)
})


ListControl.addEventListener('click', function ListMode(e) {
  const datas = filteredMovies.length ? filteredMovies : AllMovies
  if (e.target.matches('.fas')) {
    displayMode = MODE_LIST
  } else if (e.target.matches('.fa')) {
    displayMode = MODE_CARD
  }
  render(datas, 1)
})

//設置監聽器在datapanel上
dataPanel.addEventListener('click', function clickbutton(e) {
  //若按下.btn的按鈕後，將e.target上的data.id傳進showmoviemodal函式中
  if (e.target.matches('.btn-show-movie')) {
    showMovieModal(Number(e.target.dataset.id))
  } else if (e.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(e.target.dataset.id))
  }
})

//Search
search.addEventListener('submit', function clicksubmit(e) {
  e.preventDefault()
  let keyword = searchInput.value.trim().toLowerCase()
  filteredMovies = AllMovies.filter((movie) => movie.title.toLowerCase().includes(keyword))
  if (keyword.length === 0 || filteredMovies.length === 0) {
    return alert('未找到相關電影')
  }
  render(filteredMovies, 1)
})
