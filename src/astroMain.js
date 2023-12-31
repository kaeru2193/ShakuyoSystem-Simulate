const pivotAstro = getAstroDay(2085, 6, 1, 6);
import { planets } from "./planets.js";
export function getPlaEcl(astroDay) {
    let data = [];
    let days = astroDay - pivotAstro;
    planets.forEach(p => {
        data.push(calcEclPos(p, days));
    });
    return data;
}
export function getAstroDay(year, season, point, day) {
    return Math.floor(539.025 * year) + Math.floor(year / 400) + (60 * season) + (12 * point) + day - 1086752; //元期：2016/1/1/1
}
export function getEclOrb() {
    let data = [];
    const orbRes = 1000;
    planets.forEach(p => {
        const partDay = p.pers * (86400 / 86679) / orbRes;
        const orbit = new Array(orbRes).fill(0).map((a, idx) => {
            return calcEclPos(p, partDay * idx);
        });
        data.push(orbit);
    });
    return data;
}
function calcEquPos(pla, days) {
    let planetEcl;
    if (pla < 0) {
        planetEcl = [0, 0, 0]; //灼陽を指定
    }
    else {
        const planet = planets[pla];
        planetEcl = calcEclPos(planet, days);
    }
    const eikyu = planets[2];
    const eikyuEcl = calcEclPos(eikyu, days);
    const [xGeoEcl, yGeoEcl, zGeoEcl] = planetEcl.map((e, idx) => e - eikyuEcl[idx]);
    const rObl = 23.2649 * (Math.PI / 180); //自転軸傾斜 (ラジアン)
    const xEqu = xGeoEcl;
    const yEqu = Math.cos(rObl) * yGeoEcl - Math.sin(rObl) * zGeoEcl;
    const zEqu = Math.sin(rObl) * yGeoEcl + Math.cos(rObl) * zGeoEcl;
    const alpha = Math.atan(yEqu / xEqu) * (180 / Math.PI); //赤経
    const delta = Math.atan(zEqu / Math.sqrt(Math.pow(xEqu, 2) + Math.pow(yEqu, 2))) * (180 / Math.PI); //赤緯
    const dist = Math.sqrt(Math.pow(xEqu, 2) + Math.pow(yEqu, 2) + Math.pow(zEqu, 2)); //距離
    let fixAlpha;
    if (xEqu < 0) {
        fixAlpha = alpha + 180;
    }
    else if (yEqu < 0) {
        fixAlpha = alpha + 360;
    }
    else {
        fixAlpha = alpha;
    }
    return {
        alpha: fixAlpha,
        delta: delta,
        dist: dist
    };
}
function calcEclPos(planet, days) {
    const [ax, ec, inc, ml, lp, la, per] = [planet.axs, planet.ecs, planet.incs, planet.mls, planet.lps, planet.las, planet.pers];
    const earthDays = days * (86679 / 86400); //地球日へ変換
    const ma = fixRange((360 / per) * earthDays + ml - lp); //平均近点角
    const [ea, rEa] = solveKepler(ma, ec);
    const xOrb = ax * (Math.cos(rEa) - ec);
    const yOrb = ax * Math.sqrt(1 - Math.pow(ec, 2)) * Math.sin(rEa);
    const ap = lp - la;
    const [rInc, rLa, rAp] = [inc, la, ap].map(a => a * (Math.PI / 180));
    const xEcl = (Math.cos(rAp) * Math.cos(rLa) - Math.sin(rAp) * Math.sin(rLa) * Math.cos(rInc)) * xOrb +
        (-Math.sin(rAp) * Math.cos(rLa) - Math.cos(rAp) * Math.sin(rLa) * Math.cos(rInc)) * yOrb;
    const yEcl = (Math.cos(rAp) * Math.sin(rLa) + Math.sin(rAp) * Math.cos(rLa) * Math.cos(rInc)) * xOrb +
        (-Math.sin(rAp) * Math.sin(rLa) + Math.cos(rAp) * Math.cos(rLa) * Math.cos(rInc)) * yOrb;
    const zEcl = (Math.sin(rAp) * Math.sin(rInc)) * xOrb +
        (Math.cos(rAp) * Math.sin(rInc)) * yOrb;
    return [xEcl, yEcl, zEcl, planet.name, planet.pname, planet.color];
}
function fixRange(num, max = 360) {
    return num + max * -Math.floor(num / max);
}
function solveKepler(ma, ec) {
    const rMa = ma * (Math.PI / 180); //ラジアン変換
    const dEc = ec * (180 / Math.PI); //離心率 (度)
    let ea = ma - dEc * Math.sin(rMa);
    const tol = 1e-8;
    let loop = 0;
    while (true) {
        const rEa = ea * (Math.PI / 180); //ラジアン変換
        const delMa = ma - (ea - dEc * Math.sin(rEa));
        const delEa = delMa / (1 - ec * Math.cos(rEa));
        ea = ea + delEa;
        if (Math.abs(delEa) < tol) {
            return [ea, rEa];
        }
        loop++;
    }
}
