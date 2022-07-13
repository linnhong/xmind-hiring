export default function formatTime(date) {
    const  month = date.getMonth() + 1, day = date.getDate(),
        time = date.getFullYear() + "-" + (month < 10 ? "0" + month : month) + "-" + (day < 10 ? "0" + day : day) + " " + (date.getHours() || "00") + ":"
            + (date.getMinutes() || "00") + ":" + (date.getSeconds() || "00");
    return { time, month: month + "月" }
}