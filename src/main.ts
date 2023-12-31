import { EikyuDate } from "./clockmain.js";
import { getAstroDay, getPlaEcl, getEclOrb } from "./astroMain.js";

const orbData = getEclOrb()

const scale = window.devicePixelRatio;
const canvasSize = 1000
let viewRange = 100

const c: HTMLCanvasElement = <HTMLCanvasElement> document.getElementById("simCanvas");
c!.height = Math.floor(canvasSize * scale)
c!.width = Math.floor(canvasSize * scale)

const speedSlider: HTMLInputElement = <HTMLInputElement> document.getElementById("speed")
const zoomSlider: HTMLInputElement = <HTMLInputElement> document.getElementById("zoom")
const phunCheck: HTMLInputElement = <HTMLInputElement> document.getElementById("phun")
const reverseCheck: HTMLInputElement = <HTMLInputElement> document.getElementById("reverse")

const ctx = c.getContext("2d")

ctx!.scale(scale, scale);

const now = EikyuDate.now().toEikyuFormat()
let astroDay = getAstroDay(now.yea, now.sea, now.poi, now.day)

window.onload = () => {
    setInterval(drawFrame, 30)
}

const drawFrame = () => {
    const plaPos = getPlaEcl(astroDay)

    ctx!.clearRect(0, 0, canvasSize, canvasSize);

    orbData.forEach(o => {
        drawOrbit(o)
    })

    plaPos.forEach((p) => {
        const viewName = phunCheck.checked? p[4]: p[3]
        drawAstro(p[0], p[1], p[5], viewName)
    })
    drawAstro(0, 0, "#000000", phunCheck.checked? "日天": "灼陽")

    drawDate()

    const timeDirection = reverseCheck.checked? -1: 1
    viewRange = 10 ** (2.1 - Number(zoomSlider.value))
    astroDay += (10 ** Number(speedSlider.value) - 1) * timeDirection
}

function drawAstro(eclX: number, eclY: number, color: string, name: string) {
    const [x, y] = mapPosition(eclX, eclY)

    ctx!.beginPath()

    ctx!.arc(x, y, 3, 0, 360 * Math.PI / 180, false)

    ctx!.fillStyle = color
    ctx!.fill()

    ctx!.fillStyle = "#000000"
    ctx!.font = phunCheck.checked? "15px PhunWrite": "15px sans-serif";
    ctx!.textBaseline = "bottom"
    ctx!.fillText(name, x + 3, y - 3);
}

function drawOrbit(positions: number[][]) {
    ctx!.beginPath()

    ctx!.lineWidth = 1
    ctx!.strokeStyle = "#cccccc"
    
    const [x, y] = mapPosition(positions[0][0], positions[0][1])
    ctx!.moveTo(x, y)

    positions.slice(1).forEach(c => {
        const [x, y] = mapPosition(c[0], c[1])

        ctx!.lineTo(x, y)
    })

    ctx!.closePath()

    ctx!.stroke();
}

function drawDate() {
    ctx!.fillStyle = "#000000"
    ctx!.textBaseline = "top"

    const [eikyuDay, earthDay] = toDateText(astroDay)

    ctx!.font = phunCheck.checked? "20px PhunWrite": "20px sans-serif";
    ctx!.fillText(eikyuDay, 10, 10);

    ctx!.font = "20px sans-serif";
    ctx!.fillText(earthDay, 10, 35);
}

function mapPosition(eclX: number, eclY: number) {
    const x = (eclX / viewRange * canvasSize) + (canvasSize / 2)
    const y = (-eclY / viewRange * canvasSize) + (canvasSize / 2)
    return [x, y]
}

function toDateText(astro: number) {
    const miliDifference = 124416000 * astro //astroをミリ秒化

    const pivot = new EikyuDate("split", 2016, 1, 1, 1).date
    const nowMili = new EikyuDate("total", pivot + miliDifference)

    const earth = new Date(EikyuDate.toEarth(nowMili.date))

    const [year, month, day] = [earth.getUTCFullYear(), earth.getUTCMonth() + 1, earth.getUTCDate()]

    if (phunCheck.checked) {
        const e = nowMili.getPhunNumFormat()
        return [`${e.yea}年${e.sea}季${e.poi}旬${e.day}日`, `${year}年${month}月${day}日`]
    } else {
        const e = nowMili.toEikyuFormat()
        return [`${e.yea}/${e.sea}/${e.poi}/${e.day}`, `${year}/${month}/${day}`]
    }
}