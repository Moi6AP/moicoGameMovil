import { useEffect, createRef, useRef, useState } from 'react';
import { Pressable, Dimensions, Text, View } from 'react-native';
import { isColision, getPosiciones, comprobarColisionConLosBordesMapa, partida } from './utils';
import { Audio } from 'expo-av';
import { io } from 'socket.io-client';
import { animarTableroHorizontal, clearAnim } from './animaciones';

export default function Motor () {

  const animacionMS = 300;
  const [map, setMap] = useState([]);
  const [initScreen, setInitScreen] = useState(false);
  const refTxtTocaForPlay = useRef(null);
  const tableroConfig = useRef(false);
  const tirarFicha = useRef(true);
  const infoPartida = useRef(false);
  const socket = useRef(false);

  const [updRender, setUpdRender] = useState(0);

  const tableroRef = useRef(null);
  const fichaID = useRef(0);
  const fichaDefaultInfo = useRef(false);
  const getElementFicha = (newRef, data)=> <View key={data.id} ref={newRef} style={{position:"absolute", borderColor:"#fff", borderWidth:1, left:data.x, top:data.y, backgroundColor: data.color || "purple", height:data.radio, width:data.radio, borderRadius:data.radio/2}}/>;

  function ponerFicha (position, tiroOnline){

    if (!infoPartida.current.inGame) {
        return;
    }

    tirarFicha.current = false;

    const res = comprobarColisionConLosBordesMapa(position, fichaDefaultInfo.current, tableroConfig.current);
    if (!res) {
      tirarFicha.current = true;
      return;
    }

    if (infoPartida.current.mode == "online" && !tiroOnline) {
      if (infoPartida.current.turno == infoPartida.current.id) {
        socket.current.emit("ponerFicha", {x:position.x/tableroConfig.current.width*100, y:position.y/tableroConfig.current.height*100});
      }

      return;
    }

    try {
      (async()=>{
        const { sound } = await Audio.Sound.createAsync(require("../assets/sounds/ponerFicha2.mp3"));
        sound.playAsync();
      })();
    } catch {}

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

    newFicha.data.color = infoPartida.current.jugadores[infoPartida.current.turno].color;
    newFicha.ref = createRef(null);
    newFicha.element = getElementFicha(newFicha.ref, newFicha.data);

    // AGREGAR AL MAPA Y AL DOM
    setMap(map1 => [...map1, newFicha]);
  }

  async function comprobarColisionEnMapa () {
    const newFicha = map[map.length-1];
    const colisionados = [];
    const newMap = [...map];
    const currentInfo = {jugadores:infoPartida.current.jugadores, turno:infoPartida.current.turno};

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
        try {
          (async()=>{
            const { sound } = await Audio.Sound.createAsync(require("../assets/sounds/choque.mp3"));
            sound.playAsync();
          })();
        } catch {}
      }, animacionMS+50);

      currentInfo.jugadores[currentInfo.turno].cantidadFichas += colisionados.length+1;
      currentInfo.turno = currentInfo.turno == currentInfo.jugadores.length-1 ? 0 : currentInfo.turno+1;

    } else {
      currentInfo.jugadores[currentInfo.turno].cantidadFichas += colisionados.length+1;
      currentInfo.turno = currentInfo.turno == currentInfo.jugadores.length-1 ? 0 : currentInfo.turno+1;
      
      tirarFicha.current = true;
      partida.set(currentInfo);
    }

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
      partida.set(currentInfo);
      tirarFicha.current = true;
      setMap(newMap);
    }

  }

  async function getNewPosition (f1, f2, multiFicha){
    
    // Calcular la distancia entre los centros de los círculos
    let distanciaX = (Math.abs(f1.x - f2.x)/2);
    let distanciaY = (Math.abs(f1.y - f2.y)/2);
    
    if (distanciaX == 0 && distanciaY == 0) {
        return;
    }
    
    const destinoFichas = getPosiciones(f1, f2, distanciaX, distanciaY, multiFicha);
  
    
    await animar(f1, destinoFichas.f1);
  }

  async function animar (old, neww, msProp, e){

    let ms = msProp || 300;
    const fps = 20;
    let porcentaje = 0;
    const indexFicha = map.findIndex(a => a.data.id == old.id);

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

  }

  function onPressPonerFicha (e){
    if (tirarFicha.current) {
      ponerFicha({x:e.locationX, y:e.locationY});
    }
  }

  function iniciarPartida(){
    if (infoPartida.current.mode == "online") {
      socket.current = io("http://192.168.1.215:4200");

      socket.current.on("partidaDefault", (data)=>{
        partida.set(data);
      });

      socket.current.on("newFicha", (newFicha)=>{
        ponerFicha({...newFicha, x:newFicha.x*tableroConfig.current.width/100, y:newFicha.y*tableroConfig.current.height/100}, true);
      });
    } else {
      partida.set({inGame:true});
    }
  }
  
  async function tirarHabilidad (){    
    const anim = animarTableroHorizontal(tableroRef, 130, tableroConfig.current.width*8/100);
  }

  useEffect(()=>{
    if (map.length > 0 && !tirarFicha.current) {
      comprobarColisionEnMapa();
    }


    let interval = false;
    if (infoPartida.current.inGame) {
      let temp =  infoPartida.current.defaultSegundosParaTirar || 7;

      interval = setInterval(()=>{
        temp--;
        if (temp == 0 && tirarFicha.current == true && infoPartida.current.mode !== "online") {
           ponerFicha({x:200, y:200});
        }
        
      }, 1000);
    }

    return ()=>clearInterval(interval);
  }, [map, updRender]);

  // INICIALIZAR JUEGO Y AJUSTES, TAMAÑO ETC
  useEffect(()=>{
    const screen = Dimensions.get("screen");

    if (!fichaDefaultInfo.current && !tableroConfig.current) {

      tableroConfig.current = {height:screen.height*70/100, width:screen.width*45/100};
      const radio = tableroConfig.current.width*7/100;

      fichaDefaultInfo.current = {
        radio: radio,
        colision: radio*2.8, 
        color:"purple"
      }
      
    }

    tirarHabilidad();

    setInitScreen(true);
    /* setUpdRender(e => e+1); */

  }, []);


  // ACCION DEL JUEGO
  useEffect(()=>{

    // INTERVAL TOCA PARA JUGAR
    let visibleTocaForPlay = true;
    function intervalFunctionTocaPaJugar (){
      refTxtTocaForPlay.current.setNativeProps({style:{display: visibleTocaForPlay ? "none" : "block"}});
      visibleTocaForPlay = !visibleTocaForPlay;
    }
    let intervalTocaParaJugar = false;
    let seCanceloInterval = true;



    partida.get((data)=>{
      infoPartida.current = data;

      // INTERVAL TOCA PARA JUGAR
      if (data.inGame && !seCanceloInterval) {
        console.log("terminar interval");
        clearInterval(intervalTocaParaJugar);
        refTxtTocaForPlay.current.setNativeProps({style:{display:"none"}});

        setUpdRender(1);
        seCanceloInterval = true;
      }
      if (!data.inGame && false && seCanceloInterval) {
        console.log("init interval");
        intervalTocaParaJugar = setInterval(intervalFunctionTocaPaJugar, 1300);
        seCanceloInterval = false;
      }

      // ONLINE
    }, "motor");

  }, []);

   return initScreen && (
    <View ref={tableroRef} style={{width: tableroConfig.current.width, backgroundColor:"transparent", height: tableroConfig.current.height, marginBottom:"auto", marginTop: !infoPartida.current.inGame ? "auto" : 0,}}>
      <Pressable style={{flex:1}} onPress={(e)=>!infoPartida.current.inGame ? iniciarPartida() : onPressPonerFicha(e.nativeEvent)}>

        {map.map((f)=>f.element)}

      </Pressable>
      <View style={{height: tableroConfig.current.height, width:tableroConfig.current.width, position:"absolute", alignItems:"center", justifyContent:"center", borderRadius:2,  left:0, top:0, zIndex:-1, borderColor:"#fff", borderWidth:1}} >
        <Text ref={refTxtTocaForPlay} style={{color:"#fff"}}>Toca para jugar</Text>
      </View>
    </View>
  )
}