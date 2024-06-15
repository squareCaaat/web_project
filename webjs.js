//map implementation
var container = document.getElementById('map');
var options = {
    center: new kakao.maps.LatLng(35.18003483348194, 129.07493819187425),
    level: 9
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

// 주소-좌표 변환 객체를 생성합니다
var geocoder = new kakao.maps.services.Geocoder();

function relayout() {    
    // 지도를 표시하는 div 크기를 변경한 이후 지도가 정상적으로 표출되지 않을 수도 있습니다
    // 크기를 변경한 이후에는 반드시  map.relayout 함수를 호출해야 합니다 
    // window의 resize 이벤트에 의한 크기변경은 map.relayout 함수가 자동으로 호출됩니다
    map.relayout();
    map.setCenter(busanCenter.부산.coords);
    //new kakao.maps.LatLng(35.18003483348194, 129.07493819187425)
}

//openAPI implementaion
const apiUrl = 'https://apis.data.go.kr/6260000/GoodPriceStoreService/getGoodPriceStore?serviceKey=wMPj3KtrAGElpdH4MKeC0CHjJg%2FNKvHPXd9Anmj6rjL%2Fl43xbSEbEoGGTQJOdEj6yR3XhclIs3OZtav0Lyq2Jg%3D%3D&pageNo=1&numOfRows=699&resultType=json';
let originData;
let originCsv = [];

//csv parsing
function successFunction(fdata){
    var rows = fdata.split(/\r?\n|\r/);
    var fields = new Array();
    for(var row = 0; row < rows.length; row++){
        var cells = rows[row].split(',');
        var jsoncell = {};
        for(var cell = 0; cell < cells.length; cell++){
            if(row == 0){
                fields.push(cells[cell]);
            } else {
                jsoncell[fields[cell]] = cells[cell];
            }
        }
        if(row != 0){
            originCsv.push(jsoncell);
        }
    }
    console.log('csv init complete');
}

//read csv
$.ajax({
    url: '/static/boardlist.csv',
    dataType: 'text'
}).done(successFunction);

//marker handler
let markers = [];
let clusterMarkers = [];
var restIcon = new kakao.maps.MarkerImage(
    './media/restaurantmarker.png',
    new kakao.maps.Size(32, 32)
);

var servIcon = new kakao.maps.MarkerImage(
    './media/servicemarker.png',
    new kakao.maps.Size(32, 32)
);

var cafeIcon = new kakao.maps.MarkerImage(
    './media/cafemarker.png',
    new kakao.maps.Size(32, 32)
);

var accomoIcon = new kakao.maps.MarkerImage(
    './media/accomomarker.png',
    new kakao.maps.Size(32, 32)
);

var bathIcon = new kakao.maps.MarkerImage(
    './media/bathmarker.png',
    new kakao.maps.Size(32, 32)
);

var laundryIcon = new kakao.maps.MarkerImage(
    './media/laundrymarker.png',
    new kakao.maps.Size(32, 32)
);

var salonIcon = new kakao.maps.MarkerImage(
    './media/salonmarker.png',
    new kakao.maps.Size(32, 32)
);

var icon = new kakao.maps.MarkerImage(
    './media/marker.png',
    new kakao.maps.Size(32, 32)
);

async function setMarker(){
    //marker initialization
    originData.forEach((item)=>{
        var coordmap = {};
        var tmpadres = item.adres;
        if(item.adres.indexOf('부산') == -1){
            // item.adres = '부산 ' + item.adres;
            tmpadres = '부산 ' + item.adres;
        }
        coordmap.data = item; 
        geocoder.addressSearch(tmpadres, function(result, status) {
            // 정상적으로 검색이 완료됐으면 
            if (status === kakao.maps.services.Status.OK) {
                var coords = new kakao.maps.LatLng(result[0].y, result[0].x);
                
                // 결과값으로 받은 위치를 마커 객체에 저장
                if(item.cn === '음식점'){
                    if(item.cate === '기타양식'){
                        var marker = new kakao.maps.Marker({
                            position: coords,
                            image: cafeIcon
                        });
                    } else{
                        var marker = new kakao.maps.Marker({
                            position: coords,
                            image: restIcon
                        });
                    }
                } else{
                    if(item.cn === '기타서비스업'){
                        var marker = new kakao.maps.Marker({
                            position: coords,
                            image: servIcon
                        });
                    } else if(item.cn === '목욕업'){
                        var marker = new kakao.maps.Marker({
                            position: coords,
                            image: bathIcon
                        });
                    } else if(item.cn === '세탁업'){
                        var marker = new kakao.maps.Marker({
                            position: coords,
                            image: laundryIcon
                        });
                    } else if(item.cn === '숙박업'){
                        var marker = new kakao.maps.Marker({
                            position: coords,
                            image: accomoIcon
                        });
                    } else if(item.cn === '이미용업'){
                        var marker = new kakao.maps.Marker({
                            position: coords,
                            image: salonIcon
                        });
                    } else{
                        var marker = new kakao.maps.Marker({
                            position: coords,
                            image: icon
                        });
                    }
                }

                // 마커에 커서가 오버됐을 때 마커 위에 표시할 인포윈도우를 생성합니다
                var iwContent = `<div style="width:150px;text-align:center;padding:6px 0;">${item.sj}<br/>${item.adres}</div>`;

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
                
                kakao.maps.event.addListener(marker, 'click', ()=>{
                    showStoreData(item.adres);
                    //map.setCenter(marker.n);
                });

                coordmap.marker = marker;
                markers.push(coordmap);
            } else{
                console.log('cant set marker:', item.sj, itme.adres);
            }
        });
    });
}

function showFilteredMarker(filteredData){
    markers.forEach((mk)=>{
        filteredData.forEach((el)=>{
            if(mk.data === el){
                mk.marker.setMap(map);
                for(let id in busanCenter){
                    let coord = busanCenter[id];
                    if(mk.data.region == id){
                        map.setCenter(coord.coords);
                        map.setLevel(8);
                        break;
                    }
                }
            }
        });
    });
}

function showFilteredData(filteredData){
    const dcontainer = document.getElementById('data-container');
    dcontainer.innerHTML = '';
    filteredData.forEach((element)=>{
        const card = createDC(element);
        dcontainer.appendChild(card);
    });
    showFilteredMarker(filteredData);
}

//filter handler
const dongData = {
    "중구": ["광복동", "남포동", "대창동", "동광동", "보수동", "부평동", "신창동", "영주동", "중앙동", "대청동", "창선동"],
    "동구": ["범일동", "수정동", "좌천동", "초량동"],
    "서구": ["동대신동", "부민동", "서대신동", "아미동", "암남동", "초장동", "충무동", "토성동", "신호동"],
    "영도구": ["남항동", "봉래동", "신선동", "영선동", "청학동", "동삼동"],
    "부산진구": ["개금동", "당감동", "범전동", "범천동", "부암동", "부전동", "양정동", "전포동", "연지동", "초읍동"],
    "동래구": ["낙민동", "명륜동", "복천동", "사직동", "수안동", "안락동", "명장동","온천동"],
    "연제구": ["거제동", "연산동"],
    "금정구": ["구서동", "금사동", "남산동", "부곡동", "서동", "선동", "오륜동", "장전동", "청룡동", "회동동"],
    "북구": ["구포동", "금곡동", "덕천동", "만덕동", "화명동"],
    "사상구": ["감전동", "괘법동", "덕포동", "모라동", "삼락동", "엄궁동", "주례동"],
    "사하구": ["감천동", "괴정동", "구평동", "다대동", "당리동", "신평동", "장림동", "하단동"],
    "강서구": ["대저동", "명지동", "녹산동", "가락동", "범방동", "생곡동", "송정동", "죽림동", "지사동", "천가동", "화전동"],
    "남구": ["감만동", "대연동", "문현동", "용당동", "용호동", "우암동"],
    "해운대구": ["반여동", "반송동", "송정동", "우동", "좌동", "중동"],
    "수영구": ["광안동", "남천동", "망미동", "민락동", "수영동"],
    "기장군": ["기장읍", "장안읍", "정관읍", "일광읍", "철마면"]
};

//let distIdMapping = [];

//DOM handler
function showCateData(value){
    const dcontainer = document.getElementById('data-container');
    dcontainer.innerHTML = '';
    if(value == -1){
        dcontainer.innerHTML = '';
        return;
    }
    if(value === '음식점'){
        originData.forEach((element)=>{
            if(element.cn === '음식점'){
                const card = createDC(element);
                dcontainer.appendChild(card);
            }
        });
    } else {
        originData.forEach((element)=>{
            if(element.cate === value){
                const card = createDC(element);
                dcontainer.appendChild(card);
            }
        });
    }  
}

function showStoreData(value){
    const dcontainer = document.getElementById('data-container');
    dcontainer.innerHTML = '';
    originData.forEach((element)=>{
        if(element.adres === value){
            const card = createDC(element);
            markers.some((mk)=>{
                if(mk.data.adres === value){
                    map.setCenter(mk.marker.n);
                    map.setLevel(4);
                    return true;
                } else {
                    return false;
                }
            });
            dcontainer.appendChild(card);
            return;
        }
    })
}

function createDC(item){
    const card = document.createElement('div');
    card.className = 'card';

    const header = document.createElement('div');
    header.className = 'card-header';
    header.id = `${item.idx}`;
    header.textContent = item.sj;
    card.appendChild(header);

    const body = document.createElement('div');
    body.className = 'card-body';

    const cate = document.createElement('p');
    cate.className = 'category-detail';
    if(item.cn == '음식점'){
        const cn = document.createElement('p');
        cn.className = 'category';
        cn.textContent = '업종: 음식점';
        body.appendChild(cn);
        if(item.cate === '기타양식'){
            cate.textContent = '세부분류: 카페/디저트';
        } else{
            cate.textContent = item.cate? `세부분류: ${item.cate}`: '';
        }
        
        body.appendChild(cate);
    } else{
        cate.textContent = `업종: ${item.cn}`;
        body.appendChild(cate);
    }

    const tel = document.createElement('p');
    tel.className = 'tel';
    tel.textContent = item.tel? `Tel: ${item.tel}` : 'Tel: 없음';
    body.appendChild(tel);

    const adres = document.createElement('p');
    adres.className = 'adress';
    adres.textContent = `${item.adres}`;
    body.appendChild(adres);
    body.appendChild(document.createElement('hr'));
    card.appendChild(body);

    // const img = document.createElement('img');
    // if(item.imgFile1){
    //     img.src = `https://${item.imgFile1}`;
    //     img.alt = item.imgName1;
    //     body.appendChild(img);
    //     card.appendChild(body);
    // } else if(item.imgFile2){
    //     img.src = `https://${item.imgFile2}`;
    //     img.alt = item.imgName2;
    //     body.appendChild(img);
    //     card.appendChild(body);
    // } else{
    //     img.src = 'media/no-image.jpg';
    //     img.alt = 'no image';
    //     body.appendChild(img);
    //     card.appendChild(body);
    // }

    // const footer = document.createElement('div');
    // footer.className = 'card-footer';
    
    // if(item.intrcn != '<p><br></p>' || item.intrcn != ' ' || item.intrcn != '' || item.intrcn != '<p>&nbsp;</p>'){
    //     const intrcn = document.createElement('div');
    //     intrcn.className = 'introduction';
    //     intrcn.innerHTML = item.intrcn;
    //     intrcn.style.overflow = 'auto';
    //     footer.appendChild(document.createElement('hr'));
    //     footer.appendChild(intrcn);
    // }
    
    // card.appendChild(footer);

    return card;
}

function clearMarkers(){
    markers.forEach(mk => mk.marker.setMap(null));
    //cluster.clear();
}


let busanCenter = {
    부산: {
        coords: new kakao.maps.LatLng(35.1798, 129.075)
    },
    강서구: {
        coords: new kakao.maps.LatLng(35.20916389, 128.9829083)
    },
    금정구: {
        coords: new kakao.maps.LatLng(35.24007778, 129.0943194)
    },
    강서구: {
        coords: new kakao.maps.LatLng(35.20916389, 128.9829083)
    },
    남구: {
        coords: new kakao.maps.LatLng(35.13340833, 129.0865)
    },
    동구: {
        coords: new kakao.maps.LatLng(35.13589444, 129.059175)
    },
    동래구: {
        coords: new kakao.maps.LatLng(35.20187222, 129.0858556)
    },
    부산진구: {
        coords: new kakao.maps.LatLng(35.15995278, 129.0553194)
    },
    북구: {
        coords: new kakao.maps.LatLng(35.19418056, 128.992475)
    },
    사상구: {
        coords: new kakao.maps.LatLng(35.14946667, 128.9933333)
    },
    사하구: {
        coords: new kakao.maps.LatLng(35.10142778, 128.9770417)
    },
    서구: {
        coords: new kakao.maps.LatLng(35.09483611, 129.0263778)
    },
    수영구: {
        coords: new kakao.maps.LatLng(35.14246667, 129.115375)
    },
    연제구: {
        coords: new kakao.maps.LatLng(35.17318611, 129.082075)
    },
    영도구: {
        coords: new kakao.maps.LatLng(35.08811667, 129.0701861)
    },
    중구: {
        coords: new kakao.maps.LatLng(35.10321667, 129.0345083)
    },
    해운대구: {
        coords: new kakao.maps.LatLng(35.16001944, 129.1658083)
    },
    기장군: {
        coords: new kakao.maps.LatLng(35.24477541, 129.2222873)
    }
};

//main
$(document).ready(function() {
    fetchData();
    function getFilterValues() {
        const filters = {
            storeSearch: $('#storeSearch').val(),
            region: $('#region').val(),
            district: $('#district').val(),
            category: $('#category').val(),
            foodCategory: $('#foodCategory').val(),
            koreanDetail: $('#koreanDetail').val(),
            park: $('input[name="park"]:checked').val()
        };
        return filters;
    }

    function processFilters() {
        const filters = getFilterValues();
        const filteredData = originData.filter(filterFunction(filters));
        clearMarkers();
        console.log('Filter Values:', filters);
        console.log('filtered data: ', filteredData);
        showFilteredMarker(filteredData);
    }

    function filterFunction(filters){
        return function(el){
            if(filters.storeSearch && !(
                el.sj.includes(filters.storeSearch) ||
                el.cn.includes(filters.storeSearch) ||
                (el.cate != null && el.cate.includes(filters.storeSearch)) ||
                (el.menu != null && el.menu.includes(filters.storeSearch))
            )){
                return false;
            }
            if(filters.region !== '모두' && el.region !== filters.region){
                return false;
            }
            if(filters.district !== '모두'){
                let eldg = el.locale.substring(0,2);
                let exp = /\d/;
                if(eldg[1] == '동'){
                    eldg = eldg.substring(0,1);
                } else if(exp.test(eldg)){
                    eldg = eldg[0];
                }
                if(!filters.district.includes(eldg)){
                    return false;
                }   
            }
            if(filters.category !== '모두' && el.cn !== filters.category){
                return false;
            }
            if(filters.foodCategory !== '모두' && (filters.category === '음식점' && el.cate !== filters.foodCategory)){
                return false;
            }
            if(filters.koreanDetail !== '모두' && (filters.foodCategory === '한식' && el.cate !== filters.koreanDetail)){
                return false;
            }
            if(filters.park !== '모두' && el.parkngAt !== filters.park){
                return false;
            }
            return true;
        };
    }

    $('select').change(function() {
        processFilters();
    });

    // 모든 radio 버튼의 change 이벤트에 리스너 추가
    $('input[name="park"]').change(function() {
        processFilters();
    });

    $('#searchbtn').click(function() {
        processFilters();
    });

    $('#region').change(function(){
        $("#district").children('option:not(:first)').remove();
        for(let id in dongData){
            let dong = dongData[id];
            if($(this).val() === id){
                dong.forEach((dg)=>{
                    $("#district").append(`<option value=${dg}>${dg}</option>`);
                });
                break;
            }
        }
    });

    $('#category').change(function(){
        if ($(this).val() != '음식점' && $(this).val() != '모두') {
            $('#foodCategory').val('모두').attr('selected', 'selected');
            $('#fcategory').hide(); 
            processFilters();
        } else{
            $('#fcategory').show(); 
            processFilters();
        }
    });

    $('#foodCategory').change(function(){
        if ($(this).val() != '한식' && $(this).val() != '모두') {
            $('#koreanDetail').val('모두').attr('selected', 'selected');
            $('#kdetail').hide(); 
            processFilters();
        } else{
            $('#kdetail').show(); 
            processFilters();
        }
    });
});

//initialization
async function fetchData(){
    fetch(apiUrl)
    .then((response) => {
        return response.json();
    })
    .then((data) => {
        tmpData = data.getGoodPriceStore.body.items.item;
        // 데이터 정상화
        tmpData.forEach((item)=>{
            if(item.sj === '참숯마을'){
                item.adres = '부산 연제구 월드컵대로111번길 6-8';
            }
            if(item.sj === '아침N김밥'){
                item.adres = '부산 동구 부산진성공원로 23-3';
            }
            if(item.sj === '장미돼지국밥'){
                item.adres = '부산 사하구 오작로8번안길 7';
            }
            if(item.sj === '양푼이동태백반'){
                item.adres = '부산 동구 부산진성공원로 1-6';
            }
            if(item.sj === '신가네밀면'){
                item.adres = '부산 기장군 정관읍 구연1로 5';
            }
            if(item.sj === '강촌손칼국수'){
                item.adres = '부산 사상구 백양대로 916';
            }
            if(item.sj === '부성식당'){
                item.adres = '부산 동구 부산진성공원로 17-2';
            }
            if(item.sj === '명가'){
                item.adres = '부산 동구 부산진성공원로 23-9';
            }
            if(item.sj === '초량영동밀면'){
                item.adres = '부산 동구 중앙대로209번길 12';
            }
            if(item.sj === '짬뽕땡기는날'){
                item.adres = '부산 강서구 명지오션시티10로 16 영어도시 퀸덤1차 상가동 241가호';
            }
            if(item.sj === '서민세탁소'){
                item.cn = '기타서비스업';
            }
            if(item.sj === '자매미용실'){
                item.cn = '이미용업';
            }
            if(item.sj === '도리오헤어'){
                item.cn = '이미용업';
            }
            if(item.sj === '온타임'){
                item.cn = '음식점';
            }
            if(item.sj === '카페두콩'){
                item.cn = '음식점';
            }
            if(item.sj === '영선꼼장어,바다장어'){
                item.sj = '영선꼼장어 바다장어';
            }
        });
        originCsv.forEach((el) => {
            tmpData.forEach((item) => {
                if(item.sj === el.sj){
                    if(item.cn === '음식점'){
                        item.cate = el.cate;
                        item.menu = el.menu;
                        item.pric = el.pric;
                    } else if(item.cn === '이미용'){
                        item.cn = el.cate;
                        item.menu = el.menu;
                        item.pric = el.pric;
                    } else if(item.cn === '목욕'){
                        item.cn = el.cate;
                        item.menu = el.menu;
                        item.pric = el.pric;
                    } else if(item.cn === '기타'){
                        item.cn = el.cate;
                        item.menu = el.menu;
                        item.pric = el.pric;
                    } else{
                        item.cn = el.cate;
                        item.menu = el.menu;
                        item.pric = el.pric;
                    }
                }
            });
        });
        originData = tmpData;
        originData.forEach((el)=>{
            for(let id in dongData){
                let dong = dongData[id];
                dong.some((dg)=>{
                    let eldg = el.locale.substring(0,2);
                    let exp = /\d/;
                    if(eldg[1] == '동'){
                        eldg = eldg.substring(0,1);
                    } else if(exp.test(eldg)){
                        eldg = eldg[0];
                    }
                    if(dg.includes(eldg)){
                        el.region = id;
                        return true;
                    }
                });
            }
        });
        console.log('data init complete');
    })
    .then(()=>{
        setMarker();
        console.log('marker init complete');
    })
    .catch((error) =>{console.log('Error:', error)});
}

