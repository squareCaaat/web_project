function jsonToMap(json){
    const map = new Map();
    for(const key in json){
        if(json.hasOwnProperty(key)){
            map.set(key, json[key]);
        }
    }
    return map;
}

function extractFieldsToMap(json, keys){
    const map = new Map();
    keys.forEach(keys => {
        if(json.hasOwnProperty(key)){
            map.set(key)
        }
    });
    return map;
}

const url = 'https://apis.data.go.kr/6260000/GoodPriceStoreService/getGoodPriceStore?serviceKey=wMPj3KtrAGElpdH4MKeC0CHjJg%2FNKvHPXd9Anmj6rjL%2Fl43xbSEbEoGGTQJOdEj6yR3XhclIs3OZtav0Lyq2Jg%3D%3D&pageNo=1&numOfRows=50&resultType=json';
var dataPane = document.getElementById('sample_data');

fetch(url)
.then(response => response.json())
.then(data => {
    const keysToExtract = ['parkngAt', 'bsnTime', 'idx', 'sj', 'mNm', 'adres', 'tel', 'cnCd', 'cn', 'localeCd', 'locale'];
    const dataMap = jsonToMap(data, keysToExtract);
    console.log(dataMap);

    dataMap.forEach((value, key) => {
        console.log('${key}: ${value}');
    })
})
.catch(error => console.error('Error:', error));
/*.then(resJson => {
    dataPane.innerText = JSON.stringify(resJson, null, 1);
})*/