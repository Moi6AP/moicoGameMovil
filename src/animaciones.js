export const controllerAnimaciones  = {};

export function animarTableroHorizontal (tableroRef, msProp, cantidadMover){
    const ms = msProp || 130;
    const porcMax = 40;
    const porcMin = 60;
    const w = cantidadMover;

    const idAnim = Object.keys(controllerAnimaciones).length;
    controllerAnimaciones[idAnim] = true;
    
    async function anim () {
        await animarElement({left:0}, {left:-w}, tableroRef, ms, idAnim);
        await animarElement({left:-w}, {left:-(w+w*porcMax/100)}, tableroRef, (porcMax*ms/100)-10, idAnim);
        await animarElement({left:-(w+w*porcMax/100)}, {left:-(w+w*porcMin/100)}, tableroRef, (porcMin*ms/100)-5, idAnim);
        await animarElement({left:-(w+w*porcMin/100)}, {left:-(w+w*porcMax/100)}, tableroRef,  (porcMin*ms/100)-5, idAnim);
        await animarElement({left:-(w+w*porcMax/100)}, {left:-(w)}, tableroRef, (porcMax*ms/100)-10, idAnim);
        
        await animarElement({left:-(w)}, {left:w}, tableroRef, ms*2, idAnim);

        await animarElement({left:w}, {left:w+(w*porcMax/100)}, tableroRef, (porcMax*ms/100)-10, idAnim);
        await animarElement({left:w+(w*porcMax/100)}, {left:w+(w*porcMin/100)}, tableroRef, (porcMin*ms/100)-5, idAnim);
        await animarElement({left:w+(w*porcMin/100)}, {left:w+(w*porcMax/100)}, tableroRef, (porcMin*ms/100)-5, idAnim);
        await animarElement({left:w+(w*porcMax/100)}, {left:w}, tableroRef, (porcMax*ms/100)-10, idAnim);
        await animarElement({left:w}, {left:0}, tableroRef, ms, idAnim);

        // REPETIR ANIMACION SI NO SE HA CANCELADO LA ANIMACION
        controllerAnimaciones[idAnim] && anim();
    }
    anim();

    return idAnim;
}

export async function animarElement (oldE, newE, elementRef, msProp, idAnim){
    let ms = msProp || 300;
    const fps = 45;
    let porcentaje = 0;
    const StylePropiedadesParaAnimar = Object.keys(oldE);
    const timeouts = [];
    
    if (controllerAnimaciones[idAnim]) {
        await new Promise (complete => {
            for (let i = 1; i <= fps; i++) {
              const currentMS = ms/fps*i;
              timeouts.push(setTimeout(()=>anim(currentMS), currentMS));
            }
            timeouts.push(setTimeout(complete, ms));
        });
    }
  
    function anim (currentMS){
        if (controllerAnimaciones[idAnim]) {
            porcentaje = currentMS/ms*100;

            const newStylePropiedadesModificadas = {};
            StylePropiedadesParaAnimar.map((nameStylePropiedad)=>{
                const propiedadValor = oldE[nameStylePropiedad];
                let distancia = Math.abs(propiedadValor-newE[nameStylePropiedad]);
                
                newStylePropiedadesModificadas[nameStylePropiedad] = propiedadValor > newE[nameStylePropiedad] ? propiedadValor-(porcentaje*distancia/100) : propiedadValor+(porcentaje*distancia/100); 
            });

            elementRef.current.setNativeProps({
                style:newStylePropiedadesModificadas
            });
        } else {
            timeouts.map((t)=>clearTimeout(t));
        }
    }

}


export const clearAnim = (id)=>delete controllerAnimaciones[id];