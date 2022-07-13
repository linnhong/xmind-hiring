import axios from "axios"
export default function readCsv(url) {
    let result = new Promise((resolve, reject) => {
        //通过axios基于url读取本地的csv文件
        axios
            .get(url)
            .then((res) => {
                resolve(csvJSON(res.request.responseText));
            })
            .catch((err) => {
                reject(err);
            });

    })
    return result;
}
//将csv字符串序列化为数组
function csvJSON(csv) {
    //先将csv字符串分割为多行
    const lines = csv.split("\n"), result = [], headers = lines[0].split(",");
    for (const i of lines) {
        const obj = {}, currentline = i.split(",");
        //将每一行的数据基于第一行的属性构建对象
        for (let j = 0; j < headers.length; j++) {
            obj[headers[j]] = currentline[j];
        }
        //将构建完毕的对象加入结果数组中
        result.push(obj);
    }
    return result;
}
