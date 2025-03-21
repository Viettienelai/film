// Biến lưu trạng thái danh sách phim trước đó
let previousState = {
    url: 'https://phim.nguonc.com/api/films/phim-moi-cap-nhat?page=1',
    title: 'Phim Mới Cập Nhật'
};

// Danh sách để lưu các slug đã hiển thị, tránh trùng lặp
let displayedSlugs = new Set();

// Lấy danh sách phim khi tải trang
window.onload = () => {
    displayedSlugs.clear(); // Xóa danh sách slug khi tải lại trang
    // Tải danh sách phim từ trang 1 đến trang 10
    for (let page = 1; page <= 10; page++) {
        fetchMovies(`https://phim.nguonc.com/api/films/phim-moi-cap-nhat?page=${page}`, 'Phim Mới Cập Nhật', true);
    }
};

// Tìm kiếm phim
function searchMovies() {
    const keyword = document.getElementById('searchInput').value.trim();
    if (keyword) {
        const url = `https://phim.nguonc.com/api/films/search?keyword=${encodeURIComponent(keyword)}`;
        previousState = { url, title: `Kết quả tìm kiếm cho "${keyword}"` };
        displayedSlugs.clear(); // Xóa danh sách slug khi tìm kiếm
        fetchMovies(url, previousState.title, false);
    }
}

// Quay về trang chủ
function goToHome() {
    previousState = {
        url: 'https://phim.nguonc.com/api/films/phim-moi-cap-nhat?page=1',
        title: 'Phim Mới Cập Nhật'
    };
    displayedSlugs.clear(); // Xóa danh sách slug khi quay về trang chủ
    for (let page = 1; page <= 10; page++) {
        fetchMovies(`https://phim.nguonc.com/api/films/phim-moi-cap-nhat?page=${page}`, 'Phim Mới Cập Nhật', true);
    }
    document.getElementById('searchInput').value = ''; // Xóa ô tìm kiếm
}

// Quay lại danh sách trước đó
function goBack() {
    if (previousState.url === 'https://phim.nguonc.com/api/films/phim-moi-cap-nhat?page=1') {
        displayedSlugs.clear(); // Xóa danh sách slug khi quay về trang chủ
        for (let page = 1; page <= 10; page++) {
            fetchMovies(`https://phim.nguonc.com/api/films/phim-moi-cap-nhat?page=${page}`, 'Phim Mới Cập Nhật', true);
        }
    } else {
        displayedSlugs.clear(); // Xóa danh sách slug khi quay lại danh sách khác
        fetchMovies(previousState.url, previousState.title, false);
    }
}

// Lấy dữ liệu phim từ API
function fetchMovies(url, title, append = false) {
    fetch(url)
        .then(response => response.json())
        .then(data => {
            const movieContainer = document.getElementById('movieContainer');
            const movieListTitle = document.getElementById('movieListTitle');
            
            // Nếu không append, xóa nội dung cũ
            if (!append) {
                movieContainer.innerHTML = '';
                displayedSlugs.clear(); // Xóa danh sách slug khi không append
            }
            
            movieListTitle.textContent = title;
            document.getElementById('movieList').style.display = 'block';
            document.getElementById('movieDetail').style.display = 'none';

            const movies = data.items || (data.movie ? [data.movie] : []);
            movies.forEach(movie => {
                // Kiểm tra nếu phim đã được hiển thị (dựa trên slug)
                if (!displayedSlugs.has(movie.slug)) {
                    displayedSlugs.add(movie.slug); // Thêm slug vào danh sách đã hiển thị
                    const filmDiv = document.createElement('div');
                    filmDiv.classList.add('film-container');
                    filmDiv.innerHTML = `
                        <img src="${movie.thumb_url || 'default-poster.jpg'}" alt="${movie.name}">
                        <div class="film-info">
                            <h3>${movie.name}</h3>
                        </div>
                    `; // Xóa phần <p> hiển thị năm
                    filmDiv.onclick = () => showMovieDetail(movie.slug);
                    movieContainer.appendChild(filmDiv);
                }
            });
        })
        .catch(error => console.error('Lỗi khi tải danh sách phim:', error));
}

