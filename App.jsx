import { useEffect, useState } from "react";
import { Image, ImageBackground, StatusBar, Text, View } from "react-native";
import Motor from "./src/motor";
import { partida } from "./src/utils";
import LeftContainer from "./src/indexScreen/leftContainer";
import RightContainer from "./src/indexScreen/rightContainer";
import ElegirGameMode from "./src/indexScreen/elegirGameMode";

export default function App() {

    const [infoPartida, setInfoPartida] = useState({mode:"online", inGame:false, gameMode:"1vs1" });
    const [elegirGameMode, setElegirGameMode] = useState(true);
    const coloresJugadores = ["#E87056", "#5690E8", "#9256E8", "#FFC300"];
    
    useEffect(()=>{

        partida.set(infoPartida);

        partida.get((data)=>{
            setInfoPartida(data);
        }, "index");
    }, []);

    function setGameMode (e){
        const cantJugadores = e == "1vs1" ? 2 : e == "3jugadores" ? 3 : (e == "4jugadores" || e == "2vs2") ? 4 : 0;
        const jugadores = [];

        for (let i = 0; i < cantJugadores; i++) {
            jugadores.push({cantidadFichas: 10, color: coloresJugadores[i]});
            
            if (e == "2vs2") {
                jugadores[i].team = (i == 0 || i == 2) ? 1 : 2;
            }
        }

        partida.set({jugadores:jugadores, gameMode:e, turno:0});
    }
    
    return (
        <ImageBackground source={require("./assets/images/bg.png")} style={{ flex: 1, backgroundColor: "#000", flexDirection: "row" }}>
            <StatusBar/>            
            {!infoPartida.inGame && <LeftContainer infoPartida={infoPartida} /> }
            <View>
                <Motor />
            </View>
            {infoPartida.inGame && <RightContainer infoPartida={infoPartida} />}

           { elegirGameMode && <ElegirGameMode setClose={(_, a)=>{a && setGameMode(a); setElegirGameMode(false); }} />}
        </ImageBackground>
    )
}