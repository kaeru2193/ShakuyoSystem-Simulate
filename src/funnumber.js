export class FunNumber {
    toOldFunNumber(input) {
        const oneNumbers = ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九"];
        const orderNumbers = ["", "十", "百", "千", "万"];
        const stringed = String(input);
        let output = "";
        for (let i = 0; i < stringed.length; i++) {
            const order = stringed.length - i - 1;
            if (Number(stringed[i]) != 0) {
                if (stringed.length < 5 && stringed.length > 1 && Number(stringed[i]) == 1 && order + 1 == stringed.length) {
                    output += orderNumbers[order];
                }
                else {
                    output += oneNumbers[Number(stringed[i])] + orderNumbers[order];
                }
            }
        }
        if (input == 0) {
            return "零";
        }
        return output;
    }
    toFunNumber(input) {
        const numbers = ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九"];
        return input.toString(10).split("").map(n => numbers[Number(n)]).join("");
    }
    toFunNumberbase12(input) {
        const numbers = ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九", "甲", "乙"];
        return input.toString(12).split("").map(n => numbers[parseInt(n, 12)]).join("");
    }
    toPhunCalcNum(input) {
        const PhunNum = {
            "0": "〇",
            "1": "〡",
            "2": "〢",
            "3": "〣",
            "4": "〤",
            "5": "〥",
            "6": "〦",
            "7": "〧",
            "8": "〨",
            "9": "〩",
            "a": "〹",
            "b": "〺",
            ".": "・",
        };
        return input.toString(12).split("").map(n => { return PhunNum[n]; }).join("");
    }
}
