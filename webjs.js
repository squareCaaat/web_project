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
    map.setCenter(new kakao.maps.LatLng(35.18003483348194, 129.07493819187425));
}

//openAPI implementaion
const apiUrl = 'https://apis.data.go.kr/6260000/GoodPriceStoreService/getGoodPriceStore?serviceKey=wMPj3KtrAGElpdH4MKeC0CHjJg%2FNKvHPXd9Anmj6rjL%2Fl43xbSEbEoGGTQJOdEj6yR3XhclIs3OZtav0Lyq2Jg%3D%3D&pageNo=1&numOfRows=650&resultType=json';
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

//settimeout


//marker handler
let markers = [];
async function setMarker(){
    //marker initialization
    originData.forEach((item)=>{
        var coordmap = {};
        var tmpadres = item.adres;
        if(item.adres.indexOf('부산') == -1){
            // item.adres = '부산 ' + item.adres;
            tmpadres = '부산 ' + item.adres;
        }
        coordmap.sj = item.sj; 
        geocoder.addressSearch(tmpadres, function(result, status) {
            // 정상적으로 검색이 완료됐으면 
            if (status === kakao.maps.services.Status.OK) {
                var coords = new kakao.maps.LatLng(result[0].y, result[0].x);
                
                // 결과값으로 받은 위치를 마커 객체에 저장
                var marker = new kakao.maps.Marker({
                    position: coords
                });

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
                
                kakao.maps.event.addListener(marker, 'click', ()=>{showStoreData(item.adres)});

                coordmap.marker = marker;
                markers.push(coordmap);
            } else{
                console.log(item.sj);
            }
        });
    });
}

function showAllMarker(){
    markers.forEach((el)=>{
        el.marker.setMap(map);
    });
}

//filter handler
let filterData = [];

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
        cate.textContent = `업종: ${item.cate}`;
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

function categoryHandler(value){
    const divFood = document.getElementById('fcategory');
    const selFood = document.getElementById('food-category');
    if(value != '음식점'){
        divFood.style.display = 'none';
        selFood.options[0].selected = true;
    }
    if(value == '음식점'){
        divFood.style.display = 'block';
        showCateData(value);
    } else if(value == '숙박업'){
        showCateData(value);
    } else if(value == '목욕업'){
        showCateData(value);
    } else if(value == '세탁업'){
        showCateData(value);
    } else if(value == '이미용업'){
        showCateData(value);
    } else if(value == '기타서비스업'){
        showCateData(value);
    } else {
        showCateData(-1);
    }
}

function foodHandler(value){
    const kfood = document.getElementById('kdetail');
    const selkFood = document.getElementById('korean-detail');
    if(value != '한식'){
        kfood.style.display = 'none';
        selkFood.options[0].selected = true;
    }
    if(value == '한식'){
        kfood.style.display = 'block';
    }
}


//initialization
fetch(apiUrl)
.then((response) => {
    return response.json();
})
.then((data) => {
    
    tmpData = data.getGoodPriceStore.body.items.item;
        originCsv.forEach((element) => {
            tmpData.forEach((tmpe) => {
                if(element.sj === tmpe.sj){
                    tmpe.cate = element.cate;
                    tmpe.menu = element.menu;
                    tmpe.pric = element.pric;
                }
            })
        });
        originData = tmpData;
        console.log('data init complete');
})
.then(()=>{
    setMarker();
    console.log('marker init complete');
})
.catch((error) =>{console.log('Error:', error)});