// Hiển thị chi tiết phim
function showMovieDetail(slug) {
    const url = `https://phim.nguonc.com/api/film/${slug}`;
    fetch(url)
        .then(response => response.json())
        .then(data => {
            const movie = data.movie;
            document.getElementById('movieList').style.display = 'none';
            document.getElementById('movieDetail').style.display = 'block';

            // Xử lý dữ liệu category để lấy Định dạng, Thể loại, Quốc gia, Năm
            let format = 'Không xác định';
            let genre = 'Không xác định';
            let country = 'Không xác định';
            let year = 'Không xác định';

            if (movie.category) {
                Object.values(movie.category).forEach(cat => {
                    const groupName = cat.group.name;
                    const listValues = cat.list.map(item => item.name).join(', ');

                    if (groupName === 'Định dạng') {
                        format = listValues;
                    } else if (groupName === 'Thể loại') {
                        genre = listValues;
                    } else if (groupName === 'Quốc gia') {
                        country = listValues;
                    } else if (groupName === 'Năm') {
                        year = listValues;
                    }
                });
            }

            // Cập nhật ảnh nền cho .movie-header
            const movieHeader = document.querySelector('.movie-header');
            movieHeader.style.backgroundImage = `url('${movie.poster_url || movie.thumb_url || 'default-poster.jpg'}')`;

            // Cập nhật nội dung cho #movieInfo
            const movieInfo = document.getElementById('movieInfo');
            const posterImg = movieInfo.querySelector('.poster-container img');
            posterImg.src = movie.thumb_url || 'default-poster.jpg';
            posterImg.alt = movie.name;

            const detailsContainer = movieInfo.querySelector('.details-container');
            detailsContainer.querySelector('h1').textContent = movie.name;
            detailsContainer.querySelectorAll('.detail-item .value')[0].textContent = movie.original_name;
            detailsContainer.querySelectorAll('.detail-item .value')[1].textContent = format;
            detailsContainer.querySelectorAll('.detail-item .value')[2].textContent = genre;
            detailsContainer.querySelectorAll('.detail-item .value')[3].textContent = country;
            detailsContainer.querySelectorAll('.detail-item .value')[4].textContent = year;
            detailsContainer.querySelectorAll('.detail-item .value')[5].textContent = `${movie.current_episode} / ${movie.total_episodes}`;
            detailsContainer.querySelectorAll('.detail-item .value')[6].textContent = movie.time || 'Không xác định';
            detailsContainer.querySelectorAll('.detail-item .value')[7].textContent = movie.quality;
            detailsContainer.querySelectorAll('.detail-item .value')[8].textContent = movie.language;
            detailsContainer.querySelectorAll('.detail-item .value')[9].textContent = movie.director || 'Không xác định';
            detailsContainer.querySelectorAll('.detail-item .value')[10].textContent = movie.casts || 'Không xác định';

            // Cập nhật mô tả
            const descriptionDiv = document.querySelector('.description');
            descriptionDiv.textContent = movie.description || 'Không có mô tả';

            // Danh sách tập phim
            const episodeList = document.getElementById('episodeList');
            episodeList.innerHTML = '';
            if (movie.episodes && movie.episodes.length > 0 && movie.episodes[0].items) {
                movie.episodes[0].items.forEach((episode, index) => {
                    const epBox = document.createElement('div');
                    epBox.classList.add('episode-box');
                    // Đánh dấu tập đầu tiên là đang phát (mặc định)
                    if (index === 0) {
                        epBox.classList.add('active-episode');
                    }
                    epBox.textContent = `Tập ${episode.name}`;
                    epBox.onclick = () => playEpisode(episode.embed || episode.m3u8, epBox);
                    episodeList.appendChild(epBox);
                });
                // Phát tập đầu tiên mặc định
                playEpisode(movie.episodes[0].items[0].embed || movie.episodes[0].items[0].m3u8, episodeList.children[0]);
            } else {
                episodeList.innerHTML = '<p>Không có tập phim nào.</p>';
                document.getElementById('videoFrame').src = '';
            }
        })
        .catch(error => console.error('Lỗi khi tải chi tiết phim:', error));
}

// Phát video bằng iframe và đánh dấu tập đang phát
function playEpisode(videoUrl, selectedEpBox) {
    const videoFrame = document.getElementById('videoFrame');
    if (videoUrl) {
        videoFrame.src = videoUrl;

        // Xóa class active-episode khỏi tất cả các box
        const episodeBoxes = document.querySelectorAll('.episode-box');
        episodeBoxes.forEach(box => box.classList.remove('active-episode'));

        // Thêm class active-episode cho box được chọn
        if (selectedEpBox) {
            selectedEpBox.classList.add('active-episode');
        }
    } else {
        videoFrame.src = '';
        console.error('Không có link video để phát.');
    }
}