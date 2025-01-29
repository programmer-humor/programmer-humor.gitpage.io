let currentPage = 0;
const pageSize = 3;
let isLoading = false;
let hasMoreData = true;

async function fetchHumorFeed(page, size) {
    try {
        // const response = await fetch('humor_data.json');
        // const apiUrl = process.env.REAL_API_HOST || 'humor_data.json';
        const apiUrl = 'https://real-brave-people.p-e.kr';
        // const apiUrl = 'https://dev-brave-people.p-e.kr';
        // const apiUrl = 'http://localhost:9000';
        const response = await fetch(`${apiUrl}/front/v1/humors?orderType=RECENTLY&langType=ENG,KO&page=${page}&size=${size}`);
        // const response = await fetch(`${apiUrl}/front/v1/humors?orderType=RECENTLY&langType=ENG,KO&page=${page}&size=${size}`, {
            // mode: 'cors',
            // credentials: 'include'
        //   });

        if (!response.ok) {
            throw new Error('fail to call API');
        }
        const data = await response.json();
        hasMoreData = data.length === size;
        return data;
    } catch (error) {
        console.error('fail to get feed:', error);
        return null;
    }
}

function createFeedHTML(feedItem) {
    const imageListHTML = feedItem.image_list.map(img => 
        `<div class="swiper-slide">
            <img src="${img.image_url}" alt="유머 이미지 ${img.seq}" loading="lazy" onclick="openModal('${img.image_url}')">
         </div>`
    ).join('');

    return `
        <article class="feed-item">
            <h2>${feedItem.title}</h2>
            <p>${feedItem.content}</p>
            <div class="swiper">
                <div class="swiper-wrapper">
                    ${imageListHTML}
                </div>
                <div class="swiper-pagination"></div>
                <div class="swiper-button-next"></div>
                <div class="swiper-button-prev"></div>
            </div>
        </article>
    `;
}

function showLoadingIndicator() {
    document.getElementById('loading-indicator').style.display = 'block';
}

function hideLoadingIndicator() {
    document.getElementById('loading-indicator').style.display = 'none';
}

async function loadMoreFeed() {
    if (isLoading || !hasMoreData) return;

    isLoading = true;
    showLoadingIndicator();

    const feedContainer = document.getElementById('feed-container');
    const data = await fetchHumorFeed(currentPage, pageSize);
    
    if (data && data.length > 0) {
        const feedHTML = data.map(createFeedHTML).join('');
        feedContainer.insertAdjacentHTML('beforeend', feedHTML);
        
        // Swiper 초기화
        data.forEach((_, index) => {
            new Swiper(`.feed-item:nth-child(${(currentPage - 1) * pageSize + index + 1}) .swiper`, {
                pagination: {
                    el: '.swiper-pagination',
                },
                navigation: {
                    nextEl: '.swiper-button-next',
                    prevEl: '.swiper-button-prev',
                },
            });
        });

        currentPage++;
    }

    if (!hasMoreData) {
        feedContainer.insertAdjacentHTML('beforeend', `
            <div class="end-message">
                😀 모든 유머를 읽었습니다.
            </div>
        `);
    }

    isLoading = false;
    hideLoadingIndicator();
}

function handleScroll() {
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 500) {
        loadMoreFeed();
    }
}

// 모달 관련 함수 추가
function openModal(imageUrl) {
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalImage');
    modal.style.display = "block";
    modalImg.src = imageUrl;
}

// 초기 로드
document.addEventListener('DOMContentLoaded', () => {
    loadMoreFeed();

    // 모달 닫기 이벤트 설정
    const modal = document.getElementById('imageModal');
    const closeBtn = document.getElementsByClassName('modal-close')[0];

    closeBtn.onclick = function() {
        modal.style.display = "none";
    }

    modal.onclick = function(event) {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    }

    // ESC 키로 모달 닫기
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && modal.style.display === "block") {
            modal.style.display = "none";
        }
    });
});

// 스크롤 이벤트 리스너 추가
window.addEventListener('scroll', handleScroll);