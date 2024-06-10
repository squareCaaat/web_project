//map implementation
var container = document.getElementById('map');
var options = {
    center: new kakao.maps.LatLng(35.18003483348194, 129.07493819187425),
    level: 5
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
        relayout();
    } else {
        map.setMapTypeId(kakao.maps.MapTypeId.HYBRID);    
        skyviewControl.className = 'selected_btn';
        roadmapControl.className = 'btn';
        relayout();
    }
}
// 줌 인/아웃
function zoomIn() {
    map.setLevel(map.getLevel() - 1);
}

function zoomOut() {
    map.setLevel(map.getLevel() + 1);
}

// 주소-좌표 변환 객체를 생성합니다
var geocoder = new kakao.maps.services.Geocoder();

function relayout() {    
    // 지도를 표시하는 div 크기를 변경한 이후 지도가 정상적으로 표출되지 않을 수도 있습니다
    // 크기를 변경한 이후에는 반드시  map.relayout 함수를 호출해야 합니다 
    // window의 resize 이벤트에 의한 크기변경은 map.relayout 함수가 자동으로 호출됩니다
    map.relayout();
}

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
    return data.getGoodPriceStore.body.items.item; 
}

function createCard(item) {
    const card = document.createElement('div');
    card.className = 'card';

    const header = document.createElement('div');
    header.className = 'card-header';
    header.id = `${item.idx}`;
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

    const cn = document.createElement('p');
    cn.className = 'category';
    cn.textContent = `${item.cn}`;
    footer.appendChild(cn);

    const tel = document.createElement('p');
    tel.className = 'tel';
    tel.textContent = item.tel? `Tel: ${item.tel}` : 'Tel: 없음';
    footer.appendChild(tel);

    const adres = document.createElement('p');
    adres.className = 'adress';
    adres.textContent = `${item.adres}`;
    footer.appendChild(adres);
    
    if(item.intrcn != '<p><br></p>' || item.intrcn != ' ' || item.intrcn != '' || item.intrcn != '<p>&nbsp;</p>'){
        const intrcn = document.createElement('div');
        intrcn.className = 'introduction';
        intrcn.innerHTML = item.intrcn;
        intrcn.style.overflow = 'auto';
        footer.appendChild(document.createElement('hr'));
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

//handle map marker
var markers = [];
//지도에 해당 업체의 위치르 마커로 찍기
// 주소로 좌표를 검색합니다
function putMarkMap(data){
    data.forEach((item)=>{
        if(item.adres.indexOf('부산') == -1){
            item.adres = '부산 ' + item.adres;
        }
        geocoder.addressSearch(item.adres, function(result, status) {
            // 정상적으로 검색이 완료됐으면 
            if (status === kakao.maps.services.Status.OK) {
                var coords = new kakao.maps.LatLng(result[0].y, result[0].x);

                // 결과값으로 받은 위치를 마커로 표시합니다
                var marker = new kakao.maps.Marker({
                    map: map,
                    position: coords
                });
                markers.push(marker);

                // 마커에 커서가 오버됐을 때 마커 위에 표시할 인포윈도우를 생성합니다
                var iwContent = `<div style="width:150px;text-align:center;padding:6px 0;">${item.sj}</div>`;

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
                if(data.length == 1){
                    map.setCenter(coords);
                }
            } 
        });
    });
}

//handle filter
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
    putMarkMap(filteredData);
    displayData(filteredData);
}

document.getElementById('apply-filters').addEventListener('click', () => {
    markers.forEach((mark)=>{mark.setMap(null)});
    fetchData().then(data => {
        applyFilters(data);
    });
});

//handle search
function searchStore(data){
    const searchText = document.getElementById('store_name').value;
    const filteredData = data.filter(item => item.sj.includes(searchText));
    markers.forEach((mark)=>{mark.setMap(null)});
    putMarkMap(filteredData);
    displayData(filteredData);
}

document.getElementById('searchbtn').addEventListener('click', () => {
    fetchData().then(data => {
        searchStore(data);
    })
})

// Initial load
fetchData().then(data => {
    putMarkMap(data);
    displayData(data);
    relayout();
});

