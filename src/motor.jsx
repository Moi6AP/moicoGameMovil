import { useEffect, createRef, useRef, useState } from 'react';
import { Alert, Pressable, Dimensions, Text, View, ImageBackground } from 'react-native';
import { isColision, getPosiciones, comprobarColisionConLosBordesMapa, partida } from './utils';
import { Audio } from 'expo-av';


export default function Motor () {

  const animacionMS = 300;
  const [map, setMap] = useState([]);
  const [initScreen, setInitScreen] = useState(false);
  const refTxtTocaForPlay = useRef(null);
  const tableroConfig = useRef(false);
  const tirarFicha = useRef(true);
  const infoPartida = useRef(false);

  const jugadores = useRef([
    {
      cantidadFichas: 10,
      color:"purple"
    }, 
    {
      cantidadFichas: 10,
      color:"blue"
    }
  ]);
  const jugadorTurnoIndex = useRef(0); 
  const [updRender, setUpdRender] = useState(0);

  const fichaID = useRef(0);
  const fichaDefaultInfo = useRef(false);
  const getElementFicha = (newRef, data)=> <View key={data.id} ref={newRef} style={{position:"absolute", left:data.x, top:data.y, backgroundColor: data.color || "purple", height:data.radio, width:data.radio, borderRadius:data.radio/2}}/>;

  function ponerFicha (position){

    if (!infoPartida.current.inGame) {
        return;
    }

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

    if (colisionados.length > 0) {
  
      setTimeout(()=>{
        (async()=>{
          const { sound } = await Audio.Sound.createAsync(require("../assets/sounds/choque.mp3"));
          sound.playAsync();
        })();
      }, animacionMS+50);

      if (infoPartida.current.mode == "local") {
        jugadores.current[jugadorTurnoIndex.current].cantidadFichas = (jugadores.current[jugadorTurnoIndex.current].cantidadFichas+colisionados.length)+1;      
        jugadorTurnoIndex.current = jugadorTurnoIndex.current == jugadores.current.length-1 ? 0 : jugadorTurnoIndex.current+1;
      }

    } else {
      if (infoPartida.current.mode == "local") {
        jugadores.current[jugadorTurnoIndex.current].cantidadFichas = jugadores.current[jugadorTurnoIndex.current].cantidadFichas-1;

        jugadorTurnoIndex.current = jugadorTurnoIndex.current == jugadores.current.length-1 ? 0 : jugadorTurnoIndex.current+1;
        
        tirarFicha.current = true;
        setUpdRender(e => e+1);
      }
    }

    infoPartida.current.mode == "local" && partida.set({turno: jugadorTurnoIndex.current, jugadores:jugadores.current});

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
      setMap(newMap);
      if (infoPartida.current.mode == "local"){
        tirarFicha.current = true;
      }
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
    /* let currentMS = 0; */
    let porcentaje = 0;
    const indexFicha = map.findIndex(a => a.data.id == old.id);

    const start = Date.now();   
    indexFicha > -1 && await new Promise (complete => {

      for (let i = 1; i <= fps; i++) {
        const currentMS = ms/fps*i;
        setTimeout(()=>anim(currentMS), currentMS);
      }
      
      setTimeout(complete, ms+800);
    });

    function anim (currentMS){

      porcentaje = currentMS/ms*100;

      let valX = Math.abs(old.x-neww.x);
      let valY = Math.abs(old.y-neww.y);

      map[indexFicha].ref.current.setNativeProps({
        style:{
          left: (old.x > neww.x ? old.x-(porcentaje*valX/100) : old.x+(porcentaje*valX/100)),
          top:  (old.y > neww.y ? old.y-(porcentaje*valY/100) : old.y+(porcentaje*valY/100))
        }
      });      
    }
    console.log(Date.now()-start);

  }

  function onPressPonerFicha (e){
    if (tirarFicha.current) {
      ponerFicha({x:e.locationX, y:e.locationY});
    }
  }

  function iniciarPartida(){
    partida.set({inGame:true});
  }

  useEffect(()=>{
    if (map.length > 0) {
      comprobarColisionEnMapa();
    }
  }, [map]);

  // INICIALIZAR JUEGO Y AJUSTES, TAMAÑO ETC
  useEffect(()=>{
    const screen = Dimensions.get("screen");

    if (!fichaDefaultInfo.current && !tableroConfig.current) {

      tableroConfig.current = {height:screen.height*70/100, width:screen.width*45/100};
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


  // ACCION DEL JUEGO
  useEffect(()=>{

    let visibleTocaForPlay = true;
    const intervalTocaParaJugar = setInterval(()=>{
      refTxtTocaForPlay.current.setNativeProps({style:{display: visibleTocaForPlay ? "none" : "block"}});
      visibleTocaForPlay = !visibleTocaForPlay;
    }, 1300);

    partida.get((data)=>{
      infoPartida.current = data;

      if (data.inGame) {
        clearInterval(intervalTocaParaJugar);
        refTxtTocaForPlay.current.setNativeProps({style:{display:"none"}});
      }
    }, "motor");

  }, []);

   return initScreen && (
    <View style={{width: tableroConfig.current.width, backgroundColor:"transparent", height: tableroConfig.current.height, marginBottom:"auto"}}>
      <Pressable style={{flex:1}} onPress={(e)=>!infoPartida.current.inGame ? iniciarPartida() : onPressPonerFicha(e.nativeEvent)}>

        {map.map((f)=>f.element)}

      </Pressable>
      <View style={{height: tableroConfig.current.height, width:tableroConfig.current.width, position:"absolute", alignItems:"center", justifyContent:"center", borderRadius:2,  left:0, top:0, zIndex:-1, borderColor:"#fff", borderWidth:1}} >
        <Text ref={refTxtTocaForPlay} style={{color:"#fff"}}>Toca para jugar</Text>
      </View>
    </View>
  )
}