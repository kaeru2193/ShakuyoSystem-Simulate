import { FunNumber } from './funnumber.js';
function mod(a, b) {
    return a * b < 0 ? a % b + b : a % b;
}
export class EikyuDate {
    constructor(inputType, valueOrYear, season = 1, point = 1, day = 1, hour = 0, period = 0, minute = 0, second = 0, milisecond = 0) {
        this.date = Date.now();
        if (inputType == "total") {
            this.date = valueOrYear;
        }
        else if (inputType == "split") {
            this.date = this.toMiliseconds(valueOrYear, season, point, day, hour, period, minute, second, milisecond);
        }
    }
    toMiliseconds(yea, sea = 1, poi = 1, day = 1, hou = 0, per = 0, min = 0, sec = 0, mil = 0) {
        const difYear = yea;
        const plainDays = difYear * 539;
        const leapDays = Math.floor((yea - 1) / 40) + 1;
        const greatLeapDays = Math.floor((yea - 1) / 400) + 1;
        const dayOfYear = plainDays + leapDays + greatLeapDays;
        const dayOfSeason = (sea - 1) * 60;
        const dayOfPoint = (poi - 1) * 12;
        const dayOfDay = day - 1;
        const dayOfAll = dayOfYear + dayOfSeason + dayOfPoint + dayOfDay;
        const allMiliSecond = dayOfAll * 124416000 + hou * 10368000 + per * 864000 + min * 72000 + sec * 1000 + mil; //すべて
        return allMiliSecond;
    }
    static toEikyu(earthDate) {
        const pivot = Date.UTC(2023, 0, 1); //2288985998207
        const difference = earthDate - pivot;
        const eikyuDif = difference / 0.6966869212962963;
        const eikyuNow = 137614795776000 + 2288985998207 + eikyuDif; // 0/1/1/1～2052/1/1/1 + 2052/1/1/1～基準点
        return eikyuNow;
    }
    static toEarth(eikyuDate) {
        const pivot = Date.UTC(2023, 0, 1);
        const eikyuRaw = eikyuDate - 2288985998207 - 137614795776000; //全部引く
        const earthDif = eikyuRaw * 0.6966869212962963;
        const earthNow = pivot + earthDif;
        return earthNow;
    }
    toEikyuFormat() {
        const eikyuNow = this.date;
        const funweeklist = ["天", "火", "気", "木", "水", "土"];
        const eikyuPointSec = mod(eikyuNow / 1000, 72);
        const eikyuSec = Math.floor(mod(eikyuNow / 1000, 72));
        const eikyuMin = Math.floor(mod(eikyuNow / 1000 / 72, 12));
        const eikyuPer = Math.floor(mod(eikyuNow / 1000 / 72 / 12, 12));
        const eikyuHou = Math.floor(mod(eikyuNow / 1000 / 72 / 12 / 12, 12));
        const differenceDay = eikyuNow / 1000 / 72 / 12 / 12 / 12;
        const eikyuFWeek = funweeklist[Math.floor(differenceDay - 1) % 6];
        const eikyuFWeekNum = Math.floor(differenceDay - 1) % 6;
        const fixedDays = differenceDay - 541; //0年は閏年のため1/1/1/1始まりへ補正
        const Period400 = 215611; //400年周期の日数
        const Period40 = 21561; //40年周期の日数
        const Period1 = 539; //1年の日数
        const numOfPeriod400 = Math.floor(fixedDays / Period400); //n回目の400周期
        const dayIn400 = fixedDays - numOfPeriod400 * Period400; //400周期内での日数
        let numOfPeriod40 = Math.floor(dayIn400 / Period40); //n回目の40周期
        if (numOfPeriod40 >= 10) {
            numOfPeriod40 = 9;
        } //大閏年の最後の日を前の年へ
        const dayIn40 = dayIn400 - numOfPeriod40 * Period40; //40周期内での日数
        let numOfPeriod1 = Math.floor(dayIn40 / Period1); //周期内n年目
        if (numOfPeriod1 >= 40) {
            numOfPeriod1 = 39;
        } //閏年の最後の日を前の年へ
        const dayIn1 = dayIn40 - numOfPeriod1 * Period1; //年内日数
        const eikyuYea = numOfPeriod400 * 400 + numOfPeriod40 * 40 + numOfPeriod1 * 1 + 1; //周期を合計&補正分を加算
        const eikyuLetYea = eikyuYea - 843;
        let eikyuSea = Math.floor(dayIn1 / 60) + 1;
        let eikyuPoi = Math.floor(mod(dayIn1, 60) / 12) + 1;
        let eikyuDay = Math.floor(mod(mod(dayIn1, 60), 12)) + 1;
        if (dayIn1 >= 540) { //大閏年
            eikyuSea = 9;
            eikyuPoi = 5;
            eikyuDay = 13;
        }
        const dateObj = {
            psec: eikyuPointSec,
            sec: eikyuSec,
            min: eikyuMin,
            per: eikyuPer,
            hou: eikyuHou,
            day: eikyuDay,
            poi: eikyuPoi,
            sea: eikyuSea,
            yea: eikyuYea,
            lyea: eikyuLetYea
        };
        return dateObj;
    }
    getFormatted() {
        const obj = this.toEikyuFormat();
        return `${obj.yea}/${obj.sea}/${obj.poi}/${obj.day} ${obj.hou}:${obj.per}:${obj.min}:${obj.sec}`;
    }
    getFormattedHTML() {
        const obj = this.toEikyuFormat();
        return `${obj.yea}/${obj.sea}/${obj.poi}/${obj.day}<br>${obj.hou}:${obj.per}:${obj.min}:${obj.sec}`;
    }
    static now(now = Date.now()) {
        return new EikyuDate("total", EikyuDate.toEikyu(now));
    }
    timezone(hour) {
        return new EikyuDate("total", this.date + 10368000 * hour);
    }
    getPhunNumFormat() {
        const funNumber = new FunNumber();
        const eikyuObj = this.toEikyuFormat();
        const obj = {
            sec: funNumber.toPhunCalcNum(eikyuObj.sec),
            min: funNumber.toPhunCalcNum(eikyuObj.min),
            per: funNumber.toPhunCalcNum(eikyuObj.per),
            hou: funNumber.toPhunCalcNum(eikyuObj.hou),
            day: funNumber.toPhunCalcNum(eikyuObj.day),
            poi: funNumber.toPhunCalcNum(eikyuObj.poi),
            sea: funNumber.toPhunCalcNum(eikyuObj.sea),
            yea: funNumber.toPhunCalcNum(eikyuObj.yea),
        };
        return obj;
    }
    getPhunBase12() {
        const funNumber = new FunNumber();
        const eikyuObj = this.toEikyuFormat();
        const obj = {
            sec: funNumber.toPhunCalcNum(eikyuObj.sec),
            min: funNumber.toPhunCalcNum(eikyuObj.min),
            per: funNumber.toPhunCalcNum(eikyuObj.per),
            hou: funNumber.toPhunCalcNum(eikyuObj.hou),
            day: funNumber.toPhunCalcNum(eikyuObj.day),
            poi: funNumber.toPhunCalcNum(eikyuObj.poi),
            sea: funNumber.toPhunCalcNum(eikyuObj.sea),
            yea: funNumber.toPhunCalcNum(eikyuObj.yea),
        };
        return `${obj.yea}年${obj.sea}気${obj.poi}周${obj.day}日 ${obj.hou}時${obj.per}刻${obj.min}分${obj.sec}秒`;
    }
    getPhunHTMLBase12() {
        const funNumber = new FunNumber();
        const eikyuObj = this.toEikyuFormat();
        const obj = {
            sec: funNumber.toPhunCalcNum(eikyuObj.sec),
            min: funNumber.toPhunCalcNum(eikyuObj.min),
            per: funNumber.toPhunCalcNum(eikyuObj.per),
            hou: funNumber.toPhunCalcNum(eikyuObj.hou),
            day: funNumber.toPhunCalcNum(eikyuObj.day),
            poi: funNumber.toPhunCalcNum(eikyuObj.poi),
            sea: funNumber.toPhunCalcNum(eikyuObj.sea),
            yea: funNumber.toPhunCalcNum(eikyuObj.yea),
        };
        return `${obj.yea}年${obj.sea}気${obj.poi}周${obj.day}日<br>${obj.hou}時${obj.per}刻${obj.min}分${obj.sec}秒`;
    }
}
