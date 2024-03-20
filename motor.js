export function isColision(f1, f2, onlyRadio) {
  
    // Calcular la distancia entre los centros de los círculos
    const distancia = Math.hypot(f1.x - f2.x, f1.y - f2.y);

    const distancia1 = Math.abs(distancia-(f1[onlyRadio ? "radio" : "colision"]/2))-(f2[onlyRadio ? "radio" : "colision"]/2);

    return distancia1 < 0.34;
}

export function getPosiciones (f1, f2, distanciaX, distanciaY, multiFicha){

    let pendiente = Math.abs(Math.abs(f1.y-f2.y)/Math.abs(f1.x-f2.x));

    const xMax = f1.x > f2.x ? true : false;
    const yMax = f1.y > f2.y ? true : false;
    
    const resultFichas = {
        f1:{
            ...f1,
            x: multiFicha ? f2.x : xMax ? f1.x-distanciaX : f1.x+distanciaX,
            y: multiFicha ? f2.y : yMax ? f1.y-distanciaY : f1.y+distanciaY
        }
    };

    resultFichas.f2 = {...f2, x:resultFichas.f1.x, y:resultFichas.f1.y};

    function buscandoNoColision(){
        const _f1 = {...resultFichas.f1};
        const _f2 = {...resultFichas.f2};

        let pixel = 0.01;
        let pPendiente = 1*pendiente/100;    

        resultFichas.f1.x = f1.x > f2.x ? _f1.x+pixel : f1.x == f2.x ? _f1.x : _f1.x-pixel;
        resultFichas.f1.y = f1.y > f2.y ? _f1.y+(pPendiente == Infinity ? 1 : pPendiente) : f1.y == f2.y ? _f1.y : _f1.y-(pPendiente == Infinity ? 1 : pPendiente);

        if (!multiFicha) {
            resultFichas.f2.x = f2.x > f1.x ? _f2.x+pixel : f2.x == f1.x ? _f2.x : _f2.x-pixel;
            resultFichas.f2.y = f2.y > f1.y ? _f2.y+(pPendiente == Infinity ? 1 : pPendiente) : f2.y == f1.y ? _f2.y : _f2.y-(pPendiente == Infinity ? 1 : pPendiente);
        }

        isColision(resultFichas.f1, resultFichas.f2, true) ? buscandoNoColision() : true;
    }
    buscandoNoColision();

    return resultFichas;
}