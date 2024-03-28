import { useEffect, createRef, useRef, useState } from 'react';
import { Alert, Pressable, Dimensions, Text, View } from 'react-native';
import { isColision, getPosiciones, comprobarColisionConLosBordesMapa } from './utils';
import { Audio } from 'expo-av';


export default function Motor () {

  const [map, setMap] = useState([]);
  const [initScreen, setInitScreen] = useState(false);
  const tableroConfig = useRef(false);
  const tirarFicha = useRef(true);

  const jugadores = useRef([
    {
      id:"MOI11",
      cantidadFichas: 10,
      color:"purple"
    }, 
    {
      id:"MOI22",
      cantidadFichas: 10,
      color:"blue"
    }
  ]);
  const jugadorTurnoIndex = useRef(0); 

  const fichaID = useRef(0);
  const fichaDefaultInfo = useRef(false);
  const getElementFicha = (newRef, data)=> <View key={data.id} ref={newRef} style={{position:"absolute", left:data.x, top:data.y, backgroundColor: data.color || "purple", height:data.radio, width:data.radio, borderRadius:data.radio/2}}/>;

  function ponerFicha (position){

    tirarFicha.current = false;

    const res = comprobarColisionConLosBordesMapa(position, fichaDefaultInfo.current, tableroConfig.current);
    if (!res) {
      tirarFicha.current = true;
      return;
    }

    (async()=>{
      const { sound } = await Audio.Sound.createAsync(require("../assets/sounds/ponerFicha2.mp3"));
      sound.playAsync();
    })();

    fichaID.current = fichaID.current+1;

    const newFicha = {
      data:{
        ...position,
        ...fichaDefaultInfo.current, 
        id: fichaID.current
      } 
    };

    newFicha.data.y = newFicha.data.y-(fichaDefaultInfo.current.radio/2);
    newFicha.data.x = newFicha.data.x-(fichaDefaultInfo.current.radio/2);

    newFicha.data.color = jugadorTurnoIndex.current == 0 ? "blue" : "purple";
    newFicha.ref = createRef(null);
    newFicha.element = getElementFicha(newFicha.ref, newFicha.data);

    // AGREGAR AL MAPA Y AL DOM
    setMap(map1 => [...map1, newFicha]);
  }

  async function comprobarColisionEnMapa () {
    
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

    if (colisionados.length > 0) {
      jugadores.current[jugadorTurnoIndex.current].cantidadFichas = (jugadores.current[jugadorTurnoIndex.current].cantidadFichas+colisionados.length)+1;      

      setTimeout(()=>{
        (async()=>{
          const { sound } = await Audio.Sound.createAsync(require("../assets/sounds/choque.mp3"));
          sound.playAsync();
        })();
      }, 100);

      setMap(newMap);
      setTimeout(()=>{
        jugadorTurnoIndex.current = jugadorTurnoIndex.current == jugadores.current.length-1 ? 0 : jugadorTurnoIndex.current+1;
        tirarFicha.current = true;
      }, 400);

    } else {
      jugadores.current[jugadorTurnoIndex.current].cantidadFichas = jugadores.current[jugadorTurnoIndex.current].cantidadFichas-1;

      if (jugadores.current[jugadorTurnoIndex.current].cantidadFichas == 0) {
        const name = jugadores.current[jugadorTurnoIndex.current].id;
        setTimeout(()=>Alert.alert("GANO JUGADOR: "+name), 400);
      }

      jugadorTurnoIndex.current = jugadorTurnoIndex.current == jugadores.current.length-1 ? 0 : jugadorTurnoIndex.current+1;
      
      tirarFicha.current = true;
    }

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
    const fps = 20;
    let currentMS = 0;
    let porcentaje = 0;
    const indexFicha = map.findIndex(a => a.data.id == old.id);

    indexFicha > -1 && await new Promise (complete => {
      const animFrame = setInterval(()=>{
        currentMS += ms/fps;

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
          setTimeout(() => complete(), 250);
        }

      }, ms/fps);          
    });

  }

  function onPressPonerFicha (e){
    if (tirarFicha.current) {
      ponerFicha({x:e.locationX, y:e.locationY});
    }
  }

  useEffect(()=>{
    if (map.length > 0) {
      comprobarColisionEnMapa(); 
    }
  }, [map]);

  useEffect(()=>{
    const screen = Dimensions.get("screen");

    if (!fichaDefaultInfo.current && !tableroConfig.current) {

      tableroConfig.current = {height:screen.height*85/100, width:screen.width*45/100};
      const radio = tableroConfig.current.width*7/100;

      fichaDefaultInfo.current = {
        radio: radio,
        colision: radio*3.5, 
        color:"purple"
      }
      
    }

    setInitScreen(true);

    /* setTimeout(()=>{
      ponerFicha({x:314.28, y:296.28});
    }, 1000); */
  }, []);

   return initScreen && (
    <View style={{width: tableroConfig.current.width, height: tableroConfig.current.height, borderWidth:0, borderColor:"#fff"}}>
      {/* <View>
          <Text style={{color:"#fff"}}>Turno de: {config.turnoJugadorName}</Text>

          <Text style={{color:"#fff"}}>Fichas de {config.jugadores[0]?.id}: {config.jugadores[0].cantidadFichas}</Text>
          <Text style={{marginRight:100, color:"#fff"}}>Fichas de {config.jugadores[1].id}: {config.jugadores[1].cantidadFichas}</Text>
      </View> */}
      <Pressable style={{flex:1, backgroundColor:"#000"}} onPress={(e)=>onPressPonerFicha(e.nativeEvent)}>

        {map.map((f)=>f.element)}

      </Pressable>

      <View style={{height: tableroConfig.current.height+2, width:tableroConfig.current.width+2, position:"absolute", left:-1, top:-1, zIndex:-1, backgroundColor:"red"}} />
    </View>
  )
}