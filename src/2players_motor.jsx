import { useEffect, createRef, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { isColision, getPosiciones } from 'motor';

export default function Motor () {

  let [map, setMap] = useState([]);
  let [playAnim, setPlayAnim] = useState(false);
  let [tirarFicha, setTirarFicha] = useState(true);

  let fichaID = useRef(0);
  const fichaDefaultInfo = {radio:20, colision:120, color:"purple"};
  const getElementFicha = (newRef, data)=> <View key={data.id} ref={newRef} style={{position:"absolute", left:data.x, top:data.y, backgroundColor: data.color || "purple", height:data.radio, width:data.radio, borderRadius: data.radio/2}}/>;

  function ponerFicha (position){
    
    fichaID.current = fichaID.current+1;

    const newFicha = {data:{...position, ...fichaDefaultInfo, id: fichaID.current} };

    newFicha.data.y = newFicha.data.y-(fichaDefaultInfo.radio/2);
    newFicha.data.x = newFicha.data.x-(fichaDefaultInfo.radio/2);

    newFicha.ref = createRef(null);
    newFicha.element = getElementFicha(newFicha.ref, newFicha.data);

    // AGREGAR AL MAPA Y AL DOM
    setPlayAnim(true);
    setMap(map1 =>[...map1, newFicha]);
    setTimeout(()=>setPlayAnim(false), 1);
  }

  async function comprobarColisionEnMapa () {

    setTirarFicha(false);
    
    const newFicha = map[map.length-1];
    const colisionados = [];
    const newMap = [...map];

    newMap.map((f, i) => {
        if (i !== newMap.length-1) {
            const colision = isColision(newFicha.data, f.data);
            if (colision) {
                colisionados.push(f);
            }   
        }
    });

    if (colisionados.length > 1) {
      await Promise.all(colisionados.map(async(f, i)=>{
        if (i == colisionados.length-1) {
          // ELIMINAR LA ULTIMA FICHA Q SE INGRESO
          const indexDel1 = newMap.findIndex(a => a.data.id == newFicha.data.id);
          newMap.splice(indexDel1, 1);

          await getNewPosition(f.data, newFicha.data, true);
        } else {
          getNewPosition(f.data, newFicha.data, true);
        }

        // ELIMINAR DEL DOM Y DEL MAPA
        const indexDel = newMap.findIndex(a => a.data.id == f.data.id);
        newMap.splice(indexDel, 1);
        
      }));

    } else if (colisionados.length == 1) {
        getNewPosition(colisionados[0].data, newFicha.data);
        await getNewPosition(newFicha.data, colisionados[0].data);

        // ELIMINAR DEL DOM Y DEL MAPA
        const indexDel = newMap.findIndex(a => a.data.id == colisionados[0].data.id);

        if (indexDel > -1) { 
            newMap.splice(indexDel, 1);

            const indexDel1 = newMap.findIndex(a => a.data.id == newFicha.data.id);
            if (indexDel1 > -1) { 
                newMap.splice(indexDel1, 1);
            }
        }

    }

    colisionados.length > 0 && setMap(newMap);
    setTirarFicha(true);
  }

  async function getNewPosition (f1, f2, multiFicha){

    // Calcular la distancia entre los centros de los círculos
    let distanciaX = (Math.abs(f1.x - f2.x)/2);
    let distanciaY = (Math.abs(f1.y - f2.y)/2);

    const destinoFichas = getPosiciones(f1, f2, distanciaX, distanciaY, multiFicha);
    
    await animar(f1, destinoFichas.f1);
  }

  async function animar (old, neww, msProp){

    let ms = msProp || 300;
    let currentMS = 0;
    let porcentaje = 0;
    const indexFicha = map.findIndex(a => a.data.id == old.id);

    indexFicha > -1 && await new Promise (complete => {
      const animFrame = setInterval(()=>{
        currentMS += 20;

        porcentaje = currentMS/ms*100;

        let valX = Math.abs(old.x-neww.x);
        let valY = Math.abs(old.y-neww.y);

        map[indexFicha].ref.current.setNativeProps({
          style:{
            left: (old.x > neww.x ? old.x-(porcentaje*valX/100) : old.x+(porcentaje*valX/100)),
            top:  (old.y > neww.y ? old.y-(porcentaje*valY/100) : old.y+(porcentaje*valY/100))
          }
        });

        if (currentMS == ms) {
          clearInterval(animFrame);
          setTimeout(i => complete(), 250);
        }

      }, 25);          
    });

  }

  useEffect(()=>{
    if (playAnim === true) {
      comprobarColisionEnMapa();
    }
  }, [playAnim, map]);

  return (
    <Pressable onPress={(e)=>tirarFicha && ponerFicha({x:e.nativeEvent.locationX.toFixed(3), y:e.nativeEvent.locationY.toFixed(3)})} style={styles.container}>

      {map.map((f)=>(
        f.element
      ))}

    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
