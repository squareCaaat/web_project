function jsonToMap(json){
    const map = new Map();
    for(const key in json){
        if(json.hasOwnProperty(key)){
            map.set(key, json[key]);
        }
    }
    return map;
}

// 특정 필드만 추출하여 Map 객체로 변환하는 함수
function extractFieldsToMap(data, keys) {
    const map = new Map();
    data.forEach(item => {
        const subMap = new Map();
        keys.forEach(key => {
            if (item.hasOwnProperty(key)) {
                subMap.set(key, item[key]);
            }
        });
        map.set(item.idx, subMap); // 예시로 idx를 키로 사용
    });
    return map;
}

const url = 'https://apis.data.go.kr/6260000/GoodPriceStoreService/getGoodPriceStore?serviceKey=wMPj3KtrAGElpdH4MKeC0CHjJg%2FNKvHPXd9Anmj6rjL%2Fl43xbSEbEoGGTQJOdEj6yR3XhclIs3OZtav0Lyq2Jg%3D%3D&pageNo=1&numOfRows=50&resultType=json';
var dataPane = document.getElementById('sample_data');

fetch(url)
.then(response => response.json())
.then(data => {
    const item = data.getGoodPriceStore.body.items.item;
    const keysToExtract = ['parkngAt', 'bsnTime', 'idx', 'sj', 'mNm', 'adres', 'tel', 'cnCd', 'cn', 'localeCd', 'locale'];
    const dataMap = extractFieldsToMap(data, keysToExtract);

    dataMap.forEach((value, key) => {
        console.log(`ID: ${key}`);
        value.forEach((subValue, subKey) => {
            console.log(` ${subKey}: ${subValue}`);
        })
    })
})
.catch(error => console.error('Error:', error));
/*.then(resJson => {
    dataPane.innerText = JSON.stringify(resJson, null, 1);
})*/