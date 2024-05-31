//css control
function openBar(){
    document.getElementById('sidebar').style.width = '250px';
    document.getElementById('main').style.marginLeft = '250px';
    document.getElementById('openbtn').style.display = 'none';
}

function closeBar(){
    document.getElementById('sidebar').style.width = '0';
    document.getElementById('main').style.marginLeft = '0';
    document.getElementById('openbtn').style.display = 'inline';
}

//openAPI implementaion
async function fetchData() {
    const response = 
            await fetch('https://apis.data.go.kr/6260000/GoodPriceStoreService/getGoodPriceStore?serviceKey=wMPj3KtrAGElpdH4MKeC0CHjJg%2FNKvHPXd9Anmj6rjL%2Fl43xbSEbEoGGTQJOdEj6yR3XhclIs3OZtav0Lyq2Jg%3D%3D&pageNo=1&numOfRows=500&resultType=json');
    const data = await response.json();
    return data.getGoodPriceStore.body.items.item; // Adjust based on your API structure
}

function createCard(item) {
    const card = document.createElement('div');
    card.className = 'card';

    const header = document.createElement('div');
    header.className = 'card-header';
    header.textContent = item.sj;
    card.appendChild(header);

    const body = document.createElement('div');
    body.className = 'card-body';

    const img = document.createElement('img');
    if(item.imgFile1){
        img.src = `https://${item.imgFile1}`;
        img.alt = item.imgName1;
        body.appendChild(img);
        card.appendChild(body);
    } else if(item.imgFile2){
        img.src = `https://${item.imgFile2}`;
        img.alt = item.imgName2;
        body.appendChild(img);
        card.appendChild(body);
    } else{
        img.src = 'media/no-image.jpg';
        img.alt = 'no image';
        body.appendChild(img);
        card.appendChild(body);
    }

    const footer = document.createElement('div');
    footer.className = 'card-footer';

    const cn = document.createElement('div');
    cn.textContent = `${item.cn}`;
    footer.appendChild(cn);

    const tel = document.createElement('div');
    tel.textContent = item.tel? `Tel: ${item.tel}` : 'Tel: 없음';
    footer.appendChild(tel);

    const adres = document.createElement('div');
    adres.textContent = `${item.adres}`;
    footer.appendChild(adres);

    const intrcn = document.createElement('div');
    let line = document.createElement('hr');
    intrcn.className = 'introduction';
    if(item.intrcn != null){
        intrcn.innerHTML = item.intrcn;
        intrcn.style.overflow = 'scroll';
        footer.appendChild(line);
        footer.appendChild(intrcn);
    }
    card.appendChild(footer);

    return card;
}

function displayData(data) {
    const container = document.getElementById('data-container');
    container.innerHTML = ''; // Clear existing content
    data.forEach(item => {
        const card = createCard(item);
        container.appendChild(card);
    });
}

function applyFilters(data) {
    const parkingFilter = document.getElementById('filter-parking').value;
    const categoryFilter = document.getElementById('filter-category').value;

    let filteredData = data;

    if (parkingFilter !== 'all') {
        filteredData = filteredData.filter(item => item.parkngAt === parkingFilter);
    }

    if (categoryFilter !== 'all') {
        filteredData = filteredData.filter(item => item.cn === categoryFilter);
    }

    displayData(filteredData);
}

document.getElementById('apply-filters').addEventListener('click', () => {
    fetchData().then(data => {
        applyFilters(data);
    });
});

// Initial load
fetchData().then(data => {
    displayData(data);
});

//map implementation
var container = document.getElementById('map');
var options = {
    center: new kakao.maps.LatLng(35.18003483348194, 129.07493819187425),
    level: 4
};
// 지도 생성
var map = new kakao.maps.Map(container, options);
// 스카이뷰/지도 타입 변경
function setMapType(maptype) { 
    var roadmapControl = document.getElementById('btnRoadmap');
    var skyviewControl = document.getElementById('btnSkyview'); 
    if (maptype === 'roadmap') {
        map.setMapTypeId(kakao.maps.MapTypeId.ROADMAP);    
        roadmapControl.className = 'selected_btn';
        skyviewControl.className = 'btn';
    } else {
        map.setMapTypeId(kakao.maps.MapTypeId.HYBRID);    
        skyviewControl.className = 'selected_btn';
        roadmapControl.className = 'btn';
    }
}
// 줌 인/아웃
function zoomIn() {
    map.setLevel(map.getLevel() - 1);
}

function zoomOut() {
    map.setLevel(map.getLevel() + 1);
}

// 지도를 클릭한 위치에 표출할 마커입니다
var marker = new kakao.maps.Marker({ 
    // 지도 중심좌표에 마커를 생성합니다 
    position: map.getCenter() 
}); 
// 지도에 마커를 표시합니다
marker.setMap(map);

// 지도에 클릭 이벤트를 등록합니다
// 지도를 클릭하면 마지막 파라미터로 넘어온 함수를 호출합니다
/*kakao.maps.event.addListener(map, 'click', function(mouseEvent) {        
    
    // 클릭한 위도, 경도 정보를 가져옵니다 
    var latlng = mouseEvent.latLng; 
    
    // 마커 위치를 클릭한 위치로 옮깁니다
    marker.setPosition(latlng);
}); */

// 마커에 커서가 오버됐을 때 마커 위에 표시할 인포윈도우를 생성합니다
var iwContent = '<div style="padding:5px;">상점이름</div>'; // 인포윈도우에 표출될 내용으로 HTML 문자열이나 document element가 가능합니다

// 인포윈도우를 생성합니다
var infowindow = new kakao.maps.InfoWindow({
    content : iwContent
});

// 마커에 마우스오버 이벤트를 등록합니다
kakao.maps.event.addListener(marker, 'mouseover', function() {
  // 마커에 마우스오버 이벤트가 발생하면 인포윈도우를 마커위에 표시합니다
    infowindow.open(map, marker);
});

// 마커에 마우스아웃 이벤트를 등록합니다
kakao.maps.event.addListener(marker, 'mouseout', function() {
    // 마커에 마우스아웃 이벤트가 발생하면 인포윈도우를 제거합니다
    infowindow.close();
});

// 지도를 표시하는 div 크기를 변경하는 함수입니다
function resizeMap() {
    var mapContainer = document.getElementById('map');
    mapContainer.style.width = '100%';
    mapContainer.style.height = '30vh'; 
}

function relayout() {    
    
    // 지도를 표시하는 div 크기를 변경한 이후 지도가 정상적으로 표출되지 않을 수도 있습니다
    // 크기를 변경한 이후에는 반드시  map.relayout 함수를 호출해야 합니다 
    // window의 resize 이벤트에 의한 크기변경은 map.relayout 함수가 자동으로 호출됩니다
    map.relayout();
}
window.addEventListener('DOMContentLoaded', (event) => {
    map.relayout();
    map.setCenter(35.18003483348194, 129.07493819187425);
});